export type DropType =
  | 'definition'
  | 'ruptura'
  | 'puente'
  | 'operativo'
  | 'code';

export type VisualType = 'flow' | 'matrix' | 'code' | 'funnel' | 'pyramid' | 'list' | 'comparison';

export interface VisualNode {
  label: string;
  icon: string;
  color: string;
  desc?: string;
}

export interface VisualMatrixItem {
  severity: string;
  priority: string;
  bg: string;
  border: string;
  text: string;
}

export interface VisualStep {
  label: string;
  icon: string;
  color: string;
}

export interface VisualPyramidLevel {
  label: string;
  width: string;
  color: string;
  count: string;
}

export interface VisualData {
  type: VisualType;
  nodes?: VisualNode[];
  items?: VisualMatrixItem[];
  code?: string;
  steps?: VisualStep[];
  levels?: VisualPyramidLevel[];
  comparison?: { left: string; right: string }[];
}

export interface Drop {
  id: string;
  title: string;
  content: string;
  type: DropType;
  tags: string[];
  collectionId?: string;
  codeSnippet?: string;
  imageUrl?: string;
  visualContent?: string;
  visualType?: VisualType;
  visualData?: VisualData;
  createdAt: string;
  updatedAt: string;

  interval: number;
  repetitionCount: number;
  easeFactor: number;
  nextReviewDate: string;
  lastReviewDate?: string;
  status: 'new' | 'learning' | 'review' | 'relearn';
  liked?: boolean;
  viewed?: boolean;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  color?: string;
  dropCount: number;
  createdAt: string;
}

export type QuestionType = 'multiple-choice' | 'true-false' | 'fill-blank' | 'flashcard';
export type Difficulty = 'facil' | 'medio' | 'dificil';
export type QuizGenerationMode = 'curated' | 'local' | 'ia';

export interface QuizQuestion {
  dropId?: string;        // optional — preguntas curadas no tienen drop asociado
  collectionId?: string;  // para filtrar y mostrar en resultados
  conceptName?: string;   // nombre del concepto para mostrar en resultados
  type: QuestionType;
  difficulty: Difficulty;
  question: string;
  answer: string;
  explanation: string;
  // Multiple choice
  options?: string[];
  correctIndex?: number;
  // True/False
  isTrue?: boolean;
  // Fill-in-blank
  blankSentence?: string;
  blankWord?: string;
  blankOptions?: string[];
}

export interface QuizConfig {
  collectionId: string | null;
  difficulty: Difficulty;
  count: 5 | 10 | 20;
  mode: QuizGenerationMode;
}

export interface QuizAnswerRecord {
  dropId?: string;
  questionText: string;
  conceptName?: string;
  correct: boolean;
  quality: number;
}

export const DROP_TYPE_CONFIG: Record<DropType, { label: string; emoji: string; color: string; bgColor: string }> = {
  definition: { label: 'Definición', emoji: '📐', color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
  ruptura: { label: 'Ruptura', emoji: '⚡', color: 'text-red-400', bgColor: 'bg-red-500/10' },
  puente: { label: 'Puente', emoji: '🌀', color: 'text-purple-400', bgColor: 'bg-purple-500/10' },
  operativo: { label: 'Operativo', emoji: '🔧', color: 'text-amber-400', bgColor: 'bg-amber-500/10' },
  code: { label: 'Código', emoji: '💻', color: 'text-violet-400', bgColor: 'bg-violet-500/10' },
};
