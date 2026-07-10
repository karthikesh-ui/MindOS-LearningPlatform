from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas import GoogleLoginIn, GuestLoginIn, TokenOut, UserOut
from app.services import login_with_google, login_as_guest
from app.auth import GoogleAuthError

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/google", response_model=TokenOut)
def google_login(payload: GoogleLoginIn, db: Session = Depends(get_db)):
    try:
        user, token, expires_in = login_with_google(db, payload.id_token)
    except GoogleAuthError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc))
    return TokenOut(access_token=token, expires_in=expires_in, user=UserOut.model_validate(user))


@router.post("/guest", response_model=TokenOut)
def guest_login(payload: GuestLoginIn | None = None, db: Session = Depends(get_db)):
    name = payload.name if payload else None
    user, token, expires_in = login_as_guest(db, name)
    return TokenOut(access_token=token, expires_in=expires_in, user=UserOut.model_validate(user))
