from sqlalchemy.orm import Session

from fastapi.encoders import jsonable_encoder
from .. import models, schemas

from datetime import datetime


def get_batch(batch_id: int, db: Session):
    return db.query(models.Batch).filter(models.Batch.id == batch_id).first()


def get_batches(db: Session):
    return db.query(models.Batch).all()


def get_batches_by_status(status: str, db: Session):
    return db.query(models.Batch).filter(models.Batch.status == status).all()


def get_batches_by_product_id(product_id: int, db: Session):
    return db.query(models.Batch).filter(models.Batch.product_id == product_id).all()


def get_batches_by_product_id_and_status(product_id: int, status: str, db: Session):
    return db.query(models.Batch).filter(models.Batch.product_id == product_id,
                                         models.Batch.status == status).all()


def get_batches_plan_amount_over(amount: int, db: Session):
    return db.query(models.Batch).filter(models.Batch.plan_amount >= amount).all()


def get_batches_plan_amount_equal(amount: int, db: Session):
    return db.query(models.Batch).filter(models.Batch.plan_amount == amount).all()


def get_batches_plan_amount_under(amount: int, db: Session):
    return db.query(models.Batch).filter(models.Batch.plan_amount <= amount).all()


def get_batches_not_fulfilled(db: Session):
    return db.query(models.Batch).filter(models.Batch.actual_amount < models.Batch.plan_amount).all()


def get_batches_start_after(date: datetime, db: Session):
    return db.query(models.Batch).filter(models.Batch.start >= date).all()


def get_batches_start_on(date: datetime, db: Session):
    return db.query(models.Batch).filter(models.Batch.start == date).all()


def get_batches_start_before(date: datetime, db: Session):
    return db.query(models.Batch).filter(models.Batch.start <= date).all()


def get_batches_ship_after(date: datetime, db: Session):
    return db.query(models.Batch).filter(models.Batch.ship >= date).all()


def get_batches_ship_on(date: datetime, db: Session):
    return db.query(models.Batch).filter(models.Batch.ship == date).all()


def get_batches_ship_before(date: datetime, db: Session):
    return db.query(models.Batch).filter(models.Batch.ship <= date).all()


def create_batch(batch: schemas.BatchCreate, db: Session):
    new_batch = models.Batch(**batch.dict())
    db.add(new_batch)
    db.commit()
    db.refresh(new_batch)
    return new_batch


def update_batch(batch: schemas.Batch, db: Session):
    updated_batch = models.Batch(**batch.dict())
    db.query(models.Batch). \
        filter(models.Batch.id == updated_batch.id). \
        update(jsonable_encoder(updated_batch))
    db.commit()
    return db.query(models.Batch).filter(models.Batch.id == updated_batch.id).first()


def delete_batch(batch: schemas.Batch, db: Session):
    db.query(models.Batch). \
        filter(models.Batch.id == batch.id). \
        delete(synchronize_session="fetch")
    db.commit()
    return
