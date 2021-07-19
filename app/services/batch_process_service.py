from sqlalchemy.orm import Session

from fastapi.encoders import jsonable_encoder
from .. import models, schemas


def get_batch_process(batch_process_id: int, db: Session):
    return db.query(models.BatchProcess).filter(models.BatchProcess.id == batch_process_id).first()


def get_batch_processes(db: Session):
    return db.query(models.BatchProcess).all()


def get_batch_processes_by_process_id(process_id: int, db: Session):
    return db.query(models.BatchProcess).filter(models.BatchProcess.process_id == process_id).all()


def get_batch_processes_by_batch_id(batch_id: int, db: Session):
    return db.query(models.BatchProcess).filter(models.BatchProcess.batch_id == batch_id).all()


def get_batch_processes_by_status(status: str, db: Session):
    return db.query(models.BatchProcess).filter(models.BatchProcess.status == status).all()


def create_batch_process(batch_process: schemas.BatchProcessCreate, db: Session):
    new_batch_process = models.BatchProcess(**batch_process.dict())
    db.add(new_batch_process)
    db.commit()
    db.refresh(new_batch_process)
    return new_batch_process


def update_batch_process(batch_process: schemas.BatchProcess, db: Session):
    updated_batch_process = models.BatchProcess(**batch_process.dict())
    db.query(models.BatchProcess). \
        filter(models.BatchProcess.id == updated_batch_process.id). \
        update(jsonable_encoder(updated_batch_process))
    db.commit()
    return db.query(models.BatchProcess).filter(models.BatchProcess.id == updated_batch_process.id).first()


def delete_batch_process(batch_process: schemas.BatchProcess, db: Session):
    db.query(models.BatchProcess). \
        filter(models.BatchProcess.id == batch_process.id). \
        delete(synchronize_session="fetch")
    db.commit()
    return
