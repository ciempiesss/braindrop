import { cn } from '@/lib/utils';
import type { QuizQuestion } from '@/types';

interface Props {
  question: QuizQuestion;
  selectedIndex: number | null;
  onSelect: (index: number) => void;
}

export function FillBlank({ question, selectedIndex, onSelect }: Props) {
  const { blankSentence = '', blankWord = '', blankOptions = [], correctIndex = 0 } = question;
  const answered = selectedIndex !== null;

  return (
    <div className="space-y-3">
      <div className="quiz-card-hover rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(25,31,43,0.96),rgba(18,23,31,1))] px-4 py-4">
        <p className="mb-2 text-[11px] uppercase tracking-[0.08em] text-white/50">Completa la idea</p>
        <p className="text-[15px] leading-7 text-white/92">
          {answered
            ? blankSentence.split('_____').map((part, index, arr) => (
                <span key={`${part}-${index}`}>
                  {part}
                  {index < arr.length - 1 ? (
                    <span className="quiz-pop mx-1 rounded bg-emerald-500/20 px-2 py-0.5 font-bold text-emerald-100">
                      {blankWord}
                    </span>
                  ) : null}
                </span>
              ))
            : blankSentence.split('_____').map((part, index, arr) => (
                <span key={`${part}-${index}`}>
                  {part}
                  {index < arr.length - 1 ? (
                    <span className="mx-1 inline-block border-b-2 border-[#7c3aed]/70 px-7 text-[#a78bfa]">
                      &nbsp;
                    </span>
                  ) : null}
                </span>
              ))}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {blankOptions.map((option, index) => {
          const isSelected = selectedIndex === index;
          const isCorrect = index === correctIndex;
          const stateClass = answered
            ? isCorrect
              ? 'border-emerald-400/50 bg-emerald-500/10 text-emerald-50'
              : isSelected
                ? 'border-rose-400/50 bg-rose-500/10 text-rose-50'
                : 'border-white/8 bg-white/[0.02] text-white/45'
            : 'border-white/10 bg-[linear-gradient(180deg,rgba(25,31,43,0.96),rgba(18,23,31,1))] text-white hover:border-[#7c3aed]/45';

          return (
            <button
              key={`${option}-${index}`}
              onClick={() => !answered && onSelect(index)}
              disabled={answered}
              className={cn('quiz-btn-press quiz-card-hover quiz-option-reveal rounded-2xl border px-3 py-3 text-center text-[14px] font-semibold transition-all', stateClass)}
              style={{ animationDelay: `${index * 60}ms` }}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
