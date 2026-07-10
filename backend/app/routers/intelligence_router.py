"""Notifications, Weak Areas, Recommendations, Mock Interviews, Analytics, Gamification, Learning Memory router."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from app.database.session import get_db
from app.middleware import get_current_user
from app.models import User
from app.schemas import (
    NotificationOut,
    WeakAreaOut,
    RecommendationOut,
    MockInterviewOut,
    MockInterviewStartIn,
    MockInterviewAnswerIn,
    AnalyticsOut,
    GamificationOut,
    MessageOut,
)
from app.services import (
    list_notifications,
    mark_read,
    mark_all_read,
    delete_notification,
    list_weak_areas,
    dismiss_weak_area,
    list_recommendations,
    accept_recommendation,
    dismiss_recommendation,
    start_interview,
    submit_answer,
    list_interviews,
    get_interview,
    get_analytics,
    get_gamification_overview,
    get_learning_memory,
)

router = APIRouter(prefix="/intel", tags=["intelligence"])


# --- Notifications ---

@router.get("/notifications", response_model=list[NotificationOut])
def notifications(unread: bool = False, current: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return list_notifications(db, current.id, unread)


@router.post("/notifications/{nid}/read", response_model=NotificationOut)
def read_one(nid: UUID, current: User = Depends(get_current_user), db: Session = Depends(get_db)):
    n = mark_read(db, current.id, nid)
    if not n:
        raise HTTPException(status_code=404, detail="Notification not found")
    return n


@router.post("/notifications/read-all", response_model=MessageOut)
def read_all(current: User = Depends(get_current_user), db: Session = Depends(get_db)):
    count = mark_all_read(db, current.id)
    return MessageOut(message=f"Marked {count} as read")


@router.delete("/notifications/{nid}", response_model=MessageOut)
def remove_notif(nid: UUID, current: User = Depends(get_current_user), db: Session = Depends(get_db)):
    ok = delete_notification(db, current.id, nid)
    if not ok:
        raise HTTPException(status_code=404, detail="Notification not found")
    return MessageOut(message="deleted")


# --- Weak Areas ---

@router.get("/weak-areas", response_model=list[WeakAreaOut])
def weak_areas(current: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return list_weak_areas(db, current.id)


@router.delete("/weak-areas/{wid}", response_model=MessageOut)
def dismiss_weak(wid: UUID, current: User = Depends(get_current_user), db: Session = Depends(get_db)):
    ok = dismiss_weak_area(db, current.id, wid)
    if not ok:
        raise HTTPException(status_code=404, detail="Weak area not found")
    return MessageOut(message="dismissed")


# --- Recommendations ---

@router.get("/recommendations", response_model=list[RecommendationOut])
def recommendations(accepted: bool = False, current: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return list_recommendations(db, current.id, accepted)


@router.post("/recommendations/{rid}/accept", response_model=RecommendationOut)
def accept_rec(rid: UUID, current: User = Depends(get_current_user), db: Session = Depends(get_db)):
    r = accept_recommendation(db, current.id, rid)
    if not r:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    return r


@router.delete("/recommendations/{rid}", response_model=MessageOut)
def dismiss_rec(rid: UUID, current: User = Depends(get_current_user), db: Session = Depends(get_db)):
    ok = dismiss_recommendation(db, current.id, rid)
    if not ok:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    return MessageOut(message="dismissed")


# --- Mock Interviews ---

@router.get("/interviews", response_model=list[MockInterviewOut])
def interviews(current: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return list_interviews(db, current.id)


@router.post("/interviews", response_model=MockInterviewOut, status_code=201)
def start_iv(payload: MockInterviewStartIn, current: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return start_interview(db, current.id, payload.track)


@router.get("/interviews/{sid}", response_model=MockInterviewOut)
def get_iv(sid: UUID, current: User = Depends(get_current_user), db: Session = Depends(get_db)):
    iv = get_interview(db, current.id, sid)
    if not iv:
        raise HTTPException(status_code=404, detail="Interview not found")
    return iv


@router.post("/interviews/answer", response_model=MockInterviewOut)
def answer_iv(payload: MockInterviewAnswerIn, current: User = Depends(get_current_user), db: Session = Depends(get_db)):
    iv = submit_answer(db, current.id, payload.session_id, payload.question_index, payload.answer, payload.self_rating, payload.notes)
    if not iv:
        raise HTTPException(status_code=404, detail="Interview not found")
    return iv


# --- Analytics ---

@router.get("/analytics", response_model=AnalyticsOut)
def analytics(current: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_analytics(db, current.id)


# --- Gamification ---

@router.get("/gamification", response_model=GamificationOut)
def gamification(current: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_gamification_overview(db, current.id)


# --- Learning Memory ---

@router.get("/memory")
def memory(current: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_learning_memory(db, current.id)
