import { useCallback, useMemo, useState } from 'react';

import { loadSettings } from '@/components/Settings';
import { CURATED_QUESTIONS, getCuratedFiltered } from '@/data/quizQuestions';
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

function moveCorrectIndex(options: string[], fromIndex: number, toIndex: number): { options: string[]; correctIndex: number } {
  if (fromIndex === toIndex || fromIndex < 0 || fromIndex >= options.length) {
    return { options, correctIndex: fromIndex };
  }
  const next = [...options];
  const [correct] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, correct);
  return { options: next, correctIndex: toIndex };
}

function normalizeText(text: string, maxChars: number): string {
  return text.replace(/\s+/g, ' ').trim().slice(0, maxChars);
}

function normalizeQuestionCopy(question: QuizQuestion): QuizQuestion {
  return {
    ...question,
    question: normalizeText(question.question, 220),
    answer: normalizeText(question.answer, 220),
    explanation: normalizeText(question.explanation, 320),
  };
}

function rebalanceAnswerPositions(questions: QuizQuestion[]): QuizQuestion[] {
  const targetPattern = [0, 1, 2, 3];
  let optionQuestionCount = 0;
  questions.forEach((question) => {
    const hasMC = Array.isArray(question.options) && question.options.length >= 2;
    const hasFill = Array.isArray(question.blankOptions) && question.blankOptions.length >= 2;
    if (hasMC || hasFill) optionQuestionCount += 1;
  });
  const targets = Array.from({ length: optionQuestionCount }, (_, index) => targetPattern[index % 4]);
  const shuffledTargets = shuffleArray(targets);
  let targetCursor = 0;

  return questions.map((question) => {
    if (Array.isArray(question.options) && question.options.length >= 2 && question.correctIndex != null) {
      const target = shuffledTargets[targetCursor] ?? question.correctIndex;
      targetCursor += 1;
      const normalizedTarget = Math.min(Math.max(target, 0), question.options.length - 1);
      const moved = moveCorrectIndex(question.options, question.correctIndex, normalizedTarget);
      return { ...question, options: moved.options, correctIndex: moved.correctIndex };
    }
    if (Array.isArray(question.blankOptions) && question.blankOptions.length >= 2 && question.correctIndex != null) {
      const target = shuffledTargets[targetCursor] ?? question.correctIndex;
      targetCursor += 1;
      const normalizedTarget = Math.min(Math.max(target, 0), question.blankOptions.length - 1);
      const moved = moveCorrectIndex(question.blankOptions, question.correctIndex, normalizedTarget);
      return { ...question, blankOptions: moved.options, correctIndex: moved.correctIndex };
    }
    return question;
  });
}

function diversifyQuestionOrder(questions: QuizQuestion[]): QuizQuestion[] {
  const buckets: Record<QuizQuestion['type'], QuizQuestion[]> = {
    'multiple-choice': [],
    'true-false': [],
    'fill-blank': [],
    flashcard: [],
  };
  questions.forEach((question) => buckets[question.type].push(question));
  (Object.keys(buckets) as Array<QuizQuestion['type']>).forEach((type) => {
    buckets[type] = shuffleArray(buckets[type]);
  });

  const sequence: QuizQuestion[] = [];
  let prevType: QuizQuestion['type'] | null = null;
  while (sequence.length < questions.length) {
    const availableTypes = (Object.keys(buckets) as Array<QuizQuestion['type']>).filter(
      (type) => buckets[type].length > 0
    );
    if (availableTypes.length === 0) break;
    const preferred = availableTypes.find((type) => type !== prevType) ?? availableTypes[0];
    const next = buckets[preferred].shift();
    if (!next) break;
    sequence.push(next);
    prevType = next.type;
  }
  return sequence;
}

function finalizeSessionQuestions(questions: QuizQuestion[]): QuizQuestion[] {
  const normalized = questions.map(normalizeQuestionCopy);
  const balanced = rebalanceAnswerPositions(normalized);
  return diversifyQuestionOrder(balanced);
}

function pickCuratedSession(
  collectionId: string | null,
  difficulty: QuizQuestion['difficulty'],
  count: number
): QuizQuestion[] {
  const pool = getCuratedFiltered(collectionId, difficulty, 999);
  const tfTrue = shuffleArray(pool.filter((question) => question.type === 'true-false' && question.isTrue === true));
  const tfFalse = shuffleArray(pool.filter((question) => question.type === 'true-false' && question.isTrue === false));
  const nonTF = shuffleArray(pool.filter((question) => question.type !== 'true-false'));

  const tfCap = Math.min(Math.floor(count * 0.35), tfTrue.length + tfFalse.length);
  const tfTrueCount = Math.min(Math.ceil(tfCap / 2), tfTrue.length);
  const tfFalseCount = Math.min(tfCap - tfTrueCount, tfFalse.length);

  const selectedTF = [...tfTrue.slice(0, tfTrueCount), ...tfFalse.slice(0, tfFalseCount)];
  const remaining = shuffleArray([
    ...nonTF,
    ...tfTrue.slice(tfTrueCount),
    ...tfFalse.slice(tfFalseCount),
  ]);

  return shuffleArray([...selectedTF, ...remaining]).slice(0, count);
}

function filterPoolBySettings(
  drops: Drop[],
  collectionId: string | null,
  collectionIds: string[] | undefined
): Drop[] {
  const { visibleCollections } = loadSettings();
  let pool = drops;
  if (visibleCollections.length > 0) {
    pool = pool.filter((drop) => drop.collectionId && visibleCollections.includes(drop.collectionId));
  }
  if (collectionIds && collectionIds.length > 0) {
    pool = pool.filter((drop) => drop.collectionId && collectionIds.includes(drop.collectionId));
  } else if (collectionId) {
    pool = pool.filter((drop) => drop.collectionId === collectionId);
  }
  return pool;
}

function takeBalancedByCollection(drops: Drop[], count: number): Drop[] {
  const buckets = new Map<string, Drop[]>();
  drops.forEach((drop) => {
    const key = drop.collectionId || 'sin-coleccion';
    const list = buckets.get(key) || [];
    list.push(drop);
    buckets.set(key, list);
  });
  const keys = shuffleArray([...buckets.keys()]);
  keys.forEach((key) => {
    buckets.set(key, shuffleArray(buckets.get(key) || []));
  });

  const result: Drop[] = [];
  while (result.length < count) {
    let added = 0;
    for (const key of keys) {
      const bucket = buckets.get(key) || [];
      if (bucket.length === 0) continue;
      const next = bucket.shift();
      if (next) {
        result.push(next);
        added += 1;
      }
      if (result.length >= count) break;
    }
    if (added === 0) break;
  }
  return result;
}

function selectDrops(
  drops: Drop[],
  config: QuizConfig,
  preferences: Record<string, 'like' | 'dislike'>
): Drop[] {
  const pool = filterPoolBySettings(drops, config.collectionId, config.collectionIds);
  const due = shuffleArray(pool.filter((drop) => drop.viewed && !preferences[drop.id]));
  const unseen = shuffleArray(pool.filter((drop) => !drop.viewed));
  const reviewed = shuffleArray(pool.filter((drop) => drop.viewed && preferences[drop.id]));

  const mixed = [...due, ...unseen, ...reviewed];
  if (!config.collectionIds || config.collectionIds.length === 0) {
    return takeBalancedByCollection(mixed, config.count);
  }
  return mixed.slice(0, config.count);
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
  toggleCollectionFilter: (collectionId: string) => void;
  clearCollectionFilter: () => void;
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
    collectionIds: [],
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

  const toggleCollectionFilter = useCallback((collectionId: string) => {
    setConfigState((prev) => {
      const current = prev.collectionIds || [];
      const exists = current.includes(collectionId);
      const next = exists ? current.filter((id) => id !== collectionId) : [...current, collectionId];
      return { ...prev, collectionIds: next };
    });
  }, []);

  const clearCollectionFilter = useCallback(() => {
    setConfigState((prev) => ({ ...prev, collectionIds: [] }));
  }, []);

  const availableDrops = useMemo(
    () => filterPoolBySettings(drops, config.collectionId, config.collectionIds).length,
    [drops, config.collectionId, config.collectionIds]
  );

  const dueDrops = useMemo(
    () =>
      filterPoolBySettings(drops, config.collectionId, config.collectionIds).filter(
        (drop) => drop.viewed && !dropPreferences[drop.id]
      ).length,
    [drops, config.collectionId, config.collectionIds, dropPreferences]
  );

  const curatedAvailable = useMemo(() => {
    if (config.collectionIds && config.collectionIds.length > 0) {
      return CURATED_QUESTIONS.filter(
        (question) =>
          question.difficulty === config.difficulty &&
          question.collectionId &&
          config.collectionIds?.includes(question.collectionId)
      ).length;
    }
    return getCuratedFiltered(config.collectionId, config.difficulty, 999).length;
  }, [config.collectionId, config.collectionIds, config.difficulty]);

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
      const curatedBase =
        config.collectionIds && config.collectionIds.length > 0
          ? shuffleArray(
              CURATED_QUESTIONS.filter(
                (question) =>
                  question.difficulty === config.difficulty &&
                  question.collectionId &&
                  config.collectionIds?.includes(question.collectionId)
              )
            ).slice(0, config.count)
          : pickCuratedSession(config.collectionId, config.difficulty, config.count);
      const curated = curatedBase;
      if (curated.length > 0) {
        setQuestions(finalizeSessionQuestions(curated));
        setPhase('playing');
        return;
      }
      const selected = selectDrops(drops, config, dropPreferences);
      if (selected.length === 0) return;
      setQuestions(
        finalizeSessionQuestions(
          selected.map((drop) => generateLocalQuestion(drop, drops, config.difficulty))
        )
      );
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

      setQuestions(finalizeSessionQuestions(generated));
      setPhase('playing');
      return;
    }

    setQuestions(
      finalizeSessionQuestions(
        selected.map((drop) => generateLocalQuestion(drop, drops, config.difficulty))
      )
    );
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
    toggleCollectionFilter,
    clearCollectionFilter,
    setConfig,
    startSession,
    submitAnswer,
    nextQuestion,
    restartSession,
  };
}
