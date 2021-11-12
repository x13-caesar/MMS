from fastapi import APIRouter, Depends
from typing import List
from .. import schemas
from ..services import specification_service, component_service
from sqlalchemy.orm import Session
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from fastapi import HTTPException

from ..dependencies import get_db


router = APIRouter(
    prefix="/components",
    tags=["component"],
    responses={404: {"description": "Not found"}},
)


@router.get("/", response_model=List[schemas.Component])
def read_components(db: Session = Depends(get_db)):
    components = component_service.get_components(db=db)
    return components


@router.get("/all_categories", response_model=List[schemas.CompoCategory])
def read_components(db: Session = Depends(get_db)):
    return component_service.get_compo_categories(db=db)


@router.get("/existing_ids", response_model=List[str])
def read_all_component_ids(db: Session = Depends(get_db)):
    ids = [compo.id for compo in component_service.get_all_ids(db=db)]
    return ids


@router.get("/{component_id}", response_model=schemas.Component)
def read_component(component_id: str, db: Session = Depends(get_db)):
    component = component_service.get_component(component_id=component_id, db=db)
    if component is None:
        raise HTTPException(status_code=404, detail="Component not found")
    return component


@router.get("/name/{name}")
def read_component_by_name(name: str, db: Session = Depends(get_db)):
    component = component_service.get_component_by_name(name=name, db=db)
    if component is None:
        raise HTTPException(status_code=404, detail="Component not found")
    return component


@router.get("/category/{category}")
def read_component_by_category(category: str, db: Session = Depends(get_db)):
    component = component_service.get_component_by_category(category=category, db=db)
    if component is None:
        raise HTTPException(status_code=404, detail="Component not found")
    return component


@router.get("/low_stock/{component_id}")
def if_component_stock_low(component_id: int, db: Session = Depends(get_db)):
    comp = component_service.get_component(component_id=component_id,
                                           db=db)
    specs = specification_service.get_specifications_by_component_id(component_id=component_id,
                                                                     db=db)
    total_stock = sum([s.stock for s in specs])
    return True if comp.warn_stock > total_stock else False


@router.get("/low_stock", response_model=List[schemas.Component])
def read_components_with_low_stock(db: Session = Depends(get_db)):
    all_components = component_service.get_components(db=db)
    return [comp for comp in all_components if if_component_stock_low(component_id=comp.id)]


@router.post("/", response_model=schemas.Component)
def create_component(component: schemas.ComponentCreate, db: Session = Depends(get_db)):
    return component_service.create_component(component=component, db=db)


@router.put("/")
def update_component(component: schemas.Component, db: Session = Depends(get_db)):
    db_component_data = component_service.get_component(component.id, db=db)
    if not db_component_data:
        raise HTTPException(status_code=400, detail="Matching component not found")
    db_component_model = schemas.Component(**jsonable_encoder(db_component_data))
    update_data = component.dict(exclude_unset=True)
    updated_component = db_component_model.copy(update=update_data)
    return component_service.update_component(component=updated_component, db=db)


@router.delete("/{component_id}")
def delete_component(component_id: str, db: Session = Depends(get_db)):
    db_component_data = component_service.get_component(component_id, db=db)
    if not db_component_data:
        raise HTTPException(status_code=400, detail="Matching component not found")
    component_service.delete_component(component=db_component_data, db=db)
    return JSONResponse(content={"success": True})
