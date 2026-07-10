import { useCallback, useState } from 'react';
import { engineApi } from '@/services/engineApi';
import type { EngineEvent, EngineResult } from '@/types/engine';
import type { ApiResult } from '@/types';

/**
 * The central Learning Engine hook.
 * Fires learning events and cascades updates across all connected modules.
 */
export function useLearningEngine() {
  const [lastResult, setLastResult] = useState<EngineResult | null>(null);
  const [firing, setFiring] = useState(false);

  const fire = useCallback(async (event: EngineEvent): Promise<ApiResult<EngineResult>> => {
    setFiring(true);
    const result = await engineApi.fireEvent(event);
    setFiring(false);
    if (result.ok) setLastResult(result.data);
    return result;
  }, []);

  return { fire, lastResult, firing };
}
