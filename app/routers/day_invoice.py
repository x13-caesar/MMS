from http.client import HTTPException
from typing import List

from fastapi import APIRouter, Depends
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session
from starlette.responses import JSONResponse

from .. import schemas
from ..dependencies import get_db
from ..services import day_invoice_service
from datetime import datetime, timedelta

router = APIRouter(
    prefix="/day_invoice",
    tags=["day_invoice"],
    responses={404: {"description": "Not found"}},
)


@router.get("/", response_model=List[schemas.DayInvoice])
def read_day_invoices(db: Session = Depends(get_db)):
    day_invoices = day_invoice_service.get_day_invoices(db=db)
    return day_invoices


@router.get("/day_invoice_id/{day_invoice_id}", response_model=schemas.DayInvoice)
def read_day_invoice(day_invoice_id: int, db: Session = Depends(get_db)):
    day_invoice = day_invoice_service.get_day_invoice(day_invoice_id=day_invoice_id, db=db)
    return day_invoice


@router.get("/checked", response_model=List[schemas.DayInvoice])
def read_checked_day_invoices(db: Session = Depends(get_db)):
    return day_invoice_service.get_day_invoices_by_check_status(True, db=db)


@router.get("/unchecked", response_model=List[schemas.DayInvoice])
def read_unchecked_day_invoices(db: Session = Depends(get_db)):
    return day_invoice_service.get_day_invoices_by_check_status(False, db=db)


@router.get("/batch_id/{batch_id}")
def read_day_invoices_by_batch_id(batch_id: int, db: Session = Depends(get_db)):
    day_invoices = day_invoice_service.get_day_invoices_by_batch_id(batch_id=batch_id, db=db)
    return day_invoices


@router.get("/batch_process_id/{batch_process_id}")
def read_day_invoices_by_batch_process_id(batch_process_id: int, db: Session = Depends(get_db)):
    day_invoices = day_invoice_service.get_day_invoices_by_batch_process_id(batch_process_id=batch_process_id, db=db)
    return day_invoices


@router.get("/employee_id/{employee_id}")
def read_day_invoices_by_employee_id(employee_id: int, db: Session = Depends(get_db)):
    day_invoices = day_invoice_service.get_day_invoices_by_employee_id(employee_id=employee_id, db=db)
    return day_invoices


@router.get("/work_date/{after}/{before}")
def read_day_invoices_in_work_date_range(after: datetime, before: datetime, db: Session = Depends(get_db)):
    day_invoices = day_invoice_service.get_day_invoices_in_work_date_range(after=after,
                                                                           before=before,
                                                                           db=db)
    return day_invoices


# All datetime passed by path params should be in format "YYYY-MM-DD"
@router.get("/employee_id_and_work_date/{employee_id}/{after}/{before}")
def read_day_invoices_by_employee_id_and_work_date_range(employee_id: int, after: datetime, before: datetime,
                                                         db: Session = Depends(get_db)):
    day_invoices = day_invoice_service.get_day_invoices_by_employee_id_and_work_date_range(employee_id=employee_id,
                                                                                           after=after,
                                                                                           before=before,
                                                                                           db=db)
    return day_invoices


@router.get("/unchecked/employee_id_and_work_date/{employee_id}/{after}/{before}")
def read_unchecked_day_invoices_by_employee_id_and_work_date_range(employee_id: int, after: datetime, before: datetime,
                                                                   db: Session = Depends(get_db)):
    day_invoices = day_invoice_service.get_unchecked_day_invoices_by_employee_id_and_work_date_range(
        employee_id=employee_id,
        after=after,
        before=before,
        db=db)
    return day_invoices


@router.get("/salary_id/{salary_id}")
def read_day_invoices_by_salary_id(salary_id: int, db: Session = Depends(get_db)):
    return day_invoice_service.get_day_invoices_by_salary_id(salary_id=salary_id, db=db)


@router.post("/", response_model=schemas.DayInvoice)
def create_day_invoice(day_invoice: schemas.DayInvoiceCreate, db: Session = Depends(get_db)):
    return day_invoice_service.create_day_invoice(day_invoice=day_invoice, db=db)


@router.put("/", response_model=schemas.DayInvoice)
def update_day_invoice(day_invoice: schemas.DayInvoice,
                       db: Session = Depends(get_db)):
    db_day_invoice_data = day_invoice_service.get_day_invoice(day_invoice.id, db=db)
    db_day_invoice_model = schemas.DayInvoice(**jsonable_encoder(db_day_invoice_data))
    update_data = day_invoice.dict(exclude_unset=True)
    updated_day_invoice = db_day_invoice_model.copy(update=update_data)
    return day_invoice_service.update_day_invoice(day_invoice=updated_day_invoice, db=db)


@router.delete("/{day_invoice_id}")
def delete_day_invoice(day_invoice_id: int, db: Session = Depends(get_db)):
    db_day_invoice_data = day_invoice_service.get_day_invoice(day_invoice_id, db=db)
    day_invoice_service.delete_day_invoice(day_invoice=db_day_invoice_data, db=db)
    return JSONResponse(content={"success": True})
