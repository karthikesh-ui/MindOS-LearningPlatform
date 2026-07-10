export type AuthProvider = 'google' | 'guest';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  provider: AuthProvider;
  createdAt: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  user: User;
}

export interface Profile {
  userId: string;
  bio?: string;
  headline?: string;
  targetRole?: string;
  location?: string;
  timezone?: string;
  weeklyGoalMinutes: number;
  updatedAt: string;
}

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface Language {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  difficulty: Difficulty;
  estimatedHours: number;
  icon: string;
  accent: string;
  modulesCount: number;
}

export interface Progress {
  languageId: string;
  percent: number;
  completedModules: number;
  totalModules: number;
  lastStudiedAt?: string;
  nextModuleTitle?: string;
}

export interface Bookmark {
  id: string;
  title: string;
  languageSlug: string;
  languageName: string;
  type: 'module' | 'lesson' | 'article';
  createdAt: string;
}

export interface PlannerItem {
  id: string;
  title: string;
  languageSlug: string;
  languageName: string;
  scheduledFor: 'today' | 'tomorrow';
  durationMinutes: number;
  done: boolean;
}

export interface ActivityItem {
  id: string;
  kind: 'completed' | 'started' | 'bookmark' | 'milestone';
  title: string;
  detail: string;
  occurredAt: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  progress?: number;
}

export interface XpSummary {
  total: number;
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  weeklyGain: number;
}

export interface StreakSummary {
  current: number;
  longest: number;
  lastStudyDate: string;
  thisWeek: boolean[];
}

export interface LearningHubData {
  languages: (Language & { progress?: Progress })[];
}

// -------------------------------------------------------------- Roadmaps

export type RoadmapStage = 'Beginner' | 'Intermediate' | 'Advanced' | 'Interview Preparation' | 'Projects' | 'Resources';

export interface RoadmapTopic {
  id: string;
  title: string;
  subTopics: string[];
  estimatedMinutes: number;
  difficulty: Difficulty;
  completed: boolean;
}

export interface RoadmapStageGroup {
  stage: RoadmapStage;
  description: string;
  topics: RoadmapTopic[];
  progress: number;
}

export interface Roadmap {
  languageSlug: string;
  languageName: string;
  stages: RoadmapStageGroup[];
  overallPercent: number;
}

// ----------------------------------------------------------------- Topics

export interface TopicObjective {
  text: string;
}

export interface TopicPageData {
  id: string;
  languageSlug: string;
  languageName: string;
  title: string;
  stage: RoadmapStage;
  description: string;
  objectives: string[];
  prerequisites: string[];
  estimatedMinutes: number;
  difficulty: Difficulty;
  examples: { title: string; code: string; language: string }[];
  references: { title: string; url: string }[];
  isCompleted: boolean;
  isBookmarked: boolean;
  prevTopicId: string | null;
  nextTopicId: string | null;
}

// ------------------------------------------------------------------ Notes

export type NoteCategory = 'general' | 'concept' | 'snippet' | 'question' | 'summary';

export interface Note {
  id: string;
  title: string;
  body: string;
  category: NoteCategory;
  pinned: boolean;
  favorite: boolean;
  languageSlug?: string;
  topicId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NoteInput {
  title: string;
  body: string;
  category?: NoteCategory;
  pinned?: boolean;
  favorite?: boolean;
  languageSlug?: string;
  topicId?: string;
}

// --------------------------------------------------------------- Problems

export type ProblemStatus = 'open' | 'solved' | 'archived';
export type ProblemDifficulty = 'Easy' | 'Medium' | 'Hard';

export interface Problem {
  id: string;
  title: string;
  description: string;
  languageSlug: string;
  tags: string[];
  status: ProblemStatus;
  difficulty: ProblemDifficulty;
  notes?: string;
  isBookmarked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProblemInput {
  title: string;
  description: string;
  languageSlug: string;
  tags?: string[];
  difficulty?: ProblemDifficulty;
  notes?: string;
}

// --------------------------------------------------------------- Planner

export type PlannerScope = 'today' | 'tomorrow' | 'week' | 'month';
export type PlannerPriority = 'low' | 'medium' | 'high';

export interface PlannerTask {
  id: string;
  title: string;
  languageSlug?: string;
  languageName?: string;
  scope: PlannerScope;
  priority: PlannerPriority;
  durationMinutes: number;
  deadline?: string;
  done: boolean;
  createdAt: string;
}

export interface PlannerTaskInput {
  title: string;
  languageSlug?: string;
  languageName?: string;
  scope: PlannerScope;
  priority?: PlannerPriority;
  durationMinutes?: number;
  deadline?: string;
}

export interface PlannerOverview {
  today: PlannerTask[];
  tomorrow: PlannerTask[];
  week: PlannerTask[];
  month: PlannerTask[];
  completedToday: number;
  totalToday: number;
  weekProgress: number;
}

// --------------------------------------------------------------- Progress

export interface ProgressOverviewData {
  learningHours: number;
  completedTopics: number;
  completedLanguages: number;
  currentStreak: number;
  longestStreak: number;
  xp: XpSummary;
  weeklyProgress: { day: string; minutes: number }[];
  monthlyProgress: { week: string; minutes: number; topics: number }[];
  perLanguage: { languageSlug: string; languageName: string; percent: number; hours: number }[];
  timeline: { id: string; title: string; detail: string; occurredAt: string; kind: ActivityItem['kind'] }[];
}

// ---------------------------------------------------------------- Search

export type SearchKind = 'language' | 'topic' | 'note' | 'problem' | 'bookmark';

export interface SearchResult {
  id: string;
  kind: SearchKind;
  title: string;
  subtitle?: string;
  languageSlug?: string;
  url: string;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
}

// ------------------------------------------------------ Dashboard additions

export interface DashboardData {
  user: Pick<User, 'name' | 'email' | 'avatarUrl'>;
  xp: XpSummary;
  streak: StreakSummary;
  todaysPlan: PlannerItem[];
  tomorrowPreview: PlannerItem[];
  continueLearning: Progress[];
  weeklyGoal: { completedMinutes: number; targetMinutes: number };
  recentActivity: ActivityItem[];
  bookmarks: Bookmark[];
  languages: Language[];
  recentNotes: Note[];
  upcomingTopics: { id: string; title: string; languageSlug: string; languageName: string; stage: RoadmapStage }[];
}

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };
