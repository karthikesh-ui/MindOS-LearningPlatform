import { useState } from 'react';
import { RotateCcw, Sparkles, Zap } from 'lucide-react';
import type { Flashcard } from '@/types/engine';
import { engineApi } from '@/services/engineApi';
import { Button, Card } from '@/components/ui';
import { cx } from '@/utils';

interface FlashcardDeckProps {
  cards: Flashcard[];
  onReview?: () => void;
}

export function FlashcardDeck({ cards, onReview }: FlashcardDeckProps) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewing, setReviewing] = useState(false);

  if (cards.length === 0) {
    return <Card className="p-6 text-center text-sm text-ink-400">No flashcards due for review.</Card>;
  }

  const card = cards[index];
  const isLast = index === cards.length - 1;

  async function rate(rating: string) {
    setReviewing(true);
    await engineApi.reviewFlashcard(card.id, rating);
    setReviewing(false);
    if (isLast) {
      setIndex(0);
      setFlipped(false);
      onReview?.();
    } else {
      setIndex((i) => i + 1);
      setFlipped(false);
    }
  }

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold text-ink-900">Flashcards</h3>
        <span className="text-xs text-ink-400">{index + 1}/{cards.length}</span>
      </div>
      <div
        className="mt-4 cursor-pointer rounded-2xl border border-surface-border bg-surface-subtle p-6 text-center min-h-40 flex flex-col items-center justify-center transition-all hover:shadow-card"
        onClick={() => setFlipped((f) => !f)}
      >
        {flipped ? (
          <>
            <Zap className="h-5 w-5 text-accent-600" />
            <p className="mt-2 text-sm font-medium text-ink-800">{card.back}</p>
          </>
        ) : (
          <>
            <Sparkles className="h-5 w-5 text-brand-600" />
            <p className="mt-2 text-sm font-medium text-ink-800">{card.front}</p>
            <p className="mt-1 text-xs text-ink-400">Click to reveal answer</p>
          </>
        )}
      </div>
      {flipped && (
        <div className="mt-4 grid grid-cols-4 gap-2">
          <Button size="sm" variant="secondary" disabled={reviewing} onClick={() => rate('again')}>Again</Button>
          <Button size="sm" variant="secondary" disabled={reviewing} onClick={() => rate('hard')}>Hard</Button>
          <Button size="sm" variant="secondary" disabled={reviewing} onClick={() => rate('good')}>Good</Button>
          <Button size="sm" disabled={reviewing} onClick={() => rate('easy')}>Easy</Button>
        </div>
      )}
      <div className="mt-3 flex items-center justify-between">
        <span className={cx('chip', card.status === 'mastered' ? 'bg-accent-50 text-accent-700' : 'bg-surface-card text-ink-500')}>
          {card.status}
        </span>
        <Button variant="ghost" size="sm" leftIcon={<RotateCcw className="h-3 w-3" />} onClick={() => { setIndex(0); setFlipped(false); }}>
          Restart
        </Button>
      </div>
    </Card>
  );
}
