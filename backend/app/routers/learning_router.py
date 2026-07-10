from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.middleware import get_current_user
from app.models import Language, Progress, User
from app.schemas import LanguageOut, LanguageWithProgressOut, ProgressOut
from app.services import list_languages, list_progress

router = APIRouter(prefix="/learning", tags=["learning"])


@router.get("/hub", response_model=list[LanguageWithProgressOut])
def learning_hub(current: User = Depends(get_current_user), db: Session = Depends(get_db)):
    languages: list[Language] = list_languages(db)
    progress: list[Progress] = list_progress(db, current.id)
    by_lang = {p.language_id: p for p in progress}
    out: list[LanguageWithProgressOut] = []
    for lang in languages:
        item = LanguageWithProgressOut.model_validate(lang)
        p = by_lang.get(lang.id)
        if p:
            item.progress = ProgressOut.model_validate(p)
        out.append(item)
    return out


@router.get("/progress", response_model=list[ProgressOut])
def my_progress(current: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return list_progress(db, current.id)
