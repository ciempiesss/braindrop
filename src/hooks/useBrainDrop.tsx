import { createContext, useContext, useState, useEffect, useMemo, useCallback, type ReactNode } from 'react';
import type { Drop, Collection } from '@/types';
import { SAMPLE_DROPS, SAMPLE_COLLECTIONS } from '@/data/seed';
import { generateId } from '@/lib/utils';
import { supabase, dbToDrop, dropToDb, dbToCollection, collectionToDb } from '@/lib/supabase';

interface Streak {
  lastDate: string;
  count: number;
  record: number;
}

interface BrainDropContextType {
  drops: Drop[];
  collections: Collection[];
  loading: boolean;
  addDrop: (drop: Omit<Drop, 'id' | 'createdAt' | 'updatedAt' | 'interval' | 'repetitionCount' | 'easeFactor' | 'nextReviewDate' | 'status'>) => Promise<void>;
  updateDrop: (id: string, updates: Partial<Drop>) => Promise<void>;
  deleteDrop: (id: string) => Promise<void>;
  addCollection: (collection: Omit<Collection, 'id' | 'createdAt' | 'dropCount'>) => Promise<void>;
  getDropsForReview: () => Drop[];
  reviewDrop: (id: string, quality: number) => Promise<void>;
  searchDrops: (query: string) => Drop[];
  filterDrops: (type?: string, collectionId?: string, tag?: string) => Drop[];
  toggleLike: (id: string) => Promise<void>;
  markAsViewed: (id: string) => Promise<void>;
  streak: Streak;
  isUserDrop: (id: string) => boolean;
  seedIds: Set<string>;
}

const BrainDropContext = createContext<BrainDropContextType | undefined>(undefined);

// ─── Streak (localStorage) ────────────────────────────────────────────────────

const KEY_STREAK = 'braindrop_streak';

function loadStreak(): Streak {
  try {
    const stored = localStorage.getItem(KEY_STREAK);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return { lastDate: '', count: 0, record: 0 };
}

function bumpStreak(): void {
  const today = new Date().toDateString();
  const stored = loadStreak();
  if (stored.lastDate === today) return;
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const newCount = stored.lastDate === yesterday ? stored.count + 1 : 1;
  try {
    localStorage.setItem(KEY_STREAK, JSON.stringify({
      lastDate: today, count: newCount, record: Math.max(newCount, stored.record)
    }));
  } catch { /* ignore */ }
}

// ─── Seed inicial ─────────────────────────────────────────────────────────────

const SEED_IDS = new Set(SAMPLE_DROPS.map(d => d.id));

async function seedInitialData(): Promise<void> {
  // Migrar drops de usuario desde localStorage si los hay
  let localUserDrops: Drop[] = [];
  try {
    const stored = localStorage.getItem('bd_user_drops');
    if (stored) {
      const parsed: Drop[] = JSON.parse(stored);
      localUserDrops = parsed.filter(d => !SEED_IDS.has(d.id));
    }
  } catch { /* ignore */ }

  const colRows = SAMPLE_COLLECTIONS.map(c => collectionToDb(c));
  await supabase.from('collections').upsert(colRows);

  const allDrops = [...SAMPLE_DROPS, ...localUserDrops];
  for (let i = 0; i < allDrops.length; i += 50) {
    await supabase.from('drops').upsert(allDrops.slice(i, i + 50).map(dropToDb));
  }

  // Limpiar localStorage
  ['bd_user_drops', 'bd_drops', 'bd_collections', 'bd_data_hash'].forEach(k => {
    try { localStorage.removeItem(k); } catch { /* ignore */ }
  });
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function BrainDropProvider({ children }: { children: ReactNode }) {
  const [drops, setDrops] = useState<Drop[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);

      const [dropsRes, colsRes] = await Promise.all([
        supabase.from('drops').select('*').order('created_at', { ascending: false }),
        supabase.from('collections').select('*'),
      ]);

      if (cancelled) return;

      if (dropsRes.error || colsRes.error) {
        console.error('Error cargando datos:', dropsRes.error || colsRes.error);
        setLoading(false);
        return;
      }

      if (dropsRes.data.length === 0) {
        await seedInitialData();
        if (cancelled) return;
        const [d2, c2] = await Promise.all([
          supabase.from('drops').select('*').order('created_at', { ascending: false }),
          supabase.from('collections').select('*'),
        ]);
        if (!cancelled) {
          setDrops((d2.data || []).map(dbToDrop));
          setCollections((c2.data || []).map(dbToCollection));
        }
      } else {
        setDrops(dropsRes.data.map(dbToDrop));
        setCollections(colsRes.data.map(dbToCollection));
      }

      if (!cancelled) setLoading(false);
    }

    loadData();
    return () => { cancelled = true; };
  }, []);

  const collectionsWithCount = useMemo(() => {
    const counts: Record<string, number> = {};
    drops.forEach(d => { if (d.collectionId) counts[d.collectionId] = (counts[d.collectionId] || 0) + 1; });
    return collections.map(c => ({ ...c, dropCount: counts[c.id] || 0 }));
  }, [drops, collections]);

  const streak = useMemo(() => loadStreak(), [drops]);
  const seedIdsSet = useMemo(() => SEED_IDS, []);
  const isUserDrop = useCallback((id: string) => !seedIdsSet.has(id), [seedIdsSet]);

  // ─── CRUD ─────────────────────────────────────────────────────────────────

  const addDrop: BrainDropContextType['addDrop'] = useCallback(async (dropData) => {
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
    setDrops(prev => [newDrop, ...prev]);
    await supabase.from('drops').insert(dropToDb(newDrop));
  }, []);

  const updateDrop: BrainDropContextType['updateDrop'] = useCallback(async (id, updates) => {
    const updatedAt = new Date().toISOString();
    setDrops(prev => prev.map(d => d.id === id ? { ...d, ...updates, updatedAt } : d));

    // Convertir keys camelCase a snake_case para Supabase
    const dbUpdates: Record<string, unknown> = { updated_at: updatedAt };
    const keyMap: Record<string, string> = {
      collectionId: 'collection_id', codeSnippet: 'code_snippet',
      imageUrl: 'image_url', visualContent: 'visual_content',
      visualType: 'visual_type', visualData: 'visual_data',
      repetitionCount: 'repetition_count', easeFactor: 'ease_factor',
      nextReviewDate: 'next_review_date', lastReviewDate: 'last_review_date',
      interval: 'interval_days',
    };
    for (const [k, v] of Object.entries(updates)) {
      dbUpdates[keyMap[k] ?? k] = v;
    }
    await supabase.from('drops').update(dbUpdates).eq('id', id);
  }, []);

  const deleteDrop: BrainDropContextType['deleteDrop'] = useCallback(async (id) => {
    setDrops(prev => prev.filter(d => d.id !== id));
    await supabase.from('drops').delete().eq('id', id);
  }, []);

  const addCollection: BrainDropContextType['addCollection'] = useCallback(async (collectionData) => {
    const newCol: Collection = {
      ...collectionData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      dropCount: 0,
    };
    setCollections(prev => [...prev, newCol]);
    await supabase.from('collections').insert(collectionToDb(newCol));
  }, []);

  // ─── Review / SM-2 ───────────────────────────────────────────────────────

  const getDropsForReview: BrainDropContextType['getDropsForReview'] = useCallback(() => {
    const now = new Date();
    return drops.filter(d => d.viewed === true && new Date(d.nextReviewDate) <= now);
  }, [drops]);

  const reviewDrop: BrainDropContextType['reviewDrop'] = useCallback(async (id, quality) => {
    bumpStreak();
    let updatedDrop: Drop | null = null;

    setDrops(prev => prev.map(drop => {
      if (drop.id !== id) return drop;
      let { interval, easeFactor, status } = drop;

      if (quality < 3) {
        status = 'relearn'; interval = 1;
      } else {
        if (status === 'new') { status = 'learning'; interval = 1; }
        else if (status === 'learning') { interval = 6; status = 'review'; }
        else { interval = Math.round(interval * easeFactor); }
        easeFactor = Math.max(1.3, easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
      }

      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + interval);
      updatedDrop = {
        ...drop, interval, easeFactor, status,
        nextReviewDate: nextDate.toISOString(),
        lastReviewDate: new Date().toISOString(),
        repetitionCount: drop.repetitionCount + 1,
      };
      return updatedDrop;
    }));

    if (updatedDrop) {
      const d = updatedDrop as Drop;
      await supabase.from('drops').update({
        interval_days: d.interval,
        ease_factor: d.easeFactor,
        status: d.status,
        next_review_date: d.nextReviewDate,
        last_review_date: d.lastReviewDate,
        repetition_count: d.repetitionCount,
        updated_at: new Date().toISOString(),
      }).eq('id', id);
    }
  }, [drops]);

  const searchDrops: BrainDropContextType['searchDrops'] = useCallback((query) => {
    const q = query.toLowerCase();
    return drops.filter(d =>
      d.title.toLowerCase().includes(q) ||
      d.content.toLowerCase().includes(q) ||
      d.tags.some(t => t.toLowerCase().includes(q))
    );
  }, [drops]);

  const filterDrops: BrainDropContextType['filterDrops'] = useCallback((type, collectionId, tag) => {
    return drops.filter(d => {
      if (type && d.type !== type) return false;
      if (collectionId && d.collectionId !== collectionId) return false;
      if (tag && !d.tags.includes(tag)) return false;
      return true;
    });
  }, [drops]);

  const toggleLike: BrainDropContextType['toggleLike'] = useCallback(async (id) => {
    let newLiked = false;
    setDrops(prev => prev.map(d => {
      if (d.id !== id) return d;
      newLiked = !d.liked;
      return { ...d, liked: newLiked };
    }));
    await supabase.from('drops').update({ liked: newLiked }).eq('id', id);
  }, []);

  const markAsViewed: BrainDropContextType['markAsViewed'] = useCallback(async (id) => {
    const drop = drops.find(d => d.id === id);
    if (!drop || drop.viewed) return;
    bumpStreak();
    setDrops(prev => prev.map(d => d.id === id ? { ...d, viewed: true } : d));
    await supabase.from('drops').update({ viewed: true }).eq('id', id);
  }, [drops]);

  return (
    <BrainDropContext.Provider value={{
      drops, collections: collectionsWithCount, loading,
      addDrop, updateDrop, deleteDrop, addCollection,
      getDropsForReview, reviewDrop,
      searchDrops, filterDrops,
      toggleLike, markAsViewed,
      streak, isUserDrop, seedIds: seedIdsSet,
    }}>
      {children}
    </BrainDropContext.Provider>
  );
}

export function useBrainDrop() {
  const context = useContext(BrainDropContext);
  if (!context) throw new Error('useBrainDrop must be used within BrainDropProvider');
  return context;
}
