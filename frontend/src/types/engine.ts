// Learning Intelligence Engine types — extends the existing types.

// --------------------------------------------------------------- Engine core

export interface EngineEvent {
  event_type: string;
  language_slug?: string;
  topic_ref?: string;
  topic_title?: string;
  problem_title?: string;
  duration_minutes?: number;
  score?: number;
  hints_used?: number;
  extra?: Record<string, unknown>;
}

export interface EngineResult {
  xp_gained: number;
  achievements_unlocked: { code: string; title: string; description: string; xp: number }[];
  notifications_created: { kind: string; title: string; body?: string }[];
  revisions_scheduled: { topic_ref: string; scheduled_date?: string }[];
  weak_areas_detected: { title: string; type: string; severity?: string }[];
  recommendations_generated: { kind: string; title: string; language_slug?: string }[];
  streak_updated: boolean;
  dashboard_dirty: boolean;
}

// -------------------------------------------------------- Thinking History

export interface ThinkingHistoryEntry {
  id: string;
  problem_title: string;
  language_slug?: string;
  started_at: string;
  finished_at?: string;
  thinking_seconds: number;
  hints_opened: number;
  attempts: number;
  difficulty: string;
  solution_completed: boolean;
  revision_required: boolean;
  next_review_date?: string;
  improvement_score: number;
}

export interface ThinkingStats {
  total_attempts: number;
  completed: number;
  avg_thinking_seconds: number;
  avg_hints_opened: number;
  avg_improvement_score: number;
}

// --------------------------------------------------------------- Hint Engine

export interface HintStage {
  stage: number;
  stage_name: string;
  content: string;
  is_locked: boolean;
}

export interface HintProgress {
  thinking_history_id?: string;
  current_stage: number;
  stages: HintStage[];
}

// --------------------------------------------------------------- Flashcards

export type FlashcardStatus = 'new' | 'learning' | 'known' | 'mastered';

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  source_type: string;
  source_ref?: string;
  language_slug?: string;
  status: FlashcardStatus;
  ease_factor: number;
  interval_days: number;
  next_review_at?: string;
}

export interface FlashcardInput {
  front: string;
  back: string;
  source_type?: string;
  source_ref?: string;
  language_slug?: string;
}

export interface FlashcardStats {
  total: number;
  due: number;
  mastered: number;
}

// ------------------------------------------------------------------- Quizzes

export interface QuizQuestion {
  id: string;
  question: string;
  type: string;
  options?: string[];
  correct_index?: number;
  correct_answer?: string;
  explanation?: string;
}

export interface Quiz {
  id: string;
  language_slug: string;
  topic_slug?: string;
  title: string;
  quiz_type: string;
  questions: QuizQuestion[];
  is_published: boolean;
}

export interface QuizAttempt {
  id: string;
  quiz_id?: string;
  score: number;
  total: number;
  passed: boolean;
  attempted_at: string;
}

export interface QuizSubmitResult {
  score: number;
  total: number;
  passed: boolean;
  attempt_id: string;
}

// -------------------------------------------------------------- Revisions

export interface RevisionEntry {
  id: string;
  topic_ref: string;
  language_slug: string;
  title: string;
  scheduled_date: string;
  interval_days: number;
  completed: boolean;
  completed_at?: string;
  accuracy?: number;
}

export interface RevisionSchedule {
  today: RevisionEntry[];
  upcoming: RevisionEntry[];
  overdue: RevisionEntry[];
}

// ---------------------------------------------------------- Notifications

export type NotificationKind = 'revision' | 'weak_topic' | 'planner' | 'goal' | 'achievement';

export interface AppNotification {
  id: string;
  kind: NotificationKind | string;
  title: string;
  body?: string;
  resource_url?: string;
  read: boolean;
  created_at: string;
}

// ------------------------------------------------------------- Weak Areas

export type WeaknessType =
  | 'fail_rate' | 'skip_rate' | 'low_completion' | 'low_quiz'
  | 'high_hints' | 'long_solve' | 'missed_revision';

export interface WeakArea {
  id: string;
  language_slug: string;
  topic_ref?: string;
  title: string;
  weakness_type: WeaknessType | string;
  severity: 'low' | 'medium' | 'high' | string;
  score: number;
  detected_at: string;
}

// -------------------------------------------------------- Recommendations

export type RecommendationKind =
  | 'next_topic' | 'next_language' | 'revision'
  | 'practice_problem' | 'interview' | 'project';

export interface Recommendation {
  id: string;
  kind: RecommendationKind | string;
  title: string;
  subtitle?: string;
  language_slug?: string;
  priority: number;
  reason?: string;
  accepted: boolean;
  created_at: string;
}

// -------------------------------------------------------- Mock Interviews

export interface InterviewQuestion {
  id: string;
  question: string;
  difficulty: string;
  hints: string[];
}

export interface MockInterview {
  id: string;
  track: string;
  status: 'active' | 'completed' | string;
  questions: InterviewQuestion[];
  current_index: number;
  self_evaluations: { question_index: number; answer: string; self_rating: number; notes?: string; evaluated_at: string }[];
  improvement_notes?: string;
  started_at: string;
  completed_at?: string;
  overall_score?: number;
}

// ----------------------------------------------------------- Analytics

export interface AnalyticsData {
  learning_hours: number;
  topic_completion: number;
  language_progress: { language_slug: string; language_name: string; percent: number; hours: number }[];
  weekly_progress: { day: string; minutes: number }[];
  monthly_progress: { week: string; minutes: number }[];
  thinking_time_seconds: number;
  hint_usage: number;
  revision_accuracy: number;
  improvement_rate: number;
  quiz_avg_score: number;
  problems_solved: number;
  flashcards_mastered: number;
}

// ----------------------------------------------------------- Gamification

export interface GamificationData {
  xp: { total: number; level: number; current_level_xp: number; next_level_xp: number; weekly_gain: number };
  level: number;
  streak: { current: number; longest: number };
  weekly_challenge: { label: string; current: number; target: number; percent: number };
  monthly_challenge: { label: string; current: number; target: number; percent: number };
  milestones: { label: string; current: number; target: number }[];
  recent_achievements: { code: string; title: string; xp: number }[];
}

// ------------------------------------------------------- Learning Memory

export interface LearningMemory {
  sessions: number;
  total_minutes: number;
  completed_topics: number;
  problems_solved: number;
  hints_opened: number;
  bookmarks: number;
  revisions: number;
  completed_revisions: number;
  achievements: number;
  xp_events: number;
  quiz_attempts: number;
  daily_history: { date: string; minutes: number }[];
  weekly_history: { week: string; minutes: number }[];
  monthly_history: { month: string; minutes: number }[];
}
