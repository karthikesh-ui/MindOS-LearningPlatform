from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models import Profile


def get_profile(db: Session, user_id) -> Profile | None:
    return db.get(Profile, user_id)


def update_profile(db: Session, user_id, patch: dict) -> Profile | None:
    profile = db.get(Profile, user_id)
    if not profile:
        return None
    for key, value in patch.items():
        if value is not None and hasattr(profile, key):
            setattr(profile, key, value)
    profile.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(profile)
    return profile
