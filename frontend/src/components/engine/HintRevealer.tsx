import { useState } from 'react';
import { ChevronDown, Lightbulb, Lock } from 'lucide-react';
import type { HintProgress } from '@/types/engine';
import { engineApi } from '@/services/engineApi';
import { cx } from '@/utils';

interface HintRevealerProps {
  problemTitle: string;
  progress: HintProgress | null;
  onReveal?: () => void;
}

export function HintRevealer({ problemTitle, progress, onReveal }: HintRevealerProps) {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [localStages, setLocalStages] = useState<HintProgress | null>(progress);

  async function handleReveal(stage: number) {
    const result = await engineApi.revealHint(problemTitle, stage);
    if (result.ok) {
      setLocalStages((prev) => {
        if (!prev) return prev;
        const stages = prev.stages.map((s) =>
          s.stage === stage ? { ...s, content: result.data.content, is_locked: false } : s,
        );
        return { ...prev, stages, current_stage: Math.max(prev.current_stage, stage) };
      });
      onReveal?.();
    }
  }

  const stages = localStages?.stages ?? [];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-semibold text-ink-700">
        <Lightbulb className="h-4 w-4 text-warning-600" />
        Progressive Hints
      </div>
      <p className="text-xs text-ink-400">
        Hints are revealed progressively. Try to solve it yourself before revealing the next stage.
      </p>
      <div className="space-y-1.5">
        {stages.map((s) => {
          const isOpen = expanded[s.stage] ?? false;
          return (
            <div key={s.stage} className="overflow-hidden rounded-xl border border-surface-border bg-surface">
              <button
                onClick={() => setExpanded((e) => ({ ...e, [s.stage]: !e[s.stage] }))}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-surface-subtle"
              >
                <span className={cx(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold',
                  s.is_locked ? 'bg-surface-card text-ink-300' : 'bg-brand-50 text-brand-700',
                )}>
                  {s.is_locked ? <Lock className="h-3 w-3" /> : s.stage}
                </span>
                <span className="flex-1 text-xs font-medium text-ink-700">{s.stage_name}</span>
                <ChevronDown className={cx('h-3.5 w-3.5 text-ink-300 transition-transform', isOpen && 'rotate-180')} />
              </button>
              {isOpen && (
                <div className="border-t border-surface-border px-3 py-2.5">
                  {s.is_locked ? (
                    <button
                      onClick={() => handleReveal(s.stage)}
                      className="text-xs font-medium text-brand-600 hover:text-brand-700"
                    >
                      Reveal stage {s.stage}
                    </button>
                  ) : (
                    <p className="text-xs leading-relaxed text-ink-600 whitespace-pre-line">{s.content}</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
