export type DropType = 
  | 'definition'
  | 'analogy'
  | 'hook'
  | 'trivia'
  | 'insight'
  | 'connection'
  | 'code';

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
  createdAt: string;
  updatedAt: string;
  
  interval: number;
  repetitionCount: number;
  easeFactor: number;
  nextReviewDate: string;
  lastReviewDate?: string;
  status: 'new' | 'learning' | 'review' | 'relearn';
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  color?: string;
  dropCount: number;
  createdAt: string;
}

export interface QuizSession {
  id: string;
  drops: Drop[];
  currentIndex: number;
  correctCount: number;
  incorrectCount: number;
  startedAt: string;
  completedAt?: string;
}

export const DROP_TYPE_CONFIG: Record<DropType, { label: string; emoji: string; color: string; bgColor: string }> = {
  definition: { label: 'Definición', emoji: '📌', color: 'text-type-definition', bgColor: 'bg-type-definition/10' },
  analogy: { label: 'Analogía', emoji: '🔗', color: 'text-type-analogy', bgColor: 'bg-type-analogy/10' },
  hook: { label: 'Hook', emoji: '💡', color: 'text-type-hook', bgColor: 'bg-type-hook/10' },
  trivia: { label: 'Trivia', emoji: '🎯', color: 'text-type-trivia', bgColor: 'bg-type-trivia/10' },
  insight: { label: 'Insight', emoji: '⚡', color: 'text-type-insight', bgColor: 'bg-type-insight/10' },
  connection: { label: 'Conexión', emoji: '🧩', color: 'text-type-connection', bgColor: 'bg-type-connection/10' },
  code: { label: 'Code', emoji: '💻', color: 'text-type-code', bgColor: 'bg-type-code/10' },
};
