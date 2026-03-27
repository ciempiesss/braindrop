import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { QuizQuestion } from '@/types';

interface Props {
  question: QuizQuestion;
  onRate: (quality: number) => void;
  rated: boolean;
}

export function Flashcard({ question, onRate, rated }: Props) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="space-y-4">
      {/* Card */}
      <div
        onClick={() => !flipped && setFlipped(true)}
        className={cn(
          'min-h-[220px] rounded-xl border p-6 transition-all cursor-pointer',
          flipped
            ? 'bg-[#16181c] border-[#7c3aed]/40 ring-1 ring-[#7c3aed]/30'
            : 'bg-[#16181c] border-[#2f3336] hover:border-[#7c3aed]/40'
        )}
      >
        {!flipped ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[160px] text-center">
            <p className="text-[#71767b] text-sm mb-3">Toca para revelar</p>
            <p className="text-[#e7e9ea] text-lg font-semibold leading-snug">{question.question}</p>
            <div className="mt-4 text-[#7c3aed] text-xs animate-pulse">↓ tap</div>
          </div>
        ) : (
          <div>
            <p className="text-xs text-[#7c3aed] uppercase tracking-wide mb-3">Respuesta</p>
            <p className="text-[#e7e9ea] leading-relaxed whitespace-pre-wrap">{question.answer}</p>
          </div>
        )}
      </div>

      {/* Botones de calidad — solo después de flip y si no se ha calificado */}
      {flipped && !rated && (
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onRate(2)}
            className="py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-semibold text-sm hover:bg-red-500/20 transition-colors"
          >
            Difícil
          </button>
          <button
            onClick={() => onRate(4)}
            className="py-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 font-semibold text-sm hover:bg-green-500/20 transition-colors"
          >
            Bien
          </button>
          <button
            onClick={() => onRate(5)}
            className="py-3 rounded-xl bg-[#7c3aed]/10 border border-[#7c3aed]/30 text-[#7c3aed] font-semibold text-sm hover:bg-[#7c3aed]/20 transition-colors"
          >
            Fácil
          </button>
        </div>
      )}

      {flipped && rated && (
        <p className="text-center text-[#71767b] text-sm">Calificado ✓</p>
      )}
    </div>
  );
}
