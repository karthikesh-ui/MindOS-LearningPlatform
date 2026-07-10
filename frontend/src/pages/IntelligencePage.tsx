import { useState } from 'react';
import { Activity, BarChart3, Brain, Layers, Zap } from 'lucide-react';
import {
  useAnalytics, useGamification, useNotifications,
  useRecommendations, useRevisionSchedule, useWeakAreas,
  useFlashcards,
} from '@/hooks';
import {
  AnalyticsDashboard, FlashcardDeck, GamificationDashboard,
  MockInterviewPanel, NotificationCenter, RecommendationCard,
  RevisionScheduleCard, WeakAreaCard,
} from '@/components/engine';
import { ErrorState, Skeleton } from '@/components/ui';
import { cx } from '@/utils';

type Tab = 'overview' | 'analytics' | 'gamification' | 'interviews';

export default function IntelligencePage() {
  const [tab, setTab] = useState<Tab>('overview');

  const { data: analytics, loading: analyticsLoading, error: analyticsError, refetch: refetchAnalytics } = useAnalytics();
  const { data: gamification, loading: gamLoading } = useGamification();
  const { data: notifications, refetch: refetchNotifs } = useNotifications();
  const { data: recommendations, refetch: refetchRecs } = useRecommendations();
  const { data: weakAreas, refetch: refetchWeak } = useWeakAreas();
  const { data: revisionSchedule, refetch: refetchRevisions } = useRevisionSchedule();
  const { data: flashcards } = useFlashcards(true);

  const tabs: { key: Tab; label: string; icon: typeof Activity }[] = [
    { key: 'overview', label: 'Overview', icon: Layers },
    { key: 'analytics', label: 'Analytics', icon: BarChart3 },
    { key: 'gamification', label: 'Gamification', icon: Zap },
    { key: 'interviews', label: 'Interviews', icon: Brain },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink-900">Learning Intelligence</h1>
        <p className="text-sm text-ink-500">The brain of MindOS — everything is synchronized automatically.</p>
      </div>

      <div className="flex gap-1.5 overflow-x-auto rounded-xl border border-surface-border bg-surface p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cx(
              'flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
              tab === t.key ? 'bg-ink-900 text-white shadow-soft' : 'text-ink-500 hover:text-ink-900',
            )}
          >
            <t.icon className="h-3.5 w-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <RecommendationCard recommendations={recommendations ?? []} onAction={refetchRecs} />
            <WeakAreaCard areas={weakAreas ?? []} onDismiss={refetchWeak} />
            <RevisionScheduleCard schedule={revisionSchedule} onComplete={refetchRevisions} />
            {flashcards && flashcards.length > 0 && <FlashcardDeck cards={flashcards} />}
          </div>
          <div className="space-y-5">
            <NotificationCenter notifications={notifications ?? []} onChange={refetchNotifs} />
            <MockInterviewPanel />
          </div>
        </div>
      )}

      {tab === 'analytics' && (
        analyticsLoading ? <Skeleton className="h-96 rounded-2xl" /> :
        analyticsError || !analytics ? <ErrorState message={analyticsError ?? 'Unable to load analytics.'} onRetry={refetchAnalytics} /> :
        <AnalyticsDashboard data={analytics} />
      )}

      {tab === 'gamification' && (
        gamLoading || !gamification ? <Skeleton className="h-96 rounded-2xl" /> :
        <GamificationDashboard data={gamification} />
      )}

      {tab === 'interviews' && (
        <div className="mx-auto max-w-2xl">
          <MockInterviewPanel />
        </div>
      )}
    </div>
  );
}
