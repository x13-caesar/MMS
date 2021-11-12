from fastapi import APIRouter, Depends
from .. import schemas
from . import token_service
from sqlalchemy.orm import Session

from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta

from ..dependencies import get_db


router = APIRouter(
    prefix="/token",
    tags=["token"],
    responses={404: {"description": "Not found"}},
)


@router.post("/", response_model=schemas.Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = token_service.authenticate_user(form_data.username, form_data.password, db=db)
    access_token_expires = timedelta(days=token_service.ACCESS_TOKEN_EXPIRE_DAYS)
    access_token = token_service.create_access_token(data={"sub": user.username,
                                                           "role": user.role},
                                                     expires_delta=access_token_expires)
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/get_user", response_model=schemas.Token)
async def get_user(user_token: str):
    return token_service.get_current_user(user_token)


@router.post("/check_login", response_model=schemas.Token)
async def check_login(user_token: str):
    return token_service.get_current_user(user_token)
