from fastapi import APIRouter, Depends
from typing import List
from .. import schemas
from ..services import delivery_service
from sqlalchemy.orm import Session
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from fastapi import HTTPException

from ..dependencies import get_db
from datetime import datetime

router = APIRouter(
    prefix="/delivery",
    tags=["delivery"],
    responses={404: {"description": "Not found"}},
)


@router.get("/", response_model=List[schemas.Delivery])
def read_deliveries(db: Session = Depends(get_db)):
    deliveries = delivery_service.get_deliveries(db=db)
    return deliveries


@router.get("/{delivery_id}", response_model=schemas.Delivery)
def read_delivery(delivery_id: int, db: Session = Depends(get_db)):
    delivery = delivery_service.get_delivery(delivery_id=delivery_id, db=db)
    if delivery is None:
        raise HTTPException(status_code=404, detail="Delivery not found")
    return delivery


@router.get("/product_id/{product_id}")
def read_deliveries_by_product_id(product_id: int, db: Session = Depends(get_db)):
    deliveries = delivery_service.get_deliveries_by_product_id(product_id=product_id, db=db)
    if not deliveries:
        raise HTTPException(status_code=404, detail="No delivery found")
    return deliveries


@router.get("/buyer_id/{buyer_id}")
def read_deliveries_by_buyer_id(buyer_id: int, db: Session = Depends(get_db)):
    deliveries = delivery_service.get_deliveries_by_buyer_id(buyer_id=buyer_id, db=db)
    if not deliveries:
        raise HTTPException(status_code=404, detail="No delivery found")
    return deliveries


@router.get("/order_id/{order_id}")
def read_deliveries_by_order_id(order_id: str, db: Session = Depends(get_db)):
    delivery = delivery_service.get_delivery_by_order_id(order_id=order_id, db=db)
    if not delivery:
        raise HTTPException(status_code=404, detail="No delivery found")
    return delivery


@router.get("/deliver_date/{after}/{before}")
def read_deliveries_in_time_range(after: datetime, before: datetime, db: Session = Depends(get_db)):
    deliveries = delivery_service.get_deliveries_in_time_range(after=after,
                                                               before=before,
                                                               db=db)
    if not deliveries:
        raise HTTPException(status_code=404, detail="No delivery found")
    return deliveries


@router.get("/total_price/{lower_bound}/{upper_bound}")
def read_deliveries_in_total_price_range(lower_bound: int, upper_bound: int, db: Session = Depends(get_db)):
    deliveries = delivery_service.get_deliveries_in_total_price_range(lower_bound=lower_bound,
                                                                      upper_bound=upper_bound,
                                                                      db=db)
    if not deliveries:
        raise HTTPException(status_code=404, detail="No delivery found")
    return deliveries


@router.get("/amount/{lower_bound}/{upper_bound}")
def read_deliveries_in_amount_range(lower_bound: int, upper_bound: int, db: Session = Depends(get_db)):
    deliveries = delivery_service.get_deliveries_in_amount_range(lower_bound=lower_bound,
                                                                 upper_bound=upper_bound,
                                                                 db=db)
    if not deliveries:
        raise HTTPException(status_code=404, detail="No delivery found")
    return deliveries


@router.post("/", response_model=schemas.Delivery)
def create_delivery(delivery: schemas.DeliveryCreate, db: Session = Depends(get_db)):
    return delivery_service.create_delivery(delivery=delivery, db=db)


@router.put("/")
def update_delivery(delivery: schemas.Delivery,
                    db: Session = Depends(get_db)):
    db_delivery_data = delivery_service.get_delivery(delivery.id, db=db)
    if not db_delivery_data:
        raise HTTPException(status_code=400, detail="Matching delivery not found")
    db_delivery_model = schemas.Delivery(**jsonable_encoder(db_delivery_data))
    update_data = delivery.dict(exclude_unset=True)
    updated_delivery = db_delivery_model.copy(update=update_data)
    return delivery_service.update_delivery(delivery=updated_delivery, db=db)


@router.delete("/{delivery_id}")
def delete_delivery(delivery_id: int, db: Session = Depends(get_db)):
    db_delivery_data = delivery_service.get_delivery(delivery_id, db=db)
    if not db_delivery_data:
        raise HTTPException(status_code=400, detail="Matching delivery not found")
    delivery_service.delete_delivery(delivery=db_delivery_data, db=db)
    return JSONResponse(content={"success": True})
