from fastapi import APIRouter, Depends
from typing import List
from .. import schemas
from ..services import vendor_service
from sqlalchemy.orm import Session
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from fastapi import HTTPException

from ..dependencies import get_db


router = APIRouter(
    prefix="/vendors",
    tags=["vendor"],
    responses={404: {"description": "Not found"}},
)


@router.get("/", response_model=List[schemas.Vendor])
def read_vendors(db: Session = Depends(get_db)):
    vendors = vendor_service.get_vendors(db=db)
    return vendors


@router.get("/{vendor_id}", response_model=schemas.Vendor)
def read_vendor(vendor_id: int, db: Session = Depends(get_db)):
    vendor = vendor_service.get_vendor(vendor_id=vendor_id, db=db)
    if vendor is None:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return vendor


@router.get("/name/{name}")
def read_vendor_by_name(name: str, db: Session = Depends(get_db)):
    vendor = vendor_service.get_vendor_by_name(name=name, db=db)
    if vendor is None:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return vendor


@router.get("/company/{company}")
def read_vendor_by_company(company: str, db: Session = Depends(get_db)):
    vendor = vendor_service.get_vendor_by_company(company=company, db=db)
    if vendor is None:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return vendor


@router.post("/", response_model=schemas.Vendor)
def create_vendor(vendor: schemas.VendorCreate, db: Session = Depends(get_db)):
    db_vendor = vendor_service.get_vendor_by_company(company=vendor.company, db=db)
    if db_vendor:
        raise HTTPException(status_code=400, detail="Vendor company already registered")
    return vendor_service.create_vendor(vendor=vendor, db=db)


@router.put("/{vendor_id}")
def update_vendor(vendor_id: int, vendor: schemas.VendorCreate, db: Session = Depends(get_db)):
    db_vendor_data = vendor_service.get_vendor(vendor_id, db=db)
    if not db_vendor_data:
        raise HTTPException(status_code=400, detail="Matching vendor not found")
    db_vendor_model = schemas.Vendor(**jsonable_encoder(db_vendor_data))
    update_data = vendor.dict(exclude_unset=True)
    updated_vendor = db_vendor_model.copy(update=update_data)
    return vendor_service.update_vendor(vendor=updated_vendor, db=db)


@router.delete("/{vendor_id}")
def delete_vendor(vendor_id: int, db: Session = Depends(get_db)):
    db_vendor_data = vendor_service.get_vendor(vendor_id, db=db)
    if not db_vendor_data:
        raise HTTPException(status_code=400, detail="Matching vendor not found")
    vendor_service.delete_vendor(vendor=db_vendor_data, db=db)
    return JSONResponse(content={"success": True})
