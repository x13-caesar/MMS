from fastapi import APIRouter, Depends
from typing import List
from .. import schemas
from ..services import batch_process_service, batch_service
from sqlalchemy.orm import Session
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from fastapi import HTTPException

from ..dependencies import get_db

router = APIRouter(
    prefix="/batch_process",
    tags=["batch_process"],
    responses={404: {"description": "Not found"}},
)


@router.get("/", response_model=List[schemas.BatchProcess])
def read_batch_processes(db: Session = Depends(get_db)):
    batch_processes = batch_process_service.get_batch_processes(db=db)
    return batch_processes


@router.get("/{batch_process_id}", response_model=schemas.BatchProcess)
def read_batch_process(batch_process_id: int, db: Session = Depends(get_db)):
    batch_process = batch_process_service.get_batch_process(
        batch_process_id=batch_process_id,
        db=db)
    if batch_process is None:
        raise HTTPException(status_code=404, detail="Process component not found")
    return batch_process


@router.get("/process_id/{process_id}")
def read_batch_processes_by_process_id(process_id: int, db: Session = Depends(get_db)):
    batch_processes = batch_process_service.get_batch_processes_by_process_id(
        process_id=process_id,
        db=db)
    if not batch_processes:
        raise HTTPException(status_code=404, detail="No process component found")
    return batch_processes


@router.get("/status/{status}")
def read_batch_processes_by_status(status: str, db: Session = Depends(get_db)):
    batch_processes = batch_process_service.get_batch_processes_by_status(
        status=status,
        db=db)
    if not batch_processes:
        raise HTTPException(status_code=404, detail="No process component found")
    return batch_processes


@router.get("/product_id/{product_id}/{batch_status}")
def read_batch_processes_by_product_id_and_batch_status(product_id: int, batch_status: str, db: Session = Depends(get_db)):
    batches = batch_service.get_batches_by_product_id_and_status(product_id=product_id,
                                                                 status=batch_status,
                                                                 db=db)
    result = []
    for batch in batches:
        batch_processes = batch_process_service.get_batch_processes_by_batch_id(
            batch_id=batch.id,
            db=db)
        if batch_processes:
            result.extend(result)
    if not result:
        raise HTTPException(status_code=404, detail="No process component found")
    return result


@router.post("/", response_model=schemas.BatchProcess)
def create_batch_process(batch_process: schemas.BatchProcessCreate, db: Session = Depends(get_db)):
    return batch_process_service.create_batch_process(batch_process=batch_process, db=db)


@router.put("/")
def update_batch_process(batch_process: schemas.BatchProcess,
                             db: Session = Depends(get_db)):
    db_batch_process_data = batch_process_service.get_batch_process(batch_process.id, db=db)
    if not db_batch_process_data:
        raise HTTPException(status_code=400, detail="Matching process component not found")
    db_batch_process_model = schemas.BatchProcess(**jsonable_encoder(db_batch_process_data))
    update_data = batch_process.dict(exclude_unset=True)
    updated_batch_process = db_batch_process_model.copy(update=update_data)
    return batch_process_service.update_batch_process(batch_process=updated_batch_process, db=db)


@router.delete("/{batch_process_id}")
def delete_batch_process(batch_process_id: int, db: Session = Depends(get_db)):
    db_batch_process_data = batch_process_service.get_batch_process(batch_process_id, db=db)
    if not db_batch_process_data:
        raise HTTPException(status_code=400, detail="Matching process component not found")
    batch_process_service.delete_batch_process(batch_process=db_batch_process_data, db=db)
    return JSONResponse(content={"success": True})
