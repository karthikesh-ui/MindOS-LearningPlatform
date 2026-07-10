import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { AuthSession, User } from '@/types';
import { api, getStoredSession, clearStoredSession } from '@/services/api';

interface AuthContextValue {
  session: AuthSession | null;
  user: User | null;
  loading: boolean;
  signInGoogle: (idToken: string) => Promise<void>;
  signInGuest: () => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => getStoredSession());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = getStoredSession();
    if (stored && (!session || stored.accessToken !== session.accessToken)) {
      setSession(stored);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signInGoogle = useCallback(async (idToken: string) => {
    setLoading(true);
    try {
      const result = await api.auth.google(idToken);
      if (!result.ok) throw new Error(result.error);
      setSession(result.data);
      api._internal.saveSession(result.data);
    } finally {
      setLoading(false);
    }
  }, []);

  const signInGuest = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.auth.guest();
      if (!result.ok) throw new Error(result.error);
      setSession(result.data);
      api._internal.saveSession(result.data);
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(() => {
    api.auth.logout();
    clearStoredSession();
    setSession(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      signInGoogle,
      signInGuest,
      signOut,
    }),
    [session, loading, signInGoogle, signInGuest, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
