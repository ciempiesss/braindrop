import { cn } from '@/lib/utils';
import type { QuizQuestion } from '@/types';

interface Props {
  question: QuizQuestion;
  selectedAnswer: boolean | null;
  onSelect: (answer: boolean) => void;
}

export function TrueFalse({ question, selectedAnswer, onSelect }: Props) {
  const isTrue = question.isTrue ?? true;
  const answered = selectedAnswer !== null;

  const getStateClass = (value: boolean) => {
    if (!answered) return 'border-white/12 bg-white/[0.03] text-white hover:border-[#7c3aed]/45';
    const correct = value === isTrue;
    const selected = value === selectedAnswer;
    if (correct) return 'border-emerald-400/50 bg-emerald-500/10 text-emerald-50';
    if (selected) return 'border-rose-400/50 bg-rose-500/10 text-rose-50';
    return 'border-white/8 bg-white/[0.02] text-white/45';
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        onClick={() => !answered && onSelect(true)}
        disabled={answered}
        className={cn('quiz-btn-press quiz-card-hover rounded-2xl border px-4 py-5 text-base font-bold transition-all', getStateClass(true))}
      >
        {answered && isTrue ? '✓ ' : ''}Verdadero
      </button>
      <button
        onClick={() => !answered && onSelect(false)}
        disabled={answered}
        className={cn('quiz-btn-press quiz-card-hover rounded-2xl border px-4 py-5 text-base font-bold transition-all', getStateClass(false))}
      >
        {answered && !isTrue ? '✓ ' : ''}Falso
      </button>
    </div>
  );
}
