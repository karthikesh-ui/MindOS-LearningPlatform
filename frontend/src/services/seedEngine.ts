import type {
  EngineResult,
  ThinkingHistoryEntry,
  ThinkingStats,
  HintProgress,
  Flashcard,
  FlashcardStats,
  Quiz,
  RevisionSchedule,
  AppNotification,
  WeakArea,
  Recommendation,
  MockInterview,
  AnalyticsData,
  GamificationData,
  LearningMemory,
} from '@/types/engine';

const now = Date.now();
const hoursAgo = (h: number) => new Date(now - h * 3600_000).toISOString();
const daysAgo = (d: number) => new Date(now - d * 86400_000).toISOString();
const daysAhead = (d: number) => new Date(now + d * 86400_000).toISOString();
const today = new Date(now).toISOString().slice(0, 10);

export const SEED_ENGINE_RESULT: EngineResult = {
  xp_gained: 75,
  achievements_unlocked: [{ code: 'problem_master', title: '50 Problems Solved', description: 'Solve 50 coding problems', xp: 400 }],
  notifications_created: [{ kind: 'goal', title: 'Problem solved: Two Sum', body: '+75 XP earned. Keep the momentum going!' }],
  revisions_scheduled: [{ topic_ref: 'python-loops', scheduled_date: daysAhead(1).slice(0, 10) }],
  weak_areas_detected: [{ title: 'High hint usage in python', type: 'high_hints', severity: 'medium' }],
  recommendations_generated: [{ kind: 'practice_problem', title: 'Try a harder problem', language_slug: 'python' }],
  streak_updated: true,
  dashboard_dirty: true,
};

export const SEED_THINKING_HISTORY: ThinkingHistoryEntry[] = [
  { id: 'th_1', problem_title: 'Two Sum', language_slug: 'python', started_at: hoursAgo(5), finished_at: hoursAgo(4.5), thinking_seconds: 1800, hints_opened: 2, attempts: 1, difficulty: 'Easy', solution_completed: true, revision_required: false, next_review_date: daysAhead(3).slice(0, 10), improvement_score: 0 },
  { id: 'th_2', problem_title: 'LRU Cache', language_slug: 'java', started_at: hoursAgo(24), finished_at: hoursAgo(23), thinking_seconds: 3600, hints_opened: 4, attempts: 2, difficulty: 'Medium', solution_completed: false, revision_required: true, next_review_date: daysAhead(1).slice(0, 10), improvement_score: -20 },
  { id: 'th_3', problem_title: 'Median of Two Sorted Arrays', language_slug: 'cpp', started_at: daysAgo(3), finished_at: daysAgo(3), thinking_seconds: 2700, hints_opened: 3, attempts: 1, difficulty: 'Hard', solution_completed: true, revision_required: false, next_review_date: daysAhead(7).slice(0, 10), improvement_score: 15 },
  { id: 'th_4', problem_title: 'Two Sum', language_slug: 'python', started_at: daysAgo(7), finished_at: daysAgo(7), thinking_seconds: 2400, hints_opened: 5, attempts: 3, difficulty: 'Easy', solution_completed: true, revision_required: true, next_review_date: daysAhead(1).slice(0, 10), improvement_score: 25 },
];

export const SEED_THINKING_STATS: ThinkingStats = {
  total_attempts: 12,
  completed: 8,
  avg_thinking_seconds: 2100,
  avg_hints_opened: 3,
  avg_improvement_score: 12,
};

export const SEED_HINT_PROGRESS: HintProgress = {
  thinking_history_id: 'th_2',
  current_stage: 3,
  stages: [
    { stage: 1, stage_name: 'Understand the Problem', content: 'Re-read the problem statement. What are the inputs and expected outputs?', is_locked: false },
    { stage: 2, stage_name: 'Tiny Hint', content: 'Think about what data structure could help here. Consider whether the problem involves counting or searching.', is_locked: false },
    { stage: 3, stage_name: 'Thinking Direction', content: 'Consider a hash map for O(n) lookups or two pointers for in-place traversal.', is_locked: false },
    { stage: 4, stage_name: 'Logical Approach', content: '', is_locked: true },
    { stage: 5, stage_name: 'Pseudo Code', content: '', is_locked: true },
    { stage: 6, stage_name: 'Time Complexity', content: '', is_locked: true },
    { stage: 7, stage_name: 'Final Solution', content: 'This stage is locked. Only reveal the solution after you have attempted the problem yourself.', is_locked: true },
  ],
};

export const SEED_FLASHCARDS: Flashcard[] = [
  { id: 'fc_1', front: 'What is a Python decorator?', back: 'A function that takes another function and returns a modified function. Uses the @decorator syntax.', source_type: 'topic', source_ref: 'Python Decorators', language_slug: 'python', status: 'known', ease_factor: 2.6, interval_days: 7, next_review_at: daysAhead(2) },
  { id: 'fc_2', front: 'What does SQL RANK() do vs DENSE_RANK()?', back: 'RANK() leaves gaps after ties. DENSE_RANK() does not leave gaps.', source_type: 'topic', source_ref: 'SQL Window Functions', language_slug: 'sql', status: 'learning', ease_factor: 2.3, interval_days: 1, next_review_at: daysAhead(1) },
  { id: 'fc_3', front: 'What is the JavaScript event loop?', back: 'A mechanism that processes the call stack, microtask queue, and macrotask queue in order.', source_type: 'topic', source_ref: 'Event Loop', language_slug: 'javascript', status: 'new', ease_factor: 2.5, interval_days: 0, next_review_at: new Date(now).toISOString() },
  { id: 'fc_4', front: 'What is Big O of binary search?', back: 'O(log n) — each comparison halves the search space.', source_type: 'topic', source_ref: 'Binary Search', language_slug: 'python', status: 'mastered', ease_factor: 2.8, interval_days: 14, next_review_at: daysAhead(10) },
  { id: 'fc_5', front: 'What is the CAP theorem?', back: 'A distributed system can guarantee at most 2 of: Consistency, Availability, Partition tolerance.', source_type: 'topic', source_ref: 'CAP Theorem', language_slug: 'system-design', status: 'learning', ease_factor: 2.4, interval_days: 3, next_review_at: daysAhead(1) },
];

export const SEED_FLASHCARD_STATS: FlashcardStats = { total: 28, due: 5, mastered: 12 };

export const SEED_QUIZZES: Quiz[] = [
  { id: 'quiz_python', language_slug: 'python', title: 'Python Knowledge Check', quiz_type: 'mixed', is_published: true, questions: [
    { id: 'q1', question: 'What is the output of: print(type([]))?', type: 'output_predict', options: ["<class 'list'>", "<class 'array'>", "<class 'dict'>", 'list'], correct_index: 0, explanation: "[] creates a list, and type() returns its class." },
    { id: 'q2', question: 'Which keyword is used to define a function in Python?', type: 'mcq', options: ['function', 'def', 'func', 'lambda'], correct_index: 1, explanation: "Python uses 'def' to define functions." },
    { id: 'q3', question: 'Fill in the blank: The ______ statement is used to exit a loop early.', type: 'fill_blank', correct_answer: 'break', explanation: 'The break statement exits the nearest enclosing loop.' },
  ]},
  { id: 'quiz_sql', language_slug: 'sql', title: 'SQL Knowledge Check', quiz_type: 'mixed', is_published: true, questions: [
    { id: 'q1', question: 'Which JOIN returns all rows from the left table even if no match?', type: 'mcq', options: ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'CROSS JOIN'], correct_index: 1, explanation: 'LEFT JOIN preserves all rows from the left table.' },
    { id: 'q2', question: 'What does COUNT(*) return?', type: 'mcq', options: ['Number of distinct values', 'Total number of rows', 'First row count', 'Column sum'], correct_index: 1, explanation: 'COUNT(*) counts all rows including duplicates and NULLs.' },
  ]},
];

export const SEED_REVISION_SCHEDULE: RevisionSchedule = {
  today: [
    { id: 'rev_1', topic_ref: 'python-loops', language_slug: 'python', title: 'Python Loops', scheduled_date: today, interval_days: 1, completed: false },
    { id: 'rev_2', topic_ref: 'sql-joins', language_slug: 'sql', title: 'SQL Joins', scheduled_date: today, interval_days: 3, completed: false },
  ],
  upcoming: [
    { id: 'rev_3', topic_ref: 'python-oop', language_slug: 'python', title: 'Python OOP', scheduled_date: daysAhead(3).slice(0, 10), interval_days: 7, completed: false },
    { id: 'rev_4', topic_ref: 'js-async', language_slug: 'javascript', title: 'JavaScript Async', scheduled_date: daysAhead(7).slice(0, 10), interval_days: 14, completed: false },
  ],
  overdue: [
    { id: 'rev_5', topic_ref: 'cpp-pointers', language_slug: 'cpp', title: 'C++ Pointers', scheduled_date: daysAgo(2).slice(0, 10), interval_days: 1, completed: false },
  ],
};

export const SEED_NOTIFICATIONS: AppNotification[] = [
  { id: 'n_1', kind: 'revision', title: 'Revision due: Python Loops', body: 'You scheduled a revision for today. Review to lock in the concept.', resource_url: '/app/learning/python', read: false, created_at: hoursAgo(2) },
  { id: 'n_2', kind: 'weak_topic', title: 'Weak area detected: SQL Joins', body: 'Your quiz scores suggest SQL Joins need reinforcement.', resource_url: '/app/learning/sql', read: false, created_at: hoursAgo(5) },
  { id: 'n_3', kind: 'goal', title: 'Problem solved: Two Sum', body: '+75 XP earned. Keep the momentum going!', read: true, created_at: hoursAgo(8) },
  { id: 'n_4', kind: 'planner', title: 'Tomorrow plan ready', body: 'You have 2 tasks scheduled for tomorrow.', read: false, created_at: hoursAgo(12) },
  { id: 'n_5', kind: 'achievement', title: 'Achievement unlocked: Week Warrior', body: 'You maintained a 7-day streak. +200 XP!', read: true, created_at: daysAgo(1) },
];

export const SEED_WEAK_AREAS: WeakArea[] = [
  { id: 'wa_1', language_slug: 'sql', topic_ref: 'sql-joins', title: 'SQL Joins', weakness_type: 'low_quiz', severity: 'high', score: 0.8, detected_at: hoursAgo(5) },
  { id: 'wa_2', language_slug: 'cpp', topic_ref: 'cpp-pointers', title: 'C++ Pointers', weakness_type: 'long_solve', severity: 'medium', score: 0.6, detected_at: daysAgo(2) },
  { id: 'wa_3', language_slug: 'java', title: 'High hint usage in Java', weakness_type: 'high_hints', severity: 'medium', score: 0.5, detected_at: daysAgo(1) },
  { id: 'wa_4', language_slug: 'system-design', topic_ref: 'cap-theorem', title: 'CAP Theorem', weakness_type: 'missed_revision', severity: 'low', score: 0.3, detected_at: daysAgo(3) },
];

export const SEED_RECOMMENDATIONS: Recommendation[] = [
  { id: 'rec_1', kind: 'next_topic', title: 'Continue with the next Python topic', subtitle: 'Pick up where you left off', language_slug: 'python', priority: 8, reason: 'You just completed a topic — momentum is highest right now.', accepted: false, created_at: hoursAgo(1) },
  { id: 'rec_2', kind: 'practice_problem', title: 'Try a harder problem', subtitle: 'Challenge yourself with the next difficulty level', language_slug: 'python', priority: 7, reason: 'Solving consecutive problems builds problem-solving muscle.', accepted: false, created_at: hoursAgo(2) },
  { id: 'rec_3', kind: 'revision', title: 'Review weak areas from recent quizzes', subtitle: 'Spaced repetition will lock in the concepts', priority: 6, reason: 'Quiz performance suggests some topics need reinforcement.', accepted: false, created_at: hoursAgo(5) },
  { id: 'rec_4', kind: 'interview', title: 'Try a mock interview', subtitle: 'Test your skills under time pressure', priority: 6, reason: 'You have solved 10+ problems — interview practice will sharpen your delivery.', accepted: false, created_at: daysAgo(1) },
];

export const SEED_MOCK_INTERVIEW: MockInterview = {
  id: 'mi_1', track: 'python', status: 'active', current_index: 1,
  questions: [
    { id: 'q1', question: 'Explain the difference between a list and a tuple in Python. When would you use each?', difficulty: 'Easy', hints: ['Think about mutability', 'Consider performance implications'] },
    { id: 'q2', question: "How does Python's GIL affect multi-threaded programs? What alternatives exist?", difficulty: 'Medium', hints: ['Global Interpreter Lock', 'Consider multiprocessing'] },
    { id: 'q3', question: 'Write a function to reverse a linked list. Explain your approach.', difficulty: 'Medium', hints: ['Iterative vs recursive', 'Think about pointers'] },
  ],
  self_evaluations: [
    { question_index: 0, answer: 'Lists are mutable, tuples are immutable. Use tuples for fixed data like coordinates.', self_rating: 4, evaluated_at: hoursAgo(1) },
  ],
  started_at: hoursAgo(2),
};

export const SEED_ANALYTICS: AnalyticsData = {
  learning_hours: 52,
  topic_completion: 18,
  language_progress: [
    { language_slug: 'python', language_name: 'Python', percent: 62, hours: 14 },
    { language_slug: 'sql', language_name: 'SQL', percent: 81, hours: 9 },
    { language_slug: 'javascript', language_name: 'JavaScript', percent: 45, hours: 7 },
  ],
  weekly_progress: [
    { day: 'Mon', minutes: 45 }, { day: 'Tue', minutes: 30 }, { day: 'Wed', minutes: 60 },
    { day: 'Thu', minutes: 0 }, { day: 'Fri', minutes: 40 }, { day: 'Sat', minutes: 25 }, { day: 'Sun', minutes: 15 },
  ],
  monthly_progress: [
    { week: 'W1', minutes: 180 }, { week: 'W2', minutes: 210 }, { week: 'W3', minutes: 145 }, { week: 'W4', minutes: 260 },
  ],
  thinking_time_seconds: 12600,
  hint_usage: 14,
  revision_accuracy: 78,
  improvement_rate: 12,
  quiz_avg_score: 72,
  problems_solved: 8,
  flashcards_mastered: 12,
};

export const SEED_GAMIFICATION: GamificationData = {
  xp: { total: 3400, level: 5, current_level_xp: 300, next_level_xp: 700, weekly_gain: 420 },
  level: 5,
  streak: { current: 12, longest: 18 },
  weekly_challenge: { label: 'Study 5 hours this week', current: 215, target: 300, percent: 72 },
  monthly_challenge: { label: 'Solve 20 problems', current: 8, target: 20, percent: 40 },
  milestones: [
    { label: '100 study hours', current: 52, target: 100 },
    { label: '50 problems solved', current: 8, target: 50 },
    { label: '7 day streak', current: 12, target: 7 },
  ],
  recent_achievements: [
    { code: 'week_warrior', title: '7 Day Consistency', xp: 200 },
    { code: 'first_steps', title: 'First Steps', xp: 100 },
  ],
};

export const SEED_LEARNING_MEMORY: LearningMemory = {
  sessions: 34,
  total_minutes: 3120,
  completed_topics: 18,
  problems_solved: 8,
  hints_opened: 14,
  bookmarks: 6,
  revisions: 12,
  completed_revisions: 7,
  achievements: 4,
  xp_events: 48,
  quiz_attempts: 6,
  daily_history: [
    { date: daysAgo(6).slice(0, 10), minutes: 45 },
    { date: daysAgo(5).slice(0, 10), minutes: 30 },
    { date: daysAgo(4).slice(0, 10), minutes: 60 },
    { date: daysAgo(3).slice(0, 10), minutes: 0 },
    { date: daysAgo(2).slice(0, 10), minutes: 40 },
    { date: daysAgo(1).slice(0, 10), minutes: 25 },
    { date: today, minutes: 15 },
  ],
  weekly_history: [
    { week: 'W1', minutes: 180 }, { week: 'W2', minutes: 210 }, { week: 'W3', minutes: 145 }, { week: 'W4', minutes: 260 },
  ],
  monthly_history: [
    { month: 'Feb', minutes: 420 }, { month: 'Mar', minutes: 580 }, { month: 'Apr', minutes: 720 },
    { month: 'May', minutes: 650 }, { month: 'Jun', minutes: 480 }, { month: 'Jul', minutes: 270 },
  ],
};
