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
      <div
        onClick={() => !flipped && setFlipped(true)}
        className={cn(
          'min-h-[220px] cursor-pointer rounded-xl border p-6 transition-all',
          flipped
            ? 'border-[#7c3aed]/40 bg-[#16181c] ring-1 ring-[#7c3aed]/30'
            : 'border-[#2f3336] bg-[#16181c] hover:border-[#7c3aed]/40'
        )}
      >
        {!flipped ? (
          <div className="flex h-full min-h-[160px] flex-col items-center justify-center text-center">
            <p className="mb-3 text-sm text-[#71767b]">Toca para revelar</p>
            <p className="text-lg font-semibold leading-snug text-[#e7e9ea]">{question.question}</p>
            <div className="mt-4 text-xs text-[#7c3aed] animate-pulse">tap para revelar</div>
          </div>
        ) : (
          <div>
            <p className="mb-3 text-xs uppercase tracking-wide text-[#7c3aed]">Respuesta</p>
            <p className="whitespace-pre-wrap leading-relaxed text-[#e7e9ea]">{question.answer}</p>
          </div>
        )}
      </div>

      {flipped && !rated ? (
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onRate(2)}
            className="rounded-xl border border-red-500/30 bg-red-500/10 py-3 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/20"
          >
            Dificil
          </button>
          <button
            onClick={() => onRate(4)}
            className="rounded-xl border border-green-500/30 bg-green-500/10 py-3 text-sm font-semibold text-green-400 transition-colors hover:bg-green-500/20"
          >
            Bien
          </button>
          <button
            onClick={() => onRate(5)}
            className="rounded-xl border border-[#7c3aed]/30 bg-[#7c3aed]/10 py-3 text-sm font-semibold text-[#7c3aed] transition-colors hover:bg-[#7c3aed]/20"
          >
            Facil
          </button>
        </div>
      ) : null}

      {flipped && rated ? <p className="text-center text-sm text-[#71767b]">Calificado OK</p> : null}
    </div>
  );
}
