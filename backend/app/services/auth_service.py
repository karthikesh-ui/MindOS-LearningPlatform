import uuid
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.auth import create_access_token, verify_google_id_token, GoogleAuthError
from app.core.config import settings
from app.models import User, Profile, Setting, Streak


def _upsert_user(
    db: Session,
    *,
    email: str,
    name: str,
    provider: str,
    avatar_url: str | None,
    provider_subject: str | None,
    is_guest: bool,
) -> User:
    user = db.query(User).filter(User.email == email).first()
    if user:
        # Refresh mutable fields on each login
        user.name = name or user.name
        user.avatar_url = avatar_url or user.avatar_url
        user.provider_subject = provider_subject or user.provider_subject
        db.commit()
        return user

    user = User(
        email=email,
        name=name,
        provider=provider,
        avatar_url=avatar_url,
        provider_subject=provider_subject,
        is_guest=is_guest,
    )
    db.add(user)
    db.flush()

    db.add(Profile(user_id=user.id, weekly_goal_minutes=300))
    db.add(Setting(user_id=user.id))
    db.add(Streak(user_id=user.id))
    db.commit()
    db.refresh(user)
    return user


def _issue_token(user: User, expires_minutes: int) -> tuple[str, int]:
    token = create_access_token(str(user.id), expires_minutes, extra={"email": user.email})
    return token, expires_minutes * 60


def login_with_google(db: Session, id_token_str: str):
    try:
        claims = verify_google_id_token(id_token_str)
    except GoogleAuthError:
        raise

    email = claims.get("email")
    if not email:
        raise GoogleAuthError("ID token missing email claim")

    user = _upsert_user(
        db,
        email=email,
        name=claims.get("name", email.split("@")[0]),
        provider="google",
        avatar_url=claims.get("picture"),
        provider_subject=claims.get("sub"),
        is_guest=False,
    )
    token, expires_in = _issue_token(user, settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return user, token, expires_in


def login_as_guest(db: Session, name: str | None):
    handle = uuid.uuid4().hex[:8]
    email = f"guest_{handle}@minds.local"
    user = _upsert_user(
        db,
        email=email,
        name=name or "Guest Learner",
        provider="guest",
        avatar_url=None,
        provider_subject=handle,
        is_guest=True,
    )
    token, expires_in = _issue_token(user, settings.GUEST_TOKEN_EXPIRE_MINUTES)
    return user, token, expires_in
