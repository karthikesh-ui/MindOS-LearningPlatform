from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field


# --------------------------------------------------------------------- Auth

class GoogleLoginIn(BaseModel):
    id_token: str = Field(..., description="Google ID token from Google Identity Services")


class GuestLoginIn(BaseModel):
    name: str | None = Field(default=None, max_length=80)


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    email: EmailStr
    name: str
    avatar_url: str | None = None
    provider: Literal["google", "guest"]
    created_at: datetime


class TokenOut(BaseModel):
    access_token: str
    token_type: Literal["bearer"] = "bearer"
    expires_in: int
    user: UserOut


# ------------------------------------------------------------------- Profile

class ProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    user_id: UUID
    bio: str | None = None
    headline: str | None = None
    target_role: str | None = None
    location: str | None = None
    timezone: str | None = None
    weekly_goal_minutes: int
    updated_at: datetime


class ProfileUpdate(BaseModel):
    bio: str | None = None
    headline: str | None = None
    target_role: str | None = None
    location: str | None = None
    timezone: str | None = None
    weekly_goal_minutes: int | None = None


# ----------------------------------------------------------------- Learning

class LanguageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    slug: str
    name: str
    tagline: str
    description: str
    difficulty: str
    estimated_hours: int
    icon: str
    accent: str
    modules_count: int


class ProgressOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    language_id: UUID
    percent: int
    completed_modules: int
    total_modules: int
    last_studied_at: datetime | None = None
    next_module_title: str | None = None


class LanguageWithProgressOut(LanguageOut):
    progress: ProgressOut | None = None


# ---------------------------------------------------------------- Bookmarks

class BookmarkOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    title: str
    language_slug: str
    language_name: str
    type: Literal["module", "lesson", "article"]
    created_at: datetime


class BookmarkIn(BaseModel):
    title: str = Field(..., max_length=200)
    language_slug: str
    language_name: str
    type: Literal["module", "lesson", "article"] = "lesson"
    external_ref: str | None = None


# --------------------------------------------------------------- Dashboard

class PlannerItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    title: str
    language_slug: str
    language_name: str
    scheduled_for: str
    duration_minutes: int
    done: bool


class ActivityItemOut(BaseModel):
    id: UUID
    kind: Literal["completed", "started", "bookmark", "milestone"]
    title: str
    detail: str
    occurred_at: datetime


class XpSummaryOut(BaseModel):
    total: int
    level: int
    current_level_xp: int
    next_level_xp: int
    weekly_gain: int


class StreakOut(BaseModel):
    current: int
    longest: int
    last_study_date: datetime | None
    week_mask: str


class DashboardOut(BaseModel):
    user: UserOut
    xp: XpSummaryOut
    streak: StreakOut
    todays_plan: list[PlannerItemOut]
    tomorrow_preview: list[PlannerItemOut]
    continue_learning: list[ProgressOut]
    weekly_goal: dict
    recent_activity: list[ActivityItemOut]
    bookmarks: list[BookmarkOut]
    languages: list[LanguageOut]


# --------------------------------------------------------------- Meta / generic

class AchievementOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    code: str
    title: str
    description: str
    icon: str
    xp_reward: int


class MessageOut(BaseModel):
    message: str


class HealthOut(BaseModel):
    status: str
    version: str
    database: str


# --------------------------------------------------------------- Roadmaps / Topics

class TopicBriefOut(BaseModel):
    id: UUID
    title: str
    estimated_minutes: int
    difficulty: str
    completed: bool = False


class RoadmapStageOut(BaseModel):
    stage: str
    description: str | None = None
    progress: int
    topics: list[TopicBriefOut]


class RoadmapOut(BaseModel):
    language_slug: str
    language_name: str
    overall_percent: int
    stages: list[RoadmapStageOut]


class TopicExample(BaseModel):
    title: str
    code: str
    language: str


class TopicReference(BaseModel):
    title: str
    url: str


class TopicOut(BaseModel):
    id: UUID
    language_slug: str
    title: str
    stage: str
    description: str | None = None
    objectives: list[str] = []
    prerequisites: list[str] = []
    estimated_minutes: int
    difficulty: str
    sub_topics: list[str] = []
    examples: list[TopicExample] = []
    references: list[TopicReference] = []
    is_completed: bool = False
    is_bookmarked: bool = False


# ------------------------------------------------------------------- Notes

class NoteOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    title: str
    body: str
    category: str
    pinned: bool
    favorite: bool
    language_slug: str | None = None
    topic_id: UUID | None = None
    created_at: datetime
    updated_at: datetime


class NoteIn(BaseModel):
    title: str = Field(..., max_length=200)
    body: str = ""
    category: str = "general"
    pinned: bool = False
    favorite: bool = False
    language_slug: str | None = None
    topic_id: UUID | None = None


class NoteUpdate(BaseModel):
    title: str | None = None
    body: str | None = None
    category: str | None = None
    pinned: bool | None = None
    favorite: bool | None = None
    language_slug: str | None = None
    topic_id: UUID | None = None


# --------------------------------------------------------------- Problems

class ProblemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    title: str
    description: str
    language_slug: str | None = None
    tags: list[str] = []
    status: str
    difficulty: str
    notes: str | None = None
    is_bookmarked: bool
    created_at: datetime
    updated_at: datetime


class ProblemIn(BaseModel):
    title: str = Field(..., max_length=200)
    description: str = ""
    language_slug: str | None = None
    tags: list[str] = []
    difficulty: str = "Medium"
    notes: str | None = None


class ProblemUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    language_slug: str | None = None
    tags: list[str] | None = None
    status: str | None = None
    difficulty: str | None = None
    notes: str | None = None
    is_bookmarked: bool | None = None


# --------------------------------------------------------------- Planner

class PlannerTaskOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    title: str
    language_slug: str | None = None
    language_name: str | None = None
    scope: str
    priority: str
    duration_minutes: int
    deadline: datetime | None = None
    done: bool
    created_at: datetime


class PlannerTaskIn(BaseModel):
    title: str = Field(..., max_length=200)
    language_slug: str | None = None
    language_name: str | None = None
    scope: str = "today"
    priority: str = "medium"
    duration_minutes: int = 30
    deadline: datetime | None = None


class PlannerTaskUpdate(BaseModel):
    title: str | None = None
    language_slug: str | None = None
    language_name: str | None = None
    scope: str | None = None
    priority: str | None = None
    duration_minutes: int | None = None
    deadline: datetime | None = None
    done: bool | None = None


class PlannerOverviewOut(BaseModel):
    today: list[PlannerTaskOut]
    tomorrow: list[PlannerTaskOut]
    week: list[PlannerTaskOut]
    month: list[PlannerTaskOut]
    completed_today: int
    total_today: int
    week_progress: int


# --------------------------------------------------------------- Search

class SearchResultOut(BaseModel):
    id: str
    kind: str
    title: str
    subtitle: str | None = None
    language_slug: str | None = None
    url: str


class SearchOut(BaseModel):
    query: str
    results: list[SearchResultOut]
