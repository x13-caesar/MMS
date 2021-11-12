from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from fastapi import HTTPException

from ..schemas import User
from ..security.token_service import get_current_active_user
from sqlalchemy.orm import Session
from ..services import user_service

from ..dependencies import get_db

router = APIRouter(
    prefix="/users",
    tags=["user"],
    responses={404: {"description": "Not found"}},
)


@router.get("/me")
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    return current_user


@router.post("/")
async def create_user(user: User, db: Session = Depends(get_db)):
    user_service.create_user(user=user, db=db)
    return JSONResponse(content={"success": True})
