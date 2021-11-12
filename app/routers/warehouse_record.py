from fastapi import APIRouter, Depends
from typing import List
from .. import schemas
from ..services import warehouse_record_service
from sqlalchemy.orm import Session
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from fastapi import HTTPException

from ..dependencies import get_db

router = APIRouter(
    prefix="/warehouse_record",
    tags=["warehouse_record"],
    responses={404: {"description": "Not found"}},
)


@router.get("/", response_model=List[schemas.WarehouseRecord])
def read_warehouse_records(db: Session = Depends(get_db)):
    warehouse_records = warehouse_record_service.get_warehouse_records(db=db)
    return warehouse_records


@router.get("/{warehouse_record_id}", response_model=schemas.WarehouseRecord)
def read_warehouse_record(warehouse_record_id: int, db: Session = Depends(get_db)):
    warehouse_record = warehouse_record_service.get_warehouse_record(warehouse_record_id=warehouse_record_id, db=db)
    if warehouse_record is None:
        raise HTTPException(status_code=404, detail="WarehouseRecord not found")
    return warehouse_record


@router.get("/batch_process_id/{batch_process_id}", response_model=List[schemas.WarehouseRecord])
def read_warehouse_records_by_product_id(batch_process_id: int, db: Session = Depends(get_db)):
    warehouse_records = warehouse_record_service.get_warehouse_records_by_batch_process_id(batch_process_id=batch_process_id, db=db)
    if not warehouse_records:
        raise HTTPException(status_code=404, detail="No warehouse_record found")
    return warehouse_records


@router.get("/component_id/{component_id}")
def read_warehouse_records_by_name(component_id: str, db: Session = Depends(get_db)):
    warehouse_records = warehouse_record_service.get_warehouse_records_by_component_id(component_id=component_id, db=db)
    if not warehouse_records:
        raise HTTPException(status_code=404, detail="No warehouse_record found")
    return warehouse_records


@router.post("/", response_model=schemas.WarehouseRecord)
def create_warehouse_record(warehouse_record: schemas.WarehouseRecordCreate, db: Session = Depends(get_db)):
    return warehouse_record_service.create_warehouse_record(warehouse_record=warehouse_record, db=db)


@router.put("/")
def update_warehouse_record(warehouse_record: schemas.WarehouseRecord,
                   db: Session = Depends(get_db)):
    db_warehouse_record_data = warehouse_record_service.get_warehouse_record(warehouse_record.id, db=db)
    if not db_warehouse_record_data:
        raise HTTPException(status_code=400, detail="Matching warehouse_record not found")
    db_warehouse_record_model = schemas.WarehouseRecord(**jsonable_encoder(db_warehouse_record_data))
    update_data = warehouse_record.dict(exclude_unset=True)
    updated_warehouse_record = db_warehouse_record_model.copy(update=update_data)
    return warehouse_record_service.update_warehouse_record(warehouse_record=updated_warehouse_record, db=db)


@router.delete("/{warehouse_record_id}")
def delete_warehouse_record(warehouse_record_id: int, db: Session = Depends(get_db)):
    db_warehouse_record_data = warehouse_record_service.get_warehouse_record(warehouse_record_id, db=db)
    if not db_warehouse_record_data:
        raise HTTPException(status_code=400, detail="Matching warehouse_record not found")
    warehouse_record_service.delete_warehouse_record(warehouse_record=db_warehouse_record_data, db=db)
    return JSONResponse(content={"success": True})
