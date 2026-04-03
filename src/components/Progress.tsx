import { useMemo } from 'react';
import { useBrainDrop } from '@/hooks/useBrainDrop';
import { formatSubcategoryLabel } from '@/lib/dropContent';

export function Progress() {
  const { drops, collections, streak, dropPreferences, preferenceStats } = useBrainDrop();

  const stats = useMemo(() => {
    const total = drops.length;
    const viewed = drops.filter((drop) => drop.viewed).length;
    const pendingFeedback = drops.filter((drop) => drop.viewed && !dropPreferences[drop.id]).length;

    const byCollection = collections
      .map((collection) => {
        const collDrops = drops.filter((drop) => drop.collectionId === collection.id);
        const collViewed = collDrops.filter((drop) => drop.viewed).length;
        return {
          ...collection,
          total: collDrops.length,
          viewed: collViewed,
          percent: collDrops.length > 0 ? Math.round((collViewed / collDrops.length) * 100) : 0,
        };
      })
      .filter((collection) => collection.total > 0);

    return { total, viewed, pendingFeedback, byCollection };
  }, [drops, collections, dropPreferences]);

  const viewedPercent = stats.total > 0 ? Math.round((stats.viewed / stats.total) * 100) : 0;
  const topLiked = preferenceStats.topLikedTags.slice(0, 4);
  const topDisliked = preferenceStats.topDislikedTags.slice(0, 4);
  const guidance = useMemo(() => {
    const focus = topLiked[0]?.tag ? formatSubcategoryLabel(topLiked[0].tag) : null;
    const avoid = topDisliked[0]?.tag ? formatSubcategoryLabel(topDisliked[0].tag) : null;
    if (focus && avoid) return `Tu energía hoy se alinea más con ${focus}; baja fricción si pausas ${avoid} temporalmente.`;
    if (focus) return `Tu patrón reciente favorece ${focus}. Aprovecha esa inercia para abrir sesión con ese tipo de drops.`;
    if (avoid) return `Hay fatiga en ${avoid}. Conviene mezclarlo con formatos puente u operativo antes de volver a carga alta.`;
    return 'Todavía no hay suficiente feedback. Marca Me gustó / No me gustó para personalizar mejor el timeline.';
  }, [topLiked, topDisliked]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(98,121,170,0.16),transparent_38%),linear-gradient(180deg,#0d1118_0%,#10151d_100%)]">
      <header className="sticky top-0 z-10 border-b border-white/6 bg-[rgba(15,20,29,0.86)] p-4 backdrop-blur-xl">
        <h1 className="font-display text-[26px] font-black tracking-[-0.05em] text-white">Progreso</h1>
      </header>

      <div className="space-y-4 p-4">
        <section className="rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(24,31,42,0.96),rgba(16,22,31,0.98))] p-4 shadow-[14px_14px_34px_rgba(2,8,23,0.28),-8px_-8px_18px_rgba(255,255,255,0.02)]">
          <h2 className="mb-4 font-semibold text-white/90">Resumen general</h2>

          <div className="mb-4">
            <div className="mb-1.5 flex justify-between text-sm">
              <span className="text-white/55">Drops vistos</span>
              <span className="font-semibold text-white">
                {stats.viewed} / {stats.total}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#7c3aed] to-[#2563eb] transition-all"
                style={{ width: `${viewedPercent}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-white/52">{viewedPercent}% completado</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-[18px] border border-white/8 bg-black/20 p-3">
              <p className="text-3xl font-extrabold text-[#4ade80]">{preferenceStats.totalLikes}</p>
              <p className="text-xs text-white/52">Me gustaron</p>
            </div>
            <div className="rounded-[18px] border border-white/8 bg-black/20 p-3">
              <p className="text-3xl font-extrabold text-[#f87171]">{preferenceStats.totalDislikes}</p>
              <p className="text-xs text-white/52">No me gustaron</p>
            </div>
            <div className="rounded-[18px] border border-white/8 bg-black/20 p-3">
              <p className="text-3xl font-extrabold text-white">{stats.pendingFeedback}</p>
              <p className="text-xs text-white/52">Sin feedback</p>
            </div>
          </div>
        </section>

        <section className="rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(24,31,42,0.96),rgba(16,22,31,0.98))] p-4 shadow-[14px_14px_34px_rgba(2,8,23,0.28),-8px_-8px_18px_rgba(255,255,255,0.02)]">
          <h2 className="mb-4 font-semibold text-white/90">Racha</h2>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-5xl font-extrabold text-[#f97316]">{streak.count}</p>
              <p className="mt-1 text-xs text-white/52">dias seguidos</p>
            </div>
            <div className="flex-1 border-l border-white/10 pl-6">
              <p className="mb-1 text-sm text-white/52">Record personal</p>
              <p className="text-2xl font-bold text-white">{streak.record} dias</p>
            </div>
          </div>
        </section>

        <section className="rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(24,31,42,0.96),rgba(16,22,31,0.98))] p-4 shadow-[14px_14px_34px_rgba(2,8,23,0.28),-8px_-8px_18px_rgba(255,255,255,0.02)]">
          <h2 className="mb-4 font-semibold text-white/90">Preferencias por tipo</h2>
          <div className="space-y-3">
            {Object.entries(preferenceStats.byType).map(([type, values]) => (
              <div key={type} className="flex items-center justify-between rounded-[16px] border border-white/8 bg-black/20 px-3 py-2">
                <span className="text-sm text-white">{type}</span>
                <span className="text-xs text-white/52">
                  +{values.likes} / -{values.dislikes}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[24px] border border-[#7c3aed]/30 bg-[linear-gradient(180deg,rgba(61,42,104,0.34),rgba(23,18,36,0.56))] p-4 shadow-[14px_14px_34px_rgba(2,8,23,0.28),-8px_-8px_18px_rgba(255,255,255,0.02)]">
          <h2 className="mb-2 font-semibold text-[#d8c8ff]">Insight de afinidad</h2>
          <p className="text-sm leading-6 text-[#e9ddff]/88">{guidance}</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <div className="rounded-[14px] border border-emerald-300/20 bg-emerald-500/10 px-3 py-2">
              <p className="text-[11px] uppercase tracking-[0.08em] text-emerald-200/70">Te activa</p>
              <p className="mt-1 text-sm text-emerald-100">
                {topLiked.length > 0
                  ? topLiked.map((item) => formatSubcategoryLabel(item.tag)).join(' • ')
                  : 'Sin datos todavía'}
              </p>
            </div>
            <div className="rounded-[14px] border border-rose-300/20 bg-rose-500/10 px-3 py-2">
              <p className="text-[11px] uppercase tracking-[0.08em] text-rose-200/70">Te drena</p>
              <p className="mt-1 text-sm text-rose-100">
                {topDisliked.length > 0
                  ? topDisliked.map((item) => formatSubcategoryLabel(item.tag)).join(' • ')
                  : 'Sin datos todavía'}
              </p>
            </div>
          </div>
        </section>

        {stats.byCollection.length > 0 ? (
          <section className="rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(24,31,42,0.96),rgba(16,22,31,0.98))] p-4 shadow-[14px_14px_34px_rgba(2,8,23,0.28),-8px_-8px_18px_rgba(255,255,255,0.02)]">
            <h2 className="mb-4 font-semibold text-white/90">Por coleccion</h2>
            <div className="space-y-3">
              {stats.byCollection.map((collection) => (
                <div key={collection.id}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="flex items-center gap-2 text-white">
                      <span
                        className="inline-block h-2 w-2 rounded-full"
                        style={{ backgroundColor: collection.color || '#7c3aed' }}
                      />
                      {collection.name}
                    </span>
                    <span className="text-white/52">
                      {collection.viewed}/{collection.total}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${collection.percent}%`, backgroundColor: collection.color || '#7c3aed' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
