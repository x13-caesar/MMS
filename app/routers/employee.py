from fastapi import APIRouter, Depends
from typing import List
from .. import schemas
from ..services import employee_service
from sqlalchemy.orm import Session
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from fastapi import HTTPException

from ..dependencies import get_db
from datetime import datetime

router = APIRouter(
    prefix="/employee",
    tags=["employee"],
    responses={404: {"description": "Not found"}},
)


@router.get("/", response_model=List[schemas.Employee])
def read_employees(db: Session = Depends(get_db)):
    employees = employee_service.get_employees(db=db)
    return employees


@router.get("/{employee_id}", response_model=schemas.Employee)
def read_employee(employee_id: int, db: Session = Depends(get_db)):
    employee = employee_service.get_employee(employee_id=employee_id, db=db)
    if employee is None:
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee


@router.get("/name/{name}")
def read_employees_by_name(name: str, db: Session = Depends(get_db)):
    employees = employee_service.get_employees_by_name(name=name, db=db)
    if not employees:
        raise HTTPException(status_code=404, detail="No employee found")
    return employees


@router.get("/phone/{phone}")
def read_employees_by_phone(phone: str, db: Session = Depends(get_db)):
    employees = employee_service.get_employees_by_phone(phone=phone, db=db)
    if not employees:
        raise HTTPException(status_code=404, detail="No employee found")
    return employees


@router.get("/ssn/{ssn}")
def read_employees_by_ssn(ssn: str, db: Session = Depends(get_db)):
    employees = employee_service.get_employees_by_ssn(ssn=ssn, db=db)
    if not employees:
        raise HTTPException(status_code=404, detail="No employee found")
    return employees


@router.get("/department/{department}")
def read_employees_by_department(department: str, db: Session = Depends(get_db)):
    employees = employee_service.get_employees_by_department(department=department, db=db)
    if not employees:
        raise HTTPException(status_code=404, detail="No employee found")
    return employees


@router.get("/status/{status}")
def read_employees_by_status(status: str, db: Session = Depends(get_db)):
    employees = employee_service.get_employees_by_status(status=status, db=db)
    if not employees:
        raise HTTPException(status_code=404, detail="No employee found")
    return employees


@router.get("/onboard/{after}/{before}")
def read_employees_in_time_range(after: datetime, before: datetime, db: Session = Depends(get_db)):
    employees = employee_service.get_employees_in_onboard_range(after=after,
                                                                before=before,
                                                                db=db)
    if not employees:
        raise HTTPException(status_code=404, detail="No employee found")
    return employees


@router.get("/onboard/{after}/{before}")
def read_employees_in_birthday_range(after: datetime, before: datetime, db: Session = Depends(get_db)):
    employees = employee_service.get_employees_in_birthday_range(after=after,
                                                                 before=before,
                                                                 db=db)
    if not employees:
        raise HTTPException(status_code=404, detail="No employee found")
    return employees


@router.post("/", response_model=schemas.Employee)
def create_employee(employee: schemas.EmployeeCreate, db: Session = Depends(get_db)):
    return employee_service.create_employee(employee=employee, db=db)


@router.put("/last_pay_check")
def update_employee(employee_id: int,
                    last_pay_check: datetime,
                    db: Session = Depends(get_db)):
    db_employee_data = employee_service.get_employee(employee_id, db=db)
    if not db_employee_data:
        raise HTTPException(status_code=400, detail="Matching employee not found")
    db_employee_model = schemas.Employee(**jsonable_encoder(db_employee_data))
    db_employee_model.last_pay_check = last_pay_check
    return employee_service.update_employee(employee=db_employee_model, db=db)


@router.put("/")
def update_employee(employee: schemas.Employee,
                   db: Session = Depends(get_db)):
    db_employee_data = employee_service.get_employee(employee.id, db=db)
    if not db_employee_data:
        raise HTTPException(status_code=400, detail="Matching employee not found")
    db_employee_model = schemas.Employee(**jsonable_encoder(db_employee_data))
    update_data = employee.dict(exclude_unset=True)
    updated_employee = db_employee_model.copy(update=update_data)
    return employee_service.update_employee(employee=updated_employee, db=db)


@router.delete("/{employee_id}")
def delete_employee(employee_id: int, db: Session = Depends(get_db)):
    db_employee_data = employee_service.get_employee(employee_id, db=db)
    if not db_employee_data:
        raise HTTPException(status_code=400, detail="Matching employee not found")
    employee_service.delete_employee(employee=db_employee_data, db=db)
    return JSONResponse(content={"success": True})
