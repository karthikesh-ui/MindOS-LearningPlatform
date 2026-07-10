from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.middleware import get_current_user
from app.models import Setting, User
from app.schemas import MessageOut
from pydantic import BaseModel

router = APIRouter(prefix="/settings", tags=["settings"])


class SettingsOut(BaseModel):
    theme: str
    notif_daily: bool
    notif_weekly: bool
    notif_streaks: bool
    notif_product: bool


class SettingsUpdate(BaseModel):
    theme: str | None = None
    notif_daily: bool | None = None
    notif_weekly: bool | None = None
    notif_streaks: bool | None = None
    notif_product: bool | None = None


@router.get("", response_model=SettingsOut)
def fetch_settings(current: User = Depends(get_current_user), db: Session = Depends(get_db)):
    s = db.get(Setting, current.id)
    if not s:
        s = Setting(user_id=current.id)
        db.add(s)
        db.commit()
        db.refresh(s)
    return SettingsOut(
        theme=s.theme,
        notif_daily=s.notif_daily,
        notif_weekly=s.notif_weekly,
        notif_streaks=s.notif_streaks,
        notif_product=s.notif_product,
    )


@router.patch("", response_model=SettingsOut)
def update_settings(
    patch: SettingsUpdate,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    s = db.get(Setting, current.id)
    if not s:
        s = Setting(user_id=current.id)
        db.add(s)
    for k, v in patch.model_dump(exclude_unset=True).items():
        if v is not None:
            setattr(s, k, v)
    db.commit()
    db.refresh(s)
    return SettingsOut(
        theme=s.theme,
        notif_daily=s.notif_daily,
        notif_weekly=s.notif_weekly,
        notif_streaks=s.notif_streaks,
        notif_product=s.notif_product,
    )
