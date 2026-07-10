import { useMemo } from 'react';
import { cx } from '@/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

interface Block {
  type: 'heading' | 'paragraph' | 'code' | 'list' | 'quote';
  level?: number;
  text: string;
  items?: string[];
  lang?: string;
}

function parse(md: string): Block[] {
  const lines = md.split('\n');
  const blocks: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }
    if (line.startsWith('```')) {
      const lang = line.slice(3).trim();
      const buf: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        buf.push(lines[i]);
        i++;
      }
      i++;
      blocks.push({ type: 'code', text: buf.join('\n'), lang });
      continue;
    }
    if (/^#{1,6}\s/.test(line)) {
      const level = line.match(/^#+/)![0].length;
      blocks.push({ type: 'heading', level, text: line.replace(/^#+\s/, '') });
      i++;
      continue;
    }
    if (/^[-*]\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*]\s/, ''));
        i++;
      }
      blocks.push({ type: 'list', text: '', items });
      continue;
    }
    if (/^>\s/.test(line)) {
      blocks.push({ type: 'quote', text: line.replace(/^>\s/, '') });
      i++;
      continue;
    }
    blocks.push({ type: 'paragraph', text: line });
    i++;
  }
  return blocks;
}

function inline(text: string): string {
  return text
    .replace(/`([^`]+)`/g, '<code class="rounded bg-surface-card px-1.5 py-0.5 text-[0.85em] font-mono text-ink-700">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-ink-900">$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-brand-600 underline hover:text-brand-700">$1</a>');
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const blocks = useMemo(() => parse(content), [content]);
  return (
    <div className={cx('space-y-3 text-sm leading-relaxed text-ink-700', className)}>
      {blocks.map((b, idx) => {
        if (b.type === 'heading') {
          const sizes = ['text-xl', 'text-lg', 'text-base', 'text-base', 'text-sm', 'text-sm'];
          return (
            <h4
              key={idx}
              className={cx('font-display font-semibold text-ink-900', sizes[(b.level ?? 1) - 1])}
              dangerouslySetInnerHTML={{ __html: inline(b.text) }}
            />
          );
        }
        if (b.type === 'code') {
          return (
            <pre key={idx} className="overflow-x-auto rounded-xl border border-surface-border bg-ink-900 p-4 text-xs text-ink-100">
              <code className="font-mono">{b.text}</code>
            </pre>
          );
        }
        if (b.type === 'list') {
          return (
            <ul key={idx} className="space-y-1.5 pl-1">
              {(b.items ?? []).map((item, j) => (
                <li key={j} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ink-300" />
                  <span dangerouslySetInnerHTML={{ __html: inline(item) }} />
                </li>
              ))}
            </ul>
          );
        }
        if (b.type === 'quote') {
          return (
            <blockquote
              key={idx}
              className="border-l-2 border-brand-300 bg-brand-50/40 px-4 py-2 text-ink-600"
              dangerouslySetInnerHTML={{ __html: inline(b.text) }}
            />
          );
        }
        return <p key={idx} dangerouslySetInnerHTML={{ __html: inline(b.text) }} />;
      })}
    </div>
  );
}
