import { useState } from 'react';
import { Check, ChevronRight, RotateCcw } from 'lucide-react';
import type { Quiz, QuizQuestion } from '@/types/engine';
import { engineApi } from '@/services/engineApi';
import { Button, Card, ProgressBar } from '@/components/ui';
import { cx } from '@/utils';

interface QuizRunnerProps {
  quiz: Quiz;
  onComplete?: (result: { score: number; total: number; passed: boolean }) => void;
}

export function QuizRunner({ quiz, onComplete }: QuizRunnerProps) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, unknown>[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [textAnswer, setTextAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{ score: number; total: number; passed: boolean } | null>(null);

  const questions: QuizQuestion[] = quiz.questions;
  const q = questions[current];
  const isLast = current === questions.length - 1;

  function handleNext() {
    const ans = q.type === 'fill_blank' ? { answer: textAnswer } : { selected };
    setAnswers((prev) => {
      const next = [...prev];
      next[current] = ans;
      return next;
    });
    if (isLast) {
      handleSubmit();
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
      setTextAnswer('');
    }
  }

  async function handleSubmit() {
    const finalAnswers = [...answers];
    const ans = q.type === 'fill_blank' ? { answer: textAnswer } : { selected };
    finalAnswers[current] = ans;
    const res = await engineApi.submitQuiz(quiz.id, finalAnswers);
    if (res.ok) {
      setResult({ score: res.data.score, total: res.data.total, passed: res.data.passed });
      setSubmitted(true);
      onComplete?.({ score: res.data.score, total: res.data.total, passed: res.data.passed });
    }
  }

  function handleReset() {
    setCurrent(0);
    setAnswers([]);
    setSelected(null);
    setTextAnswer('');
    setSubmitted(false);
    setResult(null);
  }

  if (submitted && result) {
    return (
      <Card className="p-6 text-center">
        <div className={cx('mx-auto flex h-16 w-16 items-center justify-center rounded-full', result.passed ? 'bg-accent-50' : 'bg-warning-500/10')}>
          <Check className={cx('h-8 w-8', result.passed ? 'text-accent-600' : 'text-warning-600')} />
        </div>
        <h3 className="mt-4 font-display text-xl font-semibold text-ink-900">
          {result.passed ? 'Quiz passed!' : 'Keep practicing'}
        </h3>
        <p className="mt-1 text-sm text-ink-500">
          You scored {result.score}/{result.total} ({Math.round((result.score / result.total) * 100)}%)
        </p>
        <Button className="mt-5" variant="secondary" size="sm" leftIcon={<RotateCcw className="h-3.5 w-3.5" />} onClick={handleReset}>
          Try again
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold text-ink-900">{quiz.title}</h3>
        <span className="text-xs text-ink-400">{current + 1}/{questions.length}</span>
      </div>
      <ProgressBar value={(current / questions.length) * 100} tone="brand" size="sm" className="mt-3" />
      <div className="mt-5">
        <p className="text-sm font-medium text-ink-800">{q.question}</p>
        {q.type === 'fill_blank' ? (
          <input
            className="input mt-3"
            placeholder="Type your answer…"
            value={textAnswer}
            onChange={(e) => setTextAnswer(e.target.value)}
          />
        ) : (
          <div className="mt-3 space-y-2">
            {(q.options ?? []).map((opt, i) => (
              <button
                key={i}
                onClick={() => setSelected(i)}
                className={cx(
                  'flex w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left text-sm transition-all',
                  selected === i ? 'border-brand-300 bg-brand-50 text-ink-900' : 'border-surface-border bg-surface-subtle text-ink-600 hover:bg-surface-card',
                )}
              >
                <span className={cx(
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold',
                  selected === i ? 'border-brand-500 bg-brand-500 text-white' : 'border-ink-200 text-ink-300',
                )}>
                  {String.fromCharCode(65 + i)}
                </span>
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="mt-5 flex justify-end">
        <Button size="sm" onClick={handleNext} disabled={selected === null && !textAnswer} rightIcon={<ChevronRight className="h-3.5 w-3.5" />}>
          {isLast ? 'Submit' : 'Next'}
        </Button>
      </div>
    </Card>
  );
}
