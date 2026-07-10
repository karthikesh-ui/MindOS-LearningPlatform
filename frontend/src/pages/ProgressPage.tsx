import { api } from '@/services/api';
import { useAsync } from '@/hooks';
import type { ProgressOverviewData } from '@/types';
import { BarChart, Card, CardHeader, ErrorState, LineChart, ProgressBar, RingProgress, Skeleton } from '@/components/ui';
import { Activity, Clock, Flame, GraduationCap, Sparkles, TrendingUp } from 'lucide-react';
import { formatRelativeTime } from '@/utils';

export default function ProgressPage() {
  const { data, loading, error, refetch } = useAsync<ProgressOverviewData>(() => api.progress.overview(), []);

  if (loading) return <Skeleton className="h-[40rem] rounded-2xl" />;
  if (error || !data) return <div className="py-10"><ErrorState message={error ?? 'Unable to load progress.'} onRetry={refetch} /></div>;

  const stats = [
    { icon: <Clock className="h-4 w-4" />, label: 'Learning hours', value: String(data.learningHours), tone: 'brand' },
    { icon: <GraduationCap className="h-4 w-4" />, label: 'Completed topics', value: String(data.completedTopics), tone: 'accent' },
    { icon: <Flame className="h-4 w-4" />, label: 'Current streak', value: `${data.currentStreak}d`, tone: 'warning' },
    { icon: <TrendingUp className="h-4 w-4" />, label: 'Longest streak', value: `${data.longestStreak}d`, tone: 'neutral' },
    { icon: <Sparkles className="h-4 w-4" />, label: 'Total XP', value: data.xp.total.toLocaleString(), tone: 'brand' },
    { icon: <GraduationCap className="h-4 w-4" />, label: 'Languages done', value: String(data.completedLanguages), tone: 'accent' },
  ];
  const tones: Record<string, string> = { brand: 'bg-brand-50 text-brand-600', accent: 'bg-accent-50 text-accent-600', warning: 'bg-warning-500/10 text-warning-600', neutral: 'bg-surface-card text-ink-500' };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink-900">Progress</h1>
        <p className="text-sm text-ink-500">Your learning journey at a glance.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((s) => (
          <Card key={s.label} className="p-4">
            <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${tones[s.tone]}`}>{s.icon}</span>
            <p className="mt-3 font-display text-2xl font-semibold text-ink-900">{s.value}</p>
            <p className="text-xs text-ink-400">{s.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Weekly study time" subtitle="Minutes per day this week" icon={<Clock className="h-4 w-4" />} />
          <div className="mt-6">
            <BarChart data={data.weeklyProgress.map((w) => ({ label: w.day, value: w.minutes }))} tone="brand" valueSuffix="m" />
          </div>
        </Card>
        <Card className="flex flex-col items-center justify-center py-6">
          <CardHeader title="Level" subtitle={`Level ${data.xp.level}`} icon={<Sparkles className="h-4 w-4" />} className="self-stretch" />
          <RingProgress value={data.xp.currentLevelXp} max={data.xp.nextLevelXp} tone="brand" size={140} label={String(data.xp.level)} sublabel={`${data.xp.currentLevelXp}/${data.xp.nextLevelXp} XP`} className="mt-4" />
          <p className="mt-4 text-xs text-ink-400">+{data.xp.weeklyGain} XP this week</p>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Monthly progress" subtitle="Minutes studied per week" icon={<TrendingUp className="h-4 w-4" />} />
          <div className="mt-6">
            <LineChart data={data.monthlyProgress.map((m) => ({ label: m.week, value: m.minutes }))} tone="accent" />
          </div>
        </Card>
        <Card>
          <CardHeader title="Per language" subtitle="Progress across tracks" icon={<GraduationCap className="h-4 w-4" />} />
          <div className="mt-4 space-y-3">
            {data.perLanguage.map((l) => (
              <div key={l.languageSlug}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-ink-600">{l.languageName}</span>
                  <span className="text-ink-400">{l.percent}% · {l.hours}h</span>
                </div>
                <ProgressBar value={l.percent} tone="brand" size="sm" className="mt-1.5" />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Progress timeline" subtitle="Recent milestones" icon={<Activity className="h-4 w-4" />} />
        <ol className="mt-4 space-y-3">
          {data.timeline.map((item) => (
            <li key={item.id} className="flex gap-3">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface-card"><Activity className="h-3.5 w-3.5 text-brand-600" /></span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink-800">{item.title}</p>
                <p className="truncate text-xs text-ink-400">{item.detail} · {formatRelativeTime(item.occurredAt)}</p>
              </div>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}
