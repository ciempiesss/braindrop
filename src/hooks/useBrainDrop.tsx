/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useMemo, useCallback, type ReactNode } from 'react';
import type { Drop, Collection, DropType } from '@/types';
import { SAMPLE_DROPS, SAMPLE_COLLECTIONS } from '@/data/seed';
import { generateId } from '@/lib/utils';
import { supabase, dbToDrop, dropToDb, dbToCollection, collectionToDb } from '@/lib/supabase';

type DropPreference = 'like' | 'dislike';

interface PreferenceEvent {
  dropId: string;
  value: DropPreference | null;
  type: DropType;
  tags: string[];
  timestamp: string;
}

interface PreferenceStats {
  totalRated: number;
  totalLikes: number;
  totalDislikes: number;
  likeRate: number;
  byType: Record<DropType, { likes: number; dislikes: number }>;
  topLikedTags: Array<{ tag: string; count: number }>;
  topDislikedTags: Array<{ tag: string; count: number }>;
  recentEvents: PreferenceEvent[];
}

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
  searchDrops: (query: string) => Drop[];
  filterDrops: (type?: string, collectionId?: string, tag?: string) => Drop[];
  toggleLike: (id: string) => Promise<void>;
  markAsViewed: (id: string) => Promise<void>;
  setDropPreference: (id: string, value: DropPreference | null) => void;
  dropPreferences: Record<string, DropPreference>;
  preferenceStats: PreferenceStats;
  streak: Streak;
  isUserDrop: (id: string) => boolean;
  seedIds: Set<string>;
}

const BrainDropContext = createContext<BrainDropContextType | undefined>(undefined);

const KEY_STREAK = 'braindrop_streak';
const KEY_PREFERENCES = 'braindrop_drop_preferences_v1';
const KEY_PREFERENCE_EVENTS = 'braindrop_drop_preference_events_v1';

function loadStreak(): Streak {
  try {
    const stored = localStorage.getItem(KEY_STREAK);
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore
  }
  return { lastDate: '', count: 0, record: 0 };
}

function bumpStreak(): void {
  const today = new Date().toDateString();
  const stored = loadStreak();
  if (stored.lastDate === today) return;
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const newCount = stored.lastDate === yesterday ? stored.count + 1 : 1;
  try {
    localStorage.setItem(
      KEY_STREAK,
      JSON.stringify({
        lastDate: today,
        count: newCount,
        record: Math.max(newCount, stored.record),
      })
    );
  } catch {
    // ignore
  }
}

function loadDropPreferences(): Record<string, DropPreference> {
  try {
    const stored = localStorage.getItem(KEY_PREFERENCES);
    if (!stored) return {};
    const parsed = JSON.parse(stored) as Record<string, DropPreference>;
    return parsed ?? {};
  } catch {
    return {};
  }
}

function loadPreferenceEvents(): PreferenceEvent[] {
  try {
    const stored = localStorage.getItem(KEY_PREFERENCE_EVENTS);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as PreferenceEvent[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistDropPreferences(preferences: Record<string, DropPreference>): void {
  try {
    localStorage.setItem(KEY_PREFERENCES, JSON.stringify(preferences));
  } catch {
    // ignore
  }
}

function persistPreferenceEvents(events: PreferenceEvent[]): void {
  try {
    localStorage.setItem(KEY_PREFERENCE_EVENTS, JSON.stringify(events.slice(-800)));
  } catch {
    // ignore
  }
}

const SEED_IDS = new Set(SAMPLE_DROPS.map((drop) => drop.id));

async function seedInitialData(): Promise<void> {
  let localUserDrops: Drop[] = [];
  try {
    const stored = localStorage.getItem('bd_user_drops');
    if (stored) {
      const parsed: Drop[] = JSON.parse(stored);
      localUserDrops = parsed.filter((drop) => !SEED_IDS.has(drop.id));
    }
  } catch {
    // ignore
  }

  const collectionRows = SAMPLE_COLLECTIONS.map((collection) => collectionToDb(collection));
  await supabase.from('collections').upsert(collectionRows);

  const allDrops = [...SAMPLE_DROPS, ...localUserDrops];
  for (let index = 0; index < allDrops.length; index += 50) {
    await supabase.from('drops').upsert(allDrops.slice(index, index + 50).map(dropToDb));
  }

  ['bd_user_drops', 'bd_drops', 'bd_collections', 'bd_data_hash'].forEach((key) => {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  });
}

export function BrainDropProvider({ children }: { children: ReactNode }) {
  const [drops, setDrops] = useState<Drop[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [dropPreferences, setDropPreferences] = useState<Record<string, DropPreference>>(() => loadDropPreferences());
  const [preferenceEvents, setPreferenceEvents] = useState<PreferenceEvent[]>(() => loadPreferenceEvents());

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
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    persistDropPreferences(dropPreferences);
  }, [dropPreferences]);

  useEffect(() => {
    persistPreferenceEvents(preferenceEvents);
  }, [preferenceEvents]);

  const collectionsWithCount = useMemo(() => {
    const counts: Record<string, number> = {};
    drops.forEach((drop) => {
      if (drop.collectionId) counts[drop.collectionId] = (counts[drop.collectionId] || 0) + 1;
    });
    return collections.map((collection) => ({ ...collection, dropCount: counts[collection.id] || 0 }));
  }, [drops, collections]);

  const streak = loadStreak();
  const seedIdsSet = useMemo(() => SEED_IDS, []);
  const isUserDrop = useCallback((id: string) => !seedIdsSet.has(id), [seedIdsSet]);

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
    setDrops((prev) => [newDrop, ...prev]);
    await supabase.from('drops').insert(dropToDb(newDrop));
  }, []);

  const updateDrop: BrainDropContextType['updateDrop'] = useCallback(async (id, updates) => {
    const updatedAt = new Date().toISOString();
    setDrops((prev) => prev.map((drop) => (drop.id === id ? { ...drop, ...updates, updatedAt } : drop)));

    const dbUpdates: Record<string, unknown> = { updated_at: updatedAt };
    const keyMap: Record<string, string> = {
      collectionId: 'collection_id',
      codeSnippet: 'code_snippet',
      imageUrl: 'image_url',
      visualContent: 'visual_content',
      visualType: 'visual_type',
      visualData: 'visual_data',
      repetitionCount: 'repetition_count',
      easeFactor: 'ease_factor',
      nextReviewDate: 'next_review_date',
      lastReviewDate: 'last_review_date',
      interval: 'interval_days',
    };

    for (const [key, value] of Object.entries(updates)) {
      dbUpdates[keyMap[key] ?? key] = value;
    }

    await supabase.from('drops').update(dbUpdates).eq('id', id);
  }, []);

  const deleteDrop: BrainDropContextType['deleteDrop'] = useCallback(async (id) => {
    setDrops((prev) => prev.filter((drop) => drop.id !== id));
    setDropPreferences((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setPreferenceEvents((prev) => prev.filter((event) => event.dropId !== id));
    await supabase.from('drops').delete().eq('id', id);
  }, []);

  const addCollection: BrainDropContextType['addCollection'] = useCallback(async (collectionData) => {
    const newCollection: Collection = {
      ...collectionData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      dropCount: 0,
    };
    setCollections((prev) => [...prev, newCollection]);
    await supabase.from('collections').insert(collectionToDb(newCollection));
  }, []);

  const searchDrops: BrainDropContextType['searchDrops'] = useCallback(
    (query) => {
      const normalized = query.toLowerCase();
      return drops.filter(
        (drop) =>
          drop.title.toLowerCase().includes(normalized) ||
          drop.content.toLowerCase().includes(normalized) ||
          drop.tags.some((tag) => tag.toLowerCase().includes(normalized))
      );
    },
    [drops]
  );

  const filterDrops: BrainDropContextType['filterDrops'] = useCallback(
    (type, collectionId, tag) => {
      return drops.filter((drop) => {
        if (type && drop.type !== type) return false;
        if (collectionId && drop.collectionId !== collectionId) return false;
        if (tag && !drop.tags.includes(tag)) return false;
        return true;
      });
    },
    [drops]
  );

  const toggleLike: BrainDropContextType['toggleLike'] = useCallback(async (id) => {
    let newLiked = false;
    setDrops((prev) =>
      prev.map((drop) => {
        if (drop.id !== id) return drop;
        newLiked = !drop.liked;
        return { ...drop, liked: newLiked };
      })
    );
    await supabase.from('drops').update({ liked: newLiked }).eq('id', id);
  }, []);

  const markAsViewed: BrainDropContextType['markAsViewed'] = useCallback(
    async (id) => {
      const drop = drops.find((candidate) => candidate.id === id);
      if (!drop || drop.viewed) return;
      bumpStreak();
      const nowIso = new Date().toISOString();
      setDrops((prev) =>
        prev.map((candidate) =>
          candidate.id === id ? { ...candidate, viewed: true, lastReviewDate: nowIso } : candidate
        )
      );
      await supabase.from('drops').update({ viewed: true, last_review_date: nowIso }).eq('id', id);
    },
    [drops]
  );

  const setDropPreference: BrainDropContextType['setDropPreference'] = useCallback(
    (id, value) => {
      const drop = drops.find((candidate) => candidate.id === id);
      if (!drop) return;

      setDropPreferences((prev) => {
        const next = { ...prev };
        if (value === null) {
          delete next[id];
        } else {
          next[id] = value;
        }
        return next;
      });

      setPreferenceEvents((prev) => [
        ...prev,
        {
          dropId: id,
          value,
          type: drop.type,
          tags: drop.tags,
          timestamp: new Date().toISOString(),
        },
      ]);
    },
    [drops]
  );

  const preferenceStats = useMemo<PreferenceStats>(() => {
    const byType: PreferenceStats['byType'] = {
      definition: { likes: 0, dislikes: 0 },
      ruptura: { likes: 0, dislikes: 0 },
      puente: { likes: 0, dislikes: 0 },
      operativo: { likes: 0, dislikes: 0 },
      code: { likes: 0, dislikes: 0 },
    };

    const likedTags: Record<string, number> = {};
    const dislikedTags: Record<string, number> = {};

    let totalLikes = 0;
    let totalDislikes = 0;

    for (const drop of drops) {
      const pref = dropPreferences[drop.id];
      if (!pref) continue;

      if (pref === 'like') {
        totalLikes += 1;
        byType[drop.type].likes += 1;
        drop.tags.forEach((tag) => {
          likedTags[tag] = (likedTags[tag] || 0) + 1;
        });
      } else {
        totalDislikes += 1;
        byType[drop.type].dislikes += 1;
        drop.tags.forEach((tag) => {
          dislikedTags[tag] = (dislikedTags[tag] || 0) + 1;
        });
      }
    }

    const totalRated = totalLikes + totalDislikes;
    const likeRate = totalRated > 0 ? Math.round((totalLikes / totalRated) * 100) : 0;

    const toTop = (counter: Record<string, number>) =>
      Object.entries(counter)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([tag, count]) => ({ tag, count }));

    return {
      totalRated,
      totalLikes,
      totalDislikes,
      likeRate,
      byType,
      topLikedTags: toTop(likedTags),
      topDislikedTags: toTop(dislikedTags),
      recentEvents: preferenceEvents.slice(-20).reverse(),
    };
  }, [dropPreferences, drops, preferenceEvents]);

  return (
    <BrainDropContext.Provider
      value={{
        drops,
        collections: collectionsWithCount,
        loading,
        addDrop,
        updateDrop,
        deleteDrop,
        addCollection,
        searchDrops,
        filterDrops,
        toggleLike,
        markAsViewed,
        setDropPreference,
        dropPreferences,
        preferenceStats,
        streak,
        isUserDrop,
        seedIds: seedIdsSet,
      }}
    >
      {children}
    </BrainDropContext.Provider>
  );
}

export function useBrainDrop() {
  const context = useContext(BrainDropContext);
  if (!context) throw new Error('useBrainDrop must be used within BrainDropProvider');
  return context;
}
