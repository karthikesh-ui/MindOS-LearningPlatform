import uuid
from datetime import datetime

from sqlalchemy import (
    BigInteger,
    Boolean,
    CheckConstraint,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database.session import Base


def _uuid() -> uuid.UUID:
    return uuid.uuid4()


class TimestampMixin:
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(120), nullable=False)
    avatar_url = Column(String(512), nullable=True)
    provider = Column(String(20), nullable=False)  # 'google' | 'guest'
    provider_subject = Column(String(255), nullable=True)  # google sub / guest handle
    is_guest = Column(Boolean, default=False, nullable=False)

    profile = relationship("Profile", uselist=False, back_populates="user", cascade="all, delete-orphan")
    progress = relationship("Progress", back_populates="user", cascade="all, delete-orphan")
    bookmarks = relationship("Bookmark", back_populates="user", cascade="all, delete-orphan")
    planner_items = relationship("PlannerItem", back_populates="user", cascade="all, delete-orphan")
    xp_ledger = relationship("XpEvent", back_populates="user", cascade="all, delete-orphan")
    achievements = relationship("UserAchievement", back_populates="user", cascade="all, delete-orphan")


class Profile(Base, TimestampMixin):
    __tablename__ = "profiles"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    bio = Column(Text, nullable=True)
    headline = Column(String(120), nullable=True)
    target_role = Column(String(120), nullable=True)
    location = Column(String(120), nullable=True)
    timezone = Column(String(60), nullable=True)
    weekly_goal_minutes = Column(Integer, default=300, nullable=False)

    user = relationship("User", back_populates="profile")


class Language(Base, TimestampMixin):
    __tablename__ = "languages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    slug = Column(String(60), unique=True, nullable=False, index=True)
    name = Column(String(80), nullable=False)
    tagline = Column(String(160), nullable=False)
    description = Column(Text, nullable=False)
    difficulty = Column(String(20), nullable=False)  # Beginner | Intermediate | Advanced
    estimated_hours = Column(Integer, nullable=False)
    icon = Column(String(40), nullable=False)
    accent = Column(String(20), nullable=False, default="brand")
    modules_count = Column(Integer, nullable=False, default=0)
    is_published = Column(Boolean, default=True, nullable=False)

    progress = relationship("Progress", back_populates="language")


class Progress(Base, TimestampMixin):
    __tablename__ = "progress"
    __table_args__ = (UniqueConstraint("user_id", "language_id", name="uq_progress_user_language"),)

    id = Column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    language_id = Column(UUID(as_uuid=True), ForeignKey("languages.id", ondelete="CASCADE"), nullable=False, index=True)
    percent = Column(Integer, nullable=False, default=0)
    completed_modules = Column(Integer, nullable=False, default=0)
    total_modules = Column(Integer, nullable=False, default=0)
    last_studied_at = Column(DateTime, nullable=True)
    next_module_title = Column(String(200), nullable=True)

    user = relationship("User", back_populates="progress")
    language = relationship("Language", back_populates="progress")


class Bookmark(Base, TimestampMixin):
    __tablename__ = "bookmarks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    language_slug = Column(String(60), nullable=False)
    language_name = Column(String(80), nullable=False)
    type = Column(String(20), nullable=False)  # module | lesson | article | topic | language | note | problem
    external_ref = Column(String(200), nullable=True)

    user = relationship("User", back_populates="bookmarks")


class PlannerItem(Base, TimestampMixin):
    __tablename__ = "planner_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    language_slug = Column(String(60), nullable=False)
    language_name = Column(String(80), nullable=False)
    scheduled_for = Column(String(20), nullable=False)  # today | tomorrow | iso date
    duration_minutes = Column(Integer, nullable=False, default=30)
    done = Column(Boolean, default=False, nullable=False)
    position = Column(Integer, default=0, nullable=False)

    user = relationship("User", back_populates="planner_items")


class Achievement(Base, TimestampMixin):
    __tablename__ = "achievements"

    id = Column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    code = Column(String(60), unique=True, nullable=False)
    title = Column(String(120), nullable=False)
    description = Column(String(240), nullable=False)
    icon = Column(String(40), nullable=False)
    xp_reward = Column(Integer, default=0, nullable=False)

    user_achievements = relationship("UserAchievement", back_populates="achievement")


class UserAchievement(Base):
    __tablename__ = "user_achievements"
    __table_args__ = (UniqueConstraint("user_id", "achievement_id", name="uq_user_achievement"),)

    id = Column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    achievement_id = Column(UUID(as_uuid=True), ForeignKey("achievements.id", ondelete="CASCADE"), nullable=False, index=True)
    progress = Column(Integer, nullable=False, default=0)
    unlocked_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    user = relationship("User", back_populates="achievements")
    achievement = relationship("Achievement", back_populates="user_achievements")


class XpEvent(Base):
    __tablename__ = "xp_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    amount = Column(Integer, nullable=False)
    reason = Column(String(120), nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False, index=True)

    user = relationship("User", back_populates="xp_ledger")


class Streak(Base, TimestampMixin):
    __tablename__ = "streaks"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    current = Column(Integer, nullable=False, default=0)
    longest = Column(Integer, nullable=False, default=0)
    last_study_date = Column(DateTime, nullable=True)
    week_mask = Column(String(7), nullable=False, default="0000000")  # Mon..Sun booleans


class Setting(Base, TimestampMixin):
    __tablename__ = "settings"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    theme = Column(String(20), nullable=False, default="light")
    notif_daily = Column(Boolean, default=True, nullable=False)
    notif_weekly = Column(Boolean, default=True, nullable=False)
    notif_streaks = Column(Boolean, default=True, nullable=False)
    notif_product = Column(Boolean, default=False, nullable=False)


# --- Learning content (topics, roadmaps, notes, problems) -------------------

class Roadmap(Base, TimestampMixin):
    """A per-language learning roadmap aggregating stages and topics."""
    __tablename__ = "roadmaps"

    id = Column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    language_slug = Column(String(60), unique=True, nullable=False, index=True)
    language_name = Column(String(80), nullable=False)
    overall_percent = Column(Integer, nullable=False, default=0)

    stages = relationship("RoadmapStage", back_populates="roadmap", cascade="all, delete-orphan")


class RoadmapStage(Base, TimestampMixin):
    """A stage within a roadmap (Beginner, Intermediate, ...)."""
    __tablename__ = "roadmap_stages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    roadmap_id = Column(UUID(as_uuid=True), ForeignKey("roadmaps.id", ondelete="CASCADE"), nullable=False, index=True)
    stage = Column(String(40), nullable=False)
    description = Column(Text, nullable=True)
    position = Column(Integer, default=0, nullable=False)
    progress = Column(Integer, nullable=False, default=0)

    roadmap = relationship("Roadmap", back_populates="stages")
    topics = relationship("Topic", back_populates="stage", cascade="all, delete-orphan")


class Topic(Base, TimestampMixin):
    """An individual learning topic within a roadmap stage."""
    __tablename__ = "topics"

    id = Column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    stage_id = Column(UUID(as_uuid=True), ForeignKey("roadmap_stages.id", ondelete="CASCADE"), nullable=False, index=True)
    language_slug = Column(String(60), nullable=False, index=True)
    slug = Column(String(160), nullable=False)
    title = Column(String(160), nullable=False)
    description = Column(Text, nullable=True)
    estimated_minutes = Column(Integer, nullable=False, default=30)
    difficulty = Column(String(20), nullable=False, default="Beginner")
    sub_topics = Column(Text, nullable=True)  # JSON-encoded list
    objectives = Column(Text, nullable=True)  # JSON-encoded list
    prerequisites = Column(Text, nullable=True)  # JSON-encoded list
    examples = Column(Text, nullable=True)  # JSON-encoded list of {title,code,language}
    references = Column(Text, nullable=True)  # JSON-encoded list of {title,url}
    position = Column(Integer, default=0, nullable=False)
    __table_args__ = (UniqueConstraint("language_slug", "slug", name="uq_topic_language_slug"),)

    stage = relationship("RoadmapStage", back_populates="topics")
    progress_rows = relationship("TopicProgress", back_populates="topic", cascade="all, delete-orphan")


class TopicProgress(Base, TimestampMixin):
    """Per-user completion state for a topic."""
    __tablename__ = "topic_progress"
    __table_args__ = (UniqueConstraint("user_id", "topic_id", name="uq_topic_progress_user_topic"),)

    id = Column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    topic_id = Column(UUID(as_uuid=True), ForeignKey("topics.id", ondelete="CASCADE"), nullable=False, index=True)
    completed = Column(Boolean, default=False, nullable=False)
    completed_at = Column(DateTime, nullable=True)

    topic = relationship("Topic", back_populates="progress_rows")


class Note(Base, TimestampMixin):
    """A user-authored note (markdown)."""
    __tablename__ = "notes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    body = Column(Text, nullable=False, default="")
    category = Column(String(20), nullable=False, default="general")  # general|concept|snippet|question|summary
    pinned = Column(Boolean, default=False, nullable=False)
    favorite = Column(Boolean, default=False, nullable=False)
    language_slug = Column(String(60), nullable=True, index=True)
    topic_id = Column(UUID(as_uuid=True), nullable=True)


class Problem(Base, TimestampMixin):
    """A saved coding problem in the problem workspace."""
    __tablename__ = "problems"

    id = Column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False, default="")
    language_slug = Column(String(60), nullable=True, index=True)
    tags = Column(Text, nullable=True)  # JSON-encoded list
    status = Column(String(20), nullable=False, default="open")  # open|solved|archived
    difficulty = Column(String(10), nullable=False, default="Medium")  # Easy|Medium|Hard
    notes = Column(Text, nullable=True)
    is_bookmarked = Column(Boolean, default=False, nullable=False)
    # Extension point: an `ocr_source_url` / `ocr_image_path` column can be added
    # later for OCR-powered problem import. Intentionally not implemented now.


class LearningSession(Base):
    """Append-only record of a focused study session (for progress analytics)."""
    __tablename__ = "learning_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    language_slug = Column(String(60), nullable=True, index=True)
    topic_id = Column(UUID(as_uuid=True), nullable=True)
    started_at = Column(DateTime, server_default=func.now(), nullable=False, index=True)
    ended_at = Column(DateTime, nullable=True)
    duration_minutes = Column(Integer, nullable=False, default=0)
    xp_gained = Column(Integer, nullable=False, default=0)


# --- Extension points (reserved for future AI modules) ----------------------

class AiSession(Base):
    """Reserved for the future AI Tutor module — conversation state."""
    __tablename__ = "ai_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    kind = Column(String(40), nullable=False)  # tutor | quiz | interview | revision
    context = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)


class AiEvent(Base):
    """Reserved append-only log for AI module interactions."""
    __tablename__ = "ai_events"

    id = Column(BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True)
    session_id = Column(UUID(as_uuid=True), ForeignKey("ai_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(20), nullable=False)  # user | assistant | system
    content = Column(Text, nullable=False)
    tokens = Column(Integer, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    __table_args__ = (CheckConstraint("role IN ('user','assistant','system')", name="ck_ai_event_role"),)
