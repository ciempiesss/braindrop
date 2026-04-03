import type { DropType } from '@/types';

const MULTISPACE_REGEX = /\s+/g;
const INVALID_TAG_CHARS_REGEX = /[^a-z0-9-]/g;

const SUBCATEGORY_BY_COLLECTION: Record<string, string[]> = {
  consciencia: ['filosofia-mente', 'neurociencia', 'spinoza', 'cuantica', 'faggin', 'deleuze'],
  software: ['arquitectura', 'frontend', 'backend', 'typescript', 'react', 'testing'],
  patrones: ['sistemas', 'decision', 'aprendizaje', 'complejidad', 'estrategia'],
  geopolitica: ['poder', 'economia-politica', 'narrativa', 'conflicto', 'historia'],
  hermetismo: ['alquimia', 'gnosis', 'simbolismo', 'magia-del-caos', 'ritual'],
  rotoplas: ['operacion', 'comercial', 'analisis', 'equipo', 'prioridades'],
  automatizacion: ['agentes', 'orquestacion', 'scraping', 'workflows', 'deploy'],
  'qa-pro': ['testing', 'api-testing', 'e2e', 'performance', 'seguridad'],
};

const SUBCATEGORY_KEYWORDS: Record<string, string[]> = {
  'filosofia-mente': ['qualia', 'consciencia', 'conciencia', 'mente', 'hard problem', 'chalmers'],
  neurociencia: ['neuro', 'cerebro', 'neurona'],
  spinoza: ['spinoza', 'conatus', 'afecto'],
  cuantica: ['cuantica', 'quantum', 'observador', 'onda'],
  faggin: ['faggin', 'microprocesador'],
  deleuze: ['deleuze', 'guattari', 'rizoma'],
  arquitectura: ['arquitectura', 'patron', 'patrón'],
  frontend: ['frontend', 'css', 'ui', 'ux'],
  backend: ['backend', 'api', 'server', 'db', 'database'],
  typescript: ['typescript', 'tsconfig'],
  react: ['react', 'hook', 'component'],
  testing: ['test', 'testing', 'qa', 'assert'],
  agentes: ['agente', 'agent', 'llm'],
  scraping: ['scraping', 'crawler'],
  workflows: ['workflow', 'pipeline', 'automatizacion', 'automatización'],
  deploy: ['deploy', 'vercel', 'release'],
};

function cleanText(text: string): string {
  return text.replace(/\r/g, '').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
}

function normalizeTagToken(tag: string): string {
  return tag
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[_\s]+/g, '-')
    .replace(/-+/g, '-')
    .replace(INVALID_TAG_CHARS_REGEX, '')
    .replace(/^-+|-+$/g, '');
}

function inferSubcategory(
  collectionId: string | undefined,
  type: DropType,
  title: string,
  content: string,
  tags: string[]
): string {
  const haystack = `${title} ${content} ${tags.join(' ')}`.toLowerCase();
  const allowed = collectionId ? SUBCATEGORY_BY_COLLECTION[collectionId] || [] : [];

  for (const candidate of allowed) {
    const keywords = SUBCATEGORY_KEYWORDS[candidate] || [];
    if (keywords.some((keyword) => haystack.includes(keyword.toLowerCase()))) return candidate;
  }

  if (allowed.length > 0) return allowed[0];
  if (type === 'operativo') return 'ejecucion';
  if (type === 'code') return 'implementacion';
  if (type === 'ruptura') return 'reencuadre';
  if (type === 'puente') return 'conexion';
  return 'fundamentos';
}

export function normalizeTags(params: {
  tags: string[];
  collectionId?: string;
  type: DropType;
  title: string;
  content: string;
}): string[] {
  const normalized = params.tags
    .map(normalizeTagToken)
    .filter(Boolean)
    .filter((tag, index, list) => list.indexOf(tag) === index);

  const subcategory = inferSubcategory(
    params.collectionId,
    params.type,
    params.title,
    params.content,
    normalized
  );

  const withoutSubcategory = normalized.filter((tag) => tag !== subcategory);
  return [subcategory, ...withoutSubcategory].slice(0, 10);
}

export function normalizeDropDraft<T extends {
  title: string;
  content: string;
  type: DropType;
  tags: string[];
  collectionId?: string;
}>(draft: T): T {
  const title = cleanText(draft.title).replace(MULTISPACE_REGEX, ' ');
  const content = cleanText(draft.content);
  const tags = normalizeTags({
    tags: draft.tags,
    collectionId: draft.collectionId,
    type: draft.type,
    title,
    content,
  });

  return { ...draft, title, content, tags };
}

export function formatSubcategoryLabel(tag?: string): string {
  if (!tag) return 'General';
  return tag
    .split('-')
    .filter(Boolean)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(' ');
}
