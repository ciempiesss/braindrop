import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { useBrainDrop } from '@/hooks/useBrainDrop';
import { DropCard } from '@/components/DropCard';
import { Compose } from '@/components/Compose';
import { AIChat } from '@/components/AIChat';
import { EmptyState } from '@/components/EmptyState';
import { cn } from '@/lib/utils';
import type { Drop } from '@/types';
import {
  buildSessionPool,
  getSessionStats,
  SESSION_SIZE,
  PAGE_SIZE,
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
  const {
    drops,
    addDrop,
    toggleLike,
    markAsViewed,
    deleteDrop,
    updateDrop,
    seedIds,
    dropPreferences,
  } =
    useBrainDrop();
  const [activeTab, setActiveTab] = useState('para-ti');
  const [showCompose, setShowCompose] = useState(false);
  const [showQuickCapture, setShowQuickCapture] = useState(false);
  const [quickText, setQuickText] = useState('');
  const [quickLoading, setQuickLoading] = useState(false);
  const [generatedDrops, setGeneratedDrops] = useState<import('@/lib/groq').GeneratedDrop[]>([]);
  const [selectedDrops, setSelectedDrops] = useState<Set<number>>(new Set());
  const [aiChatDrop, setAiChatDrop] = useState<Drop | null>(null);
  const [refreshToast, setRefreshToast] = useState<string | null>(null);
  const [sessionSeed, setSessionSeed] = useState(() => Date.now());
  const poolIdsRef = useRef<string[]>([]);
  const [poolVersion, setPoolVersion] = useState(0);
  const [sessionPage, setSessionPage] = useState<number>(1);
  const loadingNextPageRef = useRef(false);
  const sentinelArmedRef = useRef(true);
  const burstLoadsRef = useRef(0);
  const loadCooldownUntilRef = useRef(0);
  const dropIdsSignature = useMemo(() => drops.map((drop) => drop.id).join('|'), [drops]);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);
  const currentPullDistance = useRef(0);
  const [isPulling, setIsPulling] = useState(false);

  const rebuildPool = useCallback(
    (dropsSnapshot: Drop[], tag: string | null | undefined, seed: number) => {
      const visibleCollections = loadVisibleCollections();
      const pool = buildSessionPool(
        dropsSnapshot,
        seed,
        tag,
        visibleCollections,
        seedIds,
        dropPreferences
      );
      poolIdsRef.current = pool.map((drop) => drop.id);
      setSessionPage(1);
      setPoolVersion((value) => value + 1);
      loadingNextPageRef.current = false;
      sentinelArmedRef.current = true;
      burstLoadsRef.current = 0;
      loadCooldownUntilRef.current = 0;
    },
    [seedIds, dropPreferences]
  );

  const startNewSession = useCallback(
    (dropsSnapshot: Drop[], tag?: string | null) => {
      const nextSeed = Date.now();
      setSessionSeed(nextSeed);
      rebuildPool(dropsSnapshot, tag, nextSeed);
    },
    [rebuildPool]
  );

  useEffect(() => {
    if (activeTab !== 'para-ti') return;
    rebuildPool(drops, selectedTag, sessionSeed);
  }, [activeTab, selectedTag, dropIdsSignature, rebuildPool, sessionSeed, drops]);

  const dropsViewedToday = useMemo(() => {
    const today = new Date().toDateString();
    return drops.filter(
      (drop) =>
        drop.viewed &&
        drop.lastReviewDate &&
        new Date(drop.lastReviewDate).toDateString() === today
    ).length;
  }, [drops]);

  const visibleCount = SESSION_SIZE + Math.max(0, sessionPage - 1) * PAGE_SIZE;

  const baseFilteredDrops = useMemo(() => {
    let filtered = [...drops];
    if (selectedTag) {
      filtered = filtered.filter((drop) => drop.tags.includes(selectedTag));
    }
    if (activeTab === 'favoritos') {
      return filtered
        .filter((drop) => drop.liked)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const visibleCollections = loadVisibleCollections();
    if (visibleCollections.length > 0) {
      filtered = filtered.filter(
        (drop) => drop.collectionId && visibleCollections.includes(drop.collectionId)
      );
    }
    return filtered
      .filter((drop) => new Date(drop.createdAt) >= sevenDaysAgo)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [drops, activeTab, selectedTag]);

  const displayedDrops = useMemo(() => {
    void poolVersion;
    if (activeTab === 'para-ti') {
      const ids = poolIdsRef.current.slice(0, visibleCount);
      const dropMap = new Map(drops.map((drop) => [drop.id, drop]));
      return ids.map((id) => dropMap.get(id)).filter((drop): drop is Drop => drop != null);
    }
    return baseFilteredDrops;
  }, [activeTab, visibleCount, drops, baseFilteredDrops, poolVersion]);

  const hasMoreInSession = poolIdsRef.current.length > visibleCount;

  useEffect(() => {
    loadingNextPageRef.current = false;
  }, [visibleCount]);

  useEffect(() => {
    if (activeTab !== 'para-ti' || !hasMoreInSession) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          sentinelArmedRef.current = true;
          burstLoadsRef.current = 0;
          return;
        }

        if (Date.now() < loadCooldownUntilRef.current) return;
        if (!sentinelArmedRef.current || loadingNextPageRef.current) return;
        if (burstLoadsRef.current >= 2) return;

        sentinelArmedRef.current = false;
        loadingNextPageRef.current = true;
        burstLoadsRef.current += 1;
        loadCooldownUntilRef.current = Date.now() + 450;
        setSessionPage((value) => value + 1);
      },
      { threshold: 0.25, rootMargin: '0px 0px 160px 0px' }
    );
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [activeTab, hasMoreInSession]);

  const handleAddDrop = useCallback(
    (drop: Parameters<typeof addDrop>[0]) => {
      addDrop(drop);
      setRefreshToast('Drop guardado');
      setTimeout(() => setRefreshToast(null), 2500);
    },
    [addDrop]
  );

  const handleDeleteDrop = useCallback(
    async (id: string) => {
      await deleteDrop(id);
      setRefreshToast('Drop eliminado');
      setTimeout(() => setRefreshToast(null), 2500);
    },
    [deleteDrop]
  );

  const handleQuickGenerate = useCallback(async () => {
    const text = quickText.trim();
    if (!text || quickLoading) return;
    setQuickLoading(true);
    try {
      const nextDrops = await generateDropsFromTopic(text, '');
      setGeneratedDrops(nextDrops);
      setSelectedDrops(new Set(nextDrops.map((_, index) => index)));
    } catch {
      setRefreshToast('Error generando drops');
      setTimeout(() => setRefreshToast(null), 2500);
    } finally {
      setQuickLoading(false);
    }
  }, [quickText, quickLoading]);

  const handleSaveSelected = useCallback(() => {
    const toSave = generatedDrops.filter((_, index) => selectedDrops.has(index));
    toSave.forEach((drop) =>
      addDrop({
        title: drop.title,
        content: drop.content,
        type: drop.type,
        tags: drop.tags,
        codeSnippet: drop.codeSnippet,
      })
    );
    setRefreshToast(
      `${toSave.length} drop${toSave.length !== 1 ? 's' : ''} guardado${toSave.length !== 1 ? 's' : ''}`
    );
    setTimeout(() => setRefreshToast(null), 3000);
    setGeneratedDrops([]);
    setSelectedDrops(new Set());
    setQuickText('');
    setShowQuickCapture(false);
  }, [generatedDrops, selectedDrops, addDrop]);

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
      const stats = getSessionStats(drops, dropPreferences);
      const message =
        stats.unseen > 0
          ? `${stats.unseen} drops nuevos`
          : stats.liked + stats.disliked > 0
            ? `${stats.liked} me gustaron, ${stats.disliked} no me gustaron`
            : 'Feed actualizado';

      setRefreshToast(message);
      startNewSession(drops, selectedTag);
      setTimeout(() => setRefreshToast(null), 3000);
    }
    currentPullDistance.current = 0;
  }, [drops, activeTab, selectedTag, startNewSession, dropPreferences]);

  return (
    <div className="flex flex-col bg-[radial-gradient(circle_at_top_left,rgba(98,121,170,0.14),transparent_32%),linear-gradient(180deg,#0d1118_0%,#10151d_100%)]">
      {refreshToast ? (
        <div className="fixed left-1/2 top-16 z-50 -translate-x-1/2 rounded-full bg-[#7c3aed] px-4 py-2 text-sm text-white shadow-lg">
          {refreshToast}
        </div>
      ) : null}

      <header className="top-0 z-10 border-b border-white/6 bg-[rgba(15,20,29,0.86)] backdrop-blur-xl lg:sticky">
        {selectedTag ? (
          <div className="mx-4 mt-4 flex items-center justify-between rounded-[20px] border border-[#7c3aed]/20 bg-[linear-gradient(180deg,rgba(44,30,78,0.92),rgba(29,23,47,0.96))] px-4 py-3 shadow-[inset_4px_4px_10px_rgba(18,12,31,0.38),inset_-2px_-2px_8px_rgba(255,255,255,0.02)]">
            <span className="text-[14px] text-[#c9b5ff]">
              Filtrando por: <strong>{selectedTag}</strong>
            </span>
            <button
              onClick={onClearTagFilter}
              className="rounded-full border border-white/8 px-2 py-0.5 text-[13px] text-white/48 hover:text-white"
            >
              x
            </button>
          </div>
        ) : null}

        <div className="flex items-end justify-between px-5 pb-3 pt-5">
          <div>
            <h1 className="font-display text-[34px] font-black tracking-[-0.06em] text-white">
              Tu feed de aprendizaje
            </h1>
            <p className="mt-1 text-[13px] text-white/42">
              Sesion estable, shell suave y drops con mejor foco visual.
            </p>
          </div>
          {dropsViewedToday > 0 ? (
            <span className="rounded-full border border-white/6 bg-[linear-gradient(180deg,rgba(24,31,42,0.96),rgba(18,23,31,0.98))] px-3 py-1.5 text-[12px] font-mono tabular-nums text-white/45 shadow-[10px_10px_20px_rgba(2,8,23,0.22),-4px_-4px_10px_rgba(255,255,255,0.02)]">
              {dropsViewedToday} hoy
            </span>
          ) : null}
        </div>

        <div className="flex gap-2 overflow-x-auto px-5 pb-4 scrollbar-hide">
          {['Para ti', 'Recientes', 'Favoritos'].map((tab) => {
            const tabId = tab.toLowerCase().replace(' ', '-');
            const recentCount =
              tabId === 'recientes'
                ? drops.filter(
                    (drop) =>
                      new Date(drop.createdAt) >=
                      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                  ).length
                : 0;

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tabId)}
                className={cn(
                  'flex items-center gap-1.5 whitespace-nowrap rounded-full border px-4 py-2.5 text-[14px] font-semibold transition-all shadow-[10px_10px_20px_rgba(2,8,23,0.22),-4px_-4px_10px_rgba(255,255,255,0.02)]',
                  activeTab === tabId
                    ? 'border-sky-300/12 bg-[linear-gradient(180deg,rgba(25,31,43,0.98),rgba(18,23,31,1))] text-white'
                    : 'border-white/4 bg-[linear-gradient(180deg,rgba(22,28,38,0.96),rgba(16,21,30,0.98))] text-white/46 hover:text-white'
                )}
              >
                {tab}
                {recentCount > 0 ? (
                  <span className="rounded-full bg-[#7c3aed]/25 px-1.5 py-0.5 text-[11px] font-bold text-[#c9b5ff]">
                    {recentCount}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </header>

      <div className="hidden px-1 lg:block">
        <Compose onSubmit={handleAddDrop} />
      </div>

      {showQuickCapture ? (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowQuickCapture(false);
              setGeneratedDrops([]);
              setSelectedDrops(new Set());
            }
          }}
        >
          <div className="absolute inset-0 bg-black/60" />
          <div
            className="absolute bottom-0 left-0 right-0 rounded-t-[28px] border-t border-white/5 bg-[linear-gradient(180deg,#121722_0%,#0f141d_100%)]"
            style={{
              boxShadow: '0 -8px 40px rgba(0,0,0,0.7)',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div className="mx-auto mb-4 mt-4 h-1 w-10 rounded-full bg-white/10" />

            {generatedDrops.length === 0 ? (
              <div className="flex flex-col gap-4 px-5 pb-10">
                <input
                  autoFocus
                  type="text"
                  value={quickText}
                  onChange={(e) => setQuickText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleQuickGenerate();
                  }}
                  placeholder="Tema o concepto..."
                  className="w-full rounded-[22px] border border-white/8 bg-black/20 px-5 py-4 text-[17px] text-white placeholder:text-white/20 focus:border-[#7c3aed]/50 focus:outline-none"
                />
                <button
                  onClick={handleQuickGenerate}
                  disabled={!quickText.trim() || quickLoading}
                  className="w-full rounded-[22px] py-4 text-[15px] font-bold transition-all disabled:cursor-not-allowed disabled:opacity-30"
                  style={{
                    background:
                      quickText.trim() && !quickLoading
                        ? 'linear-gradient(135deg, #7c3aed, #5b21b6)'
                        : '#1a1a22',
                    color: quickText.trim() && !quickLoading ? '#fff' : 'rgba(255,255,255,0.2)',
                    boxShadow:
                      quickText.trim() && !quickLoading
                        ? '0 4px 20px rgba(124,58,237,0.4)'
                        : 'none',
                  }}
                >
                  {quickLoading ? 'Generando...' : 'Crear drops con IA'}
                </button>
                <button
                  onClick={() => {
                    setShowQuickCapture(false);
                    setShowCompose(true);
                  }}
                  className="w-full py-2 text-[12px] text-white/20"
                >
                  Crear manualmente
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between px-5 pb-2">
                  <span className="text-[13px] text-white/40">
                    {selectedDrops.size} de {generatedDrops.length} seleccionados
                  </span>
                  <button
                    onClick={() =>
                      selectedDrops.size === generatedDrops.length
                        ? setSelectedDrops(new Set())
                        : setSelectedDrops(new Set(generatedDrops.map((_, index) => index)))
                    }
                    className="text-[12px] text-[#7c3aed]"
                  >
                    {selectedDrops.size === generatedDrops.length
                      ? 'Deseleccionar todos'
                      : 'Seleccionar todos'}
                  </button>
                </div>

                <div className="flex-1 space-y-2 overflow-y-auto px-5 pb-2">
                  {generatedDrops.map((drop, index) => {
                    const selected = selectedDrops.has(index);
                    return (
                      <div
                        key={`${drop.title}-${index}`}
                        onClick={() =>
                          setSelectedDrops((prev) => {
                            const next = new Set(prev);
                            if (selected) {
                              next.delete(index);
                            } else {
                              next.add(index);
                            }
                            return next;
                          })
                        }
                        className="relative cursor-pointer rounded-[22px] p-4 transition-all"
                        style={{
                          background: selected ? 'rgba(124,58,237,0.12)' : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${
                            selected ? 'rgba(124,58,237,0.35)' : 'rgba(255,255,255,0.06)'
                          }`,
                          opacity: selected ? 1 : 0.45,
                        }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] uppercase tracking-wider text-white/30">
                              {drop.type}
                            </span>
                            <p className="mt-0.5 text-[14px] font-semibold leading-snug text-white">
                              {drop.title}
                            </p>
                            <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-white/40">
                              {drop.content}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setGeneratedDrops((prev) =>
                                prev.filter((_, currentIndex) => currentIndex !== index)
                              );
                              setSelectedDrops((prev) => {
                                const next = new Set<number>();
                                prev.forEach((value) => {
                                  if (value < index) next.add(value);
                                  if (value > index) next.add(value - 1);
                                });
                                return next;
                              });
                            }}
                            className="px-1 text-[16px] text-white/20 hover:text-red-400"
                          >
                            x
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="px-5 pb-10 pt-3">
                  <button
                    onClick={handleSaveSelected}
                    disabled={selectedDrops.size === 0}
                    className="w-full rounded-[22px] py-4 text-[15px] font-bold transition-all disabled:opacity-30"
                    style={{
                      background:
                        selectedDrops.size > 0
                          ? 'linear-gradient(135deg, #7c3aed, #5b21b6)'
                          : '#1a1a22',
                      color: selectedDrops.size > 0 ? '#fff' : 'rgba(255,255,255,0.2)',
                      boxShadow:
                        selectedDrops.size > 0 ? '0 4px 20px rgba(124,58,237,0.4)' : 'none',
                    }}
                  >
                    Guardar {selectedDrops.size === generatedDrops.length ? 'todos' : `(${selectedDrops.size})`}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}

      {showCompose ? (
        <div className="fixed inset-0 z-50 bg-[#0a0a0a] lg:hidden">
          <div className="flex items-center justify-between border-b border-white/6 p-4">
            <h2 className="font-bold text-white">Nuevo Drop</h2>
            <button onClick={() => setShowCompose(false)} className="text-xl text-white/45">
              x
            </button>
          </div>
          <Compose
            onSubmit={(drop) => {
              handleAddDrop(drop);
              setShowCompose(false);
            }}
          />
        </div>
      ) : null}

      {isPulling ? (
        <div className="flex items-center justify-center gap-2 py-3 text-sm text-white/40">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#7c3aed] border-t-transparent" />
          <span>Suelta para actualizar</span>
        </div>
      ) : null}

      <div
        className="flex-1"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {displayedDrops.length === 0 ? (
          activeTab === 'favoritos' ? (
            <EmptyState
              icon="❤️"
              title="Sin favoritos aun"
              description="Dale like a un drop para guardarlo aqui y verlo mas tarde"
            />
          ) : activeTab === 'recientes' ? (
            <EmptyState
              icon="🕐"
              title="Sin drops esta semana"
              description="Los drops que agregues apareceran aqui durante 7 dias"
            />
          ) : (
            <EmptyState
              icon="✨"
              title="No hay drops todavia"
              description="Explora y agrega nuevos drops para comenzar"
            />
          )
        ) : (
          <div className="flex flex-col gap-3 px-2 py-3">
            {displayedDrops.map((drop) => (
              <DropCard
                key={drop.id}
                drop={drop}
                onAI={() => setAiChatDrop(drop)}
                onToggleLike={toggleLike}
                onMarkViewed={markAsViewed}
                onDelete={handleDeleteDrop}
                onEdit={(updatedDrop) => updateDrop(updatedDrop.id, updatedDrop)}
              />
            ))}
          </div>
        )}

        {activeTab === 'para-ti' && hasMoreInSession ? <div ref={sentinelRef} className="h-8" /> : null}
      </div>

      <button
        onClick={() => {
          setQuickText('');
          setShowQuickCapture(true);
        }}
        className="fixed bottom-24 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#7c3aed] text-2xl font-bold shadow-lg transition-all active:scale-95 hover:bg-[#6d28d9] lg:hidden"
        style={{ boxShadow: '0 4px 20px rgba(124,58,237,0.5)' }}
      >
        +
      </button>

      {aiChatDrop ? (
        <AIChat
          dropTitle={aiChatDrop.title}
          dropContent={aiChatDrop.content}
          dropType={aiChatDrop.type}
          onClose={() => setAiChatDrop(null)}
        />
      ) : null}
    </div>
  );
}
