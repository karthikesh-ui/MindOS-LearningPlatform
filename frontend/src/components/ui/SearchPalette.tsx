import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, FileText, Hash, Layers, Moon, Search, Star, X } from 'lucide-react';
import type { SearchResult } from '@/types';
import { api } from '@/services/api';
import { cx } from '@/utils';

const kindIcon = {
  language: <Layers className="h-4 w-4 text-brand-600" />,
  topic: <BookOpen className="h-4 w-4 text-accent-600" />,
  note: <FileText className="h-4 w-4 text-warning-600" />,
  problem: <Hash className="h-4 w-4 text-error-600" />,
  bookmark: <Star className="h-4 w-4 text-brand-600" />,
};

export function SearchPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setResults([]);
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const t = setTimeout(() => {
      api.search.query(query).then((r) => {
        if (cancelled) return;
        if (r.ok) {
          setResults(r.data.results);
          setActiveIndex(0);
        }
        setLoading(false);
      });
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query]);

  useEffect(() => {
    if (!open) return;
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, results.length - 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      }
      if (e.key === 'Enter' && results[activeIndex]) {
        navigate(results[activeIndex].url);
        onClose();
      }
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, results, activeIndex, navigate, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]">
      <div className="absolute inset-0 bg-ink-900/30 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-surface-border bg-surface shadow-lift animate-scale-in">
        <div className="flex items-center gap-3 border-b border-surface-border px-4 py-3">
          <Search className="h-5 w-5 text-ink-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search languages, topics, notes, problems…"
            className="flex-1 bg-transparent text-sm text-ink-900 placeholder:text-ink-400 outline-none"
          />
          <button onClick={onClose} className="rounded-lg p-1 text-ink-400 hover:bg-surface-card hover:text-ink-700">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto scrollbar-thin">
          {!query.trim() && (
            <div className="flex flex-col items-center gap-2 px-6 py-10 text-center text-sm text-ink-400">
              <Moon className="h-6 w-6 text-ink-300" />
              <p>Type to search across everything in MindOS.</p>
            </div>
          )}
          {query.trim() && loading && (
            <div className="px-6 py-8 text-center text-sm text-ink-400">Searching…</div>
          )}
          {query.trim() && !loading && results.length === 0 && (
            <div className="px-6 py-8 text-center text-sm text-ink-400">No results for "{query}"</div>
          )}
          {results.length > 0 && (
            <ul className="py-2">
              {results.map((r, i) => (
                <li key={`${r.kind}-${r.id}`}>
                  <button
                    onClick={() => {
                      navigate(r.url);
                      onClose();
                    }}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={cx(
                      'flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors',
                      i === activeIndex ? 'bg-surface-card' : 'hover:bg-surface-subtle',
                    )}
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-subtle">
                      {kindIcon[r.kind]}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink-900">{r.title}</p>
                      {r.subtitle && <p className="truncate text-xs text-ink-400">{r.subtitle}</p>}
                    </div>
                    <span className="rounded-md bg-surface-card px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-ink-400">
                      {r.kind}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex items-center justify-between border-t border-surface-border bg-surface-subtle px-4 py-2 text-[10px] text-ink-400">
          <span>↑↓ navigate · ↵ open · esc close</span>
          <span>MindOS Search</span>
        </div>
      </div>
    </div>
  );
}
