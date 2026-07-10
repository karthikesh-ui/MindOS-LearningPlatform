from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.middleware import get_current_user
from app.models import Achievement, User
from app.schemas import AchievementOut
from app.services import get_xp_summary, get_streak, list_achievements, list_user_achievements

router = APIRouter(prefix="/meta", tags=["meta"])


@router.get("/achievements", response_model=list[AchievementOut])
def achievements(current: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return list_achievements(db)


@router.get("/xp")
def xp(current: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_xp_summary(db, current.id)


@router.get("/streak")
def streak(current: User = Depends(get_current_user), db: Session = Depends(get_db)):
    s = get_streak(db, current.id)
    if not s:
        return {"current": 0, "longest": 0, "last_study_date": None, "week_mask": "0000000"}
    return {
        "current": s.current,
        "longest": s.longest,
        "last_study_date": s.last_study_date,
        "week_mask": s.week_mask,
    }
