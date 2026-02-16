import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { DropType } from '@/types';
import { DROP_TYPE_CONFIG } from '@/types';
import DOMPurify from 'dompurify';

const MAX_TITLE_LENGTH = 200;
const MAX_CONTENT_LENGTH = 5000;
const MAX_TAGS = 10;
const MAX_TAG_LENGTH = 30;

interface ComposeProps {
  onSubmit: (drop: {
    title: string;
    content: string;
    type: DropType;
    tags: string[];
    codeSnippet?: string;
    visualContent?: string;
  }) => void;
}

const DROP_TYPES: DropType[] = ['definition', 'analogy', 'hook', 'trivia', 'insight', 'connection', 'code'];

export function Compose({ onSubmit }: ComposeProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<DropType>('definition');
  const [tags, setTags] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [showVisual, setShowVisual] = useState(false);
  const [codeSnippet, setCodeSnippet] = useState('');
  const [visualContent, setVisualContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    if (title.length > MAX_TITLE_LENGTH || content.length > MAX_CONTENT_LENGTH) return;

    const sanitizedTitle = DOMPurify.sanitize(title.trim(), { ALLOWED_TAGS: [] });
    const sanitizedContent = DOMPurify.sanitize(content.trim(), { ALLOWED_TAGS: [] });
    const sanitizedTags = tags
      .split(',')
      .map((t) => DOMPurify.sanitize(t.trim(), { ALLOWED_TAGS: [] }))
      .filter(Boolean)
      .slice(0, MAX_TAGS)
      .map((t) => t.slice(0, MAX_TAG_LENGTH));

    onSubmit({
      title: sanitizedTitle,
      content: sanitizedContent,
      type,
      tags: sanitizedTags,
      codeSnippet: showCode ? DOMPurify.sanitize(codeSnippet, { ALLOWED_TAGS: ['code', 'pre'] }) : undefined,
      visualContent: showVisual ? DOMPurify.sanitize(visualContent, { ALLOWED_TAGS: [] }) : undefined,
    });

    setTitle('');
    setContent('');
    setTags('');
    setCodeSnippet('');
    setVisualContent('');
    setShowCode(false);
    setShowVisual(false);
  };

  return (
    <form onSubmit={handleSubmit} className="p-5 border-b border-[#2f3336]">
      <div className="flex flex-wrap gap-2 mb-4">
        {DROP_TYPES.map((t) => {
          const config = DROP_TYPE_CONFIG[t];
          return (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={cn(
                'px-3.5 py-2 rounded-full text-[13px] transition-all border',
                type === t
                  ? 'bg-[#7c3aed] border-[#7c3aed] text-white'
                  : 'bg-transparent border-[#2f3336] text-[#a0a0a0] hover:border-[#7c3aed] hover:text-[#7c3aed]'
              )}
            >
              {config.emoji} {config.label}
            </button>
          );
        })}
      </div>

      <input
        type="text"
        placeholder="Título del drop..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={MAX_TITLE_LENGTH}
        className="w-full bg-transparent text-lg font-semibold placeholder:text-[#71767b] focus:outline-none mb-2 text-white"
      />
      <div className="text-xs text-[#71767b] mb-2">{title.length}/{MAX_TITLE_LENGTH}</div>

      <textarea
        placeholder="¿Qué aprendiste hoy?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        maxLength={MAX_CONTENT_LENGTH}
        rows={3}
        className="w-full bg-transparent text-base placeholder:text-[#71767b] focus:outline-none resize-none text-[#e0e0e0]"
      />
      <div className="text-xs text-[#71767b] mb-2">{content.length}/{MAX_CONTENT_LENGTH}</div>

      {showVisual && (
        <div className="mt-3 mb-3">
          <textarea
            placeholder="🎨 Diagrama ASCII, emojis, visual..."
            value={visualContent}
            onChange={(e) => setVisualContent(e.target.value)}
            rows={4}
            className="w-full bg-[#16181c] border border-[#2f3336] rounded-xl p-3 text-sm font-mono placeholder:text-[#71767b] focus:outline-none focus:border-[#7c3aed] text-[#a78bfa]"
          />
        </div>
      )}

      {showCode && (
        <div className="mt-3 mb-3">
          <textarea
            placeholder="// Pega tu código aquí..."
            value={codeSnippet}
            onChange={(e) => setCodeSnippet(e.target.value)}
            rows={4}
            className="w-full bg-[#16181c] border border-[#2f3336] rounded-xl p-3 text-xs font-mono placeholder:text-[#71767b] focus:outline-none focus:border-[#7c3aed] text-[#a78bfa]"
          />
        </div>
      )}

      <div className="flex items-center justify-between mt-3 pt-2">
        <div className="flex items-center gap-4">
          <button type="button" className="text-[#a0a0a0] hover:text-white transition-colors text-lg">
            🏷️
          </button>
          <button type="button" className="text-[#a0a0a0] hover:text-white transition-colors text-lg">
            📷
          </button>
          <button
            type="button"
            onClick={() => setShowVisual(!showVisual)}
            className={cn(
              'transition-colors text-lg',
              showVisual ? 'text-[#a78bfa]' : 'text-[#a0a0a0] hover:text-white'
            )}
          >
            🎨
          </button>
          <button
            type="button"
            onClick={() => setShowCode(!showCode)}
            className={cn(
              'transition-colors text-lg',
              showCode ? 'text-[#c084fc]' : 'text-[#a0a0a0] hover:text-white'
            )}
          >
            💻
          </button>
          <input
            type="text"
            placeholder="tags, separados, por coma"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="bg-transparent text-sm w-40 placeholder:text-[#71767b] focus:outline-none text-[#e0e0e0]"
          />
        </div>

        <button
          type="submit"
          disabled={!title.trim() || !content.trim()}
          className={cn(
            'px-6 py-2.5 rounded-full font-bold text-[15px] transition-colors',
            title.trim() && content.trim()
              ? 'bg-[#7c3aed] text-white hover:bg-[#6d28d9]'
              : 'bg-[#2f3336] text-[#71767b] cursor-not-allowed'
          )}
        >
          Drop it! 🧠
        </button>
      </div>
    </form>
  );
}
