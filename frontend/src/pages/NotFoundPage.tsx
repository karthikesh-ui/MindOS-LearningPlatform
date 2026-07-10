import { Link } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';
import { Logo } from '@/components/Logo';


export default function NotFoundPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-surface-subtle px-4">
      <div className="pointer-events-none absolute inset-0 grid-dots opacity-40" />
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-100/50 blur-3xl" />

      <div className="relative text-center">
        <Logo size="md" />
        <p className="mt-10 font-display text-[8rem] font-semibold leading-none tracking-tighter text-ink-100 sm:text-[10rem]">
          404
        </p>
        <h1 className="mt-2 font-display text-2xl font-semibold text-ink-900">Page not found</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm text-ink-500">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/" className="btn-secondary px-5 py-3 text-sm">
            <ArrowLeft className="h-4 w-4" /> Back home
          </Link>
          <Link to="/app/dashboard" className="btn-primary px-5 py-3 text-sm">
            <Compass className="h-4 w-4" /> Go to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
