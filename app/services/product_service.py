from sqlalchemy.orm import Session

from fastapi.encoders import jsonable_encoder
from .. import models, schemas


def get_product(product_id: int, db: Session):
    return db.query(models.Product).filter(models.Product.id == product_id).first()


def get_products(db: Session):
    return db.query(models.Product).all()


def get_products_by_category(category: str, db: Session):
    return db.query(models.Product).filter(models.Product.category == category).all()


def get_products_by_name(name: str, db: Session):
    return db.query(models.Product).filter(models.Product.name == name).all()


def get_products_over_inventory(inventory: int, db: Session):
    return db.query(models.Product).filter(models.Product.inventory > inventory).all()


def get_products_equal_inventory(inventory: int, db: Session):
    return db.query(models.Product).filter(models.Product.inventory == inventory).all()


def get_products_under_inventory(inventory: int, db: Session):
    return db.query(models.Product).filter(models.Product.inventory < inventory).all()


def create_product(product: schemas.ProductCreate, db: Session):
    new_product = models.Product(**product.dict())
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product


def update_product(product: schemas.Product, db: Session):
    updated_product = models.Product(**product.dict())
    db.query(models.Product). \
        filter(models.Product.id == updated_product.id). \
        update(jsonable_encoder(updated_product))
    db.commit()
    return db.query(models.Product).filter(models.Product.id == updated_product.id).first()


def delete_product(product: schemas.Product, db: Session):
    db.query(models.Product). \
        filter(models.Product.id == product.id). \
        delete(synchronize_session="fetch")
    db.commit()
    return
