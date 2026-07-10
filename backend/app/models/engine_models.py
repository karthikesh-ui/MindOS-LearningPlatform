"""Learning Intelligence Engine models — extends the existing models.

These tables back the centralized Learning Engine: Thinking History,
Flashcards, Quizzes, Revisions, Notifications, Weak Areas, Recommendations,
Mock Interviews, Hint Logs, and the Achievements log.
"""
from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID

from app.database.session import Base
from app.models.models import TimestampMixin, _uuid


class LearningSessionRecord(Base):
    """Append-only study session record for analytics."""
    __tablename__ = "learning_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    language_slug = Column(String(60), nullable=True, index=True)
    topic_id = Column(UUID(as_uuid=True), nullable=True)
    started_at = Column(DateTime, server_default=func.now(), nullable=False, index=True)
    ended_at = Column(DateTime, nullable=True)
    duration_minutes = Column(Integer, nullable=False, default=0)
    xp_gained = Column(Integer, nullable=False, default=0)


class ThinkingHistory(Base):
    """Heart of the problem-solving system — tracks every attempt."""
    __tablename__ = "thinking_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    problem_id = Column(UUID(as_uuid=True), nullable=True, index=True)
    problem_title = Column(String(300), nullable=False)
    language_slug = Column(String(60), nullable=True, index=True)
    started_at = Column(DateTime, server_default=func.now(), nullable=False)
    finished_at = Column(DateTime, nullable=True)
    thinking_seconds = Column(Integer, nullable=False, default=0)
    hints_opened = Column(Integer, nullable=False, default=0)
    attempts = Column(Integer, nullable=False, default=0)
    difficulty = Column(String(10), nullable=False, default="Medium")
    solution_completed = Column(Boolean, nullable=False, default=False)
    revision_required = Column(Boolean, nullable=False, default=False)
    next_review_date = Column(Date, nullable=True)
    improvement_score = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)


class HintLog(Base):
    """Records progressive hint stages revealed for a problem."""
    __tablename__ = "hint_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    thinking_history_id = Column(UUID(as_uuid=True), ForeignKey("thinking_history.id", ondelete="CASCADE"), nullable=True, index=True)
    stage = Column(Integer, nullable=False)
    stage_name = Column(String(80), nullable=False)
    revealed_at = Column(DateTime, server_default=func.now(), nullable=False)


class Flashcard(Base, TimestampMixin):
    """Spaced-repetition flashcard auto-generated or manual."""
    __tablename__ = "flashcards"

    id = Column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    front = Column(Text, nullable=False)
    back = Column(Text, nullable=False)
    source_type = Column(String(20), nullable=False, default="topic")
    source_ref = Column(String(200), nullable=True)
    language_slug = Column(String(60), nullable=True, index=True)
    status = Column(String(20), nullable=False, default="new")
    ease_factor = Column(Float, nullable=False, default=2.5)
    interval_days = Column(Integer, nullable=False, default=0)
    next_review_at = Column(DateTime, nullable=True, index=True)


class Quiz(Base):
    """Quiz definition for a topic/language."""
    __tablename__ = "quizzes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    language_slug = Column(String(60), nullable=False, index=True)
    topic_slug = Column(String(160), nullable=True)
    title = Column(String(200), nullable=False)
    quiz_type = Column(String(20), nullable=False, default="mcq")
    questions = Column(JSONB, nullable=False, default=list)
    is_published = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)


class QuizAttempt(Base):
    """Records each quiz attempt."""
    __tablename__ = "quiz_attempts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    quiz_id = Column(UUID(as_uuid=True), ForeignKey("quizzes.id", ondelete="CASCADE"), nullable=True, index=True)
    score = Column(Integer, nullable=False, default=0)
    total = Column(Integer, nullable=False, default=0)
    answers = Column(JSONB, nullable=False, default=list)
    passed = Column(Boolean, nullable=False, default=False)
    attempted_at = Column(DateTime, server_default=func.now(), nullable=False)


class Revision(Base):
    """Spaced-repetition revision schedule entry."""
    __tablename__ = "revisions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    topic_ref = Column(String(200), nullable=False)
    language_slug = Column(String(60), nullable=False)
    title = Column(String(200), nullable=False)
    scheduled_date = Column(Date, nullable=False, index=True)
    interval_days = Column(Integer, nullable=False, default=1)
    completed = Column(Boolean, nullable=False, default=False)
    completed_at = Column(DateTime, nullable=True)
    accuracy = Column(Integer, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)


class Notification(Base):
    """Intelligent reminder generated by the engine."""
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    kind = Column(String(30), nullable=False)
    title = Column(String(200), nullable=False)
    body = Column(Text, nullable=True)
    resource_url = Column(String(300), nullable=True)
    read = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)


class WeakArea(Base):
    """Auto-detected weak area."""
    __tablename__ = "weak_areas"

    id = Column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    language_slug = Column(String(60), nullable=False)
    topic_ref = Column(String(200), nullable=True)
    title = Column(String(200), nullable=False)
    weakness_type = Column(String(30), nullable=False)
    severity = Column(String(10), nullable=False, default="medium")
    score = Column(Float, nullable=False, default=0.5)
    detected_at = Column(DateTime, server_default=func.now(), nullable=False)


class Recommendation(Base):
    """AI-powered next-step suggestion."""
    __tablename__ = "recommendations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    kind = Column(String(30), nullable=False)
    title = Column(String(200), nullable=False)
    subtitle = Column(String(300), nullable=True)
    language_slug = Column(String(60), nullable=True)
    priority = Column(Integer, nullable=False, default=5)
    reason = Column(Text, nullable=True)
    accepted = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)


class MockInterview(Base):
    """Interview mode session."""
    __tablename__ = "mock_interviews"

    id = Column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    track = Column(String(30), nullable=False)
    status = Column(String(20), nullable=False, default="active")
    questions = Column(JSONB, nullable=False, default=list)
    current_index = Column(Integer, nullable=False, default=0)
    self_evaluations = Column(JSONB, nullable=False, default=list)
    improvement_notes = Column(Text, nullable=True)
    started_at = Column(DateTime, server_default=func.now(), nullable=False)
    completed_at = Column(DateTime, nullable=True)
    overall_score = Column(Integer, nullable=True)


class AchievementLog(Base):
    """Tracks achievement unlocks."""
    __tablename__ = "achievements_log"

    id = Column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    achievement_code = Column(String(60), nullable=False)
    title = Column(String(120), nullable=False)
    xp_reward = Column(Integer, nullable=False, default=0)
    unlocked_at = Column(DateTime, server_default=func.now(), nullable=False)
