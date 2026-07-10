import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Chrome, Sparkles, User as UserIcon } from 'lucide-react';
import { useState } from 'react';
import { Logo } from '@/components/Logo';
import { Button, Card, Spinner } from '@/components/ui';
import { useAuth } from '@/hooks';

export default function LoginPage() {
  const { signInGoogle, signInGuest, loading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  async function handleGuest() {
    setError(null);
    try {
      await signInGuest();
      navigate('/app/dashboard');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign-in failed');
    }
  }

  async function handleGoogle() {
    setError(null);
    try {
      // Extension point: integrate Google Identity Services here using
      // import.meta.env.VITE_GOOGLE_CLIENT_ID. For now we use a mock token
      // so the flow is fully exercisable end-to-end.
      const mockIdToken = 'mock-google-id-token-' + Date.now();
      await signInGoogle(mockIdToken);
      navigate('/app/dashboard');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Google sign-in failed');
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-surface-subtle">
      <div className="pointer-events-none absolute inset-0 grid-dots opacity-40" />
      <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-brand-100/50 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-accent-100/40 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-md flex-col px-4 py-10 sm:px-6">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 text-sm text-ink-500 transition-colors hover:text-ink-900"
        >
          <ArrowLeft className="h-4 w-4" /> Back to home
        </button>

        <div className="mt-10 flex flex-col items-center text-center">
          <Logo size="lg" />
          <h1 className="mt-6 font-display text-2xl font-semibold tracking-tight text-ink-900">
            Welcome to MindOS
          </h1>
          <p className="mt-2 max-w-xs text-sm text-ink-500">
            Sign in to sync your progress, or explore as a guest — no strings attached.
          </p>
        </div>

        <Card className="mt-8 animate-scale-in p-6">
          {error && (
            <div className="mb-4 rounded-xl border border-error-500/20 bg-error-500/5 px-3.5 py-2.5 text-xs text-error-600">
              {error}
            </div>
          )}

          <Button
            variant="primary"
            size="lg"
            className="w-full"
            leftIcon={loading ? undefined : <Chrome className="h-4 w-4" />}
            loading={loading}
            onClick={handleGoogle}
          >
            Continue with Google
          </Button>

          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-surface-border" />
            <span className="text-xs text-ink-400">or</span>
            <span className="h-px flex-1 bg-surface-border" />
          </div>

          <Button
            variant="secondary"
            size="lg"
            className="w-full"
            leftIcon={<UserIcon className="h-4 w-4" />}
            onClick={handleGuest}
            disabled={loading}
          >
            Continue as guest
          </Button>

          <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-xs text-ink-400">
            <Sparkles className="h-3 w-3" /> Guest sessions last 24h and are stored locally.
          </p>
        </Card>

        <p className="mt-auto pt-10 text-center text-xs text-ink-400">
          By continuing you agree to MindOS's Terms and Privacy Policy.
        </p>
      </div>

      {loading && (
        <div className="pointer-events-none fixed bottom-6 right-6 flex items-center gap-2 rounded-full bg-surface px-3.5 py-2 text-xs text-ink-500 shadow-lift">
          <Spinner className="h-3.5 w-3.5" /> Signing you in…
        </div>
      )}
    </div>
  );
}
