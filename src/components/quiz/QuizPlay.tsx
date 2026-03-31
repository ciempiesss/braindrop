import { useState } from 'react';
import { MultipleChoice } from './questions/MultipleChoice';
import { TrueFalse } from './questions/TrueFalse';
import { FillBlank } from './questions/FillBlank';
import { Flashcard } from './questions/Flashcard';
import type { UseQuizReturn } from '@/hooks/useQuiz';
import { DROP_TYPE_CONFIG } from '@/types';

interface Props {
  quiz: UseQuizReturn;
}

const TYPE_LABELS: Record<string, string> = {
  'multiple-choice': 'Opción múltiple',
  'true-false': 'Verdadero / Falso',
  'fill-blank': 'Completar',
  'flashcard': 'Flashcard',
};

const STREAK_MESSAGES = ['¡Racha!', '¡Imparable!', '¡En zona!', '¡Fuego!'];

export function QuizPlay({ quiz }: Props) {
  const { currentQuestion, currentDrop, progress, streakCount, submitAnswer, nextQuestion } = quiz;

  // Estado local indexado por pregunta para evitar reset con effect.
  const [selectedIndexes, setSelectedIndexes] = useState<Record<number, number | null>>({});
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, boolean | null>>({});
  const [flashcardRatedMap, setFlashcardRatedMap] = useState<Record<number, boolean>>({});

  const selectedIndex = selectedIndexes[progress.current] ?? null;
  const selectedAnswer = selectedAnswers[progress.current] ?? null;
  const flashcardRated = flashcardRatedMap[progress.current] ?? false;

  const answered =
    currentQuestion?.type === 'flashcard'
      ? flashcardRated
      : currentQuestion?.type === 'true-false'
      ? selectedAnswer !== null
      : selectedIndex !== null;

  if (!currentQuestion) return null;

  const dropTypeConfig = currentDrop ? DROP_TYPE_CONFIG[currentDrop.type] : null;

  function handleMCSelect(idx: number) {
    if (selectedIndex !== null) return;
    setSelectedIndexes((prev) => ({ ...prev, [progress.current]: idx }));
    const correct = idx === (currentQuestion!.correctIndex ?? 0);
    submitAnswer(correct);
  }

  function handleTFSelect(value: boolean) {
    if (selectedAnswer !== null) return;
    setSelectedAnswers((prev) => ({ ...prev, [progress.current]: value }));
    const correct = value === (currentQuestion!.isTrue ?? true);
    submitAnswer(correct);
  }

  function handleFillSelect(idx: number) {
    if (selectedIndex !== null) return;
    setSelectedIndexes((prev) => ({ ...prev, [progress.current]: idx }));
    const correct = idx === (currentQuestion!.correctIndex ?? 0);
    submitAnswer(correct);
  }

  function handleFlashcardRate(quality: number) {
    setFlashcardRatedMap((prev) => ({ ...prev, [progress.current]: true }));
    submitAnswer(quality >= 4, quality);
  }

  const showStreak = streakCount >= 3 && answered;
  const streakMsg = STREAK_MESSAGES[Math.min(streakCount - 3, STREAK_MESSAGES.length - 1)];

  return (
    <div className="flex flex-col gap-4">
      {/* Header: progreso */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-[#71767b] tabular-nums shrink-0">
          {progress.current} / {progress.total}
        </span>
        <div className="flex-1 flex gap-1">
          {Array.from({ length: progress.total }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                i < progress.current - 1
                  ? 'bg-[#7c3aed]'
                  : i === progress.current - 1
                  ? 'bg-[#7c3aed]/60'
                  : 'bg-[#2f3336]'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Chip de tipo */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-[#71767b] bg-[#16181c] border border-[#2f3336] rounded-full px-3 py-1">
          {TYPE_LABELS[currentQuestion.type]}
        </span>
        {dropTypeConfig && (
          <span className={`text-xs rounded-full px-3 py-1 border ${dropTypeConfig.bgColor} ${dropTypeConfig.color} border-current/20`}>
            {dropTypeConfig.emoji} {dropTypeConfig.label}
          </span>
        )}
        {showStreak && (
          <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1 animate-pulse">
            🔥 {streakMsg}
          </span>
        )}
      </div>

      {/* Pregunta (para tipos que la muestran por encima) */}
      {currentQuestion.type !== 'flashcard' && (
        <p className="text-[#e7e9ea] text-lg font-semibold leading-snug">
          {currentQuestion.question}
        </p>
      )}

      {/* Componente de pregunta */}
      {currentQuestion.type === 'multiple-choice' && (
        <MultipleChoice
          question={currentQuestion}
          selectedIndex={selectedIndex}
          onSelect={handleMCSelect}
        />
      )}
      {currentQuestion.type === 'true-false' && (
        <TrueFalse
          question={currentQuestion}
          selectedAnswer={selectedAnswer}
          onSelect={handleTFSelect}
        />
      )}
      {currentQuestion.type === 'fill-blank' && (
        <FillBlank
          question={currentQuestion}
          selectedIndex={selectedIndex}
          onSelect={handleFillSelect}
        />
      )}
      {currentQuestion.type === 'flashcard' && (
        <Flashcard
          question={currentQuestion}
          onRate={handleFlashcardRate}
          rated={flashcardRated}
        />
      )}

      {/* Explicación post-respuesta */}
      {answered && currentQuestion.explanation && currentQuestion.type !== 'flashcard' && (
        <div className="bg-[#16181c] border border-[#2f3336] rounded-xl p-4">
          <p className="text-xs text-[#71767b] uppercase tracking-wide mb-1">Explicación</p>
          <p className="text-[#e7e9ea] text-sm leading-relaxed">{currentQuestion.explanation}</p>
        </div>
      )}

      {/* Botón siguiente */}
      {answered && (
        <button
          onClick={nextQuestion}
          className="w-full py-4 rounded-xl bg-[#7c3aed] text-white font-bold text-base transition-all hover:bg-[#6d28d9]"
        >
          {progress.current >= progress.total ? 'Ver resultados' : 'Siguiente →'}
        </button>
      )}
    </div>
  );
}
