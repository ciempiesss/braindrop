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

function uniqueById(drops: Drop[]): Drop[] {
  const seen = new Set<string>();
  return drops.filter((drop) => {
    if (seen.has(drop.id)) return false;
    seen.add(drop.id);
    return true;
  });
}

interface PreferenceProfile {
  typeAffinity: Record<Drop['type'], number>;
  subcategoryAffinity: Record<string, number>;
}

function buildPreferenceProfile(
  pool: Drop[],
  preferences: Record<string, 'like' | 'dislike'>
): PreferenceProfile {
  const typeAffinity: PreferenceProfile['typeAffinity'] = {
    definition: 0,
    ruptura: 0,
    puente: 0,
    operativo: 0,
    code: 0,
  };
  const subcategoryAffinity: PreferenceProfile['subcategoryAffinity'] = {};

  const byId = new Map(pool.map((drop) => [drop.id, drop]));

  for (const [dropId, pref] of Object.entries(preferences)) {
    const drop = byId.get(dropId);
    if (!drop) continue;
    const delta = pref === 'like' ? 1 : -1;
    typeAffinity[drop.type] += delta;
    if (drop.tags[0]) {
      subcategoryAffinity[drop.tags[0]] = (subcategoryAffinity[drop.tags[0]] || 0) + delta;
    }
  }

  return { typeAffinity, subcategoryAffinity };
}

function preferenceScore(
  drop: Drop,
  preferences: Record<string, 'like' | 'dislike'>,
  profile: PreferenceProfile
): number {
  if (preferences[drop.id] === 'dislike') return -999;

  let score = 0;
  if (preferences[drop.id] === 'like') score += 12;
  score += (profile.typeAffinity[drop.type] || 0) * 1.4;
  if (drop.tags[0]) {
    score += (profile.subcategoryAffinity[drop.tags[0]] || 0) * 1.1;
  }
  if (drop.viewed !== true) score += 2.5;
  return score;
}

function rankByPreference(
  drops: Drop[],
  preferences: Record<string, 'like' | 'dislike'>,
  profile: PreferenceProfile,
  seed: number
): Drop[] {
  const rand = lcgRand(seed);
  return [...drops]
    .map((drop) => ({
      drop,
      score: preferenceScore(drop, preferences, profile) + rand() * 0.15,
    }))
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.drop);
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
  const prefs = preferences ?? {};
  let pool = drops;
  if (selectedTag) {
    pool = pool.filter((drop) => drop.tags.includes(selectedTag));
  }
  if (visibleCollections && visibleCollections.length > 0) {
    pool = pool.filter((drop) => drop.collectionId && visibleCollections.includes(drop.collectionId));
  }
  const profile = buildPreferenceProfile(pool, prefs);

  const isUserDrop = (drop: Drop) => (seedIds ? !seedIds.has(drop.id) : false);

  const bucketAAll = pool.filter((drop) => drop.viewed !== true);
  const bucketAUser = seededShuffle(bucketAAll.filter((drop) => isUserDrop(drop)), seed).slice(0, 3);
  const userBoostIds = new Set(bucketAUser.map((drop) => drop.id));
  const bucketARest = seededShuffle(bucketAAll.filter((drop) => !userBoostIds.has(drop.id)), seed);
  const bucketA = [...bucketAUser, ...bucketARest];

  const bucketB = rankByPreference(
    pool.filter((drop) => prefs[drop.id] === 'like'),
    prefs,
    profile,
    seed + 1
  );

  const bucketAIds = new Set(bucketA.map((drop) => drop.id));
  const bucketBIds = new Set(bucketB.map((drop) => drop.id));

  const bucketC = rankByPreference(
    pool.filter(
      (drop) =>
        drop.viewed === true &&
        prefs[drop.id] !== 'dislike' &&
        !bucketAIds.has(drop.id) &&
        !bucketBIds.has(drop.id)
    ),
    prefs,
    profile,
    seed + 2
  );

  const usedIds = new Set([...bucketAIds, ...bucketBIds, ...bucketC.map((drop) => drop.id)]);
  const bucketDPrimary = rankByPreference(
    pool.filter((drop) => prefs[drop.id] === 'dislike' && !usedIds.has(drop.id)),
    prefs,
    profile,
    seed + 3
  );

  const usedWithDisliked = new Set([...usedIds, ...bucketDPrimary.map((drop) => drop.id)]);
  const bucketD = rankByPreference(
    pool.filter((drop) => !usedWithDisliked.has(drop.id)),
    prefs,
    profile,
    seed + 4
  );

  const ordered = interleaveBuckets([bucketA, bucketB, bucketC, bucketD, bucketDPrimary]);
  return uniqueById(diversify(ordered));
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
