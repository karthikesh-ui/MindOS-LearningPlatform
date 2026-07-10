from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.middleware import get_current_user
from app.models import User
from app.schemas import SearchOut
from app.services import global_search

router = APIRouter(prefix="/search", tags=["search"])


@router.get("", response_model=SearchOut)
def search(q: str = Query(..., min_length=1), current: User = Depends(get_current_user), db: Session = Depends(get_db)):
    results = global_search(db, current.id, q)
    return SearchOut(query=q, results=results)
