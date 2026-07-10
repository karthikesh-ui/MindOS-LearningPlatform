"""Pydantic schemas for the Learning Intelligence Engine."""
from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


# --------------------------------------------------------------- Engine core

class EngineEventIn(BaseModel):
    """Input to the Learning Engine — the activity that triggers cascading updates."""
    event_type: str = Field(..., description="topic_completed | problem_solved | problem_attempted | quiz_taken | hint_revealed | session_ended | revision_done | note_created | bookmark_added")
    language_slug: str | None = None
    topic_ref: str | None = None
    topic_title: str | None = None
    problem_title: str | None = None
    duration_minutes: int = 0
    score: int | None = None
    hints_used: int = 0
    extra: dict | None = None


class EngineResultOut(BaseModel):
    """Result of cascading updates from the Learning Engine."""
    xp_gained: int = 0
    achievements_unlocked: list[dict] = []
    notifications_created: list[dict] = []
    revisions_scheduled: list[dict] = []
    weak_areas_detected: list[dict] = []
    recommendations_generated: list[dict] = []
    streak_updated: bool = False
    dashboard_dirty: bool = True


# -------------------------------------------------------- Thinking History

class ThinkingHistoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    problem_title: str
    language_slug: str | None = None
    started_at: datetime
    finished_at: datetime | None = None
    thinking_seconds: int
    hints_opened: int
    attempts: int
    difficulty: str
    solution_completed: bool
    revision_required: bool
    next_review_date: date | None = None
    improvement_score: int


class ThinkingHistoryIn(BaseModel):
    problem_title: str
    language_slug: str | None = None
    thinking_seconds: int = 0
    hints_opened: int = 0
    attempts: int = 1
    difficulty: str = "Medium"
    solution_completed: bool = False


# --------------------------------------------------------------- Hint Engine

class HintStageOut(BaseModel):
    stage: int
    stage_name: str
    content: str
    is_locked: bool = True


class HintProgressOut(BaseModel):
    thinking_history_id: UUID | None = None
    current_stage: int = 0
    stages: list[HintStageOut]


class RevealHintIn(BaseModel):
    problem_title: str
    language_slug: str | None = None
    stage: int = Field(..., ge=1, le=7)


# --------------------------------------------------------------- Flashcards

class FlashcardOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    front: str
    back: str
    source_type: str
    source_ref: str | None = None
    language_slug: str | None = None
    status: str
    ease_factor: float
    interval_days: int
    next_review_at: datetime | None = None


class FlashcardIn(BaseModel):
    front: str
    back: str
    source_type: str = "topic"
    source_ref: str | None = None
    language_slug: str | None = None


class FlashcardReviewIn(BaseModel):
    rating: str = Field(..., description="again | hard | good | easy — maps to spaced-repetition update")


# ------------------------------------------------------------------- Quizzes

class QuizQuestion(BaseModel):
    id: str
    question: str
    type: str = "mcq"
    options: list[str] = []
    correct_index: int | None = None
    correct_answer: str | None = None
    explanation: str | None = None


class QuizOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    language_slug: str
    topic_slug: str | None = None
    title: str
    quiz_type: str
    questions: list[dict] = []
    is_published: bool = True


class QuizAttemptOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    quiz_id: UUID | None = None
    score: int
    total: int
    passed: bool
    attempted_at: datetime


class QuizSubmitIn(BaseModel):
    quiz_id: UUID
    answers: list[dict] = []


# -------------------------------------------------------------- Revisions

class RevisionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    topic_ref: str
    language_slug: str
    title: str
    scheduled_date: date
    interval_days: int
    completed: bool
    completed_at: datetime | None = None
    accuracy: int | None = None


class RevisionScheduleOut(BaseModel):
    today: list[RevisionOut]
    upcoming: list[RevisionOut]
    overdue: list[RevisionOut]


# ---------------------------------------------------------- Notifications

class NotificationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    kind: str
    title: str
    body: str | None = None
    resource_url: str | None = None
    read: bool
    created_at: datetime


# ------------------------------------------------------------- Weak Areas

class WeakAreaOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    language_slug: str
    topic_ref: str | None = None
    title: str
    weakness_type: str
    severity: str
    score: float
    detected_at: datetime


# -------------------------------------------------------- Recommendations

class RecommendationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    kind: str
    title: str
    subtitle: str | None = None
    language_slug: str | None = None
    priority: int
    reason: str | None = None
    accepted: bool
    created_at: datetime


# -------------------------------------------------------- Mock Interviews

class MockInterviewQuestion(BaseModel):
    id: str
    question: str
    difficulty: str = "Medium"
    hints: list[str] = []


class MockInterviewOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    track: str
    status: str
    questions: list[dict] = []
    current_index: int
    self_evaluations: list[dict] = []
    improvement_notes: str | None = None
    started_at: datetime
    completed_at: datetime | None = None
    overall_score: int | None = None


class MockInterviewStartIn(BaseModel):
    track: str = Field(..., description="python | java | sql | javascript | dsa | system_design")


class MockInterviewAnswerIn(BaseModel):
    session_id: UUID
    question_index: int
    answer: str
    self_rating: int = Field(..., ge=1, le=5)
    notes: str | None = None


# ----------------------------------------------------------- Analytics

class AnalyticsOut(BaseModel):
    learning_hours: int = 0
    topic_completion: int = 0
    language_progress: list[dict] = []
    weekly_progress: list[dict] = []
    monthly_progress: list[dict] = []
    thinking_time_seconds: int = 0
    hint_usage: int = 0
    revision_accuracy: int = 0
    improvement_rate: int = 0
    quiz_avg_score: int = 0
    problems_solved: int = 0
    flashcards_mastered: int = 0


# ----------------------------------------------------------- Gamification

class GamificationOut(BaseModel):
    xp: dict
    level: int
    streak: dict
    weekly_challenge: dict
    monthly_challenge: dict
    milestones: list[dict]
    recent_achievements: list[dict]


class MessageOut(BaseModel):
    message: str
