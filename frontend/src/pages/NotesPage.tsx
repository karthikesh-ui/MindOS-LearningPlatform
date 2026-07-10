import { useEffect, useMemo, useState } from 'react';
import { FileText, Pin, Plus, Search, Star, Trash2, X } from 'lucide-react';
import { api } from '@/services/api';
import { useAsync } from '@/hooks';
import type { Note, NoteCategory, NoteInput } from '@/types';
import { Badge, Button, Card, EmptyState, ErrorState, MarkdownRenderer, Skeleton } from '@/components/ui';
import { cx, formatRelativeTime } from '@/utils';

const CATEGORIES: NoteCategory[] = ['general', 'concept', 'snippet', 'question', 'summary'];

export default function NotesPage() {
  const { data: notes, loading, error, refetch } = useAsync<Note[]>(() => api.notes.list(), []);
  const [query, setQuery] = useState('');
  const [activeCat, setActiveCat] = useState<NoteCategory | 'all'>('all');
  const [showFavOnly, setShowFavOnly] = useState(false);
  const [editing, setEditing] = useState<Note | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  const filtered = useMemo(() => {
    let list = notes ?? [];
    if (activeCat !== 'all') list = list.filter((n) => n.category === activeCat);
    if (showFavOnly) list = list.filter((n) => n.favorite);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((n) => n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q));
    }
    return [...list].sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt.localeCompare(a.updatedAt));
  }, [notes, activeCat, showFavOnly, query]);

  if (loading) return <Skeleton className="h-[30rem] rounded-2xl" />;
  if (error) return <div className="py-10"><ErrorState message={error} onRetry={refetch} /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink-900">Notes</h1>
          <p className="text-sm text-ink-500">{notes?.length ?? 0} notes · markdown supported</p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => { setEditing(null); setShowEditor(true); }}>
          New note
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input className="input pl-9" placeholder="Search notes…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="flex gap-1.5 overflow-x-auto">
          <FilterChip active={activeCat === 'all'} onClick={() => setActiveCat('all')}>All</FilterChip>
          {CATEGORIES.map((c) => (
            <FilterChip key={c} active={activeCat === c} onClick={() => setActiveCat(c)}>{c}</FilterChip>
          ))}
          <FilterChip active={showFavOnly} onClick={() => setShowFavOnly((v) => !v)}><Star className="h-3 w-3" /> Favs</FilterChip>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<FileText className="h-8 w-8" />} title="No notes found" description="Create your first note to get started." action={<Button size="sm" onClick={() => { setEditing(null); setShowEditor(true); }}>New note</Button>} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((n) => (
            <NoteCard key={n.id} note={n} onEdit={() => { setEditing(n); setShowEditor(true); }} refetch={refetch} />
          ))}
        </div>
      )}

      {showEditor && <NoteEditor note={editing} onClose={() => setShowEditor(false)} refetch={refetch} />}
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={cx('shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors', active ? 'bg-ink-900 text-white' : 'bg-surface-card text-ink-500 hover:text-ink-900')}>
      {children}
    </button>
  );
}

function NoteCard({ note, onEdit, refetch }: { note: Note; onEdit: () => void; refetch: () => void }) {
  async function togglePin() { await api.notes.update(note.id, { pinned: !note.pinned }); refetch(); }
  async function toggleFav() { await api.notes.update(note.id, { favorite: !note.favorite }); refetch(); }
  async function del() { await api.notes.remove(note.id); refetch(); }

  return (
    <Card className="flex flex-col p-4 animate-fade-up" hover>
      <div className="flex items-start justify-between gap-2">
        <button onClick={onEdit} className="min-w-0 flex-1 text-left">
          <p className="truncate text-sm font-semibold text-ink-900">{note.title || 'Untitled'}</p>
        </button>
        <div className="flex shrink-0 gap-1">
          <button onClick={togglePin} className={cx('rounded p-1 hover:bg-surface-card', note.pinned ? 'text-brand-600' : 'text-ink-300')}><Pin className="h-3.5 w-3.5" /></button>
          <button onClick={toggleFav} className={cx('rounded p-1 hover:bg-surface-card', note.favorite ? 'text-warning-600' : 'text-ink-300')}><Star className={cx('h-3.5 w-3.5', note.favorite && 'fill-current')} /></button>
        </div>
      </div>
      <div className="mt-2 line-clamp-4 overflow-hidden text-xs text-ink-500">
        <MarkdownRenderer content={note.body.slice(0, 300)} />
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-surface-border pt-2">
        <Badge tone="neutral">{note.category}</Badge>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-ink-400">{formatRelativeTime(note.updatedAt)}</span>
          <button onClick={del} className="rounded p-1 text-ink-300 hover:bg-error-500/10 hover:text-error-600"><Trash2 className="h-3.5 w-3.5" /></button>
        </div>
      </div>
    </Card>
  );
}

function NoteEditor({ note, onClose, refetch }: { note: Note | null; onClose: () => void; refetch: () => void }) {
  const [title, setTitle] = useState(note?.title ?? '');
  const [body, setBody] = useState(note?.body ?? '');
  const [category, setCategory] = useState<NoteCategory>(note?.category ?? 'general');
  const [pinned, setPinned] = useState(note?.pinned ?? false);
  const [favorite, setFavorite] = useState(note?.favorite ?? false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => { if (title.trim() || body.trim()) { setSaved(true); setTimeout(() => setSaved(false), 1200); } }, 1500);
    return () => clearTimeout(t);
  }, [title, body]);

  async function save() {
    const input: NoteInput = { title: title || 'Untitled', body, category, pinned, favorite };
    if (note) { await api.notes.update(note.id, input); } else { await api.notes.create(input); }
    refetch();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[8vh]">
      <div className="absolute inset-0 bg-ink-900/30 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-surface-border bg-surface shadow-lift animate-scale-in">
        <div className="flex items-center justify-between border-b border-surface-border px-4 py-3">
          <h3 className="text-sm font-semibold text-ink-900">{note ? 'Edit note' : 'New note'}</h3>
          <div className="flex items-center gap-2">
            {saved && <span className="text-xs text-accent-600">Auto-saved</span>}
            <button onClick={onClose} className="rounded-lg p-1 text-ink-400 hover:bg-surface-card"><X className="h-4 w-4" /></button>
          </div>
        </div>
        <div className="space-y-3 p-4">
          <input className="input text-base font-semibold" placeholder="Note title…" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button key={c} onClick={() => setCategory(c)} className={cx('rounded-lg px-2.5 py-1 text-xs font-medium capitalize', category === c ? 'bg-ink-900 text-white' : 'bg-surface-card text-ink-500')}>{c}</button>
            ))}
            <button onClick={() => setPinned((v) => !v)} className={cx('rounded-lg p-1.5', pinned ? 'bg-brand-50 text-brand-600' : 'bg-surface-card text-ink-400')}><Pin className="h-3.5 w-3.5" /></button>
            <button onClick={() => setFavorite((v) => !v)} className={cx('rounded-lg p-1.5', favorite ? 'bg-warning-500/10 text-warning-600' : 'bg-surface-card text-ink-400')}><Star className={cx('h-3.5 w-3.5', favorite && 'fill-current')} /></button>
          </div>
          <textarea className="input min-h-64 font-mono text-xs" placeholder="Write in markdown…" value={body} onChange={(e) => setBody(e.target.value)} />
          <div className="rounded-xl border border-surface-border bg-surface-subtle p-3">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-ink-400">Preview</p>
            <MarkdownRenderer content={body || '*Preview will appear here…*'} />
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-surface-border px-4 py-3">
          <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={save}>{note ? 'Save' : 'Create'}</Button>
        </div>
      </div>
    </div>
  );
}
