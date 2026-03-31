import { useMemo } from 'react';
import { useBrainDrop } from '@/hooks/useBrainDrop';

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

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <header className="sticky top-0 z-10 border-b border-[#2f3336] bg-[#0a0a0a] p-4">
        <h1 className="font-display text-[24px] font-black text-[#e7e9ea]">Progreso</h1>
      </header>

      <div className="space-y-4 p-4">
        <section className="rounded-xl border border-[#2f3336] bg-[#16181c] p-4">
          <h2 className="mb-4 font-bold text-[#e7e9ea]">Resumen general</h2>

          <div className="mb-4">
            <div className="mb-1.5 flex justify-between text-sm">
              <span className="text-[#71767b]">Drops vistos</span>
              <span className="font-semibold text-[#e7e9ea]">
                {stats.viewed} / {stats.total}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#2f3336]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#7c3aed] to-[#2563eb] transition-all"
                style={{ width: `${viewedPercent}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-[#71767b]">{viewedPercent}% completado</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-[#2f3336] bg-[#0a0a0a] p-3">
              <p className="text-3xl font-extrabold text-[#4ade80]">{preferenceStats.totalLikes}</p>
              <p className="text-xs text-[#71767b]">Me gustaron</p>
            </div>
            <div className="rounded-xl border border-[#2f3336] bg-[#0a0a0a] p-3">
              <p className="text-3xl font-extrabold text-[#f87171]">{preferenceStats.totalDislikes}</p>
              <p className="text-xs text-[#71767b]">No me gustaron</p>
            </div>
            <div className="rounded-xl border border-[#2f3336] bg-[#0a0a0a] p-3">
              <p className="text-3xl font-extrabold text-[#e7e9ea]">{stats.pendingFeedback}</p>
              <p className="text-xs text-[#71767b]">Sin feedback</p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-[#2f3336] bg-[#16181c] p-4">
          <h2 className="mb-4 font-bold text-[#e7e9ea]">Racha</h2>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-5xl font-extrabold text-[#f97316]">{streak.count}</p>
              <p className="mt-1 text-xs text-[#71767b]">dias seguidos</p>
            </div>
            <div className="flex-1 border-l border-[#2f3336] pl-6">
              <p className="mb-1 text-sm text-[#71767b]">Record personal</p>
              <p className="text-2xl font-bold text-[#e7e9ea]">{streak.record} dias</p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-[#2f3336] bg-[#16181c] p-4">
          <h2 className="mb-4 font-bold text-[#e7e9ea]">Preferencias por tipo</h2>
          <div className="space-y-3">
            {Object.entries(preferenceStats.byType).map(([type, values]) => (
              <div key={type} className="flex items-center justify-between rounded-lg bg-[#0a0a0a] px-3 py-2">
                <span className="text-sm text-[#e7e9ea]">{type}</span>
                <span className="text-xs text-[#71767b]">
                  +{values.likes} / -{values.dislikes}
                </span>
              </div>
            ))}
          </div>
        </section>

        {stats.byCollection.length > 0 ? (
          <section className="rounded-xl border border-[#2f3336] bg-[#16181c] p-4">
            <h2 className="mb-4 font-bold text-[#e7e9ea]">Por coleccion</h2>
            <div className="space-y-3">
              {stats.byCollection.map((collection) => (
                <div key={collection.id}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="flex items-center gap-2 text-[#e7e9ea]">
                      <span
                        className="inline-block h-2 w-2 rounded-full"
                        style={{ backgroundColor: collection.color || '#7c3aed' }}
                      />
                      {collection.name}
                    </span>
                    <span className="text-[#71767b]">
                      {collection.viewed}/{collection.total}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-[#2f3336]">
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
