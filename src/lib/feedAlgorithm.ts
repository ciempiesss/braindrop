import type { Drop } from '@/types';

function lcgRand(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

export function seededShuffle<T>(array: T[], seed: number): T[] {
  const clone = [...array];
  const rand = lcgRand(seed);

  for (let index = clone.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(rand() * (index + 1));
    [clone[index], clone[swapIndex]] = [clone[swapIndex], clone[index]];
  }

  return clone;
}

function interleaveBuckets(buckets: Drop[][]): Drop[] {
  const result: Drop[] = [];
  const indices = buckets.map(() => 0);
  const weights = [3, 2, 2, 2, 1];
  const total = buckets.reduce((sum, bucket) => sum + bucket.length, 0);

  while (result.length < total) {
    let added = 0;

    for (let bucketIndex = 0; bucketIndex < buckets.length; bucketIndex += 1) {
      const count = Math.min(weights[bucketIndex], buckets[bucketIndex].length - indices[bucketIndex]);
      for (let itemIndex = 0; itemIndex < count; itemIndex += 1) {
        result.push(buckets[bucketIndex][indices[bucketIndex]]);
        indices[bucketIndex] += 1;
        added += 1;
      }
    }

    if (added === 0) break;
  }

  return result;
}

function diversify(drops: Drop[]): Drop[] {
  const result: Drop[] = [];
  const deferred: Drop[] = [];
  let lastType = '';
  let sameTypeCount = 0;

  for (const drop of drops) {
    if (drop.type === lastType && sameTypeCount >= 3) {
      deferred.push(drop);
      continue;
    }

    result.push(drop);
    if (drop.type === lastType) {
      sameTypeCount += 1;
    } else {
      lastType = drop.type;
      sameTypeCount = 1;
    }
  }

  return [...result, ...deferred];
}

export const SESSION_SIZE = 15;
export const PAGE_SIZE = 10;
export const MAX_SESSION = 40;

export function buildSessionPool(
  drops: Drop[],
  seed: number,
  selectedTag?: string | null,
  visibleCollections?: string[],
  seedIds?: Set<string>,
  preferences?: Record<string, 'like' | 'dislike'>
): Drop[] {
  let pool = drops;
  if (selectedTag) {
    pool = pool.filter((drop) => drop.tags.includes(selectedTag));
  }
  if (visibleCollections && visibleCollections.length > 0) {
    pool = pool.filter((drop) => drop.collectionId && visibleCollections.includes(drop.collectionId));
  }

  const isUserDrop = (drop: Drop) => (seedIds ? !seedIds.has(drop.id) : false);

  const bucketAAll = pool.filter((drop) => drop.viewed !== true);
  const bucketAUser = seededShuffle(bucketAAll.filter((drop) => isUserDrop(drop)), seed).slice(0, 3);
  const userBoostIds = new Set(bucketAUser.map((drop) => drop.id));
  const bucketARest = seededShuffle(bucketAAll.filter((drop) => !userBoostIds.has(drop.id)), seed);
  const bucketA = [...bucketAUser, ...bucketARest];

  const prefs = preferences ?? {};
  const bucketB = seededShuffle(
    pool.filter((drop) => prefs[drop.id] === 'like'),
    seed + 1
  );

  const bucketAIds = new Set(bucketA.map((drop) => drop.id));
  const bucketBIds = new Set(bucketB.map((drop) => drop.id));

  const bucketC = seededShuffle(
    pool.filter(
      (drop) =>
        drop.viewed === true &&
        prefs[drop.id] !== 'dislike' &&
        !bucketAIds.has(drop.id) &&
        !bucketBIds.has(drop.id)
    ),
    seed + 2
  );

  const usedIds = new Set([...bucketAIds, ...bucketBIds, ...bucketC.map((drop) => drop.id)]);
  const bucketDPrimary = seededShuffle(
    pool.filter((drop) => prefs[drop.id] === 'dislike' && !usedIds.has(drop.id)),
    seed + 3
  );

  const usedWithDisliked = new Set([...usedIds, ...bucketDPrimary.map((drop) => drop.id)]);
  const bucketD = seededShuffle(
    pool.filter((drop) => !usedWithDisliked.has(drop.id)),
    seed + 4
  );

  const ordered = interleaveBuckets([bucketA, bucketB, bucketC, bucketD, bucketDPrimary]);
  return diversify(ordered);
}

export function getSessionStats(
  drops: Drop[],
  preferences?: Record<string, 'like' | 'dislike'>
): { unseen: number; liked: number; disliked: number } {
  const prefs = preferences ?? {};
  return {
    unseen: drops.filter((drop) => drop.viewed !== true).length,
    liked: Object.values(prefs).filter((value) => value === 'like').length,
    disliked: Object.values(prefs).filter((value) => value === 'dislike').length,
  };
}
