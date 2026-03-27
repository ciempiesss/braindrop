import type { UseQuizReturn } from '@/hooks/useQuiz';
import { DROP_TYPE_CONFIG } from '@/types';

interface Props {
  quiz: UseQuizReturn;
}

export function QuizResult({ quiz }: Props) {
  const { sessionStats, failedItems, streakCount, restartSession } = quiz;
  const { correct, percent } = sessionStats;
  const total = quiz.answers.length;

  const circumference = 2 * Math.PI * 44;
  const dash = (percent / 100) * circumference;

  const scoreColor =
    percent >= 80 ? 'text-green-400' :
    percent >= 50 ? 'text-amber-400' :
    'text-red-400';

  const strokeColor =
    percent >= 80 ? '#4ade80' :
    percent >= 50 ? '#fbbf24' :
    '#f87171';

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Círculo de score */}
      <div className="relative w-28 h-28">
        <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="44" fill="none" stroke="#2f3336" strokeWidth="8" />
          <circle
            cx="50" cy="50" r="44"
            fill="none"
            stroke={strokeColor}
            strokeWidth="8"
            strokeDasharray={`${dash} ${circumference}`}
            strokeLinecap="round"
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-bold ${scoreColor}`}>{percent}%</span>
        </div>
      </div>

      <div className="text-center">
        <p className="text-[#e7e9ea] text-lg font-semibold">
          {correct} / {total} correctas
        </p>
        {streakCount >= 3 && (
          <p className="text-amber-400 text-sm mt-1">🔥 Racha: {streakCount} seguidas</p>
        )}
      </div>

      {/* Items fallados */}
      {failedItems.length > 0 && (
        <div className="w-full">
          <p className="text-xs text-[#71767b] uppercase tracking-wide mb-3">Para revisar</p>
          <div className="flex flex-col gap-2">
            {failedItems.map((item, i) => {
              if (item.drop) {
                const typeConfig = DROP_TYPE_CONFIG[item.drop.type];
                return (
                  <div
                    key={i}
                    className="bg-[#16181c] border border-[#2f3336] rounded-xl px-4 py-3 flex items-start gap-3"
                  >
                    <span className={`text-xs rounded-full px-2 py-0.5 shrink-0 mt-0.5 ${typeConfig.bgColor} ${typeConfig.color}`}>
                      {typeConfig.emoji}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[#e7e9ea] text-sm font-medium leading-snug">{item.drop.title}</p>
                      {item.explanation && (
                        <p className="text-[#71767b] text-xs mt-1 leading-snug">{item.explanation}</p>
                      )}
                    </div>
                  </div>
                );
              }
              // Pregunta curada sin drop
              return (
                <div
                  key={i}
                  className="bg-[#16181c] border border-[#2f3336] rounded-xl px-4 py-3"
                >
                  <p className="text-[#a78bfa] text-xs font-medium mb-1">
                    {item.conceptName ?? 'Concepto'}
                  </p>
                  <p className="text-[#e7e9ea] text-sm leading-snug line-clamp-2">{item.questionText}</p>
                  {item.explanation && (
                    <p className="text-[#71767b] text-xs mt-1 leading-snug">{item.explanation}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <button
        onClick={restartSession}
        className="w-full py-4 rounded-xl bg-[#7c3aed] text-white font-bold text-base transition-all hover:bg-[#6d28d9]"
      >
        Otra ronda
      </button>
    </div>
  );
}
