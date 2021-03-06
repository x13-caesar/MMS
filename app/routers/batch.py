# coding=utf-8

from fastapi import APIRouter, Depends
from typing import List
from .. import schemas
from ..services import batch_service, process_service
from sqlalchemy.orm import Session
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi import HTTPException
from collections import defaultdict
import pandas as pd
import io

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
    urgent_batches = batch_service.get_batches_by_status('urgent', db=db)
    unstarted_batches = batch_service.get_batches_by_status('unstarted', db=db)
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


@router.get("/batch-summary/download/{batch_id}.csv")
async def download_batch_summary_csv(batch_id: int, db: Session = Depends(get_db)):
    db_batch = batch_service.get_batch(batch_id=batch_id, db=db)
    columns = ['??????', '??????', '?????????', '??????????????????????????????', '??????????????????????????????',
               '??????????????????????????????', '??????????????????????????????', '??????????????????????????????', '??????????????????????????????',
               '??????????????????????????????', '??????????????????????????????']
    records = {}
    b_spec_ta, b_spec_ti, b_emp_ta, b_emp_ti = 0, 0, 0, 0
    b_spec_ua, b_spec_ui, b_emp_ua, b_emp_ui = 0, 0, 0, 0
    consumption, ideal_unit_consumption = defaultdict(int), defaultdict(int)
    for bp in db_batch.batch_process:
        bp_spec_ta, bp_spec_ti, bp_emp_ta, bp_emp_ti = 0, 0, 0, 0
        bp_spec_ua, bp_spec_ui, bp_emp_ua, bp_emp_ui = 0, 0, 0, 0
        # ??????????????????batch?????????????????????????????????????????????work?????????
        # ??????????????????100%???????????????????????? work plan ????????????????????????
        # ????????? warehouse record ???????????????????????????????????????????????? batch plan
        for wr in bp.warehouse_record:
            ideal_unit_consumption[wr.component_name] += wr.consumption
            # ?????????bp ???????????????
            bp_spec_ui += wr.specification_gross_price * wr.consumption
        for w in bp.work:
            w_spec_ta, w_spec_ti, w_emp_ta, w_emp_ti = 0, 0, 0, 0
            w_spec_ua, w_spec_ui, w_emp_ua, w_emp_ui = 0, 0, 0, 0
            # ???????????? = ???????????? * ?????????|???????????????
            # ?????????????????????
            for ws in w.work_specification:
                w_spec_ta += ws.specification_gross_price * ws.actual_amount
                w_spec_ti += ws.specification_gross_price * ws.plan_amount
                # ???????????????????????????
                consumption[ws.component_name] += ws.actual_amount
            # ????????????
            w_emp_ta = w.complete_hour * w.hour_pay + w.complete_unit * w.unit_pay
            w_emp_ti = bp.unit_pay * w.plan_unit
            w_emp_ua = w_emp_ta / w.complete_unit
            w_emp_ui = bp.unit_pay
            w_spec_ua = w_spec_ta / w.complete_unit
            w_spec_ui = w_spec_ui / w.plan_unit
            # ??? work ??????????????? ???bp ????????????
            bp_spec_ta += w_spec_ta
            bp_emp_ta += w_emp_ta
        # ???bp ???????????? ?????? ???bp ???????????????
        # ???bp ??????????????? ?????? ???bp ???????????????
        bp_spec_ti = bp_spec_ui * bp.start_amount
        bp_spec_ua = bp_spec_ta / bp.end_amount
        bp_emp_ti = bp.start_amount * bp.unit_pay
        bp_emp_ua = bp_emp_ta / bp.end_amount
        bp_emp_ui = bp.unit_pay
        # ???????????? bp
        bp_record_index = str(bp.process.process_order) + ' - ' + bp.process.process_name
        records[bp_record_index] = [
            bp.start_amount, bp.end_amount, bp.end_amount / bp.start_amount, bp_spec_ti, bp_spec_ta,
            bp_emp_ti, bp_emp_ta, bp_spec_ui, bp_spec_ua, bp_emp_ui, bp_emp_ua
        ]
        # ??? bp ??????????????? ???batch ????????????
        b_spec_ta += bp_spec_ta
        b_spec_ti += bp_spec_ti
        b_emp_ta += bp_emp_ta
        b_emp_ti += bp_emp_ti

    # ?????????bp ?????????
    b_spec_ua = b_spec_ta / db_batch.actual_amount
    b_spec_ui = b_spec_ti / db_batch.plan_amount
    b_emp_ua = b_emp_ta / db_batch.actual_amount
    b_emp_ui = b_emp_ti / db_batch.plan_amount
    # ???????????? batch
    batch_record_index = '??????' + str(batch_id) + '??????'
    records[batch_record_index] = [
        db_batch.plan_amount, db_batch.actual_amount, db_batch.actual_amount / db_batch.plan_amount,
        b_spec_ti, b_spec_ta, b_emp_ti, b_emp_ta,
        b_spec_ui, b_spec_ua, b_emp_ui, b_emp_ua
    ]

    df = pd.DataFrame.from_dict(records, orient='index',
                                columns=columns).reset_index()
    print(df)
    response = StreamingResponse(io.StringIO('\ufeff' + df.to_csv(index=False)),
                                 media_type="text/csv")
    response.headers["Content-Disposition"] = f"attachment; filename={str(db_batch.id)}.csv"
    return response


@router.post("/", response_model=schemas.Batch)
def create_batch(batch: schemas.BatchCreate, db: Session = Depends(get_db)):
    month_db_existing = batch_service.get_batches_in_month(batch.start.year,
                                                           batch.start.month,
                                                           db=db)
    prefix = ((batch.start.year - 2000) * 100 + batch.start.month) * 100
    suffix = 1 if not month_db_existing else (1 + len(month_db_existing))
    batch.id = prefix + suffix
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
