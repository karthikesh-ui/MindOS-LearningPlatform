import type {
  ActivityItem,
  Bookmark,
  DashboardData,
  Language,
  PlannerItem,
  Progress,
  User,
  Achievement,
  XpSummary,
  StreakSummary,
} from '@/types';

const now = Date.now();
const hoursAgo = (h: number) => new Date(now - h * 3600_000).toISOString();
const daysAgo = (d: number) => new Date(now - d * 86400_000).toISOString();


export const SEED_USER: User = {
  id: 'usr_001',
  email: 'aria.sharma@example.com',
  name: 'Aria Sharma',
  avatarUrl: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
  provider: 'google',
  createdAt: daysAgo(42),
};

export const GUEST_USER: User = {
  id: 'usr_guest',
  email: 'guest@minds.local',
  name: 'Guest Learner',
  provider: 'guest',
  createdAt: new Date().toISOString(),
};

export const SEED_LANGUAGES: Language[] = [
  {
    id: 'lang_python',
    slug: 'python',
    name: 'Python',
    tagline: 'The lingua franca of AI & ML',
    description:
      'Master Python from foundations to data manipulation with NumPy and Pandas — the backbone of every modern AI workflow.',
    difficulty: 'Beginner',
    estimatedHours: 28,
    icon: 'Code2',
    accent: 'brand',
    modulesCount: 12,
  },
  {
    id: 'lang_sql',
    slug: 'sql',
    name: 'SQL',
    tagline: 'Speak fluently with databases',
    description:
      'Query, join, and optimize relational data. Essential for analytics, backend engineering, and feature engineering at scale.',
    difficulty: 'Beginner',
    estimatedHours: 18,
    icon: 'Database',
    accent: 'accent',
    modulesCount: 8,
  },
  {
    id: 'lang_java',
    slug: 'java',
    name: 'Java',
    tagline: 'Enterprise-grade engineering',
    description:
      'Build robust, type-safe systems with Java. From OOP fundamentals to concurrency — the language that powers large-scale backends.',
    difficulty: 'Intermediate',
    estimatedHours: 34,
    icon: 'Coffee',
    accent: 'warning',
    modulesCount: 14,
  },
  {
    id: 'lang_cpp',
    slug: 'cpp',
    name: 'C++',
    tagline: 'Performance at the metal',
    description:
      'Memory, pointers, and systems programming. The foundation for ML infrastructure, competitive programming, and high-performance computing.',
    difficulty: 'Advanced',
    estimatedHours: 40,
    icon: 'Cpu',
    accent: 'error',
    modulesCount: 16,
  },
  {
    id: 'lang_javascript',
    slug: 'javascript',
    name: 'JavaScript',
    tagline: 'The language of the web',
    description:
      'Build interactive applications end-to-end. Core to frontend engineering and the gateway to full-stack AI product development.',
    difficulty: 'Beginner',
    estimatedHours: 24,
    icon: 'Braces',
    accent: 'warning',
    modulesCount: 11,
  },
  {
    id: 'lang_typescript',
    slug: 'typescript',
    name: 'TypeScript',
    tagline: 'JavaScript with safety rails',
    description:
      'Add static typing to JavaScript. The industry standard for scalable web apps and modern AI tooling.',
    difficulty: 'Intermediate',
    estimatedHours: 22,
    icon: 'FileCode2',
    accent: 'brand',
    modulesCount: 10,
  },
  {
    id: 'lang_prompt',
    slug: 'prompt-engineering',
    name: 'Prompt Engineering',
    tagline: 'Steer large language models',
    description:
      'Craft prompts that reliably elicit high-quality output from LLMs. Few-shot, chain-of-thought, RAG, and structured generation.',
    difficulty: 'Beginner',
    estimatedHours: 16,
    icon: 'Sparkles',
    accent: 'accent',
    modulesCount: 9,
  },
  {
    id: 'lang_bash',
    slug: 'bash',
    name: 'Bash',
    tagline: 'Automate the command line',
    description:
      'Shell scripting, pipelines, and automation. The everyday toolkit of every engineer working with GPUs, servers, and data.',
    difficulty: 'Beginner',
    estimatedHours: 12,
    icon: 'TerminalSquare',
    accent: 'ink',
    modulesCount: 7,
  },
  {
    id: 'lang_system-design',
    slug: 'system-design',
    name: 'System Design',
    tagline: 'Architect at scale',
    description:
      'Design scalable, resilient systems. Caching, sharding, queues, and the trade-offs senior engineers are expected to articulate.',
    difficulty: 'Advanced',
    estimatedHours: 30,
    icon: 'Network',
    accent: 'brand',
    modulesCount: 13,
  },
];

export const SEED_PROGRESS: Progress[] = [
  {
    languageId: 'lang_python',
    percent: 62,
    completedModules: 7,
    totalModules: 12,
    lastStudiedAt: hoursAgo(5),
    nextModuleTitle: 'Pandas: reshaping & merging',
  },
  {
    languageId: 'lang_prompt',
    percent: 38,
    completedModules: 3,
    totalModules: 9,
    lastStudiedAt: daysAgo(1),
    nextModuleTitle: 'Chain-of-thought prompting',
  },
  {
    languageId: 'lang_sql',
    percent: 81,
    completedModules: 6,
    totalModules: 8,
    lastStudiedAt: daysAgo(2),
    nextModuleTitle: 'Window functions in depth',
  },
  {
    languageId: 'lang_system-design',
    percent: 12,
    completedModules: 2,
    totalModules: 13,
    lastStudiedAt: daysAgo(4),
    nextModuleTitle: 'Caching strategies & CDN',
  },
];

export const SEED_TODAYS_PLAN: PlannerItem[] = [
  {
    id: 'plan_1',
    title: 'Pandas: reshaping & merging',
    languageSlug: 'python',
    languageName: 'Python',
    scheduledFor: 'today',
    durationMinutes: 45,
    done: false,
  },
  {
    id: 'plan_2',
    title: 'Few-shot prompting patterns',
    languageSlug: 'prompt-engineering',
    languageName: 'Prompt Engineering',
    scheduledFor: 'today',
    durationMinutes: 30,
    done: true,
  },
  {
    id: 'plan_3',
    title: 'SQL window functions drill',
    languageSlug: 'sql',
    languageName: 'SQL',
    scheduledFor: 'today',
    durationMinutes: 25,
    done: false,
  },
];

export const SEED_TOMORROW: PlannerItem[] = [
  {
    id: 'plan_4',
    title: 'Chain-of-thought prompting',
    languageSlug: 'prompt-engineering',
    languageName: 'Prompt Engineering',
    scheduledFor: 'tomorrow',
    durationMinutes: 35,
    done: false,
  },
  {
    id: 'plan_5',
    title: 'Caching strategies & CDN',
    languageSlug: 'system-design',
    languageName: 'System Design',
    scheduledFor: 'tomorrow',
    durationMinutes: 50,
    done: false,
  },
];

export const SEED_ACTIVITY: ActivityItem[] = [
  {
    id: 'act_1',
    kind: 'completed',
    title: 'Completed module · Few-shot prompting',
    detail: 'Prompt Engineering',
    occurredAt: hoursAgo(2),
  },
  {
    id: 'act_2',
    kind: 'milestone',
    title: 'Reached Level 7',
    detail: '+320 XP this week',
    occurredAt: daysAgo(1),
  },
  {
    id: 'act_3',
    kind: 'bookmark',
    title: 'Bookmarked · Window functions',
    detail: 'SQL',
    occurredAt: daysAgo(2),
  },
  {
    id: 'act_4',
    kind: 'started',
    title: 'Started · System Design',
    detail: 'New track · Advanced',
    occurredAt: daysAgo(4),
  },
];

export const SEED_BOOKMARKS: Bookmark[] = [
  {
    id: 'bm_1',
    title: 'Window functions in depth',
    languageSlug: 'sql',
    languageName: 'SQL',
    type: 'lesson',
    createdAt: daysAgo(2),
  },
  {
    id: 'bm_2',
    title: 'Vector embeddings explained',
    languageSlug: 'prompt-engineering',
    languageName: 'Prompt Engineering',
    type: 'article',
    createdAt: daysAgo(5),
  },
  {
    id: 'bm_3',
    title: 'Decorators & context managers',
    languageSlug: 'python',
    languageName: 'Python',
    type: 'module',
    createdAt: daysAgo(8),
  },
];

export const SEED_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach_1',
    title: 'First Steps',
    description: 'Complete your first module',
    icon: 'Footprints',
    unlockedAt: daysAgo(40),
  },
  {
    id: 'ach_2',
    title: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: 'Flame',
    unlockedAt: daysAgo(20),
  },
  {
    id: 'ach_3',
    title: 'Curious Mind',
    description: 'Start 3 different tracks',
    icon: 'Compass',
    unlockedAt: daysAgo(12),
  },
  {
    id: 'ach_4',
    title: 'Polyglot',
    description: 'Reach 50% in 4 languages',
    icon: 'Languages',
    progress: 75,
  },
  {
    id: 'ach_5',
    title: 'Deep Diver',
    description: 'Complete an Advanced track',
    icon: 'Anchor',
    progress: 12,
  },
  {
    id: 'ach_6',
    title: 'Night Owl',
    description: 'Study after 10pm, 5 times',
    icon: 'Moon',
    progress: 60,
  },
];

export const SEED_XP: XpSummary = {
  total: 4820,
  level: 7,
  currentLevelXp: 820,
  nextLevelXp: 1000,
  weeklyGain: 320,
};

export const SEED_STREAK: StreakSummary = {
  current: 12,
  longest: 18,
  lastStudyDate: hoursAgo(5),
  thisWeek: [true, true, true, false, true, true, true],
};

export const SEED_DASHBOARD: DashboardData = {
  user: {
    name: SEED_USER.name,
    email: SEED_USER.email,
    avatarUrl: SEED_USER.avatarUrl,
  },
  xp: SEED_XP,
  streak: SEED_STREAK,
  todaysPlan: SEED_TODAYS_PLAN,
  tomorrowPreview: SEED_TOMORROW,
  continueLearning: SEED_PROGRESS,
  weeklyGoal: { completedMinutes: 215, targetMinutes: 300 },
  recentActivity: SEED_ACTIVITY,
  bookmarks: SEED_BOOKMARKS,
  languages: SEED_LANGUAGES,
  recentNotes: [],
  upcomingTopics: [],
};
