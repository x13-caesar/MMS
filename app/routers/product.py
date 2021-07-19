from fastapi import APIRouter, Depends
from typing import List
from .. import schemas
from ..services import product_service
from sqlalchemy.orm import Session
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from fastapi import HTTPException

from ..dependencies import get_db

router = APIRouter(
    prefix="/products",
    tags=["product"],
    responses={404: {"description": "Not found"}},
)


@router.get("/", response_model=List[schemas.Product])
def read_products(db: Session = Depends(get_db)):
    products = product_service.get_products(db=db)
    return products


@router.get("/{product_id}", response_model=schemas.Product)
def read_product(product_id: int, db: Session = Depends(get_db)):
    product = product_service.get_product(product_id=product_id, db=db)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.get("/category/{category}")
def read_products_by_category(category: str, db: Session = Depends(get_db)):
    product = product_service.get_products_by_category(category=category, db=db)
    if not product:
        raise HTTPException(status_code=404, detail="No product found")
    return product


@router.get("/name/{name}")
def read_products_by_name(name: str, db: Session = Depends(get_db)):
    product = product_service.get_products_by_name(name=name, db=db)
    if not product:
        raise HTTPException(status_code=404, detail="No product found")
    return product


@router.get("/inventory_over/{inventory}")
def read_product_over_inventory(inventory: int, db: Session = Depends(get_db)):
    return product_service.get_products_over_inventory(
        inventory=inventory,
        db=db)


@router.get("/inventory_equal/{inventory}")
def read_product_equal_inventory(inventory: int, db: Session = Depends(get_db)):
    return product_service.get_products_equal_inventory(
        inventory=inventory,
        db=db)


@router.get("/inventory_under/{inventory}")
def read_product_under_inventory(inventory: int, db: Session = Depends(get_db)):
    return product_service.get_products_under_inventory(
        inventory=inventory,
        db=db)


@router.post("/", response_model=schemas.Product)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    return product_service.create_product(product=product, db=db)


@router.put("/")
def update_product(product: schemas.Product,
                   db: Session = Depends(get_db)):
    db_product_data = product_service.get_product(product.id, db=db)
    if not db_product_data:
        raise HTTPException(status_code=400, detail="Matching product not found")
    db_product_model = schemas.Product(**jsonable_encoder(db_product_data))
    update_data = product.dict(exclude_unset=True)
    updated_product = db_product_model.copy(update=update_data)
    return product_service.update_product(product=updated_product, db=db)


@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    db_product_data = product_service.get_product(product_id, db=db)
    if not db_product_data:
        raise HTTPException(status_code=400, detail="Matching product not found")
    product_service.delete_product(product=db_product_data, db=db)
    return JSONResponse(content={"success": True})
