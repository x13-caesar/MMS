from sqlalchemy.orm import Session

from fastapi.encoders import jsonable_encoder
from .. import models, schemas

from datetime import datetime

def get_delivery(delivery_id: int, db: Session):
    return db.query(models.Delivery).filter(models.Delivery.id == delivery_id).first()


def get_deliveries(db: Session):
    return db.query(models.Delivery).all()


def get_deliveries_by_product_id(product_id: str, db: Session):
    return db.query(models.Delivery).filter(models.Delivery.product_id == product_id).all()


def get_delivery_by_order_id(order_id: str, db: Session):
    return db.query(models.Delivery).filter(models.Delivery.order_id == order_id).first()


def get_deliveries_by_buyer_id(buyer_id: int, db: Session):
    return db.query(models.Delivery).filter(models.Delivery.buyer_id == buyer_id).all()


def get_deliveries_over_amount(amount: int, db: Session):
    return db.query(models.Delivery).filter(models.Delivery.amount >= amount).all()


def get_deliveries_equal_amount(amount: int, db: Session):
    return db.query(models.Delivery).filter(models.Delivery.amount == amount).all()


def get_deliveries_under_amount(amount: int, db: Session):
    return db.query(models.Delivery).filter(models.Delivery.amount <= amount).all()


def get_deliveries_in_amount_range(lower_bound: int, upper_bound: int, db: Session):
    return db.query(models.Delivery).filter(models.Delivery.amount >= lower_bound,
                                            models.Delivery.amount <= upper_bound).all()


def get_deliveries_over_total_price(total_price: int, db: Session):
    return db.query(models.Delivery).filter(models.Delivery.total_price >= total_price).all()


def get_deliveries_equal_total_price(total_price: int, db: Session):
    return db.query(models.Delivery).filter(models.Delivery.total_price == total_price).all()


def get_deliveries_under_total_price(total_price: int, db: Session):
    return db.query(models.Delivery).filter(models.Delivery.total_price <= total_price).all()


def get_deliveries_in_total_price_range(lower_bound: int, upper_bound: int, db: Session):
    return db.query(models.Delivery).filter(models.Delivery.total_price >= lower_bound,
                                            models.Delivery.total_price <= upper_bound).all()


def get_deliveries_deliver_after(date: datetime, db: Session):
    return db.query(models.Delivery).filter(models.Delivery.deliver_date >= date).all()


def get_deliveries_deliver_on(date: datetime, db: Session):
    return db.query(models.Delivery).filter(models.Delivery.deliver_date == date).all()


def get_deliveries_deliver_before(date: datetime, db: Session):
    return db.query(models.Delivery).filter(models.Delivery.deliver_date <= date).all()


def get_deliveries_in_time_range(after: datetime, before: datetime, db: Session):
    return db.query(models.Delivery).filter(models.Delivery.deliver_date >= after,
                                            models.Delivery.deliver_date <= before).all()


def create_delivery(delivery: schemas.DeliveryCreate, db: Session):
    new_delivery = models.Delivery(**delivery.dict())
    db.add(new_delivery)
    db.commit()
    db.refresh(new_delivery)
    return new_delivery


def update_delivery(delivery: schemas.Delivery, db: Session):
    updated_delivery = models.Delivery(**delivery.dict())
    db.query(models.Delivery). \
        filter(models.Delivery.id == updated_delivery.id). \
        update(jsonable_encoder(updated_delivery))
    db.commit()
    return db.query(models.Delivery).filter(models.Delivery.id == updated_delivery.id).first()


def delete_delivery(delivery: schemas.Delivery, db: Session):
    db.query(models.Delivery). \
        filter(models.Delivery.id == delivery.id). \
        delete(synchronize_session="fetch")
    db.commit()
    return
