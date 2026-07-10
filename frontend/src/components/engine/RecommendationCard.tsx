import { ArrowRight, Brain, Check, GraduationCap, Lightbulb, Rocket, Target, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Recommendation } from '@/types/engine';
import { engineApi } from '@/services/engineApi';
import { Badge, Card, CardHeader, EmptyState } from '@/components/ui';

const KIND_ICON = {
  next_topic: Target,
  next_language: GraduationCap,
  revision: Lightbulb,
  practice_problem: Brain,
  interview: Rocket,
  project: Rocket,
};

export function RecommendationCard({ recommendations, onAction }: { recommendations: Recommendation[]; onAction?: () => void }) {
  async function accept(id: string) { await engineApi.acceptRecommendation(id); onAction?.(); }
  async function dismiss(id: string) { await engineApi.dismissRecommendation(id); onAction?.(); }

  return (
    <Card>
      <CardHeader title="Recommendations" subtitle="AI-powered next steps" icon={<Brain className="h-4 w-4" />} />
      {recommendations.length === 0 ? (
        <EmptyState icon={<Target className="h-7 w-7" />} title="No recommendations yet" description="Complete more learning activities to get personalized suggestions." />
      ) : (
        <ul className="mt-4 space-y-2">
          {recommendations.slice(0, 5).map((rec) => {
            const Icon = KIND_ICON[rec.kind as keyof typeof KIND_ICON] ?? Target;
            const url = rec.language_slug ? `/app/learning/${rec.language_slug}` : '/app/learning';
            return (
              <li key={rec.id} className="group rounded-xl border border-surface-border bg-surface-subtle p-3 transition-all hover:border-ink-100 hover:shadow-card">
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink-900">{rec.title}</p>
                    {rec.subtitle && <p className="truncate text-xs text-ink-400">{rec.subtitle}</p>}
                    {rec.reason && <p className="mt-1 text-xs text-ink-400 italic">{rec.reason}</p>}
                    <div className="mt-2 flex items-center gap-2">
                      <Badge tone="brand">{rec.kind.replace(/_/g, ' ')}</Badge>
                      {rec.accepted ? (
                        <span className="inline-flex items-center gap-1 text-xs text-accent-600"><Check className="h-3 w-3" /> Accepted</span>
                      ) : (
                        <div className="flex gap-1">
                          <Link to={url} onClick={() => accept(rec.id)} className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700">
                            Start <ArrowRight className="h-3 w-3" />
                          </Link>
                          <button onClick={() => dismiss(rec.id)} className="rounded p-0.5 text-ink-300 hover:text-error-600"><X className="h-3 w-3" /></button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
