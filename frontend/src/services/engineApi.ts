import type {
  ApiResult,
} from '@/types';
import type {
  EngineEvent,
  EngineResult,
  ThinkingHistoryEntry,
  ThinkingStats,
  HintProgress,
  Flashcard,
  FlashcardInput,
  FlashcardStats,
  Quiz,
  QuizSubmitResult,
  QuizAttempt,
  RevisionSchedule,
  RevisionEntry,
  AppNotification,
  WeakArea,
  Recommendation,
  MockInterview,
  AnalyticsData,
  GamificationData,
  LearningMemory,
} from '@/types/engine';
import {
  SEED_ENGINE_RESULT,
  SEED_THINKING_HISTORY,
  SEED_THINKING_STATS,
  SEED_HINT_PROGRESS,
  SEED_FLASHCARDS,
  SEED_FLASHCARD_STATS,
  SEED_QUIZZES,
  SEED_REVISION_SCHEDULE,
  SEED_NOTIFICATIONS,
  SEED_WEAK_AREAS,
  SEED_RECOMMENDATIONS,
  SEED_MOCK_INTERVIEW,
  SEED_ANALYTICS,
  SEED_GAMIFICATION,
  SEED_LEARNING_MEMORY,
} from './seedEngine';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

function ok<T>(data: T): ApiResult<T> {
  return { ok: true, data };
}

function fail<T>(error: string): ApiResult<T> {
  return { ok: false, error };
}

async function withTimeoutMock<T>(data: T): Promise<ApiResult<T>> {
  await new Promise((r) => setTimeout(r, 400));
  return ok(data);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<ApiResult<T>> {
  const token = localStorage.getItem('minds.session')
    ? JSON.parse(localStorage.getItem('minds.session')!).accessToken
    : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  try {
    const res = await fetch(`/api${path}`, { ...options, headers });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return fail<T>(body.detail || `Request failed (${res.status})`);
    }
    return ok((await res.json()) as T);
  } catch (err) {
    return fail<T>(err instanceof Error ? err.message : 'Network error');
  }
}

export const engineApi = {
  // --- Engine core ---
  async fireEvent(event: EngineEvent): Promise<ApiResult<EngineResult>> {
    if (USE_MOCK) return withTimeoutMock({ ...SEED_ENGINE_RESULT, xp_gained: event.duration_minutes ? 20 : 75 });
    return request<EngineResult>('/engine/event', { method: 'POST', body: JSON.stringify(event) });
  },

  // --- Thinking History ---
  async thinkingHistory(): Promise<ApiResult<ThinkingHistoryEntry[]>> {
    if (USE_MOCK) return withTimeoutMock(SEED_THINKING_HISTORY);
    return request<ThinkingHistoryEntry[]>('/thinking/history');
  },
  async thinkingStats(): Promise<ApiResult<ThinkingStats>> {
    if (USE_MOCK) return withTimeoutMock(SEED_THINKING_STATS);
    return request<ThinkingStats>('/thinking/stats');
  },
  async hintProgress(problemTitle: string): Promise<ApiResult<HintProgress>> {
    if (USE_MOCK) return withTimeoutMock({ ...SEED_HINT_PROGRESS });
    return request<HintProgress>(`/thinking/hints?problem_title=${encodeURIComponent(problemTitle)}`);
  },
  async revealHint(problemTitle: string, stage: number): Promise<ApiResult<{ stage: number; stage_name: string; content: string; is_locked: boolean }>> {
    if (USE_MOCK) {
      const stageInfo = SEED_HINT_PROGRESS.stages.find((s) => s.stage === stage);
      if (!stageInfo) return fail('Invalid stage');
      return withTimeoutMock({ stage, stage_name: stageInfo.stage_name, content: 'Hint content for stage ' + stage, is_locked: false });
    }
    return request('/thinking/hints/reveal', { method: 'POST', body: JSON.stringify({ problem_title: problemTitle, stage }) });
  },

  // --- Flashcards ---
  async flashcards(dueOnly = false): Promise<ApiResult<Flashcard[]>> {
    if (USE_MOCK) return withTimeoutMock(dueOnly ? SEED_FLASHCARDS.filter((f) => f.status === 'new' || f.status === 'learning') : SEED_FLASHCARDS);
    return request<Flashcard[]>(`/flashcards${dueOnly ? '?due_only=true' : ''}`);
  },
  async flashcardStats(): Promise<ApiResult<FlashcardStats>> {
    if (USE_MOCK) return withTimeoutMock(SEED_FLASHCARD_STATS);
    return request<FlashcardStats>('/flashcards/stats');
  },
  async createFlashcard(input: FlashcardInput): Promise<ApiResult<Flashcard>> {
    if (USE_MOCK) {
      const fc: Flashcard = { id: 'fc_' + Math.random().toString(36).slice(2, 8), ...input, source_type: input.source_type ?? 'topic', status: 'new', ease_factor: 2.5, interval_days: 0, next_review_at: new Date().toISOString() };
      return withTimeoutMock(fc);
    }
    return request<Flashcard>('/flashcards', { method: 'POST', body: JSON.stringify(input) });
  },
  async reviewFlashcard(cardId: string, rating: string): Promise<ApiResult<Flashcard>> {
    if (USE_MOCK) {
      const fc = SEED_FLASHCARDS[0];
      const statusMap: Record<string, Flashcard['status']> = { again: 'learning', hard: 'learning', good: 'known', easy: 'mastered' };
      return withTimeoutMock({ ...fc, status: statusMap[rating] ?? 'learning' });
    }
    return request<Flashcard>(`/flashcards/${cardId}/review?rating=${rating}`, { method: 'POST' });
  },
  async deleteFlashcard(cardId: string): Promise<ApiResult<{ id: string }>> {
    if (USE_MOCK) return withTimeoutMock({ id: cardId });
    return request<{ id: string }>(`/flashcards/${cardId}`, { method: 'DELETE' });
  },

  // --- Quizzes ---
  async quizzes(languageSlug?: string): Promise<ApiResult<Quiz[]>> {
    if (USE_MOCK) return withTimeoutMock(languageSlug ? SEED_QUIZZES.filter((q) => q.language_slug === languageSlug) : SEED_QUIZZES);
    return request<Quiz[]>(`/quizzes${languageSlug ? `?language_slug=${languageSlug}` : ''}`);
  },
  async getQuiz(languageSlug: string): Promise<ApiResult<Quiz>> {
    if (USE_MOCK) return withTimeoutMock(SEED_QUIZZES.find((q) => q.language_slug === languageSlug) ?? SEED_QUIZZES[0]);
    return request<Quiz>(`/quizzes/${languageSlug}`);
  },
  async submitQuiz(quizId: string, answers: Record<string, unknown>[]): Promise<ApiResult<QuizSubmitResult>> {
    if (USE_MOCK) {
      const quiz = SEED_QUIZZES.find((q) => q.id === quizId) ?? SEED_QUIZZES[0];
      const score = Math.floor(quiz.questions.length * 0.7);
      return withTimeoutMock({ score, total: quiz.questions.length, passed: true, attempt_id: 'att_' + Math.random().toString(36).slice(2, 8) });
    }
    return request<QuizSubmitResult>('/quizzes/submit', { method: 'POST', body: JSON.stringify({ quiz_id: quizId, answers }) });
  },
  async quizAttempts(): Promise<ApiResult<QuizAttempt[]>> {
    if (USE_MOCK) return withTimeoutMock([]);
    return request<QuizAttempt[]>('/quizzes/attempts/all');
  },

  // --- Revisions ---
  async revisionSchedule(): Promise<ApiResult<RevisionSchedule>> {
    if (USE_MOCK) return withTimeoutMock(SEED_REVISION_SCHEDULE);
    return request<RevisionSchedule>('/revisions/schedule');
  },
  async completeRevision(revisionId: string, accuracy = 80): Promise<ApiResult<RevisionEntry>> {
    if (USE_MOCK) {
      const rev = SEED_REVISION_SCHEDULE.today[0] ?? SEED_REVISION_SCHEDULE.upcoming[0];
      return withTimeoutMock({ ...rev, completed: true, accuracy });
    }
    return request<RevisionEntry>(`/revisions/${revisionId}/complete?accuracy=${accuracy}`, { method: 'POST' });
  },

  // --- Notifications ---
  async notifications(unread = false): Promise<ApiResult<AppNotification[]>> {
    if (USE_MOCK) return withTimeoutMock(unread ? SEED_NOTIFICATIONS.filter((n) => !n.read) : SEED_NOTIFICATIONS);
    return request<AppNotification[]>(`/intel/notifications${unread ? '?unread=true' : ''}`);
  },
  async markNotificationRead(id: string): Promise<ApiResult<AppNotification>> {
    if (USE_MOCK) {
      const n = SEED_NOTIFICATIONS.find((x) => x.id === id) ?? SEED_NOTIFICATIONS[0];
      return withTimeoutMock({ ...n, read: true });
    }
    return request<AppNotification>(`/intel/notifications/${id}/read`, { method: 'POST' });
  },
  async markAllNotificationsRead(): Promise<ApiResult<{ message: string }>> {
    if (USE_MOCK) return withTimeoutMock({ message: 'Marked all as read' });
    return request<{ message: string }>('/intel/notifications/read-all', { method: 'POST' });
  },

  // --- Weak Areas ---
  async weakAreas(): Promise<ApiResult<WeakArea[]>> {
    if (USE_MOCK) return withTimeoutMock(SEED_WEAK_AREAS);
    return request<WeakArea[]>('/intel/weak-areas');
  },
  async dismissWeakArea(id: string): Promise<ApiResult<{ message: string }>> {
    if (USE_MOCK) return withTimeoutMock({ message: 'dismissed' });
    return request<{ message: string }>(`/intel/weak-areas/${id}`, { method: 'DELETE' });
  },

  // --- Recommendations ---
  async recommendations(accepted = false): Promise<ApiResult<Recommendation[]>> {
    if (USE_MOCK) return withTimeoutMock(accepted ? SEED_RECOMMENDATIONS.filter((r) => r.accepted) : SEED_RECOMMENDATIONS);
    return request<Recommendation[]>(`/intel/recommendations${accepted ? '?accepted=true' : ''}`);
  },
  async acceptRecommendation(id: string): Promise<ApiResult<Recommendation>> {
    if (USE_MOCK) {
      const r = SEED_RECOMMENDATIONS.find((x) => x.id === id) ?? SEED_RECOMMENDATIONS[0];
      return withTimeoutMock({ ...r, accepted: true });
    }
    return request<Recommendation>(`/intel/recommendations/${id}/accept`, { method: 'POST' });
  },
  async dismissRecommendation(id: string): Promise<ApiResult<{ message: string }>> {
    if (USE_MOCK) return withTimeoutMock({ message: 'dismissed' });
    return request<{ message: string }>(`/intel/recommendations/${id}`, { method: 'DELETE' });
  },

  // --- Mock Interviews ---
  async interviews(): Promise<ApiResult<MockInterview[]>> {
    if (USE_MOCK) return withTimeoutMock([SEED_MOCK_INTERVIEW]);
    return request<MockInterview[]>('/intel/interviews');
  },
  async startInterview(track: string): Promise<ApiResult<MockInterview>> {
    if (USE_MOCK) return withTimeoutMock({ ...SEED_MOCK_INTERVIEW, track, id: 'mi_' + Math.random().toString(36).slice(2, 8), current_index: 0, self_evaluations: [] });
    return request<MockInterview>('/intel/interviews', { method: 'POST', body: JSON.stringify({ track }) });
  },
  async getInterview(id: string): Promise<ApiResult<MockInterview>> {
    if (USE_MOCK) return withTimeoutMock(SEED_MOCK_INTERVIEW);
    return request<MockInterview>(`/intel/interviews/${id}`);
  },
  async submitInterviewAnswer(sessionId: string, questionIndex: number, answer: string, selfRating: number, notes?: string): Promise<ApiResult<MockInterview>> {
    if (USE_MOCK) {
      const evals = [...SEED_MOCK_INTERVIEW.self_evaluations, { question_index: questionIndex, answer, self_rating: selfRating, notes, evaluated_at: new Date().toISOString() }];
      return withTimeoutMock({ ...SEED_MOCK_INTERVIEW, self_evaluations: evals, current_index: questionIndex + 1 });
    }
    return request<MockInterview>('/intel/interviews/answer', { method: 'POST', body: JSON.stringify({ session_id: sessionId, question_index: questionIndex, answer, self_rating: selfRating, notes }) });
  },

  // --- Analytics ---
  async analytics(): Promise<ApiResult<AnalyticsData>> {
    if (USE_MOCK) return withTimeoutMock(SEED_ANALYTICS);
    return request<AnalyticsData>('/intel/analytics');
  },

  // --- Gamification ---
  async gamification(): Promise<ApiResult<GamificationData>> {
    if (USE_MOCK) return withTimeoutMock(SEED_GAMIFICATION);
    return request<GamificationData>('/intel/gamification');
  },

  // --- Learning Memory ---
  async learningMemory(): Promise<ApiResult<LearningMemory>> {
    if (USE_MOCK) return withTimeoutMock(SEED_LEARNING_MEMORY);
    return request<LearningMemory>('/intel/memory');
  },
};
