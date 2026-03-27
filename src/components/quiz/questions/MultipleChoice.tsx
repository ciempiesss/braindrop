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
    <div className="space-y-3">
      {options.map((option, idx) => {
        const isSelected = selectedIndex === idx;
        const isCorrect = idx === correctIndex;

        let style = 'bg-[#16181c] border border-[#2f3336] text-[#e7e9ea] hover:border-[#7c3aed]/60';
        if (answered) {
          if (isCorrect) {
            style = 'bg-green-500/10 border-2 border-green-500 text-[#e7e9ea]';
          } else if (isSelected && !isCorrect) {
            style = 'bg-red-500/10 border-2 border-red-500 text-[#e7e9ea]';
          } else {
            style = 'bg-[#16181c] border border-[#2f3336] text-[#71767b] opacity-50';
          }
        }

        return (
          <button
            key={idx}
            onClick={() => !answered && onSelect(idx)}
            disabled={answered}
            className={cn(
              'w-full p-4 rounded-xl text-left transition-all flex items-center gap-3',
              style
            )}
          >
            <span className={cn(
              'w-7 h-7 rounded-full border-2 flex items-center justify-center text-sm font-bold flex-shrink-0',
              answered && isCorrect ? 'border-green-500 text-green-400 bg-green-500/10' :
              answered && isSelected ? 'border-red-500 text-red-400 bg-red-500/10' :
              'border-[#3f4447] text-[#71767b]'
            )}>
              {answered && isCorrect ? '✓' : answered && isSelected ? '✗' : String.fromCharCode(65 + idx)}
            </span>
            <span className="font-medium leading-snug">{option}</span>
          </button>
        );
      })}
    </div>
  );
}
