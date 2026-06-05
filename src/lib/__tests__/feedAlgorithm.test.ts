import { describe, it, expect } from 'vitest';
import {
  buildSessionPool,
  seededShuffle,
  getSessionStats,
  SESSION_SIZE,
  PAGE_SIZE,
  MAX_SESSION,
} from '@/lib/feedAlgorithm';
import type { Drop } from '@/types';

function makeDrop(overrides: Partial<Drop> = {}): Drop {
  return {
    id: crypto.randomUUID(),
    title: 'Test Drop',
    content: 'Test content',
    type: 'definition',
    tags: ['testing', 'vitest'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interval: 1,
    repetitionCount: 0,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    status: 'new',
    viewed: false,
    ...overrides,
  };
}

describe('seededShuffle', () => {
  it('should return array of same length', () => {
    const input = [1, 2, 3, 4, 5];
    const result = seededShuffle(input, 42);
    expect(result).toHaveLength(input.length);
  });

  it('should contain all original elements', () => {
    const input = [1, 2, 3, 4, 5];
    const result = seededShuffle(input, 42);
    expect(result.sort()).toEqual(input.sort());
  });

  it('should be deterministic with same seed', () => {
    const input = [1, 2, 3, 4, 5];
    const result1 = seededShuffle(input, 999);
    const result2 = seededShuffle(input, 999);
    expect(result1).toEqual(result2);
  });

  it('should produce different order with different seeds', () => {
    const input = Array.from({ length: 20 }, (_, i) => i);
    const result1 = seededShuffle(input, 1);
    const result2 = seededShuffle(input, 2);
    expect(result1).not.toEqual(result2);
  });

  it('should handle empty array', () => {
    const result = seededShuffle([], 42);
    expect(result).toHaveLength(0);
  });

  it('should not mutate the original array', () => {
    const input = [1, 2, 3];
    const copy = [...input];
    seededShuffle(input, 42);
    expect(input).toEqual(copy);
  });
});

describe('buildSessionPool', () => {
  it('should return all drops after interleaving (no truncation)', () => {
    const drops = Array.from({ length: 50 }, () => makeDrop());
    const pool = buildSessionPool(drops, 12345);
    expect(pool.length).toBe(drops.length);
  });

  it('should handle empty drops array', () => {
    const pool = buildSessionPool([], 12345);
    expect(pool).toHaveLength(0);
  });

  it('should return same results with same seed', () => {
    const drops = Array.from({ length: 30 }, (_, i) =>
      makeDrop({ id: `drop-${i}`, title: `Drop ${i}` })
    );
    const pool1 = buildSessionPool(drops, 12345);
    const pool2 = buildSessionPool(drops, 12345);
    expect(pool1.map((d) => d.id)).toEqual(pool2.map((d) => d.id));
  });

  it('should filter by tag when provided', () => {
    const drops = [
      makeDrop({ id: 'a', tags: ['react'], title: 'React Drop' }),
      makeDrop({ id: 'b', tags: ['vue'], title: 'Vue Drop' }),
      makeDrop({ id: 'c', tags: ['react', 'hooks'], title: 'React Hooks' }),
    ];
    const pool = buildSessionPool(drops, 12345, 'react');
    expect(pool.every((d) => d.tags.includes('react'))).toBe(true);
  });

  it('should filter by visibleCollections when provided', () => {
    const drops = [
      makeDrop({ id: 'a', collectionId: 'col-a', tags: ['test'] }),
      makeDrop({ id: 'b', collectionId: 'col-b', tags: ['test'] }),
      makeDrop({ id: 'c', collectionId: 'col-a', tags: ['test'] }),
    ];
    const pool = buildSessionPool(drops, 12345, undefined, ['col-a']);
    expect(pool.every((d) => d.collectionId === 'col-a')).toBe(true);
  });

  it('should exclude disliked drops from unsorted buckets', () => {
    const liked = makeDrop({ id: 'liked', title: 'Liked', viewed: true, createdAt: '2025-06-01T00:00:00.000Z' });
    const disliked = makeDrop({ id: 'disliked', title: 'Disliked', viewed: true, createdAt: '2025-06-02T00:00:00.000Z' });
    const neutral = makeDrop({ id: 'neutral', title: 'Neutral', viewed: true, createdAt: '2025-06-03T00:00:00.000Z' });
    const preferences = { liked: 'like' as const, disliked: 'dislike' as const };
    const pool = buildSessionPool([liked, neutral, disliked], 12345, undefined, [], new Set(), preferences);
    expect(pool.map((d) => d.id)).toContain('liked');
    expect(pool.map((d) => d.id)).toContain('disliked');
    expect(pool.map((d) => d.id)).toContain('neutral');
  });

  it('should not produce duplicates', () => {
    const drops = Array.from({ length: 100 }, (_, i) =>
      makeDrop({ id: `drop-${i}` })
    );
    const pool = buildSessionPool(drops, 42);
    const ids = pool.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('getSessionStats', () => {
  it('should count unseen drops', () => {
    const drops = [
      makeDrop({ id: 'a', viewed: false }),
      makeDrop({ id: 'b', viewed: false }),
      makeDrop({ id: 'c', viewed: true }),
    ];
    const stats = getSessionStats(drops);
    expect(stats.unseen).toBe(2);
  });

  it('should count liked and disliked from preferences', () => {
    const drops = [makeDrop({ id: 'a' }), makeDrop({ id: 'b' }), makeDrop({ id: 'c' })];
    const stats = getSessionStats(drops, { a: 'like', b: 'dislike', c: 'like' });
    expect(stats.liked).toBe(2);
    expect(stats.disliked).toBe(1);
  });

  it('should return zeros for empty input', () => {
    const stats = getSessionStats([]);
    expect(stats.unseen).toBe(0);
    expect(stats.liked).toBe(0);
    expect(stats.disliked).toBe(0);
  });
});

describe('constants', () => {
  it('SESSION_SIZE should be positive', () => {
    expect(SESSION_SIZE).toBeGreaterThan(0);
  });

  it('PAGE_SIZE should be positive', () => {
    expect(PAGE_SIZE).toBeGreaterThan(0);
  });

  it('MAX_SESSION should be greater than SESSION_SIZE', () => {
    expect(MAX_SESSION).toBeGreaterThan(SESSION_SIZE);
  });
});
