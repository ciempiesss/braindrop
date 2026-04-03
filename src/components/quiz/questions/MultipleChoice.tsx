import { cn } from '@/lib/utils';
import type { QuizQuestion } from '@/types';

interface Props {
  question: QuizQuestion;
  selectedIndex: number | null;
  onSelect: (index: number) => void;
}

export function MultipleChoice({ question, selectedIndex, onSelect }: Props) {
  const { options = [], correctIndex = 0 } = question;
  const answered = selectedIndex !== null;

  return (
    <div className="space-y-2.5">
      {options.map((option, index) => {
        const isSelected = selectedIndex === index;
        const isCorrect = index === correctIndex;
        const stateClass = answered
          ? isCorrect
            ? 'border-emerald-400/50 bg-emerald-500/10 text-emerald-50'
            : isSelected
              ? 'border-rose-400/50 bg-rose-500/10 text-rose-50'
              : 'border-white/8 bg-white/[0.02] text-white/40'
          : 'border-white/10 bg-[linear-gradient(180deg,rgba(25,31,43,0.96),rgba(18,23,31,1))] text-white hover:border-[#7c3aed]/45';

        const letter = String.fromCharCode(65 + index);

        return (
          <button
            key={`${letter}-${option}`}
            onClick={() => !answered && onSelect(index)}
            disabled={answered}
            className={cn(
              'quiz-btn-press quiz-card-hover quiz-option-reveal flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left transition-all',
              stateClass
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <span
              className={cn(
                'mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[12px] font-bold transition-all',
                answered && isCorrect
                  ? 'border-emerald-300/70 bg-emerald-500/20 text-emerald-100 scale-110'
                  : answered && isSelected
                    ? 'border-rose-300/70 bg-rose-500/20 text-rose-100'
                    : 'border-white/25 bg-white/[0.02] text-white/75'
              )}
            >
              {answered && isCorrect ? '✓' : answered && isSelected ? '✗' : letter}
            </span>
            <span className="text-[15px] leading-6">{option}</span>
          </button>
        );
      })}
    </div>
  );
}
