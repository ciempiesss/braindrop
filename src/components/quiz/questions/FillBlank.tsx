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
    <div className="space-y-4">
      <div className="bg-[#16181c] border border-[#2f3336] rounded-xl p-4">
        <p className="text-[#71767b] text-xs mb-2 uppercase tracking-wide">Completa:</p>
        <p className="text-[#e7e9ea] text-base leading-relaxed font-medium">
          {answered
            ? blankSentence.split('_____').map((part, i, arr) => (
                <span key={i}>
                  {part}
                  {i < arr.length - 1 && (
                    <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded font-bold mx-0.5">
                      {blankWord}
                    </span>
                  )}
                </span>
              ))
            : blankSentence.split('_____').map((part, i, arr) => (
                <span key={i}>
                  {part}
                  {i < arr.length - 1 && (
                    <span className="inline-block bg-[#7c3aed]/20 border-b-2 border-[#7c3aed] px-6 mx-1 text-[#7c3aed]">
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    </span>
                  )}
                </span>
              ))
          }
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {blankOptions.map((option, idx) => {
          const isSelected = selectedIndex === idx;
          const isCorrect = idx === correctIndex;

          let style = 'bg-[#16181c] border border-[#2f3336] text-[#e7e9ea] hover:border-[#7c3aed]/60';
          if (answered) {
            if (isCorrect) style = 'bg-green-500/10 border-2 border-green-500 text-[#e7e9ea]';
            else if (isSelected) style = 'bg-red-500/10 border-2 border-red-500 text-[#e7e9ea]';
            else style = 'bg-[#16181c] border border-[#2f3336] text-[#71767b] opacity-50';
          }

          return (
            <button
              key={idx}
              onClick={() => !answered && onSelect(idx)}
              disabled={answered}
              className={cn(
                'p-3 rounded-xl text-sm font-medium text-center transition-all',
                style
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
