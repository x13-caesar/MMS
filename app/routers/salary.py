# coding=utf-8
import io

from fastapi import APIRouter, Depends
from typing import List

from .. import schemas
from ..services import salary_service
from sqlalchemy.orm import Session
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi import HTTPException

from ..dependencies import get_db
from datetime import datetime
import pandas as pd

router = APIRouter(
    prefix="/salary",
    tags=["salary"],
    responses={404: {"description": "Not found"}},
)


@router.get("/", response_model=List[schemas.Salary])
def read_salaries(db: Session = Depends(get_db)):
    salaries = salary_service.get_salaries(db=db)
    return salaries


@router.get("/{salary_id}", response_model=schemas.Salary)
def read_salary(salary_id: int, db: Session = Depends(get_db)):
    salary = salary_service.get_salary(salary_id=salary_id, db=db)
    if salary is None:
        raise HTTPException(status_code=404, detail="Salary not found")
    return salary


@router.get("/employee_id/{employee_id}")
def read_salaries_by_employee_id(employee_id: int, db: Session = Depends(get_db)):
    salaries = salary_service.get_salaries_by_employee_id(employee_id=employee_id, db=db)
    if not salaries:
        raise HTTPException(status_code=404, detail="No salary found")
    return salaries


@router.get("/status/{status}")
def read_salaries_by_status(status: str, db: Session = Depends(get_db)):
    salaries = salary_service.get_salaries_by_status(status=status, db=db)
    if not salaries:
        raise HTTPException(status_code=404, detail="No salary found")
    return salaries


@router.get("/month/{month}")
def read_salaries_of_month(month: datetime, db: Session = Depends(get_db)):
    operations = salary_service.get_salaries_in_month_range(after=month, before=month, db=db)
    if not operations:
        raise HTTPException(status_code=404, detail="No salary found")
    return operations


@router.get("/month_range/{after}/{before}")
def read_salaries_of_month(after: datetime, before: datetime, db: Session = Depends(get_db)):
    operations = salary_service.get_salaries_in_month_range(after=after, before=before, db=db)
    if not operations:
        raise HTTPException(status_code=404, detail="No salary found")
    return operations


@router.get("/salary-summary/download/{salary_id}.csv")
async def download_salary_summary_csv(salary_id: int, db: Session = Depends(get_db)):
    columns = ['日期', '批次', '工艺', '员工',
               '计件', '单件报酬', '计时', '小时报酬',
               '单日小计']
    records = {}
    target_salary = salary_service.get_salary(salary_id=salary_id, db=db)
    day_invoices = target_salary.day_invoice
    subtotal = 0
    for di in day_invoices:
        di_sum = di.unit_pay*di.complete_unit + di.hour_pay*di.complete_hour
        records[di.id] = [
            di.work_date.strftime('%Y-%m-%d'), di.batch_id, di.process_name, di.employee_name,
            di.complete_unit, di.unit_pay, di.complete_hour, di.hour_pay,
            di_sum
        ]
        subtotal += di_sum
    records['合计'] = ['', '', '', '', '', '', '', '', subtotal]
    records['扣除额'] = ['', '', '', '', '', '', '', '', target_salary.deduction]
    records['增补额/奖金'] = ['', '', '', '', '', '', '', '', target_salary.bonus]
    records['备注'] = ['', '', '', '', '', '', '', '', target_salary.notice]
    records['总计'] = ['', '', '', '', '', '', '', '', subtotal - target_salary.deduction + target_salary.bonus]
    df = pd.DataFrame.from_dict(records, orient='index',
                                columns=columns).reset_index()
    response = StreamingResponse(io.StringIO('\ufeff' + df.to_csv(index=False, encoding='utf-8-sig')),
                                 media_type="text/csv")
    start, end = target_salary.start_date.strftime('%Y-%m-%d'), target_salary.end_date.strftime('%Y-%m-%d')
    name = f'{target_salary.employee_id}_{start}_{end}'
    response.headers["Content-Disposition"] = f"attachment; filename={name}.csv"
    return response


@router.post("/", response_model=schemas.Salary)
def create_salary(salary: schemas.SalaryCreate, db: Session = Depends(get_db)):
    return salary_service.create_salary(salary=salary, db=db)


@router.put("/", response_model=schemas.Salary)
def update_salary(salary: schemas.Salary,
                  db: Session = Depends(get_db)):
    db_salary_data = salary_service.get_salary(salary.id, db=db)
    if not db_salary_data:
        raise HTTPException(status_code=400, detail="Matching salary not found")
    json_salary = jsonable_encoder(db_salary_data)
    db_salary_model = schemas.Salary(**json_salary)
    update_data = salary.dict(exclude_unset=True)
    updated_salary = db_salary_model.copy(update=update_data)
    return salary_service.update_salary(salary=updated_salary, db=db)


@router.delete("/{salary_id}")
def delete_salary(salary_id: int, db: Session = Depends(get_db)):
    db_salary_data = salary_service.get_salary(salary_id, db=db)
    if not db_salary_data:
        raise HTTPException(status_code=400, detail="Matching salary not found")
    salary_service.delete_salary(salary=db_salary_data, db=db)
    return JSONResponse(content={"success": True})
