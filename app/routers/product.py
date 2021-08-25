from fastapi import APIRouter, Depends
from typing import List

from .. import schemas
from ..services import product_service, process_service, process_component_service
from sqlalchemy.orm import Session
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from fastapi import HTTPException

from ..dependencies import get_db

router = APIRouter(
    prefix="/products",
    tags=["products"],
    responses={404: {"description": "Not found"}},
)


@router.get("/", response_model=List[schemas.Product])
def read_products(db: Session = Depends(get_db)):
    products = product_service.get_products(db=db)
    return products


@router.get("/only_name")
def read_products_names(db: Session = Depends(get_db)):
    products = product_service.get_products_names(db=db)
    return products


@router.get("/{product_id}", response_model=schemas.Product)
def read_product(product_id: int, db: Session = Depends(get_db)):
    product = product_service.get_product(product_id=product_id, db=db)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.get("/only_name/{product_id}")
def read_product_name(product_id: int, db: Session = Depends(get_db)):
    product_name = product_service.get_product_name(product_id=product_id, db=db)
    if product_name is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return {'id': product_id, 'name': product_name}


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


@router.post("/")
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    for process in product.process:
        process.id = str(product.id) + str(process.process_order).rjust(2, '0')
        process.product_id = product.id
        for idx, process_component in enumerate(process.process_component):
            print(process_component)
            process_component.id = str(process.id) + str(idx+1).rjust(2, '0')
            process_component.process_id = process.id
            process_component_service.create_process_component(process_component, db=db)
        process.process_component = []
        process_service.create_process(process, db=db)
    product.process = []
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


@router.put("/adjust_inventory/{product_id}/{adjust_number}")
def adjust_inventory(product_id: int, adjust_number: int,
                     db: Session = Depends(get_db)):
    db_product_data = product_service.get_product(product_id, db=db)
    if not db_product_data:
        raise HTTPException(status_code=400, detail="Matching product not found")
    db_product_data.inventory += adjust_number
    return product_service.update_product(product=db_product_data, db=db)


@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    db_product_data = product_service.get_product(product_id, db=db)
    if not db_product_data:
        raise HTTPException(status_code=400, detail="Matching product not found")
    product_service.delete_product(product=db_product_data, db=db)
    return JSONResponse(content={"success": True})
