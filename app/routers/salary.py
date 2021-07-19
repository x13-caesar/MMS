from fastapi import APIRouter, Depends
from typing import List
from .. import schemas
from ..services import salary_service
from sqlalchemy.orm import Session
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from fastapi import HTTPException

from ..dependencies import get_db
from datetime import datetime

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


@router.get("/month_range/{after}/{before")
def read_salaries_of_month(after: datetime, before: datetime, db: Session = Depends(get_db)):
    operations = salary_service.get_salaries_in_month_range(after=after, before=before, db=db)
    if not operations:
        raise HTTPException(status_code=404, detail="No salary found")
    return operations


@router.post("/", response_model=schemas.Salary)
def create_salary(salary: schemas.SalaryCreate, db: Session = Depends(get_db)):
    return salary_service.create_salary(salary=salary, db=db)


@router.put("/")
def update_salary(salary: schemas.Salary,
                   db: Session = Depends(get_db)):
    db_salary_data = salary_service.get_salary(salary.id, db=db)
    if not db_salary_data:
        raise HTTPException(status_code=400, detail="Matching salary not found")
    db_salary_model = schemas.Salary(**jsonable_encoder(db_salary_data))
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
