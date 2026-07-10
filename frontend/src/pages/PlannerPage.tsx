import { useState } from 'react';
import { Calendar, CheckCircle2, Circle, Flag, Plus, Target, Trash2, X } from 'lucide-react';
import { api } from '@/services/api';
import { useAsync } from '@/hooks';
import type { PlannerOverview, PlannerPriority, PlannerScope, PlannerTask, PlannerTaskInput } from '@/types';
import { SEED_LANGUAGES } from '@/services/seed';
import { Badge, Button, Card, CardHeader, EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { cx, formatMinutes } from '@/utils';

const SCOPES: { key: PlannerScope; label: string }[] = [
  { key: 'today', label: "Today's Tasks" },
  { key: 'tomorrow', label: "Tomorrow's Tasks" },
  { key: 'week', label: 'Weekly Plan' },
  { key: 'month', label: 'Monthly Goals' },
];

const PRIORITY_TONE: Record<PlannerPriority, 'neutral' | 'warning' | 'error'> = {
  low: 'neutral', medium: 'warning', high: 'error',
};

export default function PlannerPage() {
  const { data, loading, error, refetch } = useAsync<PlannerOverview>(() => api.planner.overview(), []);
  const [showForm, setShowForm] = useState(false);

  if (loading) return <Skeleton className="h-[30rem] rounded-2xl" />;
  if (error || !data) return <div className="py-10"><ErrorState message={error ?? 'Unable to load planner.'} onRetry={refetch} /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink-900">Planner</h1>
          <p className="text-sm text-ink-500">{data.completedToday}/{data.totalToday} done today · {data.weekProgress}% this week</p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setShowForm(true)}>Add task</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Target className="h-4 w-4" />} label="Today" value={`${data.completedToday}/${data.totalToday}`} tone="brand" />
        <StatCard icon={<Flag className="h-4 w-4" />} label="Week progress" value={`${data.weekProgress}%`} tone="accent" />
        <StatCard icon={<Calendar className="h-4 w-4" />} label="Tomorrow" value={String(data.tomorrow.length)} tone="warning" />
        <StatCard icon={<CheckCircle2 className="h-4 w-4" />} label="Monthly goals" value={String(data.month.length)} tone="neutral" />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {SCOPES.map((s) => {
          const items = data[s.key];
          return (
            <Card key={s.key}>
              <CardHeader title={s.label} subtitle={`${items.length} task${items.length === 1 ? '' : 's'}`} icon={<Calendar className="h-4 w-4" />} />
              {items.length === 0 ? (
                <EmptyState icon={<Circle className="h-7 w-7" />} title="No tasks here" description="Add a task to populate this column." />
              ) : (
                <ul className="mt-4 space-y-2">
                  {items.map((t) => <TaskRow key={t.id} task={t} refetch={refetch} />)}
                </ul>
              )}
            </Card>
          );
        })}
      </div>

      {showForm && <TaskForm onClose={() => setShowForm(false)} refetch={refetch} />}
    </div>
  );
}

function StatCard({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: 'brand' | 'accent' | 'warning' | 'neutral' }) {
  const tones = { brand: 'bg-brand-50 text-brand-600', accent: 'bg-accent-50 text-accent-600', warning: 'bg-warning-500/10 text-warning-600', neutral: 'bg-surface-card text-ink-500' };
  return (
    <Card className="p-4">
      <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${tones[tone]}`}>{icon}</span>
      <p className="mt-3 font-display text-2xl font-semibold text-ink-900">{value}</p>
      <p className="text-xs text-ink-400">{label}</p>
    </Card>
  );
}

function TaskRow({ task, refetch }: { task: PlannerTask; refetch: () => void }) {
  async function toggle() { await api.planner.update(task.id, { done: !task.done }); refetch(); }
  async function del() { await api.planner.remove(task.id); refetch(); }

  return (
    <li className="group flex items-center gap-3 rounded-xl border border-surface-border bg-surface-subtle px-3 py-2.5 transition-colors hover:bg-surface-card">
      <button onClick={toggle} className={cx('flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-[10px]', task.done ? 'border-accent-500 bg-accent-500 text-white' : 'border-ink-200 text-transparent hover:border-ink-300')}>
        ✓
      </button>
      <div className="min-w-0 flex-1">
        <p className={cx('truncate text-sm font-medium', task.done ? 'text-ink-400 line-through' : 'text-ink-800')}>{task.title}</p>
        <p className="truncate text-xs text-ink-400">
          {task.languageName ?? 'General'} · {formatMinutes(task.durationMinutes)}
          {task.deadline && ` · due ${new Date(task.deadline).toLocaleDateString()}`}
        </p>
      </div>
      <Badge tone={PRIORITY_TONE[task.priority]}>{task.priority}</Badge>
      <button onClick={del} className="rounded p-1 text-ink-300 opacity-0 transition-opacity hover:bg-error-500/10 hover:text-error-600 group-hover:opacity-100"><Trash2 className="h-3.5 w-3.5" /></button>
    </li>
  );
}

function TaskForm({ onClose, refetch }: { onClose: () => void; refetch: () => void }) {
  const [title, setTitle] = useState('');
  const [scope, setScope] = useState<PlannerScope>('today');
  const [priority, setPriority] = useState<PlannerPriority>('medium');
  const [duration, setDuration] = useState(30);
  const [languageSlug, setLanguageSlug] = useState('');
  const [deadline, setDeadline] = useState('');

  async function save() {
    if (!title.trim()) return;
    const lang = SEED_LANGUAGES.find((l) => l.slug === languageSlug);
    const input: PlannerTaskInput = {
      title, scope, priority, durationMinutes: duration,
      languageSlug: languageSlug || undefined,
      deadline: deadline || undefined,
    };
    // languageName is derived on backend; mock ignores it
    await api.planner.create({ ...input, languageName: lang?.name } as PlannerTaskInput);
    refetch();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[10vh]">
      <div className="absolute inset-0 bg-ink-900/30 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <Card className="relative w-full max-w-lg animate-scale-in" padded={false}>
        <div className="flex items-center justify-between border-b border-surface-border px-4 py-3">
          <h3 className="text-sm font-semibold text-ink-900">New task</h3>
          <button onClick={onClose} className="rounded-lg p-1 text-ink-400 hover:bg-surface-card"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-3 p-4">
          <input className="input" placeholder="Task title…" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block"><span className="text-xs font-medium text-ink-500">Scope</span>
              <select className="input mt-1" value={scope} onChange={(e) => setScope(e.target.value as PlannerScope)}>
                {SCOPES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            </label>
            <label className="block"><span className="text-xs font-medium text-ink-500">Priority</span>
              <select className="input mt-1" value={priority} onChange={(e) => setPriority(e.target.value as PlannerPriority)}>
                {['low', 'medium', 'high'].map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </label>
            <label className="block"><span className="text-xs font-medium text-ink-500">Duration (min)</span>
              <input type="number" className="input mt-1" value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
            </label>
            <label className="block"><span className="text-xs font-medium text-ink-500">Language (optional)</span>
              <select className="input mt-1" value={languageSlug} onChange={(e) => setLanguageSlug(e.target.value)}>
                <option value="">—</option>
                {SEED_LANGUAGES.map((l) => <option key={l.slug} value={l.slug}>{l.name}</option>)}
              </select>
            </label>
          </div>
          <label className="block"><span className="text-xs font-medium text-ink-500">Deadline (optional)</span>
            <input type="date" className="input mt-1" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          </label>
        </div>
        <div className="flex justify-end gap-2 border-t border-surface-border px-4 py-3">
          <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={save}>Add task</Button>
        </div>
      </Card>
    </div>
  );
}
