import type {
  ApiResult,
  AuthSession,
  DashboardData,
  LearningHubData,
  Profile,
  User,
  Bookmark,
  Progress,
  Roadmap,
  TopicPageData,
  Note,
  NoteInput,
  Problem,
  ProblemInput,
  PlannerTask,
  PlannerTaskInput,
  PlannerOverview,
  ProgressOverviewData,
  SearchResponse,
  SearchResult,
} from '@/types';
import {
  GUEST_USER,
  SEED_ACHIEVEMENTS,
  SEED_BOOKMARKS,
  SEED_DASHBOARD,
  SEED_LANGUAGES,
  SEED_PROGRESS,
  SEED_STREAK,
  SEED_XP,
} from './seed';
import {
  SEED_NOTES,
  SEED_PROBLEMS,
  SEED_PLANNER,
  SEED_PLANNER_TASKS,
  SEED_PROGRESS_OVERVIEW,
  searchSeed,
  topicFromRoadmap,
  recentNotesForDashboard,
  upcomingTopicsForDashboard,
} from './seedExtended';
import { SEED_ROADMAPS, roadmapBySlug } from './roadmaps';
import { sleep } from '@/utils';

const STORAGE_KEY = 'minds.session';
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
const LATENCY = 450;

function ok<T>(data: T): ApiResult<T> {
  return { ok: true, data };
}

function fail<T>(error: string): ApiResult<T> {
  return { ok: false, error };
}

async function withTimeout<T>(
  fn: () => Promise<ApiResult<T>>,
  ms = 8000,
): Promise<ApiResult<T>> {
  if (USE_MOCK) {
    await sleep(LATENCY);
    return fn();
  }
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ms);
    const result = await Promise.race([
      fn(),
      new Promise<ApiResult<T>>((resolve) =>
        setTimeout(() => resolve(fail<T>('Request timed out')), ms),
      ),
    ]);
    clearTimeout(timer);
    return result;
  } catch (err) {
    return fail<T>(err instanceof Error ? err.message : 'Network error');
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<ApiResult<T>> {
  const token = getStoredToken();
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
    const data = (await res.json()) as T;
    return ok(data);
  } catch (err) {
    return fail<T>(err instanceof Error ? err.message : 'Network error');
  }
}

export function getStoredSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthSession) : null;
  } catch {
    return null;
  }
}

export function getStoredToken(): string | null {
  return getStoredSession()?.accessToken ?? null;
}

export function clearStoredSession(): void {
  localStorage.removeItem(STORAGE_KEY);
}

function saveSession(session: AuthSession): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export const api = {
  auth: {
    async google(idToken: string): Promise<ApiResult<AuthSession>> {
      if (USE_MOCK) {
        return withTimeout(() =>
          Promise.resolve(
            ok({
              accessToken: 'mock-jwt-' + Math.random().toString(36).slice(2),
              expiresAt: Date.now() + 7 * 86400_000,
              user: { ...GUEST_USER, name: 'Aria Sharma', provider: 'google', email: 'aria.sharma@example.com' },
            }),
          ),
        );
      }
      const result = await request<AuthSession>('/auth/google', {
        method: 'POST',
        body: JSON.stringify({ id_token: idToken }),
      });
      if (result.ok) saveSession(result.data);
      return result;
    },

    async guest(): Promise<ApiResult<AuthSession>> {
      if (USE_MOCK) {
        return withTimeout(() =>
          Promise.resolve(
            ok({
              accessToken: 'mock-jwt-guest-' + Math.random().toString(36).slice(2),
              expiresAt: Date.now() + 86400_000,
              user: GUEST_USER,
            }),
          ),
        );
      }
      const result = await request<AuthSession>('/auth/guest', { method: 'POST' });
      if (result.ok) saveSession(result.data);
      return result;
    },

    logout(): void {
      clearStoredSession();
    },
  },

  profile: {
    async get(): Promise<ApiResult<Profile>> {
      if (USE_MOCK) {
        return withTimeout(() =>
          Promise.resolve(
            ok({
              userId: 'usr_001',
              headline: 'Aspiring ML Engineer',
              targetRole: 'Machine Learning Engineer',
              bio: 'Building toward a career in AI. Currently focused on Python, SQL, and prompt engineering.',
              location: 'Bengaluru, IN',
              timezone: 'Asia/Kolkata',
              weeklyGoalMinutes: 300,
              updatedAt: new Date().toISOString(),
            }),
          ),
        );
      }
      return request<Profile>('/profile');
    },

    async update(patch: Partial<Profile>): Promise<ApiResult<Profile>> {
      if (USE_MOCK) {
        return withTimeout(() =>
          Promise.resolve(
            ok({
              userId: 'usr_001',
              headline: 'Aspiring ML Engineer',
              targetRole: 'Machine Learning Engineer',
              bio: 'Building toward a career in AI.',
              location: 'Bengaluru, IN',
              timezone: 'Asia/Kolkata',
              weeklyGoalMinutes: patch.weeklyGoalMinutes ?? 300,
              updatedAt: new Date().toISOString(),
            }),
          ),
        );
      }
      return request<Profile>('/profile', {
        method: 'PATCH',
        body: JSON.stringify(patch),
      });
    },
  },

  dashboard: {
    async get(): Promise<ApiResult<DashboardData>> {
      if (USE_MOCK) {
        return withTimeout(() =>
          Promise.resolve(
            ok({
              ...SEED_DASHBOARD,
              recentNotes: recentNotesForDashboard(3),
              upcomingTopics: upcomingTopicsForDashboard(),
            }),
          ),
        );
      }
      return request<DashboardData>('/dashboard');
    },
  },

  learning: {
    async hub(): Promise<ApiResult<LearningHubData>> {
      if (USE_MOCK) {
        const languages = SEED_LANGUAGES.map((lang) => ({
          ...lang,
          progress: SEED_PROGRESS.find((p) => p.languageId === lang.id),
        }));
        return withTimeout(() => Promise.resolve(ok({ languages })));
      }
      return request<LearningHubData>('/learning/hub');
    },

    async progress(): Promise<ApiResult<Progress[]>> {
      if (USE_MOCK) {
        return withTimeout(() => Promise.resolve(ok(SEED_PROGRESS)));
      }
      return request<Progress[]>('/learning/progress');
    },
  },

  bookmarks: {
    async list(): Promise<ApiResult<Bookmark[]>> {
      if (USE_MOCK) {
        return withTimeout(() => Promise.resolve(ok(SEED_BOOKMARKS)));
      }
      return request<Bookmark[]>('/bookmarks');
    },

    async add(bookmark: Omit<Bookmark, 'id' | 'createdAt'>): Promise<ApiResult<Bookmark>> {
      if (USE_MOCK) {
        return withTimeout(() =>
          Promise.resolve(
            ok({
              ...bookmark,
              id: 'bm_' + Math.random().toString(36).slice(2, 8),
              createdAt: new Date().toISOString(),
            } as Bookmark),
          ),
        );
      }
      return request<Bookmark>('/bookmarks', {
        method: 'POST',
        body: JSON.stringify(bookmark),
      });
    },

    async remove(id: string): Promise<ApiResult<{ id: string }>> {
      if (USE_MOCK) {
        return withTimeout(() => Promise.resolve(ok({ id })));
      }
      return request<{ id: string }>(`/bookmarks/${id}`, { method: 'DELETE' });
    },
  },

  meta: {
    async achievements(): Promise<ApiResult<typeof SEED_ACHIEVEMENTS>> {
      if (USE_MOCK) {
        return withTimeout(() => Promise.resolve(ok(SEED_ACHIEVEMENTS)));
      }
      return request<typeof SEED_ACHIEVEMENTS>('/meta/achievements');
    },

    async xp(): Promise<ApiResult<typeof SEED_XP>> {
      if (USE_MOCK) {
        return withTimeout(() => Promise.resolve(ok(SEED_XP)));
      }
      return request<typeof SEED_XP>('/meta/xp');
    },

    async streak(): Promise<ApiResult<typeof SEED_STREAK>> {
      if (USE_MOCK) {
        return withTimeout(() => Promise.resolve(ok(SEED_STREAK)));
      }
      return request<typeof SEED_STREAK>('/meta/streak');
    },
  },

  roadmaps: {
    async get(slug: string): Promise<ApiResult<Roadmap>> {
      if (USE_MOCK) {
        const rm = roadmapBySlug(slug);
        return withTimeout(() => Promise.resolve(rm ? ok(rm) : fail<Roadmap>('Roadmap not found')));
      }
      return request<Roadmap>(`/learning/${slug}/roadmap`);
    },
  },

  topics: {
    async get(languageSlug: string, topicId: string): Promise<ApiResult<TopicPageData>> {
      if (USE_MOCK) {
        const t = topicFromRoadmap(languageSlug, topicId);
        return withTimeout(() => Promise.resolve(t ? ok(t) : fail<TopicPageData>('Topic not found')));
      }
      return request<TopicPageData>(`/learning/${languageSlug}/topics/${topicId}`);
    },

    async complete(languageSlug: string, topicId: string): Promise<ApiResult<{ topicId: string; completed: boolean }>> {
      if (USE_MOCK) {
        return withTimeout(() => Promise.resolve(ok({ topicId, completed: true })));
      }
      return request<{ topicId: string; completed: boolean }>(`/learning/${languageSlug}/topics/${topicId}/complete`, { method: 'POST' });
    },

    async toggleBookmark(languageSlug: string, topicId: string): Promise<ApiResult<{ topicId: string; bookmarked: boolean }>> {
      if (USE_MOCK) {
        return withTimeout(() => Promise.resolve(ok({ topicId, bookmarked: true })));
      }
      return request<{ topicId: string; bookmarked: boolean }>(`/learning/${languageSlug}/topics/${topicId}/bookmark`, { method: 'POST' });
    },
  },

  notes: {
    async list(): Promise<ApiResult<Note[]>> {
      if (USE_MOCK) {
        return withTimeout(() => Promise.resolve(ok(SEED_NOTES)));
      }
      return request<Note[]>('/notes');
    },

    async create(input: NoteInput): Promise<ApiResult<Note>> {
      if (USE_MOCK) {
        const note: Note = {
          id: 'note_' + Math.random().toString(36).slice(2, 8),
          title: input.title,
          body: input.body,
          category: input.category ?? 'general',
          pinned: input.pinned ?? false,
          favorite: input.favorite ?? false,
          languageSlug: input.languageSlug,
          topicId: input.topicId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return withTimeout(() => Promise.resolve(ok(note)));
      }
      return request<Note>('/notes', { method: 'POST', body: JSON.stringify(input) });
    },

    async update(id: string, patch: Partial<NoteInput>): Promise<ApiResult<Note>> {
      if (USE_MOCK) {
        const existing = SEED_NOTES.find((n) => n.id === id) ?? SEED_NOTES[0];
        const note: Note = {
          ...existing,
          ...patch,
          category: patch.category ?? existing.category,
          updatedAt: new Date().toISOString(),
        };
        return withTimeout(() => Promise.resolve(ok(note)));
      }
      return request<Note>(`/notes/${id}`, { method: 'PATCH', body: JSON.stringify(patch) });
    },

    async remove(id: string): Promise<ApiResult<{ id: string }>> {
      if (USE_MOCK) {
        return withTimeout(() => Promise.resolve(ok({ id })));
      }
      return request<{ id: string }>(`/notes/${id}`, { method: 'DELETE' });
    },
  },

  problems: {
    async list(): Promise<ApiResult<Problem[]>> {
      if (USE_MOCK) {
        return withTimeout(() => Promise.resolve(ok(SEED_PROBLEMS)));
      }
      return request<Problem[]>('/problems');
    },

    async create(input: ProblemInput): Promise<ApiResult<Problem>> {
      if (USE_MOCK) {
        const p: Problem = {
          id: 'prob_' + Math.random().toString(36).slice(2, 8),
          title: input.title,
          description: input.description,
          languageSlug: input.languageSlug,
          tags: input.tags ?? [],
          status: 'open',
          difficulty: input.difficulty ?? 'Medium',
          notes: input.notes,
          isBookmarked: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return withTimeout(() => Promise.resolve(ok(p)));
      }
      return request<Problem>('/problems', { method: 'POST', body: JSON.stringify(input) });
    },

    async update(id: string, patch: Partial<ProblemInput & { status: Problem['status']; isBookmarked: boolean }>): Promise<ApiResult<Problem>> {
      if (USE_MOCK) {
        const existing = SEED_PROBLEMS.find((p) => p.id === id) ?? SEED_PROBLEMS[0];
        const p: Problem = { ...existing, ...patch, updatedAt: new Date().toISOString() };
        return withTimeout(() => Promise.resolve(ok(p)));
      }
      return request<Problem>(`/problems/${id}`, { method: 'PATCH', body: JSON.stringify(patch) });
    },

    async remove(id: string): Promise<ApiResult<{ id: string }>> {
      if (USE_MOCK) {
        return withTimeout(() => Promise.resolve(ok({ id })));
      }
      return request<{ id: string }>(`/problems/${id}`, { method: 'DELETE' });
    },
  },

  planner: {
    async overview(): Promise<ApiResult<PlannerOverview>> {
      if (USE_MOCK) {
        return withTimeout(() => Promise.resolve(ok(SEED_PLANNER)));
      }
      return request<PlannerOverview>('/planner');
    },

    async list(scope?: PlannerTask['scope']): Promise<ApiResult<PlannerTask[]>> {
      if (USE_MOCK) {
        const tasks = scope ? SEED_PLANNER_TASKS.filter((t) => t.scope === scope) : SEED_PLANNER_TASKS;
        return withTimeout(() => Promise.resolve(ok(tasks)));
      }
      return request<PlannerTask[]>(scope ? `/planner?scope=${scope}` : '/planner');
    },

    async create(input: PlannerTaskInput): Promise<ApiResult<PlannerTask>> {
      if (USE_MOCK) {
        const t: PlannerTask = {
          id: 'task_' + Math.random().toString(36).slice(2, 8),
          title: input.title,
          languageSlug: input.languageSlug,
          languageName: input.languageName,
          scope: input.scope,
          priority: input.priority ?? 'medium',
          durationMinutes: input.durationMinutes ?? 30,
          deadline: input.deadline,
          done: false,
          createdAt: new Date().toISOString(),
        };
        return withTimeout(() => Promise.resolve(ok(t)));
      }
      return request<PlannerTask>('/planner', { method: 'POST', body: JSON.stringify(input) });
    },

    async update(id: string, patch: Partial<PlannerTaskInput & { done: boolean }>): Promise<ApiResult<PlannerTask>> {
      if (USE_MOCK) {
        const existing = SEED_PLANNER_TASKS.find((t) => t.id === id) ?? SEED_PLANNER_TASKS[0];
        const t: PlannerTask = { ...existing, ...patch };
        return withTimeout(() => Promise.resolve(ok(t)));
      }
      return request<PlannerTask>(`/planner/${id}`, { method: 'PATCH', body: JSON.stringify(patch) });
    },

    async remove(id: string): Promise<ApiResult<{ id: string }>> {
      if (USE_MOCK) {
        return withTimeout(() => Promise.resolve(ok({ id })));
      }
      return request<{ id: string }>(`/planner/${id}`, { method: 'DELETE' });
    },
  },

  progress: {
    async overview(): Promise<ApiResult<ProgressOverviewData>> {
      if (USE_MOCK) {
        return withTimeout(() => Promise.resolve(ok(SEED_PROGRESS_OVERVIEW)));
      }
      return request<ProgressOverviewData>('/progress');
    },
  },

  search: {
    async query(q: string): Promise<ApiResult<SearchResponse>> {
      if (USE_MOCK) {
        const results: SearchResult[] = searchSeed(q);
        return withTimeout(() => Promise.resolve(ok({ query: q, results })));
      }
      return request<SearchResponse>(`/search?q=${encodeURIComponent(q)}`);
    },
  },

  _internal: {
    saveSession,
    USE_MOCK,
    recentNotesForDashboard,
    upcomingTopicsForDashboard,
    SEED_ROADMAPS,
  },
};

export type Api = typeof api;
export type { User };
