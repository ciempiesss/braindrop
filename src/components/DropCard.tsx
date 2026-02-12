import { cn } from '@/lib/utils';
import type { Drop } from '@/types';
import { DROP_TYPE_CONFIG } from '@/types';
import { formatRelativeDate } from '@/lib/utils';

interface DropCardProps {
  drop: Drop;
  onReview?: () => void;
  onAI?: () => void;
}

const typeStyles: Record<string, { bg: string; text: string }> = {
  definition: { bg: 'bg-[#1e3a5f]', text: 'text-[#60a5fa]' },
  analogy: { bg: 'bg-[#3b1f5c]', text: 'text-[#a78bfa]' },
  hook: { bg: 'bg-[#3b2f0a]', text: 'text-[#fbbf24]' },
  trivia: { bg: 'bg-[#1f4a3b]', text: 'text-[#34d399]' },
  insight: { bg: 'bg-[#4a1f1f]', text: 'text-[#f87171]' },
  connection: { bg: 'bg-[#2d3748]', text: 'text-[#63b3ed]' },
  code: { bg: 'bg-[#2d1f3b]', text: 'text-[#c084fc]' },
};

export function DropCard({ drop, onReview, onAI }: DropCardProps) {
  const config = DROP_TYPE_CONFIG[drop.type];
  const styles = typeStyles[drop.type];

  return (
    <article className="p-4 border-b border-[#2f3336] hover:bg-[#181818] transition-colors cursor-pointer w-full">
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className={cn('px-2.5 py-1 rounded-xl text-xs font-semibold uppercase', styles.bg, styles.text)}>
          {config.emoji} {config.label}
        </span>
        {drop.tags.length > 0 && (
          <span className="text-[13px] text-[#a0a0a0]">
            {drop.tags[0]}
          </span>
        )}
      </div>

      <h3 className="text-[17px] font-bold mb-2 text-white leading-snug">
        {drop.title}
      </h3>

      <p className="text-[15px] text-[#d4d4d4] leading-relaxed">
        {drop.content}
      </p>

      {drop.visualContent && (
        <div className="mt-3 bg-[#16181c] rounded-xl p-4 border border-[#2f3336] text-center overflow-x-auto">
          <pre className="text-[15px] font-mono text-[#a78bfa] whitespace-pre-wrap leading-relaxed">
            {drop.visualContent}
          </pre>
        </div>
      )}

      {drop.codeSnippet && (
        <div className="mt-3 bg-[#16181c] rounded-xl p-4 border border-[#2f3336] overflow-x-auto">
          <pre className="text-[13px] font-mono text-[#a78bfa]">
            <code>{drop.codeSnippet}</code>
          </pre>
        </div>
      )}

      <div className="flex flex-wrap gap-4 mt-3 pt-2">
        <button 
          onClick={onReview}
          className="flex items-center gap-1 text-[#a0a0a0] text-[13px] hover:text-[#7c3aed] transition-colors"
        >
          🔄 Repetir
        </button>

        <button className="flex items-center gap-1 text-[#a0a0a0] text-[13px] hover:text-[#f87171] transition-colors">
          ❤️ 23
        </button>

        <button className="flex items-center gap-1 text-[#a0a0a0] text-[13px] hover:text-[#fbbf24] transition-colors">
          📚 Guardar
        </button>

        <button 
          onClick={onAI}
          className="flex items-center gap-1 text-[#a0a0a0] text-[13px] hover:text-[#7c3aed] transition-colors ml-auto"
        >
          🤖 IA
        </button>

        <span className="text-[13px] text-[#a0a0a0]">
          {formatRelativeDate(drop.createdAt)}
        </span>
      </div>
    </article>
  );
}
