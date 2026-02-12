import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Drop, Collection } from '@/types';
import { SAMPLE_DROPS, SAMPLE_COLLECTIONS } from '@/data/seed';

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

const STORAGE_KEY_DROPS = 'braindrop_drops';
const STORAGE_KEY_COLLECTIONS = 'braindrop_collections';

export function BrainDropProvider({ children }: { children: ReactNode }) {
  const [drops, setDrops] = useState<Drop[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY_DROPS);
    if (stored) return JSON.parse(stored);
    return SAMPLE_DROPS;
  });

  const [collections, setCollections] = useState<Collection[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY_COLLECTIONS);
    if (stored) return JSON.parse(stored);
    return SAMPLE_COLLECTIONS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_DROPS, JSON.stringify(drops));
  }, [drops]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_COLLECTIONS, JSON.stringify(collections));
  }, [collections]);

  const addDrop: BrainDropContextType['addDrop'] = (dropData) => {
    const newDrop: Drop = {
      ...dropData,
      id: Math.random().toString(36).substring(2, 15),
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
      id: Math.random().toString(36).substring(2, 15),
      createdAt: new Date().toISOString(),
      dropCount: 0,
    };
    setCollections((prev) => [...prev, newCollection]);
  };

  const getDropsForReview: BrainDropContextType['getDropsForReview'] = () => {
    const now = new Date();
    return drops.filter((drop) => new Date(drop.nextReviewDate) <= now);
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
