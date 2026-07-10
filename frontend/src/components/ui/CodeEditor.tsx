import { useEffect, useRef, useState } from 'react';
import { Check, Copy, Download, Play, RotateCcw } from 'lucide-react';
import { cx } from '@/utils';

const LANGUAGES = ['python', 'java', 'cpp', 'javascript', 'sql', 'typescript', 'bash'] as const;
type EditorLang = (typeof LANGUAGES)[number];

interface CodeEditorProps {
  initialCode?: string;
  initialLanguage?: EditorLang;
  readOnly?: boolean;
  className?: string;
  onChange?: (code: string, language: EditorLang) => void;
}

export function CodeEditor({
  initialCode = '',
  initialLanguage = 'python',
  readOnly = false,
  className,
  onChange,
}: CodeEditorProps) {
  const [language, setLanguage] = useState<EditorLang>(initialLanguage);
  const [code, setCode] = useState(initialCode);
  const [copied, setCopied] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    onChange?.(code, language);
  }, [code, language, onChange]);

  function handleCopy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  }

  function handleDownload() {
    const ext: Record<EditorLang, string> = {
      python: 'py', java: 'java', cpp: 'cpp', javascript: 'js', sql: 'sql', typescript: 'ts', bash: 'sh',
    };
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `snippet.${ext[language]}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleReset() {
    setCode(initialCode);
  }

  function handleTab(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = e.currentTarget;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const next = code.slice(0, start) + '  ' + code.slice(end);
      setCode(next);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 2;
      });
    }
  }

  return (
    <div className={cx('overflow-hidden rounded-2xl border border-surface-border bg-surface shadow-soft', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-surface-border bg-surface-subtle px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-error-500/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-warning-500/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-accent-500/60" />
          </span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as EditorLang)}
            disabled={readOnly}
            className="rounded-lg border border-surface-border bg-surface px-2 py-1 text-xs font-medium text-ink-700 focus-ring disabled:opacity-60"
          >
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={handleCopy} className="rounded-lg p-1.5 text-ink-400 hover:bg-surface-card hover:text-ink-700" title="Copy">
            {copied ? <Check className="h-4 w-4 text-accent-600" /> : <Copy className="h-4 w-4" />}
          </button>
          <button onClick={handleDownload} className="rounded-lg p-1.5 text-ink-400 hover:bg-surface-card hover:text-ink-700" title="Download">
            <Download className="h-4 w-4" />
          </button>
          <button onClick={handleReset} className="rounded-lg p-1.5 text-ink-400 hover:bg-surface-card hover:text-ink-700" title="Reset">
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Editor area */}
      <div className="relative">
        <div className="pointer-events-none absolute left-0 top-0 flex h-full w-10 flex-col border-r border-surface-border bg-surface-subtle pt-3 text-right font-mono text-xs text-ink-300 select-none">
          {code.split('\n').map((_, i) => (
            <span key={i} className="pr-2 leading-6">{i + 1}</span>
          ))}
        </div>
        <textarea
          ref={taRef}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={handleTab}
          readOnly={readOnly}
          spellCheck={false}
          className="block h-72 w-full resize-none bg-ink-900 pl-12 pr-4 pt-3 font-mono text-xs leading-6 text-ink-100 outline-none scrollbar-thin placeholder:text-ink-500"
          placeholder="// Write your code here…"
        />
      </div>

      {/* Footer / run placeholder */}
      <div className="flex items-center justify-between border-t border-surface-border bg-surface-subtle px-3 py-2">
        <span className="text-xs text-ink-400">{code.split('\n').length} lines</span>
        <button
          className="inline-flex items-center gap-1.5 rounded-lg bg-ink-900 px-3 py-1.5 text-xs font-medium text-white opacity-90 hover:opacity-100"
          title="Code execution is not available yet"
          onClick={() => { /* extension point for code runner */ }}
        >
          <Play className="h-3.5 w-3.5" /> Run
        </button>
      </div>
    </div>
  );
}
