from sqlalchemy.orm import Session

from fastapi.encoders import jsonable_encoder
from .. import models, schemas


def get_specification(specification_id: str, db: Session):
    return db.query(models.Specification).filter(models.Specification.id == specification_id).first()


def get_specifications(db: Session):
    return db.query(models.Specification).all()


def get_specification_net_price_by_id(specification_id: str, db: Session):
    return db.query(models.Specification.net_price).filter(models.Specification.id == specification_id).first()


def get_specification_gross_price_by_id(specification_id: str, db: Session):
    return db.query(models.Specification.gross_price).filter(models.Specification.id == specification_id).first()


def get_specifications_by_component(component: models.Component, db: Session):
    return db.query(models.Specification).filter(models.Specification.component_id == component.id).all()


def get_specifications_by_component_id(component_id: str, db: Session):
    return db.query(models.Specification).filter(models.Specification.component_id == component_id).all()


def get_specifications_by_vendor_id(vendor_id: int, db: Session):
    return db.query(models.Specification).filter(models.Specification.vendor_id == vendor_id).all()


def get_specifications_by_component_id_and_vendor_id(component_id: str, vendor_id: int, db: Session):
    return db.query(models.Specification).filter(
        models.Specification.vendor_id == vendor_id,
        models.Specification.component_id == component_id).all()


def get_specifications_over_price(price: int, gross: bool, db: Session):
    if gross:
        return db.query(models.Specification).filter(models.Specification.gross_price > price).all()
    else:
        return db.query(models.Specification).filter(models.Specification.net_price > price).all()


def get_specifications_equal_price(price: int, gross: bool, db: Session):
    if gross:
        return db.query(models.Specification).filter(models.Specification.gross_price == price).all()
    else:
        return db.query(models.Specification).filter(models.Specification.net_price == price).all()


def get_specifications_under_price(price: int, gross: bool, db: Session):
    if gross:
        return db.query(models.Specification).filter(models.Specification.gross_price < price).all()
    else:
        return db.query(models.Specification).filter(models.Specification.net_price < price).all()


def create_specification(specification: schemas.SpecificationCreate, db: Session):
    new_specification = models.Specification(**specification.dict())
    db.add(new_specification)
    db.commit()
    db.refresh(new_specification)
    return new_specification


def update_specification(specification: schemas.Specification, db: Session):
    json_spec = jsonable_encoder(specification)
    json_spec.pop("vendor", None)
    update_spec = models.Specification(**json_spec)
    db.query(models.Specification). \
        filter(models.Specification.id == update_spec.id). \
        update(jsonable_encoder(update_spec))
    db.commit()
    return db.query(models.Specification).filter(models.Specification.id == specification.id).first()


def delete_specification(specification: schemas.Specification, db: Session):
    db.query(models.Specification). \
        filter(models.Specification.id == specification.id). \
        delete(synchronize_session="fetch")
    db.commit()
    return {"success": True, "detail": ''}


def get_all_ids(db):
    return db.query(models.Specification.id).all()

