from sqlalchemy.orm import Session

from fastapi.encoders import jsonable_encoder
from .. import schemas
from ..models import Product


def get_product(product_id: int, db: Session):
    return db.query(Product).filter(Product.id == product_id).first()


def get_product_name(product_id: int, db: Session):
    return db.query(Product.name).filter(Product.id == product_id).first().name


def get_products(db: Session):
    return db.query(Product).all()


def get_products_names(db: Session):
    return db.query(Product.id, Product.name).all()


def get_products_by_category(category: str, db: Session):
    return db.query(Product).filter(Product.category == category).all()


def get_products_by_name(name: str, db: Session):
    return db.query(Product).filter(Product.name == name).all()


def get_products_over_inventory(inventory: int, db: Session):
    return db.query(Product).filter(Product.inventory > inventory).all()


def get_products_equal_inventory(inventory: int, db: Session):
    return db.query(Product).filter(Product.inventory == inventory).all()


def get_products_under_inventory(inventory: int, db: Session):
    return db.query(Product).filter(Product.inventory < inventory).all()


def create_product(product: schemas.ProductCreate, db: Session):
    product_data = jsonable_encoder(product)
    new_product = Product(**product_data)
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    new_id = new_product.id
    return {"success": True, "detail": new_id}


def update_product(product: schemas.Product, db: Session):
    updated_product = Product(**jsonable_encoder(product))
    db.query(Product). \
        filter(Product.id == updated_product.id). \
        update(jsonable_encoder(updated_product))
    db.commit()
    return db.query(Product).filter(Product.id == updated_product.id).first()


def delete_product(product: schemas.Product, db: Session):
    db.query(Product). \
        filter(Product.id == product.id). \
        delete(synchronize_session="fetch")
    db.commit()
    return {"success": True, "detail": ''}
