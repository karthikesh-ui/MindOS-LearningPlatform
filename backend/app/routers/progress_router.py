from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.middleware import get_current_user
from app.models import User
from app.services import progress_overview

router = APIRouter(prefix="/progress", tags=["progress"])


@router.get("")
def overview(current: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return progress_overview(db, current.id)
