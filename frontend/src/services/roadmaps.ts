import type { Roadmap } from '@/types';

const STAGE_DESC: Record<string, string> = {
  Beginner: 'Core syntax, data types, and the fundamentals you need before anything else.',
  Intermediate: 'Structuring programs, working with data, and writing idiomatic code.',
  Advanced: 'Performance, internals, and the patterns senior engineers rely on.',
  'Interview Preparation': 'High-frequency problems and the concepts interviewers test most.',
  Projects: 'Apply everything by building real, portfolio-worthy artifacts.',
  Resources: 'Curated books, docs, and references for going deeper.',
};

function mk(
  languageSlug: string,
  languageName: string,
  stages: Array<{ stage: Roadmap['stages'][number]['stage']; topics: Array<[string, string[], number, boolean]> }>,
): Roadmap {
  const built = stages.map((g) => {
    const completedCount = g.topics.filter(([, , , done]) => done).length;
    const total = g.topics.length;
    return {
      stage: g.stage,
      description: STAGE_DESC[g.stage] ?? '',
      progress: total === 0 ? 0 : Math.round((completedCount / total) * 100),
      topics: g.topics.map(([title, subTopics, estimatedMinutes, completed], i) => ({
        id: `${languageSlug}-${g.stage.toLowerCase().replace(/\s+/g, '-')}-${i}`,
        title,
        subTopics,
        estimatedMinutes,
        difficulty: (g.stage === 'Beginner' ? 'Beginner' : g.stage === 'Advanced' || g.stage === 'Interview Preparation' ? 'Advanced' : 'Intermediate') as Roadmap['stages'][number]['topics'][number]['difficulty'],
        completed,
      })),
    };
  });
  const allTopics = built.flatMap((s) => s.topics);
  const doneTopics = allTopics.filter((t) => t.completed).length;
  return {
    languageSlug,
    languageName,
    stages: built,
    overallPercent: allTopics.length === 0 ? 0 : Math.round((doneTopics / allTopics.length) * 100),
  };
}

export const SEED_ROADMAPS: Roadmap[] = [
  mk('python', 'Python', [
    { stage: 'Beginner', topics: [
      ['Variables & Data Types', ['int', 'float', 'str', 'bool', 'type()', 'type conversion'], 40, true],
      ['Control Flow', ['if/elif/else', 'for loops', 'while loops', 'break/continue'], 50, true],
      ['Functions', ['def', 'arguments', 'return', 'default values', '*args/**kwargs'], 60, true],
      ['Data Structures', ['list', 'tuple', 'dict', 'set', 'comprehensions'], 70, true],
      ['Strings & I/O', ['string methods', 'f-strings', 'input()', 'file reading'], 45, false],
    ]},
    { stage: 'Intermediate', topics: [
      ['OOP Fundamentals', ['classes', '__init__', 'methods', 'inheritance'], 75, false],
      ['Modules & Packages', ['import', 'pip', 'venv', '__name__'], 40, false],
      ['Error Handling', ['try/except', 'raise', 'custom exceptions'], 50, false],
      ['Decorators & Generators', ['@decorator', 'yield', 'generator pipelines'], 60, false],
    ]},
    { stage: 'Advanced', topics: [
      ['Concurrency', ['threading', 'asyncio', 'multiprocessing'], 80, false],
      ['Metaprogramming', ['metaclasses', 'descriptors', '__getattr__'], 70, false],
      ['Performance', ['profiling', 'cProfile', 'Cython overview'], 60, false],
    ]},
    { stage: 'Interview Preparation', topics: [
      ['Arrays & Strings', ['two pointers', 'sliding window'], 60, false],
      ['Hash Maps & Sets', ['frequency counting', 'grouping'], 50, false],
      ['Trees & Graphs', ['BFS', 'DFS', 'recursion'], 80, false],
      ['Dynamic Programming', ['memoization', 'tabulation'], 90, false],
    ]},
    { stage: 'Projects', topics: [
      ['CLI Tool', ['argparse', 'file I/O'], 120, false],
      ['Data Pipeline', ['pandas', 'CSV/JSON'], 150, false],
      ['ML Starter', ['scikit-learn', 'train/eval'], 180, false],
    ]},
    { stage: 'Resources', topics: [
      ['Official Docs', ['docs.python.org'], 30, false],
      ['Fluent Python', ['Ramalho'], 30, false],
      ['Effective Python', ['Slatkin'], 30, false],
    ]},
  ]),

  mk('sql', 'SQL', [
    { stage: 'Beginner', topics: [
      ['SELECT Basics', ['columns', 'WHERE', 'LIMIT'], 40, true],
      ['Filtering & Sorting', ['WHERE', 'ORDER BY', 'DISTINCT'], 40, true],
      ['Joins', ['INNER JOIN', 'LEFT JOIN', 'table aliases'], 60, true],
      ['Aggregations', ['COUNT', 'SUM', 'AVG', 'GROUP BY'], 50, false],
    ]},
    { stage: 'Intermediate', topics: [
      ['Subqueries', ['scalar', 'correlated', 'EXISTS'], 55, false],
      ['Window Functions', ['ROW_NUMBER', 'RANK', 'PARTITION BY'], 70, false],
      ['Set Operations', ['UNION', 'INTERSECT', 'EXCEPT'], 40, false],
      ['Data Modification', ['INSERT', 'UPDATE', 'DELETE', 'UPSERT'], 50, false],
    ]},
    { stage: 'Advanced', topics: [
      ['Query Optimization', ['EXPLAIN', 'indexes', 'plan analysis'], 80, false],
      ['CTEs & Recursion', ['WITH', 'recursive CTE'], 70, false],
      ['Transactions', ['ACID', 'isolation levels', 'locking'], 60, false],
    ]},
    { stage: 'Interview Preparation', topics: [
      ['LeetCode SQL Set', ['rankings', 'duplicates', 'consecutive'], 70, false],
      ['Schema Design', ['normalization', 'foreign keys'], 60, false],
    ]},
    { stage: 'Projects', topics: [
      ['Analytics Dashboard', ['aggregations', 'joins'], 120, false],
      ['Mini Data Warehouse', ['star schema', 'ETL'], 180, false],
    ]},
    { stage: 'Resources', topics: [
      ['Mode SQL Tutorial', ['mode.com'], 30, false],
      ['SQL Performance Explained', ['Marcus Winand'], 30, false],
    ]},
  ]),

  mk('java', 'Java', [
    { stage: 'Beginner', topics: [
      ['Syntax & Types', ['primitives', 'String', 'casting'], 50, true],
      ['Control Flow', ['if/else', 'switch', 'loops'], 45, true],
      ['Methods & Arrays', ['static', 'overloading', 'arrays'], 55, false],
    ]},
    { stage: 'Intermediate', topics: [
      ['OOP', ['classes', 'inheritance', 'interfaces', 'polymorphism'], 80, false],
      ['Collections Framework', ['List', 'Map', 'Set', 'Iterators'], 70, false],
      ['Exceptions', ['checked', 'unchecked', 'try-with-resources'], 50, false],
      ['Streams & Lambdas', ['Stream API', 'Optional', 'method refs'], 65, false],
    ]},
    { stage: 'Advanced', topics: [
      ['Concurrency', ['Thread', 'ExecutorService', 'CompletableFuture'], 85, false],
      ['JVM Internals', ['memory model', 'GC overview'], 70, false],
      ['Spring Boot Basics', ['DI', 'REST controllers'], 90, false],
    ]},
    { stage: 'Interview Preparation', topics: [
      ['Data Structures', ['LinkedList', 'HashMap', 'Heap'], 80, false],
      ['Algorithms', ['sorting', 'binary search', 'DP'], 90, false],
    ]},
    { stage: 'Projects', topics: [
      ['REST API', ['Spring Boot', 'JPA'], 180, false],
      ['Concurrency Demo', ['threads', 'queues'], 120, false],
    ]},
    { stage: 'Resources', topics: [
      ['Effective Java', ['Bloch'], 30, false],
      ['Java Concurrency in Practice', ['Goetz'], 30, false],
    ]},
  ]),

  mk('cpp', 'C++', [
    { stage: 'Beginner', topics: [
      ['Syntax & Types', ['int', 'float', 'char', 'pointers intro'], 60, true],
      ['Control Flow', ['if', 'for', 'while', 'switch'], 40, true],
      ['Functions', ['pass by value/ref', 'overloading'], 50, false],
    ]},
    { stage: 'Intermediate', topics: [
      ['Pointers & Memory', ['raw pointers', 'references', 'stack vs heap'], 80, false],
      ['OOP', ['classes', 'inheritance', 'virtual'], 75, false],
      ['STL', ['vector', 'map', 'algorithm'], 70, false],
    ]},
    { stage: 'Advanced', topics: [
      ['Move Semantics', ['rvalue', 'std::move', 'perfect forwarding'], 85, false],
      ['Templates', ['function templates', 'class templates', 'concepts'], 80, false],
      ['Concurrency', ['std::thread', 'mutex', 'atomics'], 85, false],
    ]},
    { stage: 'Interview Preparation', topics: [
      ['Competitive Set', ['greedy', 'graphs', 'DP'], 100, false],
      ['Memory Puzzles', ['leak detection', 'smart pointers'], 70, false],
    ]},
    { stage: 'Projects', topics: [
      ['Data Structure Lib', ['templates', 'STL-style'], 180, false],
      ['Thread Pool', ['futures', 'work queue'], 150, false],
    ]},
    { stage: 'Resources', topics: [
      ['cppreference.com', ['reference'], 30, false],
      ['Effective Modern C++', ['Meyers'], 30, false],
    ]},
  ]),

  mk('javascript', 'JavaScript', [
    { stage: 'Beginner', topics: [
      ['Variables & Types', ['let/const', 'primitives', 'typeof'], 40, true],
      ['Operators & Control Flow', ['arithmetic', 'if/else', 'loops'], 40, true],
      ['Functions', ['declarations', 'arrow functions', 'closures'], 55, true],
      ['Arrays & Objects', ['methods', 'destructuring', 'spread'], 60, false],
    ]},
    { stage: 'Intermediate', topics: [
      ['DOM & Events', ['querySelector', 'addEventListener'], 60, false],
      ['Async JavaScript', ['Promises', 'async/await', 'fetch'], 70, false],
      ['Modules', ['import/export', 'ESM vs CJS'], 45, false],
      ['Error Handling', ['try/catch', 'custom errors'], 40, false],
    ]},
    { stage: 'Advanced', topics: [
      ['Event Loop', ['microtasks', 'macrotasks', 'queue'], 70, false],
      ['Prototypes & this', ['prototype chain', 'call/apply/bind'], 65, false],
      ['Performance', ['debounce', 'throttle', 'lazy loading'], 60, false],
    ]},
    { stage: 'Interview Preparation', topics: [
      ['Closures & Scope', ['hoisting', 'IIFE', 'tricky output'], 55, false],
      ['Algorithms in JS', ['arrays', 'strings', 'recursion'], 80, false],
    ]},
    { stage: 'Projects', topics: [
      ['SPA from Scratch', ['router', 'state'], 180, false],
      ['Weather App', ['fetch', 'async'], 120, false],
    ]},
    { stage: 'Resources', topics: [
      ['MDN Web Docs', ['developer.mozilla.org'], 30, false],
      ["You Don't Know JS", ['Simpson'], 30, false],
    ]},
  ]),

  mk('typescript', 'TypeScript', [
    { stage: 'Beginner', topics: [
      ['Why TypeScript', ['vs JS', 'compile-time safety'], 30, true],
      ['Basic Types', ['string', 'number', 'boolean', 'arrays', 'tuples'], 45, true],
      ['Interfaces & Types', ['interface', 'type alias', 'differences'], 50, false],
    ]},
    { stage: 'Intermediate', topics: [
      ['Functions', ['typing args', 'overloads', 'void/never'], 50, false],
      ['Generics', ['function generics', 'constraints', 'defaults'], 70, false],
      ['Union & Intersection', ['|', '&', 'narrowing'], 55, false],
      ['Utility Types', ['Partial', 'Pick', 'Omit', 'Record'], 45, false],
    ]},
    { stage: 'Advanced', topics: [
      ['Conditional Types', ['extends ?', 'infer'], 75, false],
      ['Mapped Types', ['keyof', 'in'], 65, false],
      ['Module Resolution', ['paths', 'moduleResolution'], 50, false],
    ]},
    { stage: 'Interview Preparation', topics: [
      ['Type Challenges', ['type-level puzzles'], 80, false],
      ['Design with Types', ['discriminated unions', 'branded types'], 60, false],
    ]},
    { stage: 'Projects', topics: [
      ['Typed Library', ['tsconfig', 'publishing'], 150, false],
      ['Type-Safe API Client', ['generics', 'inference'], 120, false],
    ]},
    { stage: 'Resources', topics: [
      ['TypeScript Handbook', ['typescriptlang.org'], 30, false],
      ['Effective TypeScript', ['Vanderkam'], 30, false],
    ]},
  ]),

  mk('prompt-engineering', 'Prompt Engineering', [
    { stage: 'Beginner', topics: [
      ['LLM Fundamentals', ['tokens', 'context window', 'temperature'], 40, true],
      ['Anatomy of a Prompt', ['instruction', 'context', 'output format'], 40, true],
      ['Zero-shot & Few-shot', ['examples', 'pattern'], 45, true],
    ]},
    { stage: 'Intermediate', topics: [
      ['Chain-of-Thought', ['reasoning steps', 'self-consistency'], 50, false],
      ['Role & System Prompts', ['persona', 'constraints'], 45, false],
      ['Structured Output', ['JSON', 'schemas', 'function calling'], 55, false],
    ]},
    { stage: 'Advanced', topics: [
      ['RAG Basics', ['embeddings', 'retrieval', 'grounding'], 75, false],
      ['Prompt Chaining', ['pipelines', 'agentic loops'], 70, false],
      ['Evaluating Prompts', ['metrics', 'regression sets'], 60, false],
    ]},
    { stage: 'Interview Preparation', topics: [
      ['Behavioral Scenarios', ['reduce hallucination', 'guardrails'], 55, false],
      ['System Design for LLMs', ['caching', 'cost', 'latency'], 70, false],
    ]},
    { stage: 'Projects', topics: [
      ['RAG Q&A Bot', ['embeddings', 'vector store'], 180, false],
      ['Structured Extractor', ['function calling', 'schema'], 120, false],
    ]},
    { stage: 'Resources', topics: [
      ['OpenAI Cookbook', ['cookbook.openai.com'], 30, false],
      ['Anthropic Prompt Eng Guide', ['docs.anthropic.com'], 30, false],
    ]},
  ]),

  mk('bash', 'Bash', [
    { stage: 'Beginner', topics: [
      ['Shell Basics', ['commands', 'flags', 'man pages'], 30, true],
      ['File System', ['ls', 'cd', 'cp', 'mv', 'rm'], 35, true],
      ['Pipes & Redirection', ['|', '>', '>>', '<'], 40, false],
    ]},
    { stage: 'Intermediate', topics: [
      ['Variables & Strings', ['expansion', 'quoting', 'subshells'], 45, false],
      ['Conditionals & Loops', ['if', 'for', 'while', 'case'], 50, false],
      ['Functions', ['positional args', 'return codes'], 40, false],
    ]},
    { stage: 'Advanced', topics: [
      ['Text Processing', ['awk', 'sed', 'grep', 'cut'], 65, false],
      ['Process Management', ['jobs', 'signals', 'trap'], 55, false],
      ['Portability', ['POSIX sh', 'set -euo pipefail'], 50, false],
    ]},
    { stage: 'Interview Preparation', topics: [
      ['One-liners', ['log parsing', 'column extraction'], 50, false],
      ['Debugging Scripts', ['set -x', 'shellcheck'], 40, false],
    ]},
    { stage: 'Projects', topics: [
      ['Automation Script', ['cron', 'logging'], 90, false],
      ['Setup Tool', ['dotfiles bootstrap'], 120, false],
    ]},
    { stage: 'Resources', topics: [
      ['Bash Hackers Wiki', ['wiki.bash-hackers.org'], 30, false],
      ['Pure Bash Bible', ['github'], 30, false],
    ]},
  ]),

  mk('system-design', 'System Design', [
    { stage: 'Beginner', topics: [
      ['What is System Design', ['scale', 'trade-offs', 'requirements'], 35, true],
      ['Client–Server Model', ['HTTP', 'DNS', 'load balancers'], 45, true],
    ]},
    { stage: 'Intermediate', topics: [
      ['Databases', ['relational vs NoSQL', 'sharding', 'replication'], 70, false],
      ['Caching', ['CDN', 'Redis', 'cache invalidation'], 60, false],
      ['Message Queues', ['Kafka', 'SQS', 'async processing'], 65, false],
      ['API Design', ['REST', 'gRPC', 'pagination', 'idempotency'], 60, false],
    ]},
    { stage: 'Advanced', topics: [
      ['Scalability Patterns', ['horizontal scaling', 'partitioning'], 75, false],
      ['Consistency & CAP', ['eventual', 'strong', 'PACELC'], 70, false],
      ['Observability', ['metrics', 'logs', 'tracing', 'SLOs'], 60, false],
    ]},
    { stage: 'Interview Preparation', topics: [
      ['Classic Problems', ['URL shortener', 'Twitter', 'chat'], 90, false],
      ['Estimation', ['back-of-envelope', 'QPS', 'storage'], 50, false],
    ]},
    { stage: 'Projects', topics: [
      ['Design Doc', ['ADR', 'diagrams', 'trade-offs'], 150, false],
      ['Whiteboard Series', ['6 systems'], 180, false],
    ]},
    { stage: 'Resources', topics: [
      ['Designing Data-Intensive Apps', ['Kleppmann'], 30, false],
      ['System Design Primer', ['github'], 30, false],
    ]},
  ]),
];

export function roadmapBySlug(slug: string): Roadmap | undefined {
  return SEED_ROADMAPS.find((r) => r.languageSlug === slug);
}
