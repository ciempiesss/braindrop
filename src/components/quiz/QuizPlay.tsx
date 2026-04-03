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
    <div className="quiz-fade-up flex flex-col gap-5">
      <div className="quiz-card-hover rounded-3xl border border-white/10 bg-[linear-gradient(170deg,rgba(31,38,51,0.98),rgba(17,22,31,1))] p-4 shadow-[0_18px_44px_rgba(2,8,23,0.28)]">
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-semibold text-white/70">
            Pregunta {progress.current}
          </span>
          <span className="shrink-0 tabular-nums text-sm text-[#b8bec5]">
            {progress.current} / {progress.total}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="sr-only">
            Progreso {progress.current} de {progress.total}
          </span>
          <div className="flex flex-1 gap-1.5">
            {Array.from({ length: progress.total }).map((_, index) => (
              <div
                key={index}
                className={`h-2 flex-1 rounded-full transition-all duration-300 ${
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
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-semibold text-[#c9ced4]">
          {TYPE_LABELS[question.type]}
        </span>
        {dropTypeConfig ? (
          <span
            className={`rounded-full border border-current/20 px-3 py-1 text-xs font-semibold ${dropTypeConfig.bgColor} ${dropTypeConfig.color}`}
          >
            {dropTypeConfig.emoji} {dropTypeConfig.label}
          </span>
        ) : null}
        {showStreak ? (
          <span className="quiz-float quiz-pulse rounded-full border border-amber-400/25 bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
            {streakMsg}
          </span>
        ) : null}
      </div>

      {question.type !== 'flashcard' ? (
        <div className="quiz-card-hover rounded-3xl border border-white/10 bg-[linear-gradient(165deg,rgba(27,35,49,0.96),rgba(16,22,32,1))] px-5 py-4 shadow-[0_20px_56px_rgba(2,8,23,0.22)]">
          <p className="mb-1 text-[11px] uppercase tracking-[0.1em] text-white/45">Consigna</p>
          <p className="text-lg font-semibold leading-snug text-[#f6f8fa]">{question.question}</p>
        </div>
      ) : null}

      <div className="quiz-fade-up">
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
      </div>

      {answered && question.explanation && question.type !== 'flashcard' ? (
        <div className="quiz-fade-up rounded-3xl border border-white/10 bg-[linear-gradient(165deg,rgba(20,29,42,0.98),rgba(13,18,27,1))] p-4 shadow-[0_14px_30px_rgba(2,8,23,0.22)]">
          <p className="mb-1 text-xs uppercase tracking-wide text-[#99a2ad]">Explicacion</p>
          <p className="text-sm leading-relaxed text-[#e7e9ea]">{question.explanation}</p>
        </div>
      ) : null}

      {answered && motivation ? (
        <div
          className={`quiz-pop rounded-2xl border px-4 py-3 text-sm font-semibold ${
            answeredCorrect
              ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100 shadow-[0_8px_24px_rgba(16,185,129,0.15)]'
              : 'border-amber-300/30 bg-amber-500/10 text-amber-100 shadow-[0_8px_24px_rgba(245,158,11,0.12)]'
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
          className="quiz-btn-press w-full rounded-2xl border border-white/15 bg-white/[0.03] py-3 text-sm font-semibold text-white/75 transition-all hover:-translate-y-0.5 hover:border-white/30 hover:text-white"
        >
          Saltar esta pregunta
        </button>
      ) : null}

      {answered ? (
        <button
          onClick={nextQuestion}
          className="quiz-btn-press w-full rounded-2xl bg-[linear-gradient(130deg,#7c3aed,#6d28d9)] py-4 text-base font-black text-white shadow-[0_14px_30px_rgba(109,40,217,0.38)] transition-all hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_20px_40px_rgba(109,40,217,0.45)]"
        >
          {progress.current >= progress.total ? 'Ver resultados' : 'Siguiente'}
        </button>
      ) : null}
    </div>
  );
}
