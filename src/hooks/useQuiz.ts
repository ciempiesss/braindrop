import { useCallback, useMemo, useState } from 'react';

import { loadSettings } from '@/components/Settings';
import { getCuratedFiltered } from '@/data/quizQuestions';
import { useBrainDrop } from '@/hooks/useBrainDrop';
import { generateSmartQuizQuestion } from '@/lib/groq';
import { generateLocalQuestion } from '@/lib/quizGenerators';
import type { Drop, QuizAnswerRecord, QuizConfig, QuizQuestion } from '@/types';

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function filterPoolBySettings(drops: Drop[], collectionId: string | null): Drop[] {
  const { visibleCollections } = loadSettings();
  let pool = drops;
  if (visibleCollections.length > 0) {
    pool = pool.filter((drop) => drop.collectionId && visibleCollections.includes(drop.collectionId));
  }
  if (collectionId) {
    pool = pool.filter((drop) => drop.collectionId === collectionId);
  }
  return pool;
}

function selectDrops(
  drops: Drop[],
  config: QuizConfig,
  preferences: Record<string, 'like' | 'dislike'>
): Drop[] {
  const pool = filterPoolBySettings(drops, config.collectionId);
  const due = shuffleArray(pool.filter((drop) => drop.viewed && !preferences[drop.id]));
  const unseen = shuffleArray(pool.filter((drop) => !drop.viewed));
  const reviewed = shuffleArray(pool.filter((drop) => drop.viewed && preferences[drop.id]));

  return [...due, ...unseen, ...reviewed].slice(0, config.count);
}

export type QuizPhase = 'start' | 'generating' | 'playing' | 'result';

export interface FailedItem {
  drop?: Drop;
  questionText: string;
  explanation: string;
  conceptName?: string;
}

export interface UseQuizReturn {
  phase: QuizPhase;
  config: QuizConfig;
  questions: QuizQuestion[];
  currentIndex: number;
  answers: QuizAnswerRecord[];
  generationProgress: number;
  generationTotal: number;
  streakCount: number;
  currentQuestion: QuizQuestion | null;
  currentDrop: Drop | null;
  progress: { current: number; total: number };
  sessionStats: { correct: number; incorrect: number; percent: number };
  failedItems: FailedItem[];
  availableDrops: number;
  dueDrops: number;
  curatedAvailable: number;
  canStart: boolean;
  setConfig: (config: Partial<QuizConfig>) => void;
  startSession: () => Promise<void>;
  submitAnswer: (correct: boolean, quality?: number) => void;
  nextQuestion: () => void;
  restartSession: () => void;
}

function defaultConfig(): QuizConfig {
  const settings = loadSettings();
  return {
    collectionId: null,
    difficulty: 'medio',
    count: (settings.quizCount as 5 | 10 | 20) ?? 10,
    mode: settings.quizMode ?? 'local',
  };
}

export function useQuiz(): UseQuizReturn {
  const { drops, dropPreferences, setDropPreference } = useBrainDrop();

  const [phase, setPhase] = useState<QuizPhase>('start');
  const [config, setConfigState] = useState<QuizConfig>(defaultConfig);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswerRecord[]>([]);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationTotal, setGenerationTotal] = useState(0);
  const [streakCount, setStreakCount] = useState(0);

  const setConfig = useCallback((partial: Partial<QuizConfig>) => {
    setConfigState((prev) => ({ ...prev, ...partial }));
  }, []);

  const availableDrops = useMemo(
    () => filterPoolBySettings(drops, config.collectionId).length,
    [drops, config.collectionId]
  );

  const dueDrops = useMemo(
    () =>
      filterPoolBySettings(drops, config.collectionId).filter(
        (drop) => drop.viewed && !dropPreferences[drop.id]
      ).length,
    [drops, config.collectionId, dropPreferences]
  );

  const curatedAvailable = useMemo(
    () => getCuratedFiltered(config.collectionId, config.difficulty, 999).length,
    [config.collectionId, config.difficulty]
  );

  const canStart = useMemo(() => {
    if (config.mode === 'curated') {
      return curatedAvailable > 0 || availableDrops > 0;
    }
    return availableDrops > 0;
  }, [config.mode, curatedAvailable, availableDrops]);

  const startSession = useCallback(async () => {
    setCurrentIndex(0);
    setAnswers([]);
    setStreakCount(0);
    setGenerationProgress(0);
    setGenerationTotal(0);

    if (config.mode === 'curated') {
      const curated = getCuratedFiltered(config.collectionId, config.difficulty, config.count);
      if (curated.length > 0) {
        setQuestions(curated);
        setPhase('playing');
        return;
      }
      const selected = selectDrops(drops, config, dropPreferences);
      if (selected.length === 0) return;
      setQuestions(selected.map((drop) => generateLocalQuestion(drop, drops, config.difficulty)));
      setPhase('playing');
      return;
    }

    const selected = selectDrops(drops, config, dropPreferences);
    if (selected.length === 0) return;

    if (config.mode === 'ia') {
      setPhase('generating');
      setGenerationTotal(selected.length);
      const generated: QuizQuestion[] = [];
      const batchSize = 3;

      for (let index = 0; index < selected.length; index += batchSize) {
        const batch = selected.slice(index, index + batchSize);
        const results = await Promise.all(
          batch.map((drop) =>
            generateSmartQuizQuestion(drop, config.difficulty).catch(() =>
              generateLocalQuestion(drop, drops, config.difficulty)
            )
          )
        );
        generated.push(...results);
        setGenerationProgress(generated.length);
      }

      setQuestions(generated);
      setPhase('playing');
      return;
    }

    setQuestions(selected.map((drop) => generateLocalQuestion(drop, drops, config.difficulty)));
    setPhase('playing');
  }, [config, dropPreferences, drops]);

  const submitAnswer = useCallback(
    (correct: boolean, quality?: number) => {
      const question = questions[currentIndex];
      if (!question) return;

      // Evita doble registro por taps rápidos.
      if (answers.length > currentIndex) return;

      const resolvedQuality = quality ?? (correct ? 4 : 1);
      setAnswers((prev) => [
        ...prev,
        {
          dropId: question.dropId,
          questionText: question.question,
          conceptName: question.conceptName,
          correct,
          quality: resolvedQuality,
        },
      ]);
      setStreakCount((prev) => (correct ? prev + 1 : 0));

      // Solo flashcard modifica preferencia: ahí sí es evaluación de gusto/dificultad real.
      if (question.dropId && question.type === 'flashcard' && quality != null) {
        const preference = quality >= 4 ? 'like' : quality <= 2 ? 'dislike' : null;
        setDropPreference(question.dropId, preference);
      }
    },
    [answers.length, currentIndex, questions, setDropPreference]
  );

  const nextQuestion = useCallback(() => {
    const next = currentIndex + 1;
    if (next >= questions.length) {
      setPhase('result');
    } else {
      setCurrentIndex(next);
    }
  }, [currentIndex, questions.length]);

  const restartSession = useCallback(() => {
    setPhase('start');
    setQuestions([]);
    setCurrentIndex(0);
    setAnswers([]);
    setGenerationProgress(0);
    setGenerationTotal(0);
    setStreakCount(0);
  }, []);

  const currentQuestion = questions[currentIndex] ?? null;

  const currentDrop = useMemo(() => {
    if (!currentQuestion?.dropId) return null;
    return drops.find((drop) => drop.id === currentQuestion.dropId) ?? null;
  }, [currentQuestion, drops]);

  const progress = {
    current: questions.length > 0 ? currentIndex + 1 : 0,
    total: questions.length,
  };

  const sessionStats = useMemo(() => {
    const correct = answers.filter((answer) => answer.correct).length;
    const incorrect = answers.length - correct;
    const total = answers.length;
    return {
      correct,
      incorrect,
      percent: total > 0 ? Math.round((correct / total) * 100) : 0,
    };
  }, [answers]);

  const failedItems = useMemo<FailedItem[]>(() => {
    return answers
      .map((answer, index) => ({ answer, question: questions[index] }))
      .filter(({ answer }) => !answer.correct)
      .map(({ answer, question }) => ({
        drop: answer.dropId ? drops.find((drop) => drop.id === answer.dropId) : undefined,
        questionText: answer.questionText,
        explanation: question?.explanation ?? '',
        conceptName: answer.conceptName,
      }));
  }, [answers, drops, questions]);

  return {
    phase,
    config,
    questions,
    currentIndex,
    answers,
    generationProgress,
    generationTotal,
    streakCount,
    currentQuestion,
    currentDrop,
    progress,
    sessionStats,
    failedItems,
    availableDrops,
    dueDrops,
    curatedAvailable,
    canStart,
    setConfig,
    startSession,
    submitAnswer,
    nextQuestion,
    restartSession,
  };
}
