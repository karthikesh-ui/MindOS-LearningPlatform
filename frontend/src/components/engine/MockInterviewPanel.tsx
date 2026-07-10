import { useState } from 'react';
import { Brain, Check, ChevronRight, Star } from 'lucide-react';
import type { MockInterview } from '@/types/engine';
import { engineApi } from '@/services/engineApi';
import { Badge, Button, Card, ProgressBar } from '@/components/ui';
import { cx } from '@/utils';

const TRACKS = ['python', 'java', 'sql', 'javascript', 'dsa', 'system_design'] as const;

export function MockInterviewPanel() {
  const [interview, setInterview] = useState<MockInterview | null>(null);
  const [answer, setAnswer] = useState('');
  const [rating, setRating] = useState(3);
  const [notes, setNotes] = useState('');
  const [starting, setStarting] = useState(false);

  async function start(track: string) {
    setStarting(true);
    const res = await engineApi.startInterview(track);
    setStarting(false);
    if (res.ok) setInterview(res.data);
  }

  async function submitAnswer() {
    if (!interview || !answer.trim()) return;
    const res = await engineApi.submitInterviewAnswer(interview.id, interview.current_index, answer, rating, notes);
    if (res.ok) setInterview(res.data);
    setAnswer('');
    setRating(3);
    setNotes('');
  }

  if (!interview) {
    return (
      <Card className="p-5">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-brand-600" />
          <h3 className="font-display text-sm font-semibold text-ink-900">Mock Interview</h3>
        </div>
        <p className="mt-2 text-xs text-ink-400">Choose a track to start a guided interview with self-evaluation.</p>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {TRACKS.map((t) => (
            <button
              key={t}
              onClick={() => start(t)}
              disabled={starting}
              className={cx(
                'rounded-xl border border-surface-border bg-surface-subtle px-3 py-2.5 text-sm font-medium capitalize text-ink-700 transition-all hover:-translate-y-0.5 hover:border-ink-100 hover:shadow-card disabled:opacity-50',
              )}
            >
              {t.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </Card>
    );
  }

  const q = interview.questions[interview.current_index];
  const isComplete = interview.status === 'completed' || !q;

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-brand-600" />
          <h3 className="font-display text-sm font-semibold text-ink-900 capitalize">{interview.track.replace(/_/g, ' ')} Interview</h3>
        </div>
        <Badge tone={isComplete ? 'accent' : 'brand'}>{isComplete ? 'Completed' : 'Active'}</Badge>
      </div>
      <ProgressBar value={(interview.current_index / interview.questions.length) * 100} tone="brand" size="sm" className="mt-3" />

      {isComplete ? (
        <div className="mt-5 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent-50">
            <Check className="h-7 w-7 text-accent-600" />
          </div>
          <p className="mt-3 font-display text-lg font-semibold text-ink-900">Interview complete!</p>
          {interview.overall_score != null && (
            <p className="mt-1 text-sm text-ink-500">Overall score: <span className="font-semibold text-ink-900">{interview.overall_score}/100</span></p>
          )}
          <Button className="mt-4" variant="secondary" size="sm" onClick={() => setInterview(null)}>New interview</Button>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-ink-400">Q{interview.current_index + 1}/{interview.questions.length}</span>
              <Badge tone={q.difficulty === 'Hard' ? 'error' : q.difficulty === 'Medium' ? 'warning' : 'accent'}>{q.difficulty}</Badge>
            </div>
            <p className="mt-2 text-sm font-medium text-ink-900">{q.question}</p>
            {q.hints.length > 0 && (
              <details className="mt-2">
                <summary className="cursor-pointer text-xs text-brand-600">Show hints</summary>
                <ul className="mt-1 space-y-0.5 pl-4 text-xs text-ink-400">
                  {q.hints.map((h, i) => <li key={i}>• {h}</li>)}
                </ul>
              </details>
            )}
          </div>
          <textarea
            className="input min-h-24 text-xs"
            placeholder="Write your answer…"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
          <div>
            <label className="text-xs font-medium text-ink-500">Self-evaluation: {rating}/5</label>
            <div className="mt-1 flex gap-1">
              {[1, 2, 3, 4, 5].map((r) => (
                <button
                  key={r}
                  onClick={() => setRating(r)}
                  className={cx('rounded-lg p-1 transition-colors', r <= rating ? 'text-warning-600' : 'text-ink-200 hover:text-ink-400')}
                >
                  <Star className={cx('h-4 w-4', r <= rating && 'fill-current')} />
                </button>
              ))}
            </div>
          </div>
          <input
            className="input text-xs"
            placeholder="Improvement notes (optional)…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <div className="flex justify-end">
            <Button size="sm" onClick={submitAnswer} disabled={!answer.trim()} rightIcon={<ChevronRight className="h-3.5 w-3.5" />}>
              {interview.current_index === interview.questions.length - 1 ? 'Finish' : 'Next question'}
            </Button>
          </div>
          {/* AI evaluation placeholder — extension point for OpenAI integration */}
          <div className="rounded-lg border border-dashed border-surface-border bg-surface-subtle px-3 py-2 text-xs text-ink-400">
            AI evaluation will be available in a future release. This is a self-evaluation flow for now.
          </div>
        </div>
      )}
    </Card>
  );
}
