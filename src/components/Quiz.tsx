import { useQuiz } from '@/hooks/useQuiz';
import { QuizStart } from './quiz/QuizStart';
import { QuizPlay } from './quiz/QuizPlay';
import { QuizResult } from './quiz/QuizResult';

export function Quiz({ onClose }: { onClose?: () => void }) {
  const quiz = useQuiz();
  const { phase, generationProgress, questions } = quiz;

  return (
    <div className="flex flex-col gap-4 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-[#e7e9ea] font-bold text-lg">Quiz</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-[#71767b] hover:text-[#e7e9ea] text-sm transition-colors"
          >
            Cerrar
          </button>
        )}
      </div>

      {/* Pantallas */}
      {phase === 'start' && <QuizStart quiz={quiz} />}

      {phase === 'generating' && (
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="w-12 h-12 border-2 border-[#7c3aed] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#e7e9ea] font-semibold">Generando preguntas con IA</p>
          <p className="text-[#71767b] text-sm tabular-nums">
            {generationProgress} / {questions.length || '?'}
          </p>
          <div className="w-full bg-[#2f3336] rounded-full h-1.5">
            <div
              className="bg-[#7c3aed] h-1.5 rounded-full transition-all duration-300"
              style={{ width: questions.length > 0 ? `${(generationProgress / questions.length) * 100}%` : '0%' }}
            />
          </div>
        </div>
      )}

      {phase === 'playing' && <QuizPlay quiz={quiz} />}

      {phase === 'result' && <QuizResult quiz={quiz} />}
    </div>
  );
}
