import { Link } from 'react-router-dom';
import { CheckCircle2, ChevronRight, Circle, Clock } from 'lucide-react';
import type { Roadmap } from '@/types';
import { ProgressBar } from '@/components/ui';
import { cx, formatMinutes } from '@/utils';

const STAGE_TONE: Record<string, string> = {
  Beginner: 'bg-accent-50 text-accent-700 border-accent-100',
  Intermediate: 'bg-brand-50 text-brand-700 border-brand-100',
  Advanced: 'bg-error-500/10 text-error-600 border-error-500/20',
  'Interview Preparation': 'bg-ink-100 text-ink-700 border-ink-200',
  Projects: 'bg-warning-500/10 text-warning-600 border-warning-500/20',
  Resources: 'bg-surface-card text-ink-600 border-surface-border',
};

export function RoadmapView({ roadmap, languageSlug }: { roadmap: Roadmap; languageSlug: string }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-2xl border border-surface-border bg-surface-subtle px-5 py-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-ink-400">Overall progress</p>
          <p className="mt-1 font-display text-2xl font-semibold text-ink-900">{roadmap.overallPercent}%</p>
        </div>
        <ProgressBar value={roadmap.overallPercent} tone="brand" className="max-w-xs flex-1" />
      </div>

      <div className="space-y-4">
        {roadmap.stages.map((stage, idx) => (
          <div key={stage.stage} className="overflow-hidden rounded-2xl border border-surface-border bg-surface animate-fade-up" style={{ animationDelay: `${idx * 60}ms` }}>
            <div className="flex items-center justify-between border-b border-surface-border bg-surface-subtle px-5 py-3">
              <div className="flex items-center gap-3">
                <span className={cx('chip border', STAGE_TONE[stage.stage] ?? STAGE_TONE['Resources'])}>
                  {stage.stage}
                </span>
                <span className="text-xs text-ink-400">{stage.progress}% · {stage.topics.filter((t) => t.completed).length}/{stage.topics.length} done</span>
              </div>
              <ProgressBar value={stage.progress} tone="brand" size="sm" className="w-24" />
            </div>
            <p className="px-5 pt-3 text-xs text-ink-400">{stage.description}</p>
            <ul className="divide-y divide-surface-border">
              {stage.topics.map((topic) => (
                <li key={topic.id}>
                  <Link
                    to={`/app/learning/${languageSlug}/topics/${topic.id}`}
                    className="group flex items-center gap-3 px-5 py-3 transition-colors hover:bg-surface-subtle"
                  >
                    {topic.completed ? (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-accent-600" />
                    ) : (
                      <Circle className="h-5 w-5 shrink-0 text-ink-200" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className={cx('truncate text-sm font-medium', topic.completed ? 'text-ink-400 line-through' : 'text-ink-900')}>
                        {topic.title}
                      </p>
                      <p className="truncate text-xs text-ink-400">
                        {topic.subTopics.slice(0, 3).join(' · ')}{topic.subTopics.length > 3 ? ' …' : ''}
                      </p>
                    </div>
                    <span className="flex items-center gap-1 text-xs text-ink-400">
                      <Clock className="h-3 w-3" /> {formatMinutes(topic.estimatedMinutes)}
                    </span>
                    <ChevronRight className="h-4 w-4 text-ink-300 transition-transform group-hover:translate-x-0.5 group-hover:text-ink-500" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
