from fastapi import APIRouter, Depends
from typing import List
from .. import schemas
from ..services import batch_service, process_service
from sqlalchemy.orm import Session
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from fastapi import HTTPException

from ..dependencies import get_db

from datetime import datetime, timedelta
from enum import Enum

router = APIRouter(
    prefix="/batch",
    tags=["batch"],
    responses={404: {"description": "Not found"}},
)


class BatchStatus(str, Enum):
    unstarted = "unstarted"
    ongoing = "ongoing"
    urgent = "urgent"
    finished = "finished"
    shipped = "shipped"
    cancelled = "cancelled"


@router.get("/", response_model=List[schemas.Batch])
def read_batches(db: Session = Depends(get_db)):
    batches = batch_service.get_batches(db=db)
    return batches


@router.get("/meta_info", response_model=List[schemas.Batch])
def read_batches_meta_info(db: Session = Depends(get_db)):
    batches = batch_service.get_batches_meta_info(db=db)
    return batches


@router.get("/unfinished", response_model=List[schemas.Batch])
def read_unfinished_batches(db: Session = Depends(get_db)):
    ongoing_batches = batch_service.get_batches_by_status('ongoing', db=db)
    print(ongoing_batches)
    urgent_batches = batch_service.get_batches_by_status('urgent', db=db)
    print(urgent_batches)
    unstarted_batches = batch_service.get_batches_by_status('unstarted', db=db)
    print(unstarted_batches)
    return ongoing_batches + urgent_batches + unstarted_batches


@router.get("/working", response_model=List[schemas.Batch])
def read_working_batches(db: Session = Depends(get_db)):
    ongoing_batches = batch_service.get_batches_by_status('ongoing', db=db)
    urgent_batches = batch_service.get_batches_by_status('urgent', db=db)
    return ongoing_batches + urgent_batches


@router.get("/collected", response_model=List[schemas.Batch])
def read_collected_batches(db: Session = Depends(get_db)):
    finished_batches = batch_service.get_batches_by_status('finished', db=db)
    shipped_batches = batch_service.get_batches_by_status('shipped', db=db)
    return finished_batches + shipped_batches


@router.get("/recent", response_model=List[schemas.Batch])
def read_recent_ended_batches(db: Session = Depends(get_db)):
    tod = datetime.now()
    week = timedelta(days=7)
    target = tod - week
    return batch_service.get_batches_end_after(target, db=db)


@router.get("/{batch_id}", response_model=schemas.Batch)
def read_batch(batch_id: int, db: Session = Depends(get_db)):
    batch = batch_service.get_batch(batch_id=batch_id, db=db)
    if batch is None:
        raise HTTPException(status_code=404, detail="Batch not found")
    return batch


@router.get("/meta_info/{batch_id}", response_model=schemas.Batch)
def read_batch_meta_info(batch_id: int, db: Session = Depends(get_db)):
    batch = batch_service.get_batch(batch_id=batch_id, db=db)
    if batch is None:
        raise HTTPException(status_code=404, detail="Batch not found")
    return batch


@router.get("/product_id/{product_id}/{status}")
def read_batches_by_product_id_and_status(product_id: str, status: BatchStatus, db: Session = Depends(get_db)):
    if not status:
        batches = batch_service.get_batches_by_product_id(product_id=product_id,
                                                          db=db)
    else:
        batches = batch_service.get_batches_by_product_id_and_status(product_id=product_id,
                                                                     status=status.value,
                                                                     db=db)
    if not batches:
        raise HTTPException(status_code=404, detail="No batch found")
    return batches


@router.get("/status/{status}", response_model=List[schemas.Batch])
def read_batch_by_status(status: BatchStatus, db: Session = Depends(get_db)):
    batch = batch_service.get_batches_by_status(status=status, db=db)
    if batch is None:
        raise HTTPException(status_code=404, detail="Batch not found")
    return batch


@router.get("/plan_amount_over/{amount}")
def read_batch_plan_amount_over(amount: int, db: Session = Depends(get_db)):
    return batch_service.get_batches_plan_amount_over(
        amount=amount,
        db=db)


@router.get("/plan_amount_equal/{amount}")
def read_batch_plan_amount_equal(amount: int, db: Session = Depends(get_db)):
    return batch_service.get_batches_plan_amount_equal(
        amount=amount,
        db=db)


@router.get("/plan_amount_under/{amount}")
def read_batch_plan_amount_under(amount: int, db: Session = Depends(get_db)):
    return batch_service.get_batches_plan_amount_under(
        amount=amount,
        db=db)


@router.get("/not_fulfilled")
def read_batch_not_fulfilled(db: Session = Depends(get_db)):
    return batch_service.get_batches_not_fulfilled(db=db)


@router.get("/start_after/{date}")
def read_batch_start_after(date: datetime, db: Session = Depends(get_db)):
    return batch_service.get_batches_start_after(
        date=date,
        db=db)


@router.get("/start_on/{date}")
def read_batch_start_on(date: datetime, db: Session = Depends(get_db)):
    return batch_service.get_batches_start_on(
        date=date,
        db=db)


@router.get("/start_before/{date}")
def read_batch_start_before(date: datetime, db: Session = Depends(get_db)):
    return batch_service.get_batches_start_before(
        date=date,
        db=db)


@router.post("/", response_model=schemas.Batch)
def create_batch(batch: schemas.BatchCreate, db: Session = Depends(get_db)):
    new_batch = batch_service.create_batch(batch=batch, db=db)
    return new_batch


@router.put("/")
def update_batch(batch: schemas.Batch,
                 db: Session = Depends(get_db)):
    db_batch_data = batch_service.get_batch(batch.id, db=db)
    if not db_batch_data:
        raise HTTPException(status_code=400, detail="Matching batch not found")
    db_batch_model = schemas.Batch(**jsonable_encoder(db_batch_data))
    update_data = batch.dict(exclude_unset=True)
    updated_batch = db_batch_model.copy(update=update_data)
    return batch_service.update_batch(batch=updated_batch, db=db)


@router.put("/auto_update_status")
def auto_update_status(db: Session = Depends(get_db)):
    current = datetime.now()
    unstarted_batches = batch_service.get_batches_by_status('unstarted', db=db)
    for b in unstarted_batches:
        if (b.start <= current):
            b.status = 'ongoing'
            batch_service.update_batch(b, db=db)
    return JSONResponse(content={"success": True})


@router.put("/complete/{batch_id}/{actual_amount}")
def auto_update_status(batch_id: int, actual_amount: int, db: Session = Depends(get_db)):
    target_batch = batch_service.get_batch(batch_id, db=db)
    target_batch.status = 'finished'
    target_batch.actual_amount = actual_amount
    target_batch.end = datetime.now()
    return batch_service.update_batch(batch=target_batch, db=db)


@router.delete("/{batch_id}")
def delete_batch(batch_id: int, db: Session = Depends(get_db)):
    db_batch_data = batch_service.get_batch(batch_id, db=db)
    if not db_batch_data:
        raise HTTPException(status_code=400, detail="Matching batch not found")
    batch_service.delete_batch(batch=db_batch_data, db=db)
    return JSONResponse(content={"success": True})
