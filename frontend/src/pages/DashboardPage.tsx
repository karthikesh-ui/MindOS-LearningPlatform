import { RefreshCw } from 'lucide-react';
import { api } from '@/services/api';
import { useAsync, useAuth, useRecommendations, useWeakAreas } from '@/hooks';
import type { DashboardData } from '@/types';
import {
  AIAssistantCard,
  BookmarksPreviewCard,
  ContinueLearningCard,
  ProgressOverviewCard,
  QuickActionsCard,
  RecentActivityCard,
  RecentNotesCard,
  StreakCard,
  TodaysPlanCard,
  TomorrowPreviewCard,
  UpcomingTopicsCard,
  QuickResumeCard,
  WelcomeCard,
  WeeklyGoalCard,
  XPCounterCard,
} from '@/components/dashboard';
import { RecommendationCard, WeakAreaCard } from '@/components/engine';
import { Button, ErrorState, Skeleton } from '@/components/ui';

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, loading, error, refetch } = useAsync<DashboardData>(() => api.dashboard.get(), []);
  const { data: recommendations, refetch: refetchRecs } = useRecommendations();
  const { data: weakAreas, refetch: refetchWeak } = useWeakAreas();

  if (loading) return <DashboardSkeleton />;
  if (error || !data) {
    return (
      <div className="py-10">
        <ErrorState message={error ?? 'Unable to load your dashboard.'} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink-900">Dashboard</h1>
          <p className="text-sm text-ink-500">Welcome back, {user?.name.split(' ')[0] ?? 'learner'}.</p>
        </div>
        <Button variant="ghost" size="sm" leftIcon={<RefreshCw className="h-3.5 w-3.5" />} onClick={refetch}>
          Refresh
        </Button>
      </div>

      <div className="animate-fade-up">
        <WelcomeCard data={data} />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <QuickResumeCard data={data} />
          <div className="grid gap-5 sm:grid-cols-2">
            <StreakCard data={data} />
            <XPCounterCard data={data} />
          </div>
          <ContinueLearningCard data={data} />
          <UpcomingTopicsCard data={data} />
          <RecommendationCard recommendations={recommendations ?? []} onAction={refetchRecs} />
          <ProgressOverviewCard data={data} />
          <RecentActivityCard data={data} />
          <WeakAreaCard areas={weakAreas ?? []} onDismiss={refetchWeak} />
        </div>

        <div className="space-y-5">
          <TodaysPlanCard data={data} />
          <WeeklyGoalCard data={data} />
          <TomorrowPreviewCard data={data} />
          <RecentNotesCard data={data} />
          <BookmarksPreviewCard data={data} />
          <QuickActionsCard userName={user?.name} />
          <AIAssistantCard />
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
      <Skeleton className="h-48 w-full rounded-2xl" />
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Skeleton className="h-40 rounded-2xl" />
          <div className="grid gap-5 sm:grid-cols-2">
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
          </div>
          <Skeleton className="h-64 rounded-2xl" />
        </div>
        <div className="space-y-5">
          <Skeleton className="h-56 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
