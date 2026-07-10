import { Activity, Brain, Clock, Lightbulb, Target, TrendingUp, Zap } from 'lucide-react';
import type { AnalyticsData } from '@/types/engine';
import { BarChart, Card, CardHeader, LineChart, ProgressBar, RingProgress } from '@/components/ui';
import { cx } from '@/utils';

export function AnalyticsDashboard({ data }: { data: AnalyticsData }) {
  const stats = [
    { icon: <Clock className="h-4 w-4" />, label: 'Learning hours', value: String(data.learning_hours), tone: 'brand' },
    { icon: <Brain className="h-4 w-4" />, label: 'Thinking time', value: `${Math.floor(data.thinking_time_seconds / 3600)}h ${Math.floor((data.thinking_time_seconds % 3600) / 60)}m`, tone: 'accent' },
    { icon: <Lightbulb className="h-4 w-4" />, label: 'Hints used', value: String(data.hint_usage), tone: 'warning' },
    { icon: <Target className="h-4 w-4" />, label: 'Revision accuracy', value: `${data.revision_accuracy}%`, tone: 'accent' },
    { icon: <TrendingUp className="h-4 w-4" />, label: 'Improvement', value: `${data.improvement_rate > 0 ? '+' : ''}${data.improvement_rate}%`, tone: data.improvement_rate >= 0 ? 'accent' : 'error' },
    { icon: <Zap className="h-4 w-4" />, label: 'Problems solved', value: String(data.problems_solved), tone: 'brand' },
    { icon: <Activity className="h-4 w-4" />, label: 'Quiz avg', value: `${data.quiz_avg_score}%`, tone: 'warning' },
    { icon: <Brain className="h-4 w-4" />, label: 'Cards mastered', value: String(data.flashcards_mastered), tone: 'accent' },
  ];
  const tones: Record<string, string> = { brand: 'bg-brand-50 text-brand-600', accent: 'bg-accent-50 text-accent-600', warning: 'bg-warning-500/10 text-warning-600', error: 'bg-error-500/10 text-error-600' };

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-4 lg:grid-cols-8">
        {stats.map((s) => (
          <Card key={s.label} className="p-3">
            <span className={cx('flex h-8 w-8 items-center justify-center rounded-lg', tones[s.tone])}>{s.icon}</span>
            <p className="mt-2 font-display text-base font-semibold text-ink-900">{s.value}</p>
            <p className="text-[10px] text-ink-400">{s.label}</p>
          </Card>
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Weekly study time" subtitle="Minutes per day" icon={<Clock className="h-4 w-4" />} />
          <div className="mt-5"><BarChart data={data.weekly_progress.map((w) => ({ label: w.day, value: w.minutes }))} tone="brand" valueSuffix="m" /></div>
        </Card>
        <Card>
          <CardHeader title="Monthly progress" subtitle="Minutes per week" icon={<TrendingUp className="h-4 w-4" />} />
          <div className="mt-5"><LineChart data={data.monthly_progress.map((m) => ({ label: m.week, value: m.minutes }))} tone="accent" /></div>
        </Card>
      </div>
      <Card>
        <CardHeader title="Language progress" subtitle="Across all tracks" icon={<Target className="h-4 w-4" />} />
        <div className="mt-4 space-y-3">
          {data.language_progress.map((l) => (
            <div key={l.language_slug}>
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-ink-600">{l.language_name}</span>
                <span className="text-ink-400">{l.percent}% · {l.hours}h</span>
              </div>
              <ProgressBar value={l.percent} tone="brand" size="sm" className="mt-1.5" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export function GamificationDashboard({ data }: { data: import('@/types/engine').GamificationData }) {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <Card className="flex flex-col items-center justify-center py-6">
        <RingProgress value={data.xp.current_level_xp} max={data.xp.next_level_xp} tone="brand" size={140} label={String(data.level)} sublabel={`${data.xp.current_level_xp}/${data.xp.next_level_xp} XP`} />
        <p className="mt-4 text-xs text-ink-400">+{data.xp.weekly_gain} XP this week</p>
      </Card>
      <Card>
        <CardHeader title="Weekly challenge" subtitle={data.weekly_challenge.label} icon={<Target className="h-4 w-4" />} />
        <ProgressBar value={data.weekly_challenge.percent} tone="brand" className="mt-4" />
        <p className="mt-2 text-xs text-ink-400">{data.weekly_challenge.current}/{data.weekly_challenge.target}</p>
      </Card>
      <Card>
        <CardHeader title="Monthly challenge" subtitle={data.monthly_challenge.label} icon={<TrendingUp className="h-4 w-4" />} />
        <ProgressBar value={data.monthly_challenge.percent} tone="accent" className="mt-4" />
        <p className="mt-2 text-xs text-ink-400">{data.monthly_challenge.current}/{data.monthly_challenge.target}</p>
      </Card>
      <Card className="lg:col-span-3">
        <CardHeader title="Milestones" subtitle="Progress toward major goals" icon={<Zap className="h-4 w-4" />} />
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {data.milestones.map((m) => (
            <div key={m.label} className="rounded-xl bg-surface-subtle p-3">
              <p className="text-xs font-medium text-ink-500">{m.label}</p>
              <p className="mt-1 font-display text-lg font-semibold text-ink-900">{m.current}/{m.target}</p>
              <ProgressBar value={(m.current / m.target) * 100} tone="brand" size="sm" className="mt-2" />
            </div>
          ))}
        </div>
      </Card>
      {data.recent_achievements.length > 0 && (
        <Card className="lg:col-span-3">
          <CardHeader title="Recent achievements" subtitle="Professional milestones" icon={<Activity className="h-4 w-4" />} />
          <div className="mt-4 flex flex-wrap gap-2">
            {data.recent_achievements.map((a) => (
              <span key={a.code} className="inline-flex items-center gap-2 rounded-xl border border-surface-border bg-surface-subtle px-3 py-2">
                <span className="font-display text-sm font-semibold text-ink-900">{a.title}</span>
                <span className="text-xs text-accent-600">+{a.xp} XP</span>
              </span>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
