import { useState } from 'react';

import type { UseQuizReturn } from '@/hooks/useQuiz';
import { DROP_TYPE_CONFIG } from '@/types';
import { FillBlank } from './questions/FillBlank';
import { Flashcard } from './questions/Flashcard';
import { MultipleChoice } from './questions/MultipleChoice';
import { TrueFalse } from './questions/TrueFalse';

interface Props {
  quiz: UseQuizReturn;
}

const TYPE_LABELS: Record<string, string> = {
  'multiple-choice': 'Opcion multiple',
  'true-false': 'Verdadero / Falso',
  'fill-blank': 'Completar',
  flashcard: 'Flashcard',
};

const STREAK_MESSAGES = ['Racha', 'Imparable', 'En zona', 'Fuego'];
const CORRECT_MESSAGES = ['Bien ahi', 'Eso fue preciso', 'Muy buena lectura', 'Vas solido'];
const INCORRECT_MESSAGES = ['No pasa nada, sigue', 'Esta sirve para aprender', 'Error util, seguimos', 'Vamos a la siguiente'];

export function QuizPlay({ quiz }: Props) {
  const { currentQuestion, currentDrop, currentIndex, progress, streakCount, submitAnswer, nextQuestion } = quiz;

  const [selectedIndexes, setSelectedIndexes] = useState<Record<number, number | null>>({});
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, boolean | null>>({});
  const [flashcardRatedMap, setFlashcardRatedMap] = useState<Record<number, boolean>>({});
  const [flashcardQualityMap, setFlashcardQualityMap] = useState<Record<number, number>>({});

  const selectedIndex = selectedIndexes[currentIndex] ?? null;
  const selectedAnswer = selectedAnswers[currentIndex] ?? null;
  const flashcardRated = flashcardRatedMap[currentIndex] ?? false;

  if (!currentQuestion) return null;
  const question = currentQuestion;

  const answered =
    question.type === 'flashcard'
      ? flashcardRated
      : question.type === 'true-false'
        ? selectedAnswer !== null
        : selectedIndex !== null;

  const answeredCorrect =
    question.type === 'multiple-choice' || question.type === 'fill-blank'
      ? selectedIndex != null && selectedIndex === (question.correctIndex ?? 0)
      : question.type === 'true-false'
        ? selectedAnswer != null && selectedAnswer === (question.isTrue ?? true)
        : (flashcardQualityMap[currentIndex] ?? 0) >= 4;

  const dropTypeConfig = currentDrop ? DROP_TYPE_CONFIG[currentDrop.type] : null;
  const showStreak = streakCount >= 3 && answered;
  const streakMsg = STREAK_MESSAGES[Math.min(streakCount - 3, STREAK_MESSAGES.length - 1)];
  const motivation = answered
    ? answeredCorrect
      ? CORRECT_MESSAGES[currentIndex % CORRECT_MESSAGES.length]
      : INCORRECT_MESSAGES[currentIndex % INCORRECT_MESSAGES.length]
    : null;

  function handleMCSelect(index: number) {
    if (selectedIndex !== null) return;
    setSelectedIndexes((prev) => ({ ...prev, [currentIndex]: index }));
    submitAnswer(index === (question.correctIndex ?? 0));
  }

  function handleTFSelect(value: boolean) {
    if (selectedAnswer !== null) return;
    setSelectedAnswers((prev) => ({ ...prev, [currentIndex]: value }));
    submitAnswer(value === (question.isTrue ?? true));
  }

  function handleFillSelect(index: number) {
    if (selectedIndex !== null) return;
    setSelectedIndexes((prev) => ({ ...prev, [currentIndex]: index }));
    submitAnswer(index === (question.correctIndex ?? 0));
  }

  function handleFlashcardRate(quality: number) {
    setFlashcardRatedMap((prev) => ({ ...prev, [currentIndex]: true }));
    setFlashcardQualityMap((prev) => ({ ...prev, [currentIndex]: quality }));
    submitAnswer(quality >= 4, quality);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="shrink-0 tabular-nums text-sm text-[#71767b]">
          {progress.current} / {progress.total}
        </span>
        <div className="flex flex-1 gap-1">
          {Array.from({ length: progress.total }).map((_, index) => (
            <div
              key={index}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                index < progress.current - 1
                  ? 'bg-[#7c3aed]'
                  : index === progress.current - 1
                    ? 'bg-[#7c3aed]/60'
                    : 'bg-[#2f3336]'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="rounded-full border border-[#2f3336] bg-[#16181c] px-3 py-1 text-xs text-[#71767b]">
          {TYPE_LABELS[question.type]}
        </span>
        {dropTypeConfig ? (
          <span
            className={`rounded-full border border-current/20 px-3 py-1 text-xs ${dropTypeConfig.bgColor} ${dropTypeConfig.color}`}
          >
            {dropTypeConfig.emoji} {dropTypeConfig.label}
          </span>
        ) : null}
        {showStreak ? (
          <span className="animate-pulse rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs text-amber-400">
            {streakMsg}
          </span>
        ) : null}
      </div>

      {question.type !== 'flashcard' ? (
        <p className="text-lg font-semibold leading-snug text-[#e7e9ea]">{question.question}</p>
      ) : null}

      {question.type === 'multiple-choice' ? (
        <MultipleChoice question={question} selectedIndex={selectedIndex} onSelect={handleMCSelect} />
      ) : null}
      {question.type === 'true-false' ? (
        <TrueFalse question={question} selectedAnswer={selectedAnswer} onSelect={handleTFSelect} />
      ) : null}
      {question.type === 'fill-blank' ? (
        <FillBlank question={question} selectedIndex={selectedIndex} onSelect={handleFillSelect} />
      ) : null}
      {question.type === 'flashcard' ? (
        <Flashcard
          key={currentIndex}
          question={question}
          onRate={handleFlashcardRate}
          rated={flashcardRated}
        />
      ) : null}

      {answered && question.explanation && question.type !== 'flashcard' ? (
        <div className="rounded-xl border border-[#2f3336] bg-[#16181c] p-4">
          <p className="mb-1 text-xs uppercase tracking-wide text-[#71767b]">Explicacion</p>
          <p className="text-sm leading-relaxed text-[#e7e9ea]">{question.explanation}</p>
        </div>
      ) : null}

      {answered && motivation ? (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            answeredCorrect
              ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100'
              : 'border-amber-300/30 bg-amber-500/10 text-amber-100'
          }`}
        >
          {motivation}
        </div>
      ) : null}

      {!answered ? (
        <button
          onClick={() => {
            submitAnswer(false, 1);
            nextQuestion();
          }}
          className="w-full rounded-xl border border-white/15 bg-white/[0.03] py-3 text-sm font-semibold text-white/70 transition-all hover:border-white/25 hover:text-white"
        >
          Saltar esta pregunta
        </button>
      ) : null}

      {answered ? (
        <button
          onClick={nextQuestion}
          className="w-full rounded-xl bg-[#7c3aed] py-4 text-base font-bold text-white transition-all hover:bg-[#6d28d9]"
        >
          {progress.current >= progress.total ? 'Ver resultados' : 'Siguiente'}
        </button>
      ) : null}
    </div>
  );
}
