from sqlalchemy.orm import Session

from fastapi.encoders import jsonable_encoder
from .. import models, schemas

from . import specification_service

def get_component(component_id: str, db: Session):
    return db.query(models.Component).filter(models.Component.id == component_id).first()


def get_components(db: Session):
    return db.query(models.Component).all()


def get_component_by_category(category: str, db: Session):
    return db.query(models.Component).filter(models.Component.category == category).first()


def get_component_by_name(name: str, db: Session):
    return db.query(models.Component).filter(models.Component.name == name).all()


def if_component_low_stock(component_id: str, db: Session):
    comp = get_component(component_id=component_id,
                         db=db)
    specs = specification_service.get_specifications_by_component_id(component_id=component_id,
                                                                     db=db)
    total_stock = sum([s.stock for s in specs])
    return True if comp.warn_stock > total_stock else False


def create_component(component: schemas.ComponentCreate, db: Session):
    new_component = models.Component(**component.dict())
    db.add(new_component)
    db.commit()
    db.refresh(new_component)
    new_id = new_component.id
    return {"success": True, "detail": new_id}


def update_component(component: schemas.Component, db: Session):
    updated_component = models.Component(**component.dict())
    db.query(models.Component). \
        filter(models.Component.id == updated_component.id). \
        update(jsonable_encoder(updated_component))
    db.commit()
    return db.query(models.Component).filter(models.Component.id == updated_component.id).first()


def delete_component(component: schemas.Component, db: Session):
    db.query(models.Component). \
        filter(models.Component.id == component.id). \
        delete(synchronize_session="fetch")
    db.commit()
    return