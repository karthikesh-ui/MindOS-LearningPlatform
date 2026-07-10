import { useMemo, useState } from 'react';
import { Archive, Bookmark, Brain, CheckCircle2, Hash, Plus, Search, Trash2, X, ScanText } from 'lucide-react';
import { api } from '@/services/api';
import { engineApi } from '@/services/engineApi';
import { useAsync, useThinkingHistory, useHintProgress } from '@/hooks';
import type { Problem, ProblemDifficulty, ProblemInput, ProblemStatus } from '@/types';
import { SEED_LANGUAGES } from '@/services/seed';
import { Badge, Button, Card, CardHeader, EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { HintRevealer, ThinkingHistoryTracker } from '@/components/engine';
import { cx, formatRelativeTime } from '@/utils';

const STATUS_TONE: Record<ProblemStatus, 'neutral' | 'accent' | 'warning'> = {
  open: 'warning', solved: 'accent', archived: 'neutral',
};
const DIFF_TONE: Record<ProblemDifficulty, 'accent' | 'warning' | 'error'> = {
  Easy: 'accent', Medium: 'warning', Hard: 'error',
};

export default function ProblemsPage() {
  const { data: problems, loading, error, refetch } = useAsync<Problem[]>(() => api.problems.list(), []);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProblemStatus | 'all'>('all');
  const [showForm, setShowForm] = useState(false);

  const filtered = useMemo(() => {
    let list = problems ?? [];
    if (statusFilter !== 'all') list = list.filter((p) => p.status === statusFilter);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((p) => p.title.toLowerCase().includes(q) || p.tags.some((t) => t.includes(q)));
    }
    return list;
  }, [problems, statusFilter, query]);

  if (loading) return <Skeleton className="h-[30rem] rounded-2xl" />;
  if (error) return <div className="py-10"><ErrorState message={error} onRetry={refetch} /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink-900">Problem Workspace</h1>
          <p className="text-sm text-ink-500">{problems?.length ?? 0} problems · paste, tag, solve</p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setShowForm(true)}>Add problem</Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input className="input pl-9" placeholder="Search by title or tag…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="flex gap-1.5">
          {(['all', 'open', 'solved', 'archived'] as const).map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} className={cx('shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium capitalize', statusFilter === s ? 'bg-ink-900 text-white' : 'bg-surface-card text-ink-500 hover:text-ink-900')}>{s}</button>
          ))}
        </div>
      </div>

      {/* OCR extension point */}
      <Card className="border-dashed bg-surface-subtle">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-card text-ink-400"><ScanText className="h-5 w-5" /></span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-ink-700">Import from image (OCR)</p>
            <p className="text-xs text-ink-400">Extension point — OCR-powered problem import will be available in a future release.</p>
          </div>
          <Button variant="ghost" size="sm" disabled>Coming soon</Button>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState icon={<Hash className="h-8 w-8" />} title="No problems yet" description="Paste a coding problem to start tracking it." action={<Button size="sm" onClick={() => setShowForm(true)}>Add problem</Button>} />
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => <ProblemRow key={p.id} problem={p} refetch={refetch} />)}
        </div>
      )}

      {showForm && <ProblemForm onClose={() => setShowForm(false)} refetch={refetch} />}

      <EngineProblemSection />
    </div>
  );
}

function EngineProblemSection() {
  const { data: history } = useThinkingHistory();
  const { data: stats } = useAsync(() => engineApi.thinkingStats(), []);
  const [selectedProblem, setSelectedProblem] = useState<string>('');
  const { data: hintProgress } = useHintProgress(selectedProblem || 'Two Sum');

  return (
    <div className="space-y-5">
      <ThinkingHistoryTracker history={history ?? []} stats={stats ?? null} />
      <Card>
        <CardHeader title="AI Hint Engine" subtitle="Progressive hints — never reveal the solution too early" icon={<Brain className="h-4 w-4" />} />
        <div className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-medium text-ink-500">Select a problem</label>
            <select className="input mt-1" value={selectedProblem} onChange={(e) => setSelectedProblem(e.target.value)}>
              <option value="">Choose a problem…</option>
              {(history ?? []).map((h) => <option key={h.id} value={h.problem_title}>{h.problem_title}</option>)}
            </select>
          </div>
          {selectedProblem && <HintRevealer problemTitle={selectedProblem} progress={hintProgress} />}
        </div>
      </Card>
    </div>
  );
}

function ProblemRow({ problem, refetch }: { problem: Problem; refetch: () => void }) {
  async function cycleStatus() {
    const next: ProblemStatus = problem.status === 'open' ? 'solved' : problem.status === 'solved' ? 'archived' : 'open';
    await api.problems.update(problem.id, { status: next });
    refetch();
  }
  async function toggleBookmark() { await api.problems.update(problem.id, { isBookmarked: !problem.isBookmarked }); refetch(); }
  async function del() { await api.problems.remove(problem.id); refetch(); }

  return (
    <Card className="p-4 animate-fade-up" hover>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold text-ink-900">{problem.title}</p>
            <Badge tone={DIFF_TONE[problem.difficulty]}>{problem.difficulty}</Badge>
          </div>
          <p className="mt-1 line-clamp-2 text-xs text-ink-500">{problem.description}</p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {problem.tags.map((t) => <span key={t} className="chip bg-surface-card text-ink-500"><Hash className="h-2.5 w-2.5" />{t}</span>)}
            <span className="text-[10px] text-ink-400">· {formatRelativeTime(problem.createdAt)}</span>
          </div>
        </div>
        <div className="flex shrink-0 flex-col gap-1">
          <button onClick={cycleStatus} className={cx('rounded-lg p-1.5', problem.status === 'solved' ? 'bg-accent-50 text-accent-600' : 'bg-surface-card text-ink-400 hover:text-ink-700')} title="Toggle status">
            <CheckCircle2 className="h-4 w-4" />
          </button>
          <button onClick={toggleBookmark} className={cx('rounded-lg p-1.5', problem.isBookmarked ? 'bg-brand-50 text-brand-600' : 'bg-surface-card text-ink-400 hover:text-ink-700')} title="Bookmark">
            <Bookmark className={cx('h-4 w-4', problem.isBookmarked && 'fill-current')} />
          </button>
          <button onClick={del} className="rounded-lg p-1.5 text-ink-300 hover:bg-error-500/10 hover:text-error-600" title="Delete"><Trash2 className="h-4 w-4" /></button>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <Badge tone={STATUS_TONE[problem.status]}>{problem.status}</Badge>
        {problem.status === 'archived' && <Archive className="h-3 w-3 text-ink-300" />}
      </div>
    </Card>
  );
}

function ProblemForm({ onClose, refetch }: { onClose: () => void; refetch: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [languageSlug, setLanguageSlug] = useState('python');
  const [tags, setTags] = useState('');
  const [difficulty, setDifficulty] = useState<ProblemDifficulty>('Medium');

  async function save() {
    if (!title.trim()) return;
    const input: ProblemInput = {
      title, description,
      languageSlug,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      difficulty,
    };
    await api.problems.create(input);
    refetch();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[8vh]">
      <div className="absolute inset-0 bg-ink-900/30 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <Card className="relative w-full max-w-2xl animate-scale-in" padded={false}>
        <div className="flex items-center justify-between border-b border-surface-border px-4 py-3">
          <h3 className="text-sm font-semibold text-ink-900">New problem</h3>
          <button onClick={onClose} className="rounded-lg p-1 text-ink-400 hover:bg-surface-card"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-3 p-4">
          <input className="input" placeholder="Problem title…" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
          <textarea className="input min-h-32 text-xs" placeholder="Paste the problem description…" value={description} onChange={(e) => setDescription(e.target.value)} />
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="block"><span className="text-xs font-medium text-ink-500">Language</span>
              <select className="input mt-1" value={languageSlug} onChange={(e) => setLanguageSlug(e.target.value)}>
                {SEED_LANGUAGES.map((l) => <option key={l.slug} value={l.slug}>{l.name}</option>)}
              </select>
            </label>
            <label className="block"><span className="text-xs font-medium text-ink-500">Difficulty</span>
              <select className="input mt-1" value={difficulty} onChange={(e) => setDifficulty(e.target.value as ProblemDifficulty)}>
                {['Easy', 'Medium', 'Hard'].map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </label>
            <label className="block"><span className="text-xs font-medium text-ink-500">Tags (comma-sep)</span>
              <input className="input mt-1" placeholder="array, dp" value={tags} onChange={(e) => setTags(e.target.value)} />
            </label>
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-surface-border px-4 py-3">
          <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={save}>Save problem</Button>
        </div>
      </Card>
    </div>
  );
}
