import { useState, useCallback, useMemo } from 'react';
import { useBrainDrop } from '@/hooks/useBrainDrop';
import { loadSettings } from '@/components/Settings';
import { generateLocalQuestion } from '@/lib/quizGenerators';
import { generateSmartQuizQuestion } from '@/lib/groq';
import { getCuratedFiltered } from '@/data/quizQuestions';
import type { Drop, QuizQuestion, QuizConfig, QuizAnswerRecord } from '@/types';

// ─── Shuffle ──────────────────────────────────────────────────────────────────

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Selección de drops para modos local / IA ─────────────────────────────────

function selectDrops(drops: Drop[], config: QuizConfig): Drop[] {
  const { collectionId, count } = config;
  const { visibleCollections } = loadSettings();

  let pool = drops;

  if (visibleCollections.length > 0) {
    pool = pool.filter(d => d.collectionId && visibleCollections.includes(d.collectionId));
  }

  if (collectionId) {
    pool = pool.filter(d => d.collectionId === collectionId);
  }

  const unseen = shuffleArray(pool.filter(d => !d.viewed));
  const viewed = shuffleArray(pool.filter(d => d.viewed));
  return shuffleArray([...unseen, ...viewed]).slice(0, count);
}

// ─── Tipos internos ───────────────────────────────────────────────────────────

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
  streakCount: number;

  currentQuestion: QuizQuestion | null;
  currentDrop: Drop | null;
  progress: { current: number; total: number };
  sessionStats: { correct: number; incorrect: number; percent: number };
  failedItems: FailedItem[];
  availableDrops: number;
  dueDrops: number;

  setConfig: (c: Partial<QuizConfig>) => void;
  startSession: () => Promise<void>;
  submitAnswer: (correct: boolean, quality?: number) => void;
  nextQuestion: () => void;
  restartSession: () => void;
}

// ─── Default config ───────────────────────────────────────────────────────────

function defaultConfig(): QuizConfig {
  const s = loadSettings();
  return {
    collectionId: null,
    difficulty: 'medio',
    count: (s.quizCount as 5 | 10 | 20) ?? 10,
    mode: s.quizMode === 'ia' ? 'ia' : 'local',
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useQuiz(): UseQuizReturn {
  const { drops, setDropPreference, dropPreferences } = useBrainDrop();

  const [phase, setPhase] = useState<QuizPhase>('start');
  const [config, setConfigState] = useState<QuizConfig>(defaultConfig);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswerRecord[]>([]);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [streakCount, setStreakCount] = useState(0);

  // Drops disponibles (para modos local/IA)
  const { availableDrops, dueDrops } = useMemo(() => {
    const s = loadSettings();
    let pool = drops;
    if (s.visibleCollections.length > 0) {
      pool = pool.filter(d => d.collectionId && s.visibleCollections.includes(d.collectionId ?? ''));
    }
    if (config.collectionId) {
      pool = pool.filter(d => d.collectionId === config.collectionId);
    }
    const pending = pool.filter(d => d.viewed && !dropPreferences[d.id]).length;
    return { availableDrops: pool.length, dueDrops: pending };
  }, [drops, config.collectionId, dropPreferences]);

  const setConfig = useCallback((partial: Partial<QuizConfig>) => {
    setConfigState(prev => ({ ...prev, ...partial }));
  }, []);

  const startSession = useCallback(async () => {
    setCurrentIndex(0);
    setAnswers([]);
    setStreakCount(0);

    if (config.mode === 'curated') {
      // Preguntas curadas del banco predefinido
      const curated = getCuratedFiltered(config.collectionId, config.difficulty, config.count);
      if (curated.length === 0) {
        // Fallback a local si no hay curadas para esa combinación
        const selected = selectDrops(drops, config);
        const generated = selected.map(drop => generateLocalQuestion(drop, drops, config.difficulty));
        setQuestions(generated);
      } else {
        setQuestions(curated);
      }
      setPhase('playing');
      return;
    }

    if (config.mode === 'ia') {
      const selected = selectDrops(drops, config);
      if (selected.length === 0) return;

      setPhase('generating');
      setGenerationProgress(0);
      const generated: QuizQuestion[] = [];
      const BATCH = 3;

      for (let i = 0; i < selected.length; i += BATCH) {
        const batch = selected.slice(i, i + BATCH);
        const results = await Promise.all(
          batch.map(drop =>
            generateSmartQuizQuestion(drop, config.difficulty).catch(() =>
              generateLocalQuestion(drop, drops, config.difficulty)
            )
          )
        );
        generated.push(...results);
        setGenerationProgress(Math.min(i + BATCH, selected.length));
        if (i + BATCH < selected.length) {
          await new Promise(r => setTimeout(r, 400));
        }
      }

      setQuestions(generated);
      setPhase('playing');
      return;
    }

    // Modo local (algoritmo)
    const selected = selectDrops(drops, config);
    if (selected.length === 0) return;
    const generated = selected.map(drop => generateLocalQuestion(drop, drops, config.difficulty));
    setQuestions(generated);
    setPhase('playing');
  }, [drops, config]);

  const submitAnswer = useCallback((correct: boolean, quality?: number) => {
    const q = questions[currentIndex];
    if (!q) return;

    const resolvedQuality = quality ?? (correct ? 4 : 1);

    setAnswers(prev => [...prev, {
      dropId: q.dropId,
      questionText: q.question,
      conceptName: q.conceptName,
      correct,
      quality: resolvedQuality,
    }]);

    setStreakCount(prev => correct ? prev + 1 : 0);

    // Convertimos el resultado del quiz en preferencia para aprender tus gustos.
    if (q.dropId) {
      const preference = resolvedQuality >= 4 ? 'like' : resolvedQuality <= 2 ? 'dislike' : null;
      setDropPreference(q.dropId, preference);
    }
  }, [questions, currentIndex, setDropPreference]);

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
    setStreakCount(0);
  }, []);

  // Derivados de sesión
  const currentQuestion = questions[currentIndex] ?? null;

  const currentDrop = useMemo(() => {
    if (!currentQuestion?.dropId) return null;
    return drops.find(d => d.id === currentQuestion.dropId) ?? null;
  }, [currentQuestion, drops]);

  const progress = { current: currentIndex + 1, total: questions.length };

  const sessionStats = useMemo(() => {
    const correct = answers.filter(a => a.correct).length;
    const incorrect = answers.filter(a => !a.correct).length;
    const total = correct + incorrect;
    return {
      correct,
      incorrect,
      percent: total > 0 ? Math.round((correct / total) * 100) : 0,
    };
  }, [answers]);

  const failedItems = useMemo((): FailedItem[] => {
    const failedAnswers = answers.filter(a => !a.correct);
    return failedAnswers.map(a => {
      const drop = a.dropId ? drops.find(d => d.id === a.dropId) : undefined;
      const matchedQ = questions.find(q => q.question === a.questionText);
      return {
        drop,
        questionText: a.questionText,
        explanation: matchedQ?.explanation ?? '',
        conceptName: a.conceptName ?? drop?.title,
      };
    });
  }, [answers, drops, questions]);

  return {
    phase,
    config,
    questions,
    currentIndex,
    answers,
    generationProgress,
    streakCount,
    currentQuestion,
    currentDrop,
    progress,
    sessionStats,
    failedItems,
    availableDrops,
    dueDrops,
    setConfig,
    startSession,
    submitAnswer,
    nextQuestion,
    restartSession,
  };
}
