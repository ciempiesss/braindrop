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
import { generateDropsFromTopic } from '@/lib/groq';

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

export function Feed({
  selectedTag,
  onClearTagFilter,
}: {
  selectedTag?: string | null;
  onClearTagFilter?: () => void;
}) {
  const { drops, addDrop, toggleLike, markAsViewed, deleteDrop, updateDrop, reviewDrop, seedIds } = useBrainDrop();
  const [activeTab, setActiveTab] = useState('para-ti');
  const [showCompose, setShowCompose] = useState(false);
  const [showQuickCapture, setShowQuickCapture] = useState(false);
  const [quickText, setQuickText] = useState('');
  const [quickLoading, setQuickLoading] = useState(false);
  const [aiChatDrop, setAiChatDrop] = useState<Drop | null>(null);
  const [refreshToast, setRefreshToast] = useState<string | null>(null);

  // ── Pool congelado — solo IDs, en ref para evitar re-renders ────────────
  const poolIdsRef = useRef<string[]>([]);
  const [poolVersion, setPoolVersion] = useState(0); // bump para forzar recalculo
  const [sessionPage, setSessionPage] = useState<number>(1);

  // Función imperativa para reconstruir el pool
  const rebuildPool = useCallback((dropsSnapshot: Drop[], tag?: string | null) => {
    const vc = loadVisibleCollections();
    const pool = buildSessionPool(dropsSnapshot, Date.now(), tag, vc, seedIds);
    poolIdsRef.current = pool.map(d => d.id);
    setSessionPage(1);
    setPoolVersion(v => v + 1);
  }, []);

  // Construir pool al mount
  useEffect(() => {
    rebuildPool(drops, selectedTag);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Sentinel para scroll continuo ────────────────────────────────────────
  const sentinelRef = useRef<HTMLDivElement>(null);

  // ── Counter de drops vistos hoy ───────────────────────────────────────────
  const dropsViewedToday = useMemo(() => {
    const today = new Date().toDateString();
    return drops.filter(d =>
      d.viewed &&
      d.lastReviewDate &&
      new Date(d.lastReviewDate).toDateString() === today
    ).length;
  }, [drops]);

  // ── Pull-to-refresh ───────────────────────────────────────────────────────
  const touchStartY = useRef(0);
  const currentPullDistance = useRef(0);
  const [isPulling, setIsPulling] = useState(false);

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
    // recientes — solo últimos 7 días
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const vc = loadVisibleCollections();
    if (vc.length > 0) {
      filtered = filtered.filter(d => d.collectionId && vc.includes(d.collectionId));
    }
    return filtered
      .filter(d => new Date(d.createdAt) >= sevenDaysAgo)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [drops, activeTab, selectedTag]);

  const displayedDrops = useMemo(() => {
    if (activeTab === 'para-ti') {
      const ids = poolIdsRef.current.slice(0, visibleCount);
      const dropMap = new Map(drops.map(d => [d.id, d]));
      return ids.map(id => dropMap.get(id)).filter((d): d is Drop => d != null);
    }
    return baseFilteredDrops;
  // poolVersion fuerza recalculo cuando el pool se reconstruye
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, visibleCount, drops, baseFilteredDrops, poolVersion]);

  const hasMoreInSession = poolIdsRef.current.length > visibleCount;
  const canLoadMore = visibleCount < MAX_SESSION && hasMoreInSession;
  const isSessionExhausted = activeTab === 'para-ti' && displayedDrops.length > 0 && !hasMoreInSession;

  // Auto-load al llegar al sentinel
  useEffect(() => {
    if (!canLoadMore) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setSessionPage(prev => prev + 1);
      },
      { threshold: 0.1 }
    );
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [canLoadMore, sessionPage]);

  // Auto-rebuild al llegar al final de la sesión
  useEffect(() => {
    if (isSessionExhausted && activeTab === 'para-ti') {
      rebuildPool(drops, selectedTag);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSessionExhausted]);

  // ── Handlers de sesión ────────────────────────────────────────────────────

  const handleAddDrop = useCallback((drop: Parameters<typeof addDrop>[0]) => {
    addDrop(drop);
    setRefreshToast('✓ Drop guardado');
    setTimeout(() => setRefreshToast(null), 2500);
  }, [addDrop]);

  const handleQuickCapture = useCallback(async () => {
    const text = quickText.trim();
    if (!text || quickLoading) return;
    setQuickLoading(true);
    try {
      const drops = await generateDropsFromTopic(text, '');
      drops.forEach(drop => addDrop({
        title: drop.title, content: drop.content, type: drop.type,
        tags: drop.tags, codeSnippet: drop.codeSnippet,
      }));
      setRefreshToast(`✓ ${drops.length} drop${drops.length !== 1 ? 's' : ''} guardado${drops.length !== 1 ? 's' : ''}`);
    } catch {
      setRefreshToast('Error generando drops');
    } finally {
      setQuickLoading(false);
    }
    setTimeout(() => setRefreshToast(null), 3000);
    setQuickText('');
    setShowQuickCapture(false);
  }, [quickText, quickLoading, addDrop]);


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
      const stats = getSessionStats(drops);
      const message =
        stats.unseen > 0
          ? `${stats.unseen} drops nuevos`
          : stats.dueForReview > 0
          ? `${stats.dueForReview} por repasar hoy`
          : 'Feed actualizado';

      setRefreshToast(message);
      rebuildPool(drops, selectedTag);
      setTimeout(() => setRefreshToast(null), 3000);
    }
    currentPullDistance.current = 0;
  }, [drops, activeTab, selectedTag, rebuildPool]);

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
        <div className="p-4 px-5 flex items-center justify-between">
          <h1 className="text-[22px] font-extrabold text-[#e7e9ea]">Tu Feed de Aprendizaje</h1>
          {dropsViewedToday > 0 && (
            <span className="text-[12px] text-white/20 font-mono tabular-nums">
              {dropsViewedToday} hoy
            </span>
          )}
        </div>

        <div className="px-5 flex gap-1 overflow-x-auto scrollbar-hide">
          {['Para ti', 'Recientes', 'Favoritos'].map((tab) => {
            const tabId = tab.toLowerCase().replace(' ', '-');
            const recentCount = tabId === 'recientes'
              ? drops.filter(d => new Date(d.createdAt) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length
              : 0;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tabId)}
                className={cn(
                  'px-5 py-3 text-[15px] font-semibold transition-all whitespace-nowrap flex items-center gap-1.5',
                  activeTab === tabId
                    ? 'text-[#e7e9ea] border-b-[3px] border-[#7c3aed]'
                    : 'text-[#71767b] hover:bg-[#181818] hover:text-[#e7e9ea] rounded-lg'
                )}
              >
                {tab}
                {recentCount > 0 && (
                  <span className="text-[11px] bg-[#7c3aed]/20 text-[#a78bfa] px-1.5 py-0.5 rounded-full font-bold">
                    {recentCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Compose — solo desktop */}
      <div className="hidden lg:block">
        <Compose onSubmit={handleAddDrop} />
      </div>

      {/* Quick Capture bottom sheet — móvil */}
      {showQuickCapture && (
        <div
          className="lg:hidden fixed inset-0 z-50"
          onClick={(e) => { if (e.target === e.currentTarget) setShowQuickCapture(false); }}
        >
          <div className="absolute inset-0 bg-black/60" />
          <div
            className="absolute bottom-0 left-0 right-0 bg-[#0f0f14] border-t border-white/5 rounded-t-2xl p-5 pb-10"
            style={{ boxShadow: '0 -8px 40px rgba(0,0,0,0.7)' }}
          >
            <div className="w-10 h-1 bg-white/10 rounded-full mx-auto mb-5" />
            <input
              autoFocus
              type="text"
              value={quickText}
              onChange={(e) => setQuickText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleQuickCapture(); }}
              placeholder="Tema o concepto..."
              className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-4 text-[#e7e9ea] text-[17px] placeholder:text-white/20 focus:outline-none focus:border-[#7c3aed]/50 mb-4"
            />
            <button
              onClick={handleQuickCapture}
              disabled={!quickText.trim() || quickLoading}
              className="w-full py-4 text-[15px] font-bold rounded-2xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                background: quickText.trim() && !quickLoading ? 'linear-gradient(135deg, #7c3aed, #5b21b6)' : '#1a1a22',
                color: quickText.trim() && !quickLoading ? '#fff' : 'rgba(255,255,255,0.2)',
                boxShadow: quickText.trim() && !quickLoading ? '0 4px 20px rgba(124,58,237,0.4)' : 'none',
              }}
            >
              {quickLoading ? 'Generando drops...' : 'Crear drops con IA'}
            </button>
            <button
              onClick={() => { setShowQuickCapture(false); setShowCompose(true); }}
              className="w-full mt-3 py-2 text-[12px] text-white/20 hover:text-white/40 transition-colors"
            >
              Crear manualmente
            </button>
          </div>
        </div>
      )}

      {/* Full Compose modal — abierto desde "Más opciones" */}
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
              handleAddDrop(drop);
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
            {activeTab === 'favoritos' ? (
              <>
                <p className="text-2xl mb-2">❤️</p>
                <p>Aún no tienes favoritos</p>
                <p className="text-sm mt-1">Dale like a un drop para guardarlo aquí</p>
              </>
            ) : activeTab === 'recientes' ? (
              <>
                <p className="text-2xl mb-2">📅</p>
                <p className="font-semibold text-[#e7e9ea]">Sin drops esta semana</p>
                <p className="text-sm mt-1">Los drops que agregues aparecerán aquí durante 7 días</p>
              </>
            ) : (
              <p>No hay drops todavía</p>
            )}
          </div>
        ) : (
          <div className="flex flex-col">
            {displayedDrops.map((drop) => (
              <DropCard
                key={drop.id}
                drop={drop}
                onAI={() => setAiChatDrop(drop)}
                onToggleLike={toggleLike}
                onMarkViewed={markAsViewed}
                onDelete={deleteDrop}
                onEdit={(updatedDrop) => updateDrop(updatedDrop.id, updatedDrop)}
                onReview={reviewDrop}
              />
            ))}
          </div>
        )}

        {/* Sentinel para scroll continuo automático */}
        {activeTab === 'para-ti' && canLoadMore && (
          <div ref={sentinelRef} className="h-8" />
        )}
      </div>

      {/* FAB móvil */}
      <button
        onClick={() => { setQuickText(''); setShowQuickCapture(true); }}
        className="lg:hidden fixed bottom-24 right-4 w-14 h-14 bg-[#7c3aed] rounded-full flex items-center justify-center text-2xl font-bold shadow-lg hover:bg-[#6d28d9] transition-all active:scale-95 z-30"
        style={{ boxShadow: '0 4px 20px rgba(124,58,237,0.5)' }}
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
