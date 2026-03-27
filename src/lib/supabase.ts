import { createClient } from '@supabase/supabase-js';
import type { Drop, Collection } from '@/types';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// ─── Mappers DB ↔ TS ─────────────────────────────────────────────────────────

export function dbToDrop(row: Record<string, unknown>): Drop {
  return {
    id: row.id as string,
    title: row.title as string,
    content: row.content as string,
    type: row.type as Drop['type'],
    tags: (row.tags as string[]) || [],
    collectionId: (row.collection_id as string) || undefined,
    codeSnippet: (row.code_snippet as string) || undefined,
    imageUrl: (row.image_url as string) || undefined,
    visualContent: (row.visual_content as string) || undefined,
    visualType: (row.visual_type as Drop['visualType']) || undefined,
    visualData: (row.visual_data as Drop['visualData']) || undefined,
    interval: row.interval_days as number,
    repetitionCount: row.repetition_count as number,
    easeFactor: row.ease_factor as number,
    nextReviewDate: row.next_review_date as string,
    lastReviewDate: (row.last_review_date as string) || undefined,
    status: row.status as Drop['status'],
    liked: (row.liked as boolean) || false,
    viewed: (row.viewed as boolean) || false,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export function dropToDb(drop: Drop): Record<string, unknown> {
  return {
    id: drop.id,
    title: drop.title,
    content: drop.content,
    type: drop.type,
    tags: drop.tags,
    collection_id: drop.collectionId || null,
    code_snippet: drop.codeSnippet || null,
    image_url: drop.imageUrl || null,
    visual_content: drop.visualContent || null,
    visual_type: drop.visualType || null,
    visual_data: drop.visualData || null,
    interval_days: drop.interval,
    repetition_count: drop.repetitionCount,
    ease_factor: drop.easeFactor,
    next_review_date: drop.nextReviewDate,
    last_review_date: drop.lastReviewDate || null,
    status: drop.status,
    liked: drop.liked || false,
    viewed: drop.viewed || false,
    created_at: drop.createdAt,
    updated_at: drop.updatedAt,
  };
}

export function dbToCollection(row: Record<string, unknown>): Collection {
  return {
    id: row.id as string,
    name: row.name as string,
    description: (row.description as string) || undefined,
    color: (row.color as string) || undefined,
    dropCount: 0,
    createdAt: row.created_at as string,
  };
}

export function collectionToDb(col: Collection): Record<string, unknown> {
  return {
    id: col.id,
    name: col.name,
    description: col.description || null,
    color: col.color || null,
    created_at: col.createdAt,
  };
}
