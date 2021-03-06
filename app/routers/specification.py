from fastapi import APIRouter, Depends, Body
from typing import List
from .. import schemas
from ..services import specification_service
from sqlalchemy.orm import Session
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from fastapi import HTTPException

from ..dependencies import get_db

router = APIRouter(
    prefix="/specifications",
    tags=["specifications"],
    responses={404: {"description": "Not found"}},
)


@router.get("/", response_model=List[schemas.Specification])
def read_specifications(db: Session = Depends(get_db)):
    specifications = specification_service.get_specifications(db=db)
    return specifications


@router.get("/existing_ids", response_model=List[str])
def read_all_specification_ids(db: Session = Depends(get_db)):
    ids = [spec.id for spec in specification_service.get_all_ids(db=db)]
    return ids


@router.get("/net_price/{specification_id}")
def read_specification(specification_id: str, db: Session = Depends(get_db)):
    specification = specification_service.get_specification_net_price_by_id(specification_id=specification_id, db=db)
    return specification.net_price


@router.get("/gross_price/{specification_id}")
def read_specification(specification_id: str, db: Session = Depends(get_db)):
    specification = specification_service.get_specification_gross_price_by_id(specification_id=specification_id, db=db)
    return specification.gross_price


@router.get("/{specification_id}", response_model=schemas.Specification)
def read_specification(specification_id: str, db: Session = Depends(get_db)):
    specification = specification_service.get_specification(specification_id=specification_id, db=db)
    if specification is None:
        raise HTTPException(status_code=404, detail="Specification not found")
    return specification


@router.get("/component_id/{component_id}")
def read_specification_by_component_id(component_id: str, db: Session = Depends(get_db)):
    specification = specification_service.get_specifications_by_component_id(component_id=component_id, db=db)
    if specification is None:
        raise HTTPException(status_code=404, detail="Specification not found")
    return specification


@router.get("/vendor_id/{vendor_id}")
def read_specification_by_vendor_id(vendor_id: int, db: Session = Depends(get_db)):
    specification = specification_service.get_specifications_by_vendor_id(vendor_id=vendor_id, db=db)
    if specification is None:
        raise HTTPException(status_code=404, detail="Specification not found")
    return specification


@router.get("/price_over/{price}/{gross}")
def read_specification_over_price(price: int, gross: bool, db: Session = Depends(get_db)):
    return specification_service.get_specifications_over_price(
        price=price,
        gross=gross,
        db=db)


@router.get("/price_equal/{price}/{gross}")
def read_specification_equal_price(price: int, gross: bool, db: Session = Depends(get_db)):
    return specification_service.get_specifications_equal_price(
        price=price,
        gross=gross,
        db=db)


@router.get("/price_under/{price}/{gross}")
def read_specification_under_price(price: int, gross: bool, db: Session = Depends(get_db)):
    return specification_service.get_specifications_under_price(
        price=price,
        gross=gross,
        db=db)


@router.post("/", response_model=schemas.Specification)
def create_specification(specification: schemas.SpecificationCreate, db: Session = Depends(get_db)):
    if specification_service.get_specification(specification_id=specification.id,
                                               db=db):
        raise HTTPException(status_code=400, detail="Existing ID")
    elif specification_service.get_specifications_by_component_id_and_vendor_id(
            component_id=specification.component_id,
            vendor_id=specification.vendor_id,
            db=db):
        raise HTTPException(status_code=400, detail="The vendor already has this component")
    return specification_service.create_specification(specification=specification, db=db)


@router.put("/adjust_stock/{spec_id}/{adjust_number}")
def adjust_stock(spec_id: str, adjust_number: int, db: Session = Depends(get_db)):
    db_spec = specification_service.get_specification(specification_id=spec_id, db=db)
    db_spec.stock += adjust_number
    return specification_service.update_specification(specification=db_spec,
                                                      db=db)


@router.put("/", response_model=schemas.Specification)
def update_specification(specification: schemas.SpecificationCreate,
                         db: Session = Depends(get_db)):
    db_specification_data = specification_service.get_specification(specification.id, db=db)
    if not db_specification_data:
        raise HTTPException(status_code=400, detail="Matching specification not found")
    db_specification_model = schemas.Specification(**jsonable_encoder(db_specification_data))
    update_data = specification.dict(exclude_unset=True)
    updated_specification = db_specification_model.copy(update=update_data)
    return specification_service.update_specification(specification=updated_specification, db=db)


@router.delete("/{specification_id}")
def delete_specification(specification_id: str, db: Session = Depends(get_db)):
    db_specification_data = specification_service.get_specification(specification_id, db=db)
    if not db_specification_data:
        raise HTTPException(status_code=400, detail="Matching specification not found")
    specification_service.delete_specification(specification=db_specification_data, db=db)
    return JSONResponse(content={"success": True})
