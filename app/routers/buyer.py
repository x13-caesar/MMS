from fastapi import APIRouter, Depends
from typing import List
from .. import schemas
from ..services import buyer_service
from sqlalchemy.orm import Session
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from fastapi import HTTPException

from ..dependencies import get_db


router = APIRouter(
    prefix="/buyers",
    tags=["buyer"],
    responses={404: {"description": "Not found"}},
)


@router.get("/", response_model=List[schemas.Buyer])
def read_buyers(db: Session = Depends(get_db)):
    buyers = buyer_service.get_buyers(db=db)
    return buyers


@router.get("/{buyer_id}", response_model=schemas.Buyer)
def read_buyer(buyer_id: int, db: Session = Depends(get_db)):
    buyer = buyer_service.get_buyer(buyer_id=buyer_id, db=db)
    if buyer is None:
        raise HTTPException(status_code=404, detail="Buyer not found")
    return buyer


@router.get("/name/{name}")
def read_buyer_by_name(name: str, db: Session = Depends(get_db)):
    buyer = buyer_service.get_buyer_by_name(name=name, db=db)
    if buyer is None:
        raise HTTPException(status_code=404, detail="Buyer not found")
    return buyer


@router.get("/company/{company}")
def read_buyer_by_company(company: str, db: Session = Depends(get_db)):
    buyer = buyer_service.get_buyer_by_company(company=company, db=db)
    if buyer is None:
        raise HTTPException(status_code=404, detail="Buyer not found")
    return buyer


@router.post("/", response_model=schemas.Buyer)
def create_buyer(buyer: schemas.BuyerCreate, db: Session = Depends(get_db)):
    db_buyer = buyer_service.get_buyer_by_company(company=buyer.company, db=db)
    if db_buyer:
        raise HTTPException(status_code=400, detail="Buyer company already registered")
    return buyer_service.create_buyer(buyer=buyer, db=db)


@router.put("/{buyer_id}")
def update_buyer(buyer_id: int, buyer: schemas.BuyerCreate, db: Session = Depends(get_db)):
    db_buyer_data = buyer_service.get_buyer(buyer_id, db=db)
    if not db_buyer_data:
        raise HTTPException(status_code=400, detail="Matching buyer not found")
    db_buyer_model = schemas.Buyer(**jsonable_encoder(db_buyer_data))
    update_data = buyer.dict(exclude_unset=True)
    updated_buyer = db_buyer_model.copy(update=update_data)
    return buyer_service.update_buyer(buyer=updated_buyer, db=db)


@router.delete("/{buyer_id}")
def delete_buyer(buyer_id: int, db: Session = Depends(get_db)):
    db_buyer_data = buyer_service.get_buyer(buyer_id, db=db)
    if not db_buyer_data:
        raise HTTPException(status_code=400, detail="Matching buyer not found")
    buyer_service.delete_buyer(buyer=db_buyer_data, db=db)
    return JSONResponse(content={"success": True})
