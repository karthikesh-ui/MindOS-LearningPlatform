import { useEffect, useState } from 'react';
import {
  Anchor,
  Award,
  Bookmark,
  Compass,
  Flame,
  Footprints,
  Languages,
  MapPin,
  Moon,
  Target,
  TrendingUp,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '@/services/api';
import { useAsync, useAuth } from '@/hooks';
import type { Achievement, Profile as ProfileType } from '@/types';
import { SEED_ACHIEVEMENTS } from '@/services/seed';
import { Avatar, Badge, Card, CardHeader, ErrorState, ProgressBar, Skeleton } from '@/components/ui';
import { formatRelativeTime } from '@/utils';

const achievementIcons: Record<string, LucideIcon> = {
  Footprints,
  Flame,
  Compass,
  Languages,
  Anchor,
  Moon,
};

export default function ProfilePage() {
  const { user } = useAuth();
  const { data: dash, loading, error, refetch } = useAsync(() => api.dashboard.get(), []);
  const [profile, setProfile] = useState<ProfileType | null>(null);

  useEffect(() => {
    api.profile.get().then((r) => {
      if (r.ok) setProfile(r.data);
    });
  }, []);

  if (loading) return <ProfileSkeleton />;
  if (error || !dash) {
    return (
      <div className="py-10">
        <ErrorState message={error ?? 'Unable to load profile.'} onRetry={refetch} />
      </div>
    );
  }

  const stats = [
    { label: 'Day streak', value: String(dash.streak.current), icon: Flame, tone: 'text-accent-600' },
    { label: 'Total XP', value: dash.xp.total.toLocaleString(), icon: Zap, tone: 'text-brand-600' },
    { label: 'Level', value: String(dash.xp.level), icon: TrendingUp, tone: 'text-brand-600' },
    { label: 'Tracks active', value: String(dash.continueLearning.length), icon: Compass, tone: 'text-ink-600' },
    { label: 'Bookmarks', value: String(dash.bookmarks.length), icon: Bookmark, tone: 'text-warning-600' },
    { label: 'Weekly min', value: String(dash.weeklyGoal.completedMinutes), icon: Target, tone: 'text-accent-600' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="font-display text-xl font-semibold text-ink-900">Profile</h1>

      {/* Identity card */}
      <Card className="relative overflow-hidden p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-50 opacity-60 blur-2xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
          <Avatar name={user?.name ?? 'User'} src={user?.avatarUrl} size="lg" className="h-20 w-20 text-xl" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="font-display text-2xl font-semibold text-ink-900">{user?.name}</h2>
              <Badge tone={user?.provider === 'google' ? 'brand' : 'neutral'}>
                {user?.provider === 'google' ? 'Google' : 'Guest'}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-ink-500">{user?.email}</p>
            {profile && (
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-ink-500">
                {profile.headline && (
                  <span className="inline-flex items-center gap-1.5">
                    <Target className="h-3.5 w-3.5" /> {profile.headline}
                  </span>
                )}
                {profile.location && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> {profile.location}
                  </span>
                )}
              </div>
            )}
            {profile?.bio && <p className="mt-3 max-w-lg text-sm text-ink-600">{profile.bio}</p>}
          </div>
          <Link to="/app/settings" className="btn-secondary text-xs">
            Edit profile
          </Link>
        </div>
      </Card>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((s) => (
          <Card key={s.label} className="p-4">
            <s.icon className={`h-5 w-5 ${s.tone}`} />
            <p className="mt-3 font-display text-2xl font-semibold text-ink-900">{s.value}</p>
            <p className="text-xs text-ink-400">{s.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Achievements */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Achievements"
            subtitle="Milestones on your journey"
            icon={<Award className="h-4 w-4" />}
          />
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SEED_ACHIEVEMENTS.map((a: Achievement) => {
              const Icon = achievementIcons[a.icon] ?? Award;
              const unlocked = !!a.unlockedAt;
              return (
                <div
                  key={a.id}
                  className={`rounded-xl border p-4 transition-all ${
                    unlocked
                      ? 'border-accent-500/20 bg-accent-50/40 hover:shadow-card'
                      : 'border-surface-border bg-surface-subtle'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                        unlocked ? 'bg-accent-500 text-white' : 'bg-surface-card text-ink-400'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    {unlocked ? (
                      <Badge tone="accent">Unlocked</Badge>
                    ) : (
                      <span className="text-xs text-ink-400">{a.progress ?? 0}%</span>
                    )}
                  </div>
                  <p className="mt-3 text-sm font-semibold text-ink-900">{a.title}</p>
                  <p className="mt-0.5 text-xs text-ink-500">{a.description}</p>
                  {!unlocked && (
                    <ProgressBar value={a.progress ?? 0} tone="brand" size="sm" className="mt-3" />
                  )}
                  {unlocked && a.unlockedAt && (
                    <p className="mt-2 text-[11px] text-ink-400">
                      {formatRelativeTime(a.unlockedAt)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Account info */}
        <Card>
          <CardHeader title="Account" subtitle="Google account information" icon={<Compass className="h-4 w-4" />} />
          <dl className="mt-4 space-y-3 text-sm">
            <Row label="Name" value={user?.name ?? '—'} />
            <Row label="Email" value={user?.email ?? '—'} />
            <Row label="Provider" value={user?.provider === 'google' ? 'Google OAuth' : 'Guest'} />
            <Row label="Member since" value={new Date(user?.createdAt ?? Date.now()).toLocaleDateString()} />
          </dl>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-ink-400">{label}</dt>
      <dd className="truncate font-medium text-ink-900">{value}</dd>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-40 rounded-2xl" />
      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        <Skeleton className="h-80 rounded-2xl lg:col-span-2" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    </div>
  );
}
