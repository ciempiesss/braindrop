import type { Drop } from '@/types';

// ─── Semilla determinística ───────────────────────────────────────────────────

function lcgRand(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

export function seededShuffle<T>(array: T[], seed: number): T[] {
  const arr = [...array];
  const rand = lcgRand(seed);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ─── Diversidad de tipo (no más de 3 del mismo tipo consecutivos) ─────────────

function diversify(drops: Drop[]): Drop[] {
  const result: Drop[] = [];
  let lastType = '';
  let sameTypeCount = 0;
  const deferred: Drop[] = [];

  for (const drop of drops) {
    if (drop.type === lastType && sameTypeCount >= 3) {
      deferred.push(drop);
    } else {
      result.push(drop);
      if (drop.type === lastType) {
        sameTypeCount++;
      } else {
        lastType = drop.type;
        sameTypeCount = 1;
      }
    }
  }

  // Insertar diferidos al final (evitar cortarlos completamente)
  return [...result, ...deferred];
}

// ─── Algoritmo principal ──────────────────────────────────────────────────────

export const SESSION_SIZE = 15;
export const PAGE_SIZE = 10;
export const MAX_SESSION = 40;

export function buildSessionPool(
  drops: Drop[],
  seed: number,
  selectedTag?: string | null,
  visibleCollections?: string[]
): Drop[] {
  const now = new Date();

  // Aplicar filtros externos
  let pool = drops;
  if (selectedTag) {
    pool = pool.filter(d => d.tags.includes(selectedTag));
  }
  if (visibleCollections && visibleCollections.length > 0) {
    pool = pool.filter(d => d.collectionId && visibleCollections.includes(d.collectionId));
  }

  // Bucket A: no vistos nunca — los más viejos primero (pendientes desde más tiempo)
  const bucketA = pool
    .filter(d => d.viewed !== true)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  // Bucket B: por repasar según SM-2
  const bucketB = pool
    .filter(d => d.viewed === true && new Date(d.nextReviewDate) <= now)
    .sort((a, b) => new Date(a.nextReviewDate).getTime() - new Date(b.nextReviewDate).getTime());

  // Bucket C: liked pero no urgentes
  const bucketAIds = new Set(bucketA.map(d => d.id));
  const bucketBIds = new Set(bucketB.map(d => d.id));
  const bucketC = pool.filter(
    d =>
      d.viewed === true &&
      d.liked === true &&
      new Date(d.nextReviewDate) > now &&
      !bucketAIds.has(d.id) &&
      !bucketBIds.has(d.id)
  );

  // Bucket D: comodín — el resto
  const usedIds = new Set([...bucketAIds, ...bucketBIds, ...bucketC.map(d => d.id)]);
  const bucketD = pool.filter(d => !usedIds.has(d.id));

  // Proporciones del pool de 40
  const quotaA = Math.round(MAX_SESSION * 0.3); // 12
  const quotaB = Math.round(MAX_SESSION * 0.4); // 16
  const quotaC = Math.round(MAX_SESSION * 0.2); // 8
  const quotaD = MAX_SESSION - quotaA - quotaB - quotaC; // 4

  // Mezcla con semilla (variabilidad entre sesiones, determinístico para la misma semilla)
  const selected = [
    ...seededShuffle(bucketA, seed).slice(0, quotaA),
    ...seededShuffle(bucketB, seed + 1).slice(0, quotaB),
    ...seededShuffle(bucketC, seed + 2).slice(0, quotaC),
    ...seededShuffle(bucketD, seed + 3).slice(0, quotaD),
  ];

  return diversify(selected);
}

// ─── Stats para el UI de fin de sesión ───────────────────────────────────────

export function getSessionStats(drops: Drop[]): { unseen: number; dueForReview: number } {
  const now = new Date();
  return {
    unseen: drops.filter(d => d.viewed !== true).length,
    dueForReview: drops.filter(d => d.viewed === true && new Date(d.nextReviewDate) <= now).length,
  };
}
