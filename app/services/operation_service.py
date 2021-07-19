from sqlalchemy.orm import Session

from fastapi.encoders import jsonable_encoder
from .. import models, schemas

from datetime import datetime


def get_operation(operation_id: int, db: Session):
    return db.query(models.Operation).filter(models.Operation.id == operation_id).first()


def get_operations(db: Session):
    return db.query(models.Operation).all()


def get_operations_by_operator(operator: str, db: Session):
    return db.query(models.Operation).filter(models.Operation.operator == operator).all()


def get_operations_in_time_range(after: datetime, before: datetime, db: Session):
    return db.query(models.Operation).filter(models.Operation.execute_time >= after,
                                             models.Operation.execute_time <= before).all()


def create_operation(operation: schemas.OperationCreate, db: Session):
    new_operation = models.Operation(**operation.dict())
    db.add(new_operation)
    db.commit()
    db.refresh(new_operation)
    return new_operation


def update_operation(operation: schemas.Operation, db: Session):
    updated_operation = models.Operation(**operation.dict())
    db.query(models.Operation). \
        filter(models.Operation.id == updated_operation.id). \
        update(jsonable_encoder(updated_operation))
    db.commit()
    return db.query(models.Operation).filter(models.Operation.id == updated_operation.id).first()


def delete_operation(operation: schemas.Operation, db: Session):
    db.query(models.Operation). \
        filter(models.Operation.id == operation.id). \
        delete(synchronize_session="fetch")
    db.commit()
    return
