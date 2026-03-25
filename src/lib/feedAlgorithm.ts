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
  visibleCollections?: string[],
  seedIds?: Set<string>
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

  const isUserDrop = (d: Drop) => seedIds ? !seedIds.has(d.id) : false;

  // Bucket A: no vistos nunca
  // User-created drops get boosted to front (max 3)
  const bucketA_all = pool.filter(d => d.viewed !== true);
  const bucketA_user = seededShuffle(bucketA_all.filter(d => isUserDrop(d)), seed).slice(0, 3);
  const userBoostIds = new Set(bucketA_user.map(d => d.id));
  const bucketA_rest = seededShuffle(bucketA_all.filter(d => !userBoostIds.has(d.id)), seed);
  const bucketA = [...bucketA_user, ...bucketA_rest];

  // Bucket B: por repasar según SM-2 (due date pasada)
  // Sub-buckets: urgent (relearn or hard learner) vs normal
  const bucketB_all = pool.filter(d => d.viewed === true && new Date(d.nextReviewDate) <= now);
  const bucketB_urgent = seededShuffle(
    bucketB_all.filter(d => d.status === 'relearn' || d.easeFactor < 1.8),
    seed + 1
  );
  const bucketB_normal = seededShuffle(
    bucketB_all.filter(d => d.status !== 'relearn' && d.easeFactor >= 1.8),
    seed + 1
  );
  // Urgent drops come first within bucket B
  const bucketB = [...bucketB_urgent, ...bucketB_normal];

  // Bucket C: liked pero no urgentes
  const bucketAIds = new Set(bucketA.map(d => d.id));
  const bucketBIds = new Set(bucketB.map(d => d.id));
  const bucketC = seededShuffle(
    pool.filter(
      d =>
        d.viewed === true &&
        d.liked === true &&
        new Date(d.nextReviewDate) > now &&
        !bucketAIds.has(d.id) &&
        !bucketBIds.has(d.id)
    ),
    seed + 2
  );

  // Bucket D: comodín — todo lo demás
  const usedIds = new Set([...bucketAIds, ...bucketBIds, ...bucketC.map(d => d.id)]);
  const bucketD = seededShuffle(
    pool.filter(d => !usedIds.has(d.id)),
    seed + 3
  );

  // Llenar hasta MAX_SESSION redistribuyendo slots sobrantes
  // Prioridad: A (nuevos) > B_urgent > B_normal > C (liked) > D (comodín)
  const buckets = [bucketA, bucketB_urgent, bucketB_normal, bucketC, bucketD];
  const targets = [
    Math.round(MAX_SESSION * 0.3),   // 12 para A (nuevos)
    Math.round(MAX_SESSION * 0.2),   // 8 para B_urgent (relearn/difíciles)
    Math.round(MAX_SESSION * 0.2),   // 8 para B_normal (due normal)
    Math.round(MAX_SESSION * 0.2),   // 8 para C (liked)
    MAX_SESSION - Math.round(MAX_SESSION * 0.3) - Math.round(MAX_SESSION * 0.2) - Math.round(MAX_SESSION * 0.2) - Math.round(MAX_SESSION * 0.2), // 4 para D
  ];

  const taken: Drop[][] = [[], [], [], [], []];
  let remaining = MAX_SESSION;

  // Primera pasada: tomar hasta el target de cada bucket
  for (let i = 0; i < buckets.length; i++) {
    const take = Math.min(targets[i], buckets[i].length, remaining);
    taken[i] = buckets[i].slice(0, take);
    remaining -= take;
  }

  // Segunda pasada: si sobran slots, redistribuir desde los buckets que tengan más
  if (remaining > 0) {
    for (let i = 0; i < buckets.length && remaining > 0; i++) {
      const alreadyTaken = taken[i].length;
      const available = buckets[i].length - alreadyTaken;
      if (available > 0) {
        const extra = Math.min(available, remaining);
        taken[i] = [...taken[i], ...buckets[i].slice(alreadyTaken, alreadyTaken + extra)];
        remaining -= extra;
      }
    }
  }

  const selected = taken.flat();
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
