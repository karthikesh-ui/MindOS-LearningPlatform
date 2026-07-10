from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.middleware import get_current_user
from app.models import User
from app.schemas import BookmarkIn, BookmarkOut, MessageOut
from app.services import add_bookmark, list_bookmarks, remove_bookmark

router = APIRouter(prefix="/bookmarks", tags=["bookmarks"])


@router.get("", response_model=list[BookmarkOut])
def list_my_bookmarks(current: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return list_bookmarks(db, current.id)


@router.post("", response_model=BookmarkOut, status_code=status.HTTP_201_CREATED)
def create_bookmark(
    payload: BookmarkIn,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return add_bookmark(db, current.id, payload.model_dump())


@router.delete("/{bookmark_id}", response_model=MessageOut)
def delete_bookmark(bookmark_id: str, current: User = Depends(get_current_user), db: Session = Depends(get_db)):
    ok = remove_bookmark(db, current.id, bookmark_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Bookmark not found")
    return MessageOut(message="deleted")
