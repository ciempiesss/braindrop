import { useQuiz } from '@/hooks/useQuiz';
import { QuizStart } from './quiz/QuizStart';
import { QuizPlay } from './quiz/QuizPlay';
import { QuizResult } from './quiz/QuizResult';

export function Quiz({ onClose }: { onClose?: () => void }) {
  const quiz = useQuiz();
  const { phase, generationProgress, generationTotal, config } = quiz;

  return (
    <div className="quiz-fade-up mx-auto flex w-full max-w-3xl flex-col gap-4 pb-6">
      <div className="quiz-card-hover relative overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(165deg,rgba(27,35,49,0.96),rgba(15,20,29,1))] px-5 py-4 shadow-[0_20px_60px_rgba(2,8,23,0.38)]">
        <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#7c3aed]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 left-8 h-24 w-24 rounded-full bg-cyan-400/10 blur-2xl" />
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-black tracking-[-0.03em] text-white">Quiz Lab</h2>
            <p className="text-xs text-white/50">
              {config.mode === 'curated'
                ? 'Sesion curada'
                : config.mode === 'ia'
                  ? 'Sesion asistida por IA'
                  : 'Sesion local'}
            </p>
          </div>
        {onClose && (
          <button
            onClick={onClose}
            className="quiz-btn-press rounded-full border border-white/12 bg-white/[0.03] px-3 py-1 text-sm text-white/60 transition-all hover:border-white/25 hover:text-white"
          >
            Cerrar
          </button>
        )}
        </div>
      </div>

      {phase === 'start' && <QuizStart quiz={quiz} />}

      {phase === 'generating' && (
        <div className="quiz-fade-up flex flex-col items-center gap-4 rounded-3xl border border-white/10 bg-[linear-gradient(165deg,rgba(27,35,49,0.96),rgba(15,20,29,1))] py-8 shadow-[0_16px_48px_rgba(2,8,23,0.28)]">
          <div className="quiz-glow h-14 w-14 animate-spin rounded-full border-[3px] border-[#7c3aed] border-t-transparent shadow-[0_0_30px_rgba(124,58,237,0.4)]" />
          <p className="text-[#e7e9ea] font-semibold">Generando sesion...</p>
          <p className="text-[#71767b] text-sm tabular-nums">
            {generationProgress} / {generationTotal || '?'}
          </p>
          <div className="h-1.5 w-[85%] overflow-hidden rounded-full bg-[#2f3336]">
            <div
              className="h-1.5 rounded-full bg-gradient-to-r from-[#7c3aed] to-[#a78bfa] transition-all duration-500"
              style={{ width: generationTotal > 0 ? `${(generationProgress / generationTotal) * 100}%` : '0%' }}
            />
          </div>
        </div>
      )}

      {phase === 'playing' && <QuizPlay quiz={quiz} />}

      {phase === 'result' && <QuizResult quiz={quiz} />}
    </div>
  );
}
