import type { Drop, QuizQuestion, Difficulty } from '@/types';

// ─── Utilidades ───────────────────────────────────────────────────────────────

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Devuelve la primera oración completa del content */
function firstSentence(content: string): string {
  const match = content.match(/^[^.!?]+[.!?]/);
  return match ? match[0].trim() : content.split('\n')[0].trim();
}

/** Devuelve la segunda oración, o la primera si no hay segunda */
function secondSentence(content: string): string {
  const sentences = content.match(/[^.!?]+[.!?]/g) || [];
  return (sentences[1] ?? sentences[0] ?? content).trim();
}

/** Limpia un título para usarlo como palabra clave en fill-blank */
function cleanTitle(title: string): string {
  // Quitar subtítulos tipo "Algo: descripción" → quedarse con "Algo"
  return title.split(':')[0].trim();
}

/** Busca si una palabra/frase aparece en el texto (case-insensitive) */
function findInText(text: string, word: string): boolean {
  return text.toLowerCase().includes(word.toLowerCase());
}

/** Reemplaza la primera ocurrencia de word en text por _____ */
function blankOut(text: string, word: string): string {
  const idx = text.toLowerCase().indexOf(word.toLowerCase());
  if (idx === -1) return text;
  return text.slice(0, idx) + '_____' + text.slice(idx + word.length);
}

/** Distractores genéricos fallback si no hay suficientes drops */
const GENERIC_DISTRACTORS = [
  'Otro concepto relacionado',
  'Un proceso diferente',
  'Una herramienta alternativa',
  'Un enfoque distinto',
];

function getDistractors(
  correctTitle: string,
  allDrops: Drop[],
  mode: 'other-collection' | 'same-type' | 'same-collection',
  targetDrop: Drop,
  count = 3
): string[] {
  let pool: Drop[];
  if (mode === 'same-collection') {
    pool = allDrops.filter(d => d.collectionId === targetDrop.collectionId && d.title !== correctTitle);
  } else if (mode === 'same-type') {
    pool = allDrops.filter(d => d.type === targetDrop.type && d.title !== correctTitle);
  } else {
    pool = allDrops.filter(d => d.collectionId !== targetDrop.collectionId && d.title !== correctTitle);
  }

  const shuffled = shuffleArray(pool).slice(0, count).map(d => d.title);
  // Completar con genéricos si hacen falta
  while (shuffled.length < count) {
    const fallback = GENERIC_DISTRACTORS[shuffled.length] ?? `Opción ${shuffled.length + 1}`;
    shuffled.push(fallback);
  }
  return shuffled;
}

// ─── Multiple Choice ──────────────────────────────────────────────────────────

export function generateMultipleChoice(
  drop: Drop,
  allDrops: Drop[],
  difficulty: Difficulty
): QuizQuestion {
  let question: string;
  let distractorMode: 'other-collection' | 'same-type' | 'same-collection';

  const title = cleanTitle(drop.title);

  if (difficulty === 'facil') {
    question = `¿Qué es "${title}"?`;
    distractorMode = 'other-collection';
  } else if (difficulty === 'medio') {
    const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const snippet = firstSentence(drop.content).replace(new RegExp(escaped, 'gi'), '_____');
    question = `¿Qué concepto corresponde a esta descripción?\n"${snippet}"`;
    distractorMode = 'same-type';
  } else {
    // Difícil: usar el contenido sin mencionar el título, distractores de la misma colección
    const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const body = drop.content.substring(0, 120).replace(new RegExp(escaped, 'gi'), '_____');
    question = `¿A qué concepto corresponde esta descripción?\n"${body}..."`;
    distractorMode = 'same-collection';
  }

  const distractors = getDistractors(drop.title, allDrops, distractorMode, drop);

  // CRÍTICO: construir pool ANTES de shuffle, recuperar índice DESPUÉS
  const pool = [
    { text: drop.title, correct: true },
    ...distractors.map(t => ({ text: t, correct: false })),
  ];
  const shuffled = shuffleArray(pool);
  const correctIndex = shuffled.findIndex(o => o.correct);

  return {
    dropId: drop.id,
    type: 'multiple-choice',
    difficulty,
    question,
    answer: drop.title,
    explanation: firstSentence(drop.content),
    options: shuffled.map(o => o.text),
    correctIndex,
  };
}

// ─── True / False ─────────────────────────────────────────────────────────────

/**
 * Estrategia:
 * - TRUE: una afirmación directa extraída del contenido
 * - FALSE: la posición contraria que el drop refuta (extraída del mismo texto)
 *
 * Muchos drops explícitamente mencionan la creencia errónea que corrigen.
 * Usamos eso para generar la afirmación falsa plausible.
 */
export function generateTrueFalse(drop: Drop, difficulty: Difficulty): QuizQuestion {
  const title = cleanTitle(drop.title);

  // Detectar si el drop menciona una posición que refuta
  // Patrones: "No es...", "No se trata de...", "No dice que...", "Opuesto a...", "A diferencia de..."
  const refutationPatterns = [
    /No (?:es|dice|significa|implica|se trata de|afirma)\s([^.!?]+[.!?])/i,
    /Opuesto (?:al?|a la)\s([^.!?]+[.!?])/i,
    /A diferencia de\s([^.!?]+[.!?])/i,
    /(?:El modelo estándar|La creencia común|La intuición)\s(?:dice|es que)\s([^.!?]+[.!?])/i,
  ];

  let falseStatement: string | null = null;
  for (const pattern of refutationPatterns) {
    const m = drop.content.match(pattern);
    if (m) {
      falseStatement = m[0].trim();
      break;
    }
  }

  let trueStatement: string;
  let presentedStatement: string;
  let isTrue: boolean;

  if (difficulty === 'facil') {
    // Fácil: afirmación literal y obvia del título
    const tagLabel = (drop.tags[0] ?? 'este tema').replace(/-/g, ' ');
    trueStatement = `"${title}" pertenece a ${tagLabel}.`;
    if (Math.random() < 0.6) {
      presentedStatement = trueStatement;
      isTrue = true;
    } else {
      // Falso obvio: negar la existencia del concepto
      presentedStatement = `"${title}" no existe como concepto formal en ninguna disciplina.`;
      isTrue = false;
    }
  } else if (difficulty === 'medio') {
    // Medio: afirmación del contenido
    trueStatement = firstSentence(drop.content);
    if (falseStatement && Math.random() < 0.5) {
      presentedStatement = falseStatement;
      isTrue = false;
    } else {
      presentedStatement = trueStatement;
      isTrue = true;
    }
  } else {
    // Difícil: afirmación de la segunda oración (más matizada)
    trueStatement = secondSentence(drop.content);
    if (falseStatement && Math.random() < 0.6) {
      presentedStatement = falseStatement;
      isTrue = false;
    } else {
      presentedStatement = trueStatement;
      isTrue = true;
    }
  }

  const explanation = isTrue
    ? firstSentence(drop.content)
    : `Incorrecto. ${firstSentence(drop.content)}`;

  return {
    dropId: drop.id,
    type: 'true-false',
    difficulty,
    question: `¿Verdadero o falso?\n"${presentedStatement}"`,
    answer: isTrue ? 'Verdadero' : 'Falso',
    explanation,
    isTrue,
  };
}

// ─── Fill-in-blank ────────────────────────────────────────────────────────────

export function generateFillBlank(
  drop: Drop,
  allDrops: Drop[],
  difficulty: Difficulty
): QuizQuestion {
  const title = cleanTitle(drop.title);

  let targetSentence: string;
  let blankWord: string;

  if (difficulty === 'facil') {
    // Blanquear el TÍTULO en la primera oración
    targetSentence = firstSentence(drop.content);
    blankWord = title;
  } else if (difficulty === 'medio') {
    // Blanquear el primer tag que aparece en el contenido
    const tagInContent = drop.tags.find(t =>
      t.length > 3 && findInText(drop.content, t.replace(/-/g, ' '))
    );
    if (tagInContent) {
      targetSentence = firstSentence(drop.content);
      blankWord = tagInContent.replace(/-/g, ' ');
    } else {
      targetSentence = firstSentence(drop.content);
      blankWord = title;
    }
  } else {
    // Difícil: blanquear concepto clave de la segunda oración
    const sentence2 = secondSentence(drop.content);
    const tagInContent = drop.tags.find(t =>
      t.length > 3 && findInText(sentence2, t.replace(/-/g, ' '))
    );
    if (tagInContent) {
      targetSentence = sentence2;
      blankWord = tagInContent.replace(/-/g, ' ');
    } else {
      targetSentence = sentence2;
      blankWord = title;
    }
  }

  // Si la palabra no está en la oración, usar el título directamente
  if (!findInText(targetSentence, blankWord)) {
    targetSentence = firstSentence(drop.content);
    blankWord = title;
  }

  const blankSentence = blankOut(targetSentence, blankWord);

  // Distractores: otros títulos del mismo tipo
  const distractors = getDistractors(drop.title, allDrops, 'same-type', drop, 3);
  const correctDisplay = blankWord.length > 30 ? drop.title : blankWord;

  const pool = [
    { text: correctDisplay, correct: true },
    ...distractors.map(t => ({ text: cleanTitle(t), correct: false })),
  ];
  const shuffled = shuffleArray(pool);
  const correctIndex = shuffled.findIndex(o => o.correct);

  return {
    dropId: drop.id,
    type: 'fill-blank',
    difficulty,
    question: `Completa el espacio en blanco:`,
    answer: correctDisplay,
    explanation: firstSentence(drop.content),
    blankSentence,
    blankWord: correctDisplay,
    blankOptions: shuffled.map(o => o.text),
    correctIndex,
  };
}

// ─── Flashcard ────────────────────────────────────────────────────────────────

export function generateFlashcard(drop: Drop, difficulty: Difficulty): QuizQuestion {
  const title = cleanTitle(drop.title);
  let question: string;
  let answer: string;

  if (difficulty === 'facil') {
    question = `¿Qué es "${title}"?`;
    answer = drop.content;
  } else if (difficulty === 'medio') {
    // Primera oración con el título removido como prompt
    const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const sentence = firstSentence(drop.content).replace(new RegExp(escaped, 'gi'), '___').trim();
    question = sentence.endsWith('___')
      ? `¿Qué concepto completa esta frase?\n"${sentence}"`
      : `¿Qué concepto describe esto?\n"${sentence}"`;
    answer = `${drop.title}\n\n${drop.content}`;
  } else {
    // Difícil: solo los tags como pistas, sin ver el título
    const tagHint = drop.tags.slice(0, 3).join(', ');
    question = `Conceptos relacionados: ${tagHint}\n\n¿De qué concepto se trata?`;
    answer = `${drop.title}\n\n${drop.content}`;
  }

  return {
    dropId: drop.id,
    type: 'flashcard',
    difficulty,
    question,
    answer,
    explanation: drop.content,
  };
}

// ─── Generador principal ──────────────────────────────────────────────────────

const TYPE_WEIGHTS: Record<string, number[]> = {
  definition:  [30, 30, 25, 15], // MC, T/F, FillBlank, Flashcard
  ruptura:     [25, 40, 10, 25],
  puente:      [30, 30, 15, 25],
  operativo:   [25, 20, 30, 25],
  code:        [30, 20, 35, 15],
};

function pickQuestionType(drop: Drop): 'multiple-choice' | 'true-false' | 'fill-blank' | 'flashcard' {
  const weights = TYPE_WEIGHTS[drop.type] ?? [25, 25, 25, 25];
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  const types = ['multiple-choice', 'true-false', 'fill-blank', 'flashcard'] as const;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return types[i];
  }
  return 'multiple-choice';
}

export function generateLocalQuestion(
  drop: Drop,
  allDrops: Drop[],
  difficulty: Difficulty
): QuizQuestion {
  const type = pickQuestionType(drop);
  switch (type) {
    case 'multiple-choice': return generateMultipleChoice(drop, allDrops, difficulty);
    case 'true-false':      return generateTrueFalse(drop, difficulty);
    case 'fill-blank':      return generateFillBlank(drop, allDrops, difficulty);
    case 'flashcard':       return generateFlashcard(drop, difficulty);
  }
}
