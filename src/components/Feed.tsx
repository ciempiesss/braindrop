import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { useBrainDrop } from '@/hooks/useBrainDrop';
import { DropCard } from '@/components/DropCard';
import { Compose } from '@/components/Compose';
import { AIChat } from '@/components/AIChat';
import { cn } from '@/lib/utils';
import type { Drop } from '@/types';
import {
  buildSessionPool,
  getSessionStats,
  SESSION_SIZE,
  PAGE_SIZE,
  MAX_SESSION,
} from '@/lib/feedAlgorithm';

const SETTINGS_KEY = 'braindrop_settings';

function loadVisibleCollections(): string[] {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      const settings = JSON.parse(stored);
      return settings.visibleCollections || [];
    }
  } catch {
    // ignore
  }
  return [];
}

const defaultVisibleCollections = typeof window !== 'undefined' ? loadVisibleCollections() : [];

export function Feed({
  selectedTag,
  onClearTagFilter,
}: {
  selectedTag?: string | null;
  onClearTagFilter?: () => void;
}) {
  const { drops, addDrop, toggleLike, markAsViewed, deleteDrop, updateDrop } = useBrainDrop();
  const [activeTab, setActiveTab] = useState('para-ti');
  const [showCompose, setShowCompose] = useState(false);
  const [aiChatDrop, setAiChatDrop] = useState<Drop | null>(null);
  const [visibleCollections, setVisibleCollections] = useState<string[]>(defaultVisibleCollections);

  // ── Sesión ────────────────────────────────────────────────────────────────
  const [sessionSeed, setSessionSeed] = useState<number>(() => Date.now());
  const [sessionPage, setSessionPage] = useState<number>(1);
  const [sessionPool, setSessionPool] = useState<Drop[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [refreshToast, setRefreshToast] = useState<string | null>(null);

  // ── Pull-to-refresh ───────────────────────────────────────────────────────
  const touchStartY = useRef(0);
  const currentPullDistance = useRef(0);
  const [isPulling, setIsPulling] = useState(false);

  // ── Sincronizar visibleCollections con settings ───────────────────────────
  useEffect(() => {
    const handleStorage = () => setVisibleCollections(loadVisibleCollections());
    window.addEventListener('storage', handleStorage);
    const interval = setInterval(() => setVisibleCollections(loadVisibleCollections()), 1000);
    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);

  // ── Reconstruir pool cuando cambia la semilla o los drops ─────────────────
  useEffect(() => {
    if (activeTab !== 'para-ti') return;
    const pool = buildSessionPool(drops, sessionSeed, selectedTag, visibleCollections);
    setSessionPool(pool);
    setSessionPage(1);
  }, [sessionSeed, drops, selectedTag, visibleCollections, activeTab]);

  // ── Drops visibles calculados ─────────────────────────────────────────────
  const visibleCount = SESSION_SIZE + Math.max(0, sessionPage - 1) * PAGE_SIZE;

  const baseFilteredDrops = useMemo(() => {
    let filtered = [...drops];
    if (selectedTag) {
      filtered = filtered.filter(d => d.tags.includes(selectedTag));
    }
    if (activeTab === 'favoritos') {
      return filtered
        .filter(d => d.liked)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    // recientes
    if (visibleCollections.length > 0) {
      filtered = filtered.filter(d => d.collectionId && visibleCollections.includes(d.collectionId));
    }
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [drops, activeTab, selectedTag, visibleCollections]);

  const displayedDrops = useMemo(() => {
    if (activeTab === 'para-ti') return sessionPool.slice(0, visibleCount);
    return baseFilteredDrops;
  }, [activeTab, sessionPool, visibleCount, baseFilteredDrops]);

  // ── Stats de sesión ───────────────────────────────────────────────────────
  const sessionStats = useMemo(() => {
    if (activeTab !== 'para-ti') return null;
    return getSessionStats(drops);
  }, [drops, activeTab]);

  const hasMoreInSession = sessionPool.length > visibleCount;
  const canLoadMore = sessionPage < Math.ceil(MAX_SESSION / PAGE_SIZE) && hasMoreInSession;
  const isSessionExhausted = activeTab === 'para-ti' && displayedDrops.length > 0 && !hasMoreInSession;

  // ── Handlers de sesión ────────────────────────────────────────────────────
  const handleLoadMore = useCallback(() => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setSessionPage(prev => prev + 1);
      setIsLoadingMore(false);
    }, 300);
  }, []);

  const handleNewSession = useCallback(() => {
    setSessionSeed(Date.now());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // ── Pull-to-refresh ───────────────────────────────────────────────────────
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    currentPullDistance.current = 0;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const diff = e.touches[0].clientY - touchStartY.current;
    if (diff > 0 && window.scrollY === 0) {
      currentPullDistance.current = diff;
      if (diff > 60) setIsPulling(true);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    setIsPulling(false);
    if (currentPullDistance.current > 100 && activeTab === 'para-ti') {
      const now = new Date();
      const stats = getSessionStats(drops);
      const message =
        stats.unseen > 0
          ? `${stats.unseen} drops nuevos`
          : stats.dueForReview > 0
          ? `${stats.dueForReview} por repasar hoy`
          : 'Feed actualizado';

      setRefreshToast(message);
      setSessionSeed(Date.now());
      setTimeout(() => setRefreshToast(null), 3000);
    }
    currentPullDistance.current = 0;
  }, [drops, activeTab]);

  return (
    <div className="flex flex-col bg-[#0a0a0a]">
      {/* Toast de refresh */}
      {refreshToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-[#7c3aed] text-white text-sm rounded-full shadow-lg">
          {refreshToast}
        </div>
      )}

      <header className="sticky top-0 z-10 bg-[#0a0a0a] border-b border-[#2f3336]">
        {selectedTag && (
          <div className="px-5 py-2 bg-[#7c3aed]/20 border-b border-[#7c3aed]/30 flex items-center justify-between">
            <span className="text-[14px] text-[#a78bfa]">
              Filtrando por: <strong>{selectedTag}</strong>
            </span>
            <button
              onClick={onClearTagFilter}
              className="text-[14px] text-[#71767b] hover:text-[#e7e9ea]"
            >
              ✕
            </button>
          </div>
        )}
        <div className="p-4 px-5">
          <h1 className="text-[22px] font-extrabold text-[#e7e9ea]">Tu Feed de Aprendizaje</h1>
        </div>

        <div className="px-5 flex gap-1 overflow-x-auto scrollbar-hide">
          {['Para ti', 'Recientes', 'Favoritos'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase().replace(' ', '-'))}
              className={cn(
                'px-5 py-3 text-[15px] font-semibold transition-all whitespace-nowrap',
                activeTab === tab.toLowerCase().replace(' ', '-')
                  ? 'text-[#e7e9ea] border-b-[3px] border-[#7c3aed]'
                  : 'text-[#71767b] hover:bg-[#181818] hover:text-[#e7e9ea] rounded-lg'
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      {/* Compose — solo desktop */}
      <div className="hidden lg:block">
        <Compose onSubmit={addDrop} />
      </div>

      {/* Compose modal móvil */}
      {showCompose && (
        <div className="lg:hidden fixed inset-0 z-50 bg-[#0a0a0a]">
          <div className="flex items-center justify-between p-4 border-b border-[#2f3336]">
            <h2 className="font-bold text-[#e7e9ea]">Nuevo Drop</h2>
            <button onClick={() => setShowCompose(false)} className="text-[#71767b] text-xl">
              ✕
            </button>
          </div>
          <Compose
            onSubmit={(drop) => {
              addDrop(drop);
              setShowCompose(false);
            }}
          />
        </div>
      )}

      {/* Indicador de pull */}
      {isPulling && (
        <div className="flex items-center justify-center gap-2 py-3 text-[#71767b] text-sm">
          <div className="w-4 h-4 border-2 border-[#7c3aed] border-t-transparent rounded-full animate-spin" />
          <span>Suelta para actualizar</span>
        </div>
      )}

      {/* Lista de drops */}
      <div
        className="flex-1"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {displayedDrops.length === 0 ? (
          <div className="p-8 text-center text-[#71767b]">
            <p>No hay drops todavía</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 p-4">
            {displayedDrops.map((drop) => (
              <DropCard
                key={drop.id}
                drop={drop}
                onAI={() => setAiChatDrop(drop)}
                onToggleLike={toggleLike}
                onMarkViewed={markAsViewed}
                onDelete={deleteDrop}
                onEdit={(updatedDrop) => updateDrop(updatedDrop.id, updatedDrop)}
              />
            ))}
          </div>
        )}

        {/* Fin de sesión — solo en "Para Ti" */}
        {activeTab === 'para-ti' && displayedDrops.length > 0 && (
          <div className="flex flex-col items-center gap-3 px-8 py-10 border-t border-[#2f3336]">
            {sessionStats && (
              <p className="text-[#71767b] text-sm text-center">
                {sessionStats.unseen > 0 && sessionStats.dueForReview > 0
                  ? `${sessionStats.unseen} nuevos · ${sessionStats.dueForReview} por repasar`
                  : sessionStats.unseen > 0
                  ? `${sessionStats.unseen} drops nuevos pendientes`
                  : sessionStats.dueForReview > 0
                  ? `${sessionStats.dueForReview} por repasar hoy`
                  : 'Al día con todo 🎯'}
              </p>
            )}

            {isLoadingMore && (
              <div className="flex items-center gap-2 text-[#71767b]">
                <div className="w-4 h-4 border-2 border-[#7c3aed] border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Cargando...</span>
              </div>
            )}

            {!isLoadingMore && canLoadMore && (
              <button
                onClick={handleLoadMore}
                className="px-6 py-2.5 rounded-full bg-[#7c3aed]/20 border border-[#7c3aed]/40 text-[#a78bfa] text-sm font-semibold hover:bg-[#7c3aed]/30 transition-colors"
              >
                Cargar más →
              </button>
            )}

            {!isLoadingMore && isSessionExhausted && (
              <button
                onClick={handleNewSession}
                className="px-6 py-2.5 rounded-full bg-[#7c3aed] text-white text-sm font-semibold hover:bg-[#6d28d9] transition-colors"
              >
                Nueva sesión ↺
              </button>
            )}
          </div>
        )}
      </div>

      {/* FAB móvil */}
      <button
        onClick={() => setShowCompose(true)}
        className="lg:hidden fixed bottom-20 right-4 w-14 h-14 bg-[#7c3aed] rounded-full flex items-center justify-center text-2xl shadow-lg hover:bg-[#6d28d9] transition-colors z-30"
      >
        +
      </button>

      {/* AI Chat */}
      {aiChatDrop && (
        <AIChat
          dropTitle={aiChatDrop.title}
          dropContent={aiChatDrop.content}
          dropType={aiChatDrop.type}
          onClose={() => setAiChatDrop(null)}
        />
      )}
    </div>
  );
}
