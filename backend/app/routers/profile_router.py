from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.middleware import get_current_user
from app.models import User
from app.schemas import ProfileOut, ProfileUpdate
from app.services import get_profile, update_profile

router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("", response_model=ProfileOut)
def fetch_profile(current: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = get_profile(db, current.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile


@router.patch("", response_model=ProfileOut)
def patch_profile(
    patch: ProfileUpdate,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = update_profile(db, current.id, patch.model_dump(exclude_unset=True))
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile
