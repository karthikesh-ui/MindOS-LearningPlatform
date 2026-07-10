import type {
  Note,
  Problem,
  PlannerTask,
  PlannerOverview,
  ProgressOverviewData,
  SearchResult,
  TopicPageData,
  RoadmapStage,
} from '@/types';
import { roadmapBySlug } from './roadmaps';
import { SEED_XP, SEED_ACTIVITY } from './seed';

const now = Date.now();
const hoursAgo = (h: number) => new Date(now - h * 3600_000).toISOString();
const daysAgo = (d: number) => new Date(now - d * 86400_000).toISOString();

/* ----------------------------------------------------------------- Notes */

export const SEED_NOTES: Note[] = [
  {
    id: 'note_1',
    title: 'Python decorators — mental model',
    body: '# Decorators\n\nA decorator is a function that takes a function and returns a function.\n\n```python\ndef timer(fn):\n    def wrapper(*a, **kw):\n        start = time.time()\n        result = fn(*a, **kw)\n        print(time.time() - start)\n        return result\n    return wrapper\n```\n\nKey: the wrapper must accept *args, **kwargs so it works with any signature.',
    category: 'concept',
    pinned: true,
    favorite: true,
    languageSlug: 'python',
    topicId: 'python-intermediate-decorators-&-generators-0',
    createdAt: daysAgo(3),
    updatedAt: hoursAgo(5),
  },
  {
    id: 'note_2',
    title: 'SQL window functions cheat sheet',
    body: '# Window Functions\n\n- `ROW_NUMBER()` — unique row per partition\n- `RANK()` — ties share rank, gaps after\n- `DENSE_RANK()` — ties share rank, no gaps\n- `LAG()` / `LEAD()` — previous / next row value\n\n```sql\nSELECT name, score,\n  RANK() OVER (PARTITION BY class ORDER BY score DESC) AS r\nFROM students;\n```',
    category: 'snippet',
    pinned: false,
    favorite: true,
    languageSlug: 'sql',
    createdAt: daysAgo(6),
    updatedAt: daysAgo(2),
  },
  {
    id: 'note_3',
    title: 'Why embeddings? quick recap',
    body: '# Embeddings\n\nEmbeddings turn discrete tokens into dense vectors so semantic similarity becomes **cosine distance**.\n\nWhy it matters for RAG: retrieve chunks closest to the query vector, then feed them as context.',
    category: 'summary',
    pinned: false,
    favorite: false,
    languageSlug: 'prompt-engineering',
    createdAt: daysAgo(8),
    updatedAt: daysAgo(8),
  },
  {
    id: 'note_4',
    title: 'Async/await gotchas',
    body: '# Async Pitfalls\n\n1. Forgetting `await` — returns a coroutine, not the value.\n2. Top-level await only works in modules / async functions.\n3. `Promise.all` over `for await` when order does not matter.',
    category: 'question',
    pinned: false,
    favorite: false,
    languageSlug: 'javascript',
    createdAt: daysAgo(10),
    updatedAt: daysAgo(10),
  },
  {
    id: 'note_5',
    title: 'General: study log',
    body: '# This week\n\n- Python OOP modules done\n- Started SQL window functions\n- Plan: finish prompt-engineering intermediate by Sunday',
    category: 'general',
    pinned: false,
    favorite: false,
    createdAt: daysAgo(1),
    updatedAt: hoursAgo(2),
  },
];

/* -------------------------------------------------------------- Problems */

export const SEED_PROBLEMS: Problem[] = [
  {
    id: 'prob_1',
    title: 'Two Sum',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. Assume exactly one solution exists.',
    languageSlug: 'python',
    tags: ['array', 'hash-map', 'two-pointers'],
    status: 'solved',
    difficulty: 'Easy',
    notes: 'Hash map for O(n). Store value to index as you scan.',
    isBookmarked: true,
    createdAt: daysAgo(5),
    updatedAt: daysAgo(4),
  },
  {
    id: 'prob_2',
    title: 'LRU Cache',
    description: 'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache. Implement get and put in O(1) average time.',
    languageSlug: 'java',
    tags: ['design', 'hash-map', 'linked-list'],
    status: 'open',
    difficulty: 'Medium',
    notes: 'OrderedDict in Python or LinkedHashMap in Java.',
    isBookmarked: false,
    createdAt: daysAgo(3),
    updatedAt: daysAgo(3),
  },
  {
    id: 'prob_3',
    title: 'Median of Two Sorted Arrays',
    description: 'Given two sorted arrays nums1 and nums2 of size m and n, return the median of the two sorted arrays in O(log(m+n)).',
    languageSlug: 'cpp',
    tags: ['binary-search', 'array', 'divide-conquer'],
    status: 'open',
    difficulty: 'Hard',
    notes: 'Binary search on the smaller array.',
    isBookmarked: false,
    createdAt: daysAgo(7),
    updatedAt: daysAgo(7),
  },
  {
    id: 'prob_4',
    title: 'Top 3 salaries per department',
    description: 'Write a SQL query to find employees who earn the top three salaries in each of their departments.',
    languageSlug: 'sql',
    tags: ['window-functions', 'rank'],
    status: 'solved',
    difficulty: 'Medium',
    isBookmarked: true,
    createdAt: daysAgo(9),
    updatedAt: daysAgo(8),
  },
  {
    id: 'prob_5',
    title: 'Debounce implementation',
    description: 'Implement a debounce(fn, delay) function that delays calling fn until delay ms have elapsed since the last invocation.',
    languageSlug: 'javascript',
    tags: ['closures', 'timers'],
    status: 'archived',
    difficulty: 'Easy',
    isBookmarked: false,
    createdAt: daysAgo(14),
    updatedAt: daysAgo(12),
  },
];

/* ---------------------------------------------------------------- Planner */

export const SEED_PLANNER_TASKS: PlannerTask[] = [
  { id: 'task_1', title: 'Pandas reshaping & merging', languageSlug: 'python', languageName: 'Python', scope: 'today', priority: 'high', durationMinutes: 45, done: false, createdAt: daysAgo(1) },
  { id: 'task_2', title: 'Few-shot prompting practice', languageSlug: 'prompt-engineering', languageName: 'Prompt Engineering', scope: 'today', priority: 'medium', durationMinutes: 30, done: true, createdAt: daysAgo(1) },
  { id: 'task_3', title: 'SQL window functions drill', languageSlug: 'sql', languageName: 'SQL', scope: 'today', priority: 'medium', durationMinutes: 25, done: false, createdAt: daysAgo(1) },
  { id: 'task_4', title: 'Chain-of-thought prompting', languageSlug: 'prompt-engineering', languageName: 'Prompt Engineering', scope: 'tomorrow', priority: 'medium', durationMinutes: 35, done: false, createdAt: daysAgo(1) },
  { id: 'task_5', title: 'Caching strategies', languageSlug: 'system-design', languageName: 'System Design', scope: 'tomorrow', priority: 'high', durationMinutes: 50, done: false, createdAt: daysAgo(1) },
  { id: 'task_6', title: 'Java Streams & Lambdas', languageSlug: 'java', languageName: 'Java', scope: 'week', priority: 'low', durationMinutes: 60, done: false, createdAt: daysAgo(2) },
  { id: 'task_7', title: 'C++ move semantics', languageSlug: 'cpp', languageName: 'C++', scope: 'week', priority: 'medium', durationMinutes: 75, done: false, createdAt: daysAgo(2) },
  { id: 'task_8', title: 'TypeScript generics deep dive', languageSlug: 'typescript', languageName: 'TypeScript', scope: 'week', priority: 'high', durationMinutes: 50, done: true, createdAt: daysAgo(3) },
  { id: 'task_9', title: 'Complete Python OOP track', languageSlug: 'python', languageName: 'Python', scope: 'month', priority: 'high', durationMinutes: 0, deadline: new Date(now + 14 * 86400_000).toISOString(), done: false, createdAt: daysAgo(5) },
  { id: 'task_10', title: 'Build a RAG Q&A bot', languageSlug: 'prompt-engineering', languageName: 'Prompt Engineering', scope: 'month', priority: 'medium', durationMinutes: 0, deadline: new Date(now + 21 * 86400_000).toISOString(), done: false, createdAt: daysAgo(5) },
];

export const SEED_PLANNER: PlannerOverview = {
  today: SEED_PLANNER_TASKS.filter((t) => t.scope === 'today'),
  tomorrow: SEED_PLANNER_TASKS.filter((t) => t.scope === 'tomorrow'),
  week: SEED_PLANNER_TASKS.filter((t) => t.scope === 'week'),
  month: SEED_PLANNER_TASKS.filter((t) => t.scope === 'month'),
  completedToday: SEED_PLANNER_TASKS.filter((t) => t.scope === 'today' && t.done).length,
  totalToday: SEED_PLANNER_TASKS.filter((t) => t.scope === 'today').length,
  weekProgress: 62,
};

/* --------------------------------------------------------------- Progress */

export const SEED_PROGRESS_OVERVIEW: ProgressOverviewData = {
  learningHours: 47,
  completedTopics: 18,
  completedLanguages: 1,
  currentStreak: 12,
  longestStreak: 18,
  xp: SEED_XP,
  weeklyProgress: [
    { day: 'Mon', minutes: 45 },
    { day: 'Tue', minutes: 30 },
    { day: 'Wed', minutes: 60 },
    { day: 'Thu', minutes: 0 },
    { day: 'Fri', minutes: 40 },
    { day: 'Sat', minutes: 25 },
    { day: 'Sun', minutes: 15 },
  ],
  monthlyProgress: [
    { week: 'W1', minutes: 180, topics: 4 },
    { week: 'W2', minutes: 210, topics: 5 },
    { week: 'W3', minutes: 145, topics: 3 },
    { week: 'W4', minutes: 260, topics: 6 },
  ],
  perLanguage: [
    { languageSlug: 'python', languageName: 'Python', percent: 62, hours: 14 },
    { languageSlug: 'sql', languageName: 'SQL', percent: 81, hours: 9 },
    { languageSlug: 'prompt-engineering', languageName: 'Prompt Engineering', percent: 38, hours: 6 },
    { languageSlug: 'system-design', languageName: 'System Design', percent: 12, hours: 4 },
  ],
  timeline: SEED_ACTIVITY.map((a) => ({ ...a })),
};

/* ----------------------------------------------------------------- Search */

export function searchSeed(query: string): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const results: SearchResult[] = [];

  for (const r of [...allLanguagesForSearch()]) {
    if (r.title.toLowerCase().includes(q) || (r.subtitle ?? '').toLowerCase().includes(q)) {
      results.push(r);
    }
  }
  for (const n of SEED_NOTES) {
    if (n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q)) {
      results.push({ id: n.id, kind: 'note', title: n.title, subtitle: n.category, url: '/app/notes' });
    }
  }
  for (const p of SEED_PROBLEMS) {
    if (p.title.toLowerCase().includes(q) || p.tags.some((t: string) => t.includes(q))) {
      results.push({ id: p.id, kind: 'problem', title: p.title, subtitle: p.difficulty, url: '/app/problems' });
    }
  }
  return results.slice(0, 12);
}

function allLanguagesForSearch(): SearchResult[] {
  const slugs = ['python', 'sql', 'java', 'cpp', 'javascript', 'typescript', 'prompt-engineering', 'bash', 'system-design'];
  return slugs.map((slug) => ({
    id: `lang_${slug}`,
    kind: 'language' as const,
    title: slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    subtitle: 'Language track',
    languageSlug: slug,
    url: `/app/learning/${slug}`,
  }));
}

/* -------------------------------------------------------- Topic generation */

export function topicFromRoadmap(slug: string, topicId: string): TopicPageData | null {
  const rm = roadmapBySlug(slug);
  if (!rm) return null;
  const allTopics: Array<{ topic: import('@/types').Roadmap['stages'][number]['topics'][number]; stage: RoadmapStage }> = [];
  for (const sg of rm.stages) {
    for (const t of sg.topics) {
      allTopics.push({ topic: t, stage: sg.stage });
    }
  }
  const idx = allTopics.findIndex((x) => x.topic.id === topicId);
  if (idx === -1) return null;
  const { topic, stage } = allTopics[idx];
  return {
    id: topic.id,
    languageSlug: slug,
    languageName: rm.languageName,
    title: topic.title,
    stage,
    description: `${topic.title} is a ${stage.toLowerCase()} topic in ${rm.languageName}. This guided topic page covers the core ideas, worked examples, and references to go deeper. Work through each sub-topic in order, then mark the topic complete to update your roadmap progress.`,
    objectives: topic.subTopics.map((s: string) => `Understand and apply ${s}`),
    prerequisites: idx > 0 ? [`Completion of "${allTopics[idx - 1].topic.title}" is recommended`] : ['A working setup of ' + rm.languageName],
    estimatedMinutes: topic.estimatedMinutes,
    difficulty: topic.difficulty,
    examples: buildExamples(slug, topic.title),
    references: [
      { title: `${rm.languageName} — official documentation`, url: '#' },
      { title: `${topic.title} — community guide`, url: '#' },
    ],
    isCompleted: topic.completed,
    isBookmarked: false,
    prevTopicId: idx > 0 ? allTopics[idx - 1].topic.id : null,
    nextTopicId: idx < allTopics.length - 1 ? allTopics[idx + 1].topic.id : null,
  };
}

function buildExamples(slug: string, topic: string): { title: string; code: string; language: string }[] {
  const langMap: Record<string, string> = {
    python: 'python', sql: 'sql', java: 'java', cpp: 'cpp', javascript: 'javascript',
    typescript: 'typescript', 'prompt-engineering': 'text', bash: 'bash', 'system-design': 'text',
  };
  const code = sampleCode(slug, topic);
  return [{ title: `Basic example — ${topic}`, code, language: langMap[slug] ?? 'text' }];
}

function sampleCode(slug: string, _topic: string): string {
  const samples: Record<string, string> = {
    python: '# Example\ndef greet(name: str) -> str:\n    return f"Hello, {name}!"\n\nprint(greet("MindOS"))',
    sql: '-- Example\nSELECT department, COUNT(*) AS headcount\nFROM employees\nGROUP BY department\nORDER BY headcount DESC;',
    java: '// Example\npublic class Main {\n  static String greet(String name) {\n    return "Hello, " + name + "!";\n  }\n  public static void main(String[] args) {\n    System.out.println(greet("MindOS"));\n  }\n}',
    cpp: '// Example\n#include <iostream>\nstd::string greet(std::string name) {\n  return "Hello, " + name + "!";\n}\nint main() {\n  std::cout << greet("MindOS") << std::endl;\n}',
    javascript: '// Example\nconst greet = (name) => `Hello, ${name}!`;\nconsole.log(greet("MindOS"));',
    typescript: '// Example\nconst greet = (name: string): string => `Hello, ${name}!`;\nconsole.log(greet("MindOS"));',
    'prompt-engineering': 'System: You are a concise tutor.\nUser: Explain {topic} in 3 sentences.\nOutput format: bullet list.',
    bash: '# Example\ngreet() {\n  echo "Hello, $1!"\n}\ngreet "MindOS"',
    'system-design': 'Capacity estimate:\n- 10M users, 5 requests/s peak\n- read:write = 100:1\n- storage ~ 50GB / year\n- cache hit rate target 90%',
  };
  return samples[slug] ?? '# Example coming soon';
}

export function upcomingTopicsForDashboard(): NonNullable<import('@/types').DashboardData['upcomingTopics']> {
  const out: { id: string; title: string; languageSlug: string; languageName: string; stage: RoadmapStage }[] = [];
  const slugs = ['python', 'sql', 'prompt-engineering', 'system-design'];
  for (const slug of slugs) {
    const rm = roadmapBySlug(slug);
    if (!rm) continue;
    const next = rm.stages.flatMap((s) => s.topics).find((t) => !t.completed);
    if (next) {
      const stage = rm.stages.find((s) => s.topics.includes(next))?.stage ?? 'Beginner';
      out.push({ id: next.id, title: next.title, languageSlug: slug, languageName: rm.languageName, stage });
    }
    if (out.length >= 4) break;
  }
  return out.slice(0, 4);
}

export function recentNotesForDashboard(count = 3): Note[] {
  return [...SEED_NOTES].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, count);
}
