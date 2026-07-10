import { useCallback, useEffect, useRef, useState } from 'react';
import type { ApiResult } from '@/types';

type Fetcher<T> = () => Promise<ApiResult<T>>;

interface UseAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useAsync<T>(fetcher: Fetcher<T>, deps: unknown[] = []): UseAsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const depsKey = deps.map((d) => JSON.stringify(d)).join('|');
  const mounted = useRef(true);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetcherRef
      .current()
      .then((result) => {
        if (!mounted.current) return;
        if (result.ok) {
          setData(result.data);
          setError(null);
        } else {
          setError(result.error);
          setData(null);
        }
      })
      .catch((e) => {
        if (!mounted.current) return;
        setError(e instanceof Error ? e.message : 'Unexpected error');
      })
      .finally(() => {
        if (mounted.current) setLoading(false);
      });
  }, [depsKey]);

  useEffect(() => {
    mounted.current = true;
    load();
    return () => {
      mounted.current = false;
    };
  }, [load]);

  return { data, loading, error, refetch: load };
}
