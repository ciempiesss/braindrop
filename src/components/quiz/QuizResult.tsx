import type { UseQuizReturn } from '@/hooks/useQuiz';
import { DROP_TYPE_CONFIG } from '@/types';

interface Props {
  quiz: UseQuizReturn;
}

function performanceLabel(percent: number): string {
  if (percent >= 85) return 'Sesion excelente';
  if (percent >= 65) return 'Buen avance';
  if (percent >= 45) return 'Base en progreso';
  return 'Sesion de calibracion';
}

export function QuizResult({ quiz }: Props) {
  const { sessionStats, failedItems, restartSession } = quiz;
  const { correct, incorrect, percent } = sessionStats;
  const total = quiz.answers.length;
  const circle = 2 * Math.PI * 42;
  const dash = (percent / 100) * circle;

  return (
    <div className="flex flex-col gap-4">
      <section className="quiz-card-hover rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(25,31,43,0.96),rgba(18,23,31,1))] px-5 py-5">
        <div className="flex items-center gap-4">
          <div className="relative h-24 w-24">
            <svg className="-rotate-90 h-24 w-24" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="8" />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke={percent >= 65 ? '#10b981' : percent >= 45 ? '#f59e0b' : '#ef4444'}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${dash} ${circle}`}
                className="transition-all duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-xl font-black text-white">
              {percent}%
            </div>
          </div>

          <div>
            <p className="text-sm text-white/55">{performanceLabel(percent)}</p>
            <p className="text-lg font-bold text-white">
              {correct} correctas · {incorrect} por reforzar
            </p>
            <p className="text-xs text-white/45">{total} respuestas en total</p>
          </div>
        </div>
      </section>

      {failedItems.length > 0 ? (
        <section className="quiz-card-hover rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(25,31,43,0.96),rgba(18,23,31,1))] px-4 py-4">
          <p className="mb-3 text-xs uppercase tracking-[0.08em] text-white/55">Reforzar ahora</p>
          <div className="space-y-2">
            {failedItems.slice(0, 6).map((item, index) => {
              const typeConfig = item.drop ? DROP_TYPE_CONFIG[item.drop.type] : null;
              return (
                <div key={`${item.questionText}-${index}`} className="quiz-card-hover rounded-2xl border border-white/10 bg-black/20 px-3 py-3 transition-all hover:border-white/20">
                  <div className="mb-1 flex items-center gap-2">
                    {typeConfig ? (
                      <span className={`rounded-full px-2 py-0.5 text-[11px] ${typeConfig.bgColor} ${typeConfig.color}`}>
                        {typeConfig.emoji} {typeConfig.label}
                      </span>
                    ) : null}
                    <span className="text-xs text-white/45">{item.conceptName ?? item.drop?.title ?? 'Concepto'}</span>
                  </div>
                  <p className="text-sm font-semibold leading-6 text-white/92">{item.questionText}</p>
                  {item.explanation ? (
                    <p className="mt-1 text-xs leading-5 text-white/55">{item.explanation}</p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      <button
        onClick={restartSession}
        className="quiz-btn-press w-full rounded-2xl bg-[linear-gradient(135deg,#7c3aed,#5b21b6)] px-4 py-4 text-base font-black text-white shadow-[0_14px_32px_rgba(124,58,237,0.36)] transition-all hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_18px_40px_rgba(124,58,237,0.45)]"
      >
        Iniciar otra sesion
      </button>
    </div>
  );
}
