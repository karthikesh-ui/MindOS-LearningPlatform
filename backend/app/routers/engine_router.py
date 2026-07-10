"""Learning Engine router — the single entry point for cascading updates."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.middleware import get_current_user
from app.models import User
from app.schemas import EngineEventIn, EngineResultOut
from app.services import process_event

router = APIRouter(prefix="/engine", tags=["engine"])


@router.post("/event", response_model=EngineResultOut)
def fire_event(
    event: EngineEventIn,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Fire a learning event. The engine cascades updates across all modules."""
    result = process_event(db, current.id, event.model_dump())
    return EngineResultOut(**result)
