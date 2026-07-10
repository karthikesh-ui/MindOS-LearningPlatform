import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  Bookmark,
  BrainCircuit,
  CalendarDays,
  CheckCircle2,
  Compass,
  GraduationCap,
  Layers,
  LineChart,
  Rocket,
  Shield,
  Sparkles,
  Target,
  Users,
  Zap,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { MarketingHeader, MarketingFooter } from '@/components/marketing/MarketingChrome';
import { Badge, Card } from '@/components/ui';

export default function LandingPage() {
  return (
    <div className="bg-surface">
      <MarketingHeader />
      <Hero />
      <SocialProof />
      <Features />
      <Benefits />
      <Journey />
      <CTA />
      <MarketingFooter />
    </div>
  );
}

/* ------------------------------------------------------------------ Hero */

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-surface-border">
      <div className="pointer-events-none absolute inset-0 grid-dots opacity-50" />
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-brand-100/60 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-accent-100/50 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto inline-flex animate-fade-in">
            <Badge tone="brand" icon={<Sparkles className="h-3.5 w-3.5" />}>
              The Learning Operating System
            </Badge>
          </div>
          <h1 className="mt-6 animate-fade-up font-display text-4xl font-semibold leading-[1.1] tracking-tight text-ink-900 text-balance sm:text-5xl lg:text-6xl">
            A calm OS for the way you actually learn.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl animate-fade-up text-lg text-ink-500 text-balance [animation-delay:80ms]">
            MindOS brings your tracks, plans, progress, and focus into one quiet workspace. Built for
            students preparing for careers in Software Engineering, AI, ML, and GenAI.
          </p>
          <div className="mt-8 flex animate-fade-up flex-col items-center justify-center gap-3 [animation-delay:160ms] sm:flex-row">
            <Link to="/login" className="btn-primary px-5 py-3 text-sm">
              Start learning free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/login" className="btn-secondary px-5 py-3 text-sm">
              Continue as guest
            </Link>
          </div>
          <p className="mt-4 text-xs text-ink-400">No credit card · Google or guest login · PostgreSQL-backed</p>
        </div>

        {/* Product preview */}
        <div className="relative mx-auto mt-16 max-w-5xl animate-scale-in [animation-delay:240ms]">
          <div className="rounded-3xl border border-surface-border bg-surface p-2 shadow-lift">
            <div className="rounded-2xl border border-surface-border bg-surface-subtle p-4 sm:p-6">
              <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
                <div className="hidden rounded-xl border border-surface-border bg-surface p-4 lg:block">
                  <div className="flex items-center gap-2">
                    <BrainCircuit className="h-5 w-5 text-brand-600" />
                    <span className="font-display text-sm font-semibold">MindOS</span>
                  </div>
                  <div className="mt-4 space-y-1">
                    {['Dashboard', 'Learning Hub', 'Profile', 'Settings'].map((l, i) => (
                      <div
                        key={l}
                        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                          i === 0 ? 'bg-surface-card font-medium text-ink-900' : 'text-ink-500'
                        }`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-ink-300" />
                        {l}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <PreviewCard tone="brand" icon={<Zap className="h-4 w-4" />} title="Total XP" value="4,820" sub="Level 7 · +320 this week" />
                  <PreviewCard tone="accent" icon={<Target className="h-4 w-4" />} title="Weekly goal" value="215 / 300" sub="72% — on pace" />
                  <div className="rounded-xl border border-surface-border bg-surface p-4 sm:col-span-2">
                    <p className="text-xs font-semibold text-ink-500">Continue learning</p>
                    <div className="mt-3 space-y-3">
                      {[
                        { n: 'Python', p: 62 },
                        { n: 'Prompt Engineering', p: 38 },
                        { n: 'SQL', p: 81 },
                      ].map((r) => (
                        <div key={r.n}>
                          <div className="flex justify-between text-xs">
                            <span className="text-ink-700">{r.n}</span>
                            <span className="text-ink-400">{r.p}%</span>
                          </div>
                          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-card">
                            <div className="h-full rounded-full bg-brand-500" style={{ width: `${r.p}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PreviewCard({
  tone,
  icon,
  title,
  value,
  sub,
}: {
  tone: 'brand' | 'accent';
  icon: ReactNode;
  title: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-xl border border-surface-border bg-surface p-4">
      <div className="flex items-center gap-2 text-xs text-ink-500">
        <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${tone === 'brand' ? 'bg-brand-50 text-brand-600' : 'bg-accent-50 text-accent-600'}`}>
          {icon}
        </span>
        {title}
      </div>
      <p className="mt-2 font-display text-2xl font-semibold text-ink-900">{value}</p>
      <p className="mt-1 text-xs text-ink-400">{sub}</p>
    </div>
  );
}

/* ----------------------------------------------------------- Social proof */

function SocialProof() {
  return (
    <section className="border-b border-surface-border bg-surface-subtle py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="text-center text-xs font-medium uppercase tracking-wider text-ink-400">
          Built around the skills that matter for AI-era careers
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm font-semibold text-ink-400">
          {['Python', 'SQL', 'TypeScript', 'Prompt Engineering', 'System Design', 'C++', 'Bash'].map(
            (t) => (
              <span key={t}>{t}</span>
            ),
          )}
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- Features */

const features = [
  {
    icon: <Compass className="h-5 w-5" />,
    title: 'Learning Hub',
    body: 'Curated tracks for Python, SQL, ML foundations, prompt engineering, and system design — each with progress, difficulty, and estimated time.',
  },
  {
    icon: <Layers className="h-5 w-5" />,
    title: 'Unified dashboard',
    body: "Today's plan, streaks, XP, weekly goals, bookmarks, and recent activity — one calm screen that tells you exactly what to do next.",
  },
  {
    icon: <CalendarDays className="h-5 w-5" />,
    title: 'Planner (extension point)',
    body: 'A structured daily and weekly planner scaffold, ready to grow into a full scheduling engine in later releases.',
  },
  {
    icon: <LineChart className="h-5 w-5" />,
    title: 'Progress that compounds',
    body: 'Module-level progress, XP, levels, and streaks keep momentum visible — without the noise of a leaderboard.',
  },
  {
    icon: <Shield className="h-5 w-5" />,
    title: 'Secure by design',
    body: 'JWT auth, Google OAuth, guest mode, and per-user row-level data isolation backed by PostgreSQL.',
  },
  {
    icon: <Sparkles className="h-5 w-5" />,
    title: 'AI-ready architecture',
    body: 'Extension points reserved for an AI tutor, quiz engine, and revision system — the foundation is built to grow.',
  },
];

function Features() {
  return (
    <section id="features" className="border-b border-surface-border py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Features"
          title="Everything you need. Nothing you don't."
          subtitle="A focused workspace that turns scattered learning into a system."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Card key={f.title} hover className="p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                {f.icon}
              </span>
              <h3 className="mt-4 font-display text-base font-semibold text-ink-900">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">{f.body}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- Benefits */

const benefits = [
  { icon: <Target className="h-4 w-4" />, title: 'Stay focused', body: 'A calm, minimal UI designed for long, uninterrupted study sessions.' },
  { icon: <BarChart3 className="h-4 w-4" />, title: 'See real progress', body: 'Track every module, XP gain, and streak so effort stays visible.' },
  { icon: <Bookmark className="h-4 w-4" />, title: 'Never lose context', body: 'Bookmarks and a continue-learning rail bring you back to exactly where you left off.' },
  { icon: <Users className="h-4 w-4" />, title: 'Career-aligned', body: 'Tracks mapped to real roles in Software Engineering, AI, ML, and GenAI.' },
];

function Benefits() {
  return (
    <section id="benefits" className="border-b border-surface-border bg-surface-subtle py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Benefits"
          title="Designed for deep work, not dopamine."
          subtitle="MindOS replaces the chaos of ten tabs with a single, intentional surface."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b) => (
            <div key={b.title} className="rounded-2xl border border-surface-border bg-surface p-6">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-card text-ink-600">
                {b.icon}
              </span>
              <h3 className="mt-4 text-sm font-semibold text-ink-900">{b.title}</h3>
              <p className="mt-1.5 text-sm text-ink-500">{b.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- Journey */

const steps = [
  { icon: <GraduationCap className="h-5 w-5" />, title: 'Sign in', body: 'Continue with Google or try guest mode — your profile is created instantly.' },
  { icon: <Compass className="h-5 w-5" />, title: 'Pick a track', body: 'Choose from Python, SQL, prompt engineering, system design, and more.' },
  { icon: <CalendarDays className="h-5 w-5" />, title: 'Follow the plan', body: "Each day has a clear, time-boxed focus. No decision fatigue." },
  { icon: <Rocket className="h-5 w-5" />, title: 'Build momentum', body: 'Streaks, XP, and weekly goals keep you coming back — calmly.' },
];

function Journey() {
  return (
    <section id="journey" className="border-b border-surface-border py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Learning journey"
          title="Four steps to a consistent practice."
          subtitle="From first login to a habit that sticks."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <div key={s.title} className="relative rounded-2xl border border-surface-border bg-surface p-6">
              <span className="absolute right-5 top-5 font-display text-3xl font-semibold text-ink-100">
                {i + 1}
              </span>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                {s.icon}
              </span>
              <h3 className="mt-4 text-sm font-semibold text-ink-900">{s.title}</h3>
              <p className="mt-1.5 text-sm text-ink-500">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------- CTA */

function CTA() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-surface-border bg-gradient-to-br from-surface via-brand-50/40 to-accent-50/30 p-10 text-center sm:p-16">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand-100/60 blur-3xl" />
          <div className="relative">
            <CheckCircle2 className="mx-auto h-8 w-8 text-accent-600" />
            <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink-900 text-balance sm:text-4xl">
              Start your first session today.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-ink-500">
              Free to start. No credit card. Bring your Google account or explore as a guest.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/login" className="btn-primary px-5 py-3 text-sm">
                Get started <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/login" className="btn-secondary px-5 py-3 text-sm">
                Explore as guest
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------- Section header */

function SectionHeading({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">{eyebrow}</p>
      <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink-900 text-balance sm:text-4xl">
        {title}
      </h2>
      <p className="mt-3 text-ink-500 text-balance">{subtitle}</p>
    </div>
  );
}
