from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.middleware import get_current_user
from app.models import User
from app.schemas import DashboardOut
from app.services import build_dashboard

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("", response_model=DashboardOut)
def fetch_dashboard(current: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return build_dashboard(db, current)
