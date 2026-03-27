import { cn } from '@/lib/utils';
import type { QuizQuestion } from '@/types';

interface Props {
  question: QuizQuestion;
  selectedAnswer: boolean | null;
  onSelect: (answer: boolean) => void;
}

export function TrueFalse({ question, selectedAnswer, onSelect }: Props) {
  const { isTrue = true } = question;
  const answered = selectedAnswer !== null;

  function buttonStyle(value: boolean) {
    if (!answered) {
      return 'bg-[#16181c] border border-[#2f3336] text-[#e7e9ea] hover:border-[#7c3aed]/60';
    }
    const isThisCorrect = value === isTrue;
    const isThisSelected = value === selectedAnswer;

    if (isThisCorrect) return 'bg-green-500/10 border-2 border-green-500 text-[#e7e9ea]';
    if (isThisSelected) return 'bg-red-500/10 border-2 border-red-500 text-[#e7e9ea]';
    return 'bg-[#16181c] border border-[#2f3336] text-[#71767b] opacity-50';
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        onClick={() => !answered && onSelect(true)}
        disabled={answered}
        className={cn(
          'py-5 rounded-xl text-lg font-bold transition-all',
          buttonStyle(true)
        )}
      >
        {answered && isTrue ? '✓ ' : ''}Verdadero
      </button>
      <button
        onClick={() => !answered && onSelect(false)}
        disabled={answered}
        className={cn(
          'py-5 rounded-xl text-lg font-bold transition-all',
          buttonStyle(false)
        )}
      >
        {answered && !isTrue ? '✓ ' : ''}Falso
      </button>
    </div>
  );
}
