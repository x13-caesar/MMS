from sqlalchemy.orm import Session

from fastapi.encoders import jsonable_encoder
from .. import models, schemas

from datetime import datetime

def get_work(work_id: int, db: Session):
    return db.query(models.Work).filter(models.Work.id == work_id).first()


def get_works(db: Session):
    return db.query(models.Work).all()


def get_works_by_batch_process_id(batch_process_id: int, db: Session):
    return db.query(models.Work).filter(models.Work.batch_process_id == batch_process_id).all()


def get_works_by_employee_id(employee_id: int, db: Session):
    return db.query(models.Work).filter(models.Work.employee_id == employee_id).all()


def get_works_in_work_date_range(after: datetime, before: datetime, db: Session):
    return db.query(models.Work).filter(models.Work.execute_time >= after,
                                        models.Work.execute_time <= before).all()


def get_works_by_employee_id_and_work_date_range(employee_id: int, after: datetime, before: datetime, db: Session):
    return db.query(models.Work).filter(models.Work.employee_id == employee_id,
                                        models.Work.execute_time >= after,
                                        models.Work.execute_time <= before).all()


def create_work(work: schemas.WorkCreate, db: Session):
    new_work = models.Work(**work.dict())
    db.add(new_work)
    db.commit()
    db.refresh(new_work)
    return new_work


def update_work(work: schemas.Work, db: Session):
    updated_work = models.Work(**work.dict())
    db.query(models.Work). \
        filter(models.Work.id == updated_work.id). \
        update(jsonable_encoder(updated_work))
    db.commit()
    return db.query(models.Work).filter(models.Work.id == updated_work.id).first()


def delete_work(work: schemas.Work, db: Session):
    db.query(models.Work). \
        filter(models.Work.id == work.id). \
        delete(synchronize_session="fetch")
    db.commit()
    return
