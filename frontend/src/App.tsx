import { lazy, Suspense, useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';
import { AppLayout } from '@/layouts/AppLayout';
import { MarketingLayout } from '@/layouts/MarketingLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { SearchPalette, Spinner } from '@/components/ui';

const LandingPage = lazy(() => import('@/pages/LandingPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const LearningHubPage = lazy(() => import('@/pages/LearningHubPage'));
const LanguageDetailPage = lazy(() => import('@/pages/LanguageDetailPage'));
const TopicPage = lazy(() => import('@/pages/TopicPage'));
const NotesPage = lazy(() => import('@/pages/NotesPage'));
const ProblemsPage = lazy(() => import('@/pages/ProblemsPage'));
const EditorPage = lazy(() => import('@/pages/EditorPage'));
const PlannerPage = lazy(() => import('@/pages/PlannerPage'));
const ProgressPage = lazy(() => import('@/pages/ProgressPage'));
const IntelligencePage = lazy(() => import('@/pages/IntelligencePage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

function PageFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Spinner className="h-7 w-7" />
    </div>
  );
}

export default function App() {
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <AuthProvider>
      <SearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route element={<MarketingLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
          </Route>

          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <AppLayout onOpenSearch={() => setSearchOpen(true)} />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="learning" element={<LearningHubPage />} />
            <Route path="learning/:slug" element={<LanguageDetailPage />} />
            <Route path="learning/:slug/topics/:topicId" element={<TopicPage />} />
            <Route path="notes" element={<NotesPage />} />
            <Route path="problems" element={<ProblemsPage />} />
            <Route path="editor" element={<EditorPage />} />
            <Route path="planner" element={<PlannerPage />} />
            <Route path="progress" element={<ProgressPage />} />
            <Route path="intelligence" element={<IntelligencePage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}
