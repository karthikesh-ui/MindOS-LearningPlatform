import { Link } from 'react-router-dom';
import {
  Bookmark,
  Compass,
  GraduationCap,
  Settings,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { Card, CardHeader } from '@/components/ui';

interface Props {
  // reserved for future wiring (e.g. user preferences)
  userName?: string;
}

interface QuickAction {
  label: string;
  description: string;
  icon: ReactNode;
  to: string;
  tone: string;
}

const actions: QuickAction[] = [
  {
    label: 'Browse tracks',
    description: 'Explore languages',
    icon: <Compass className="h-4 w-4" />,
    to: '/app/learning',
    tone: 'bg-brand-50 text-brand-600',
  },
  {
    label: 'Plan today',
    description: 'Set your focus',
    icon: <Target className="h-4 w-4" />,
    to: '/app/dashboard',
    tone: 'bg-accent-50 text-accent-600',
  },
  {
    label: 'Bookmarks',
    description: 'Saved items',
    icon: <Bookmark className="h-4 w-4" />,
    to: '/app/profile',
    tone: 'bg-warning-500/10 text-warning-600',
  },
  {
    label: 'Settings',
    description: 'Preferences',
    icon: <Settings className="h-4 w-4" />,
    to: '/app/settings',
    tone: 'bg-surface-card text-ink-600',
  },
];

export function QuickActionsCard(_: Props) {
  return (
    <Card>
      <CardHeader title="Quick actions" subtitle="Jump back in" icon={<Zap className="h-4 w-4" />} />
      <div className="mt-4 grid grid-cols-2 gap-2.5">
        {actions.map((a) => (
          <Link
            key={a.label}
            to={a.to}
            className="group flex items-center gap-3 rounded-xl border border-surface-border bg-surface-subtle p-3 transition-all hover:-translate-y-0.5 hover:border-ink-100 hover:shadow-card"
          >
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${a.tone}`}>
              {a.icon}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink-900">{a.label}</p>
              <p className="truncate text-xs text-ink-400">{a.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}

export function AIAssistantCard() {
  return (
    <Card className="relative overflow-hidden border-brand-100 bg-gradient-to-br from-brand-50/60 via-surface to-accent-50/40">
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand-100/60 blur-2xl" />
      <div className="relative flex items-start gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink-900 text-white shadow-soft">
          <Sparkles className="h-5 w-5" />
        </span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-ink-900">AI Assistant</h3>
            <span className="chip border border-brand-100 bg-surface/70 text-brand-700 backdrop-blur">
              <GraduationCap className="h-3 w-3" /> Coming soon
            </span>
          </div>
          <p className="mt-1 text-xs text-ink-500">
            Your personal study companion — explain concepts, generate practice problems, and adapt
            your plan in real time.
          </p>
        </div>
      </div>
      <div className="relative mt-4 flex flex-wrap gap-2">
        {['Explain a concept', 'Generate practice', 'Review my week'].map((s) => (
          <span
            key={s}
            className="rounded-lg border border-surface-border bg-surface/70 px-2.5 py-1.5 text-xs text-ink-500 backdrop-blur"
          >
            {s}
          </span>
        ))}
      </div>
    </Card>
  );
}
