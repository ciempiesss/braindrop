import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from 'react';
import type { Drop, Collection } from '@/types';
import { SAMPLE_DROPS, SAMPLE_COLLECTIONS } from '@/data/seed';
import { generateId } from '@/lib/utils';

interface BrainDropContextType {
  drops: Drop[];
  collections: Collection[];
  addDrop: (drop: Omit<Drop, 'id' | 'createdAt' | 'updatedAt' | 'interval' | 'repetitionCount' | 'easeFactor' | 'nextReviewDate' | 'status'>) => void;
  updateDrop: (id: string, updates: Partial<Drop>) => void;
  deleteDrop: (id: string) => void;
  addCollection: (collection: Omit<Collection, 'id' | 'createdAt' | 'dropCount'>) => void;
  getDropsForReview: () => Drop[];
  reviewDrop: (id: string, quality: number) => void;
  searchDrops: (query: string) => Drop[];
  filterDrops: (type?: string, collectionId?: string, tag?: string) => Drop[];
}

const BrainDropContext = createContext<BrainDropContextType | undefined>(undefined);

// Keys
const KEY_DROPS = 'bd_drops';
const KEY_COLLECTIONS = 'bd_collections';
const KEY_USER_DROPS = 'bd_user_drops';
const KEY_HASH = 'bd_data_hash';

// Generate hash from seed data
function generateDataHash(data: unknown): string {
  const str = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

const SEED_HASH = generateDataHash({ drops: SAMPLE_DROPS, collections: SAMPLE_COLLECTIONS });

// Safe localStorage wrapper
function getItem<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
  } catch { }
  return fallback;
}

function setItem(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('Storage error:', e);
  }
}

export function BrainDropProvider({ children }: { children: ReactNode }) {
  // Check if seed data changed - if so, merge with user data
  const initialDrops = useMemo(() => {
    const storedHash = getItem<string>(KEY_HASH, '');
    const userDrops = getItem<Drop[]>(KEY_USER_DROPS, []);
    
    // If seed changed, merge user drops with new seed
    if (storedHash !== SEED_HASH) {
      const userIds = new Set(userDrops.map(d => d.id));
      const newDrops = SAMPLE_DROPS.filter(d => !userIds.has(d.id));
      const merged = [...newDrops, ...userDrops];
      setItem(KEY_DROPS, merged);
      setItem(KEY_HASH, SEED_HASH);
      return merged;
    }
    
    return getItem<Drop[]>(KEY_DROPS, SAMPLE_DROPS);
  }, []);

  const [drops, setDrops] = useState<Drop[]>(initialDrops);

  const initialCollections = useMemo(() => {
    return getItem<Collection[]>(KEY_COLLECTIONS, SAMPLE_COLLECTIONS);
  }, []);

  const [collections, setCollections] = useState<Collection[]>(initialCollections);

  // Persist on change
  useEffect(() => {
    setItem(KEY_DROPS, drops);
    // Save user-created drops separately for merging
    const userDrops = drops.filter(d => !d.id.startsWith('q') && !d.id.match(/^\d+$/));
    setItem(KEY_USER_DROPS, userDrops);
  }, [drops]);

  useEffect(() => {
    setItem(KEY_COLLECTIONS, collections);
  }, [collections]);

  const addDrop: BrainDropContextType['addDrop'] = (dropData) => {
    const newDrop: Drop = {
      ...dropData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      interval: 1,
      repetitionCount: 0,
      easeFactor: 2.5,
      nextReviewDate: new Date().toISOString(),
      status: 'new',
    };
    setDrops((prev) => [newDrop, ...prev]);
  };

  const updateDrop: BrainDropContextType['updateDrop'] = (id, updates) => {
    setDrops((prev) =>
      prev.map((drop) =>
        drop.id === id ? { ...drop, ...updates, updatedAt: new Date().toISOString() } : drop
      )
    );
  };

  const deleteDrop: BrainDropContextType['deleteDrop'] = (id) => {
    setDrops((prev) => prev.filter((drop) => drop.id !== id));
  };

  const addCollection: BrainDropContextType['addCollection'] = (collectionData) => {
    const newCollection: Collection = {
      ...collectionData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      dropCount: 0,
    };
    setCollections((prev) => [...prev, newCollection]);
  };

  const dropsForReview = useMemo(() => {
    const now = new Date();
    return drops.filter((drop) => new Date(drop.nextReviewDate) <= now);
  }, [drops]);

  const getDropsForReview: BrainDropContextType['getDropsForReview'] = () => {
    return dropsForReview;
  };

  const reviewDrop: BrainDropContextType['reviewDrop'] = (id, quality) => {
    setDrops((prev) =>
      prev.map((drop) => {
        if (drop.id !== id) return drop;

        let { interval, easeFactor, status } = drop;

        if (quality < 3) {
          status = 'relearn';
          interval = 1;
        } else {
          if (status === 'new') {
            status = 'learning';
            interval = 1;
          } else if (status === 'learning') {
            interval = 6;
            status = 'review';
          } else {
            interval = Math.round(interval * easeFactor);
          }

          easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
          easeFactor = Math.max(1.3, easeFactor);
        }

        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + interval);

        return {
          ...drop,
          interval,
          easeFactor,
          status,
          nextReviewDate: nextDate.toISOString(),
          lastReviewDate: new Date().toISOString(),
          repetitionCount: drop.repetitionCount + 1,
        };
      })
    );
  };

  const searchDrops: BrainDropContextType['searchDrops'] = (query) => {
    const lowerQuery = query.toLowerCase();
    return drops.filter(
      (drop) =>
        drop.title.toLowerCase().includes(lowerQuery) ||
        drop.content.toLowerCase().includes(lowerQuery) ||
        drop.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
  };

  const filterDrops: BrainDropContextType['filterDrops'] = (type, collectionId, tag) => {
    return drops.filter((drop) => {
      if (type && drop.type !== type) return false;
      if (collectionId && drop.collectionId !== collectionId) return false;
      if (tag && !drop.tags.includes(tag)) return false;
      return true;
    });
  };

  return (
    <BrainDropContext.Provider
      value={{
        drops,
        collections,
        addDrop,
        updateDrop,
        deleteDrop,
        addCollection,
        getDropsForReview,
        reviewDrop,
        searchDrops,
        filterDrops,
      }}
    >
      {children}
    </BrainDropContext.Provider>
  );
}

export function useBrainDrop() {
  const context = useContext(BrainDropContext);
  if (!context) {
    throw new Error('useBrainDrop must be used within BrainDropProvider');
  }
  return context;
}
