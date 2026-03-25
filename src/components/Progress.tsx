import { useMemo } from 'react';
import { useBrainDrop } from '@/hooks/useBrainDrop';

export function Progress() {
  const { drops, collections, streak } = useBrainDrop();

  const stats = useMemo(() => {
    const total = drops.length;
    const viewed = drops.filter(d => d.viewed || d.status !== 'new').length;
    const now = new Date();
    const dueToday = drops.filter(d => d.viewed === true && new Date(d.nextReviewDate) <= now).length;
    const mastered = drops.filter(d => d.easeFactor > 2.8 && d.interval > 21).length;

    const hard = drops.filter(d => d.easeFactor < 1.8).length;
    const normal = drops.filter(d => d.easeFactor >= 1.8 && d.easeFactor <= 2.5).length;
    const easy = drops.filter(d => d.easeFactor > 2.5).length;

    const byCollection = collections.map(c => {
      const collDrops = drops.filter(d => d.collectionId === c.id);
      const collViewed = collDrops.filter(d => d.viewed || d.status !== 'new').length;
      return {
        ...c,
        total: collDrops.length,
        viewed: collViewed,
        percent: collDrops.length > 0 ? Math.round((collViewed / collDrops.length) * 100) : 0,
      };
    }).filter(c => c.total > 0);

    return { total, viewed, dueToday, mastered, hard, normal, easy, byCollection };
  }, [drops, collections]);

  const viewedPercent = stats.total > 0 ? Math.round((stats.viewed / stats.total) * 100) : 0;

  return (
    <div className="flex flex-col bg-[#0a0a0a] min-h-screen">
      <header className="sticky top-0 z-10 bg-[#0a0a0a] border-b border-[#2f3336] p-4">
        <h1 className="text-[22px] font-extrabold text-[#e7e9ea]">Progreso</h1>
      </header>

      <div className="p-4 space-y-4">
        {/* Resumen general */}
        <section className="bg-[#16181c] rounded-xl p-4 border border-[#2f3336]">
          <h2 className="font-bold text-[#e7e9ea] mb-4">Resumen general</h2>

          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-[#71767b]">Drops vistos</span>
              <span className="text-[#e7e9ea] font-semibold">{stats.viewed} / {stats.total}</span>
            </div>
            <div className="h-2 bg-[#2f3336] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#7c3aed] to-[#2563eb] rounded-full transition-all"
                style={{ width: `${viewedPercent}%` }}
              />
            </div>
            <p className="text-xs text-[#71767b] mt-1">{viewedPercent}% completado</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className={`rounded-xl p-3 border ${stats.dueToday > 0 ? 'border-[#f87171]/40 bg-[#f87171]/5' : 'border-[#2f3336] bg-[#0a0a0a]'}`}>
              <p className={`text-3xl font-extrabold ${stats.dueToday > 0 ? 'text-[#f87171]' : 'text-[#e7e9ea]'}`}>
                {stats.dueToday}
              </p>
              <p className="text-xs text-[#71767b] mt-0.5">por repasar hoy</p>
            </div>
            <div className="rounded-xl p-3 border border-[#2f3336] bg-[#0a0a0a]">
              <p className="text-3xl font-extrabold text-[#4ade80]">{stats.mastered}</p>
              <p className="text-xs text-[#71767b] mt-0.5">dominados</p>
            </div>
          </div>
        </section>

        {/* Racha */}
        <section className="bg-[#16181c] rounded-xl p-4 border border-[#2f3336]">
          <h2 className="font-bold text-[#e7e9ea] mb-4">🔥 Racha</h2>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-5xl font-extrabold text-[#f97316]">{streak.count}</p>
              <p className="text-xs text-[#71767b] mt-1">días seguidos</p>
            </div>
            <div className="flex-1 border-l border-[#2f3336] pl-6">
              <p className="text-sm text-[#71767b] mb-1">Récord personal</p>
              <p className="text-2xl font-bold text-[#e7e9ea]">{streak.record} días</p>
              {streak.count === 0 && (
                <p className="text-xs text-[#71767b] mt-2">Usa la app hoy para empezar una racha</p>
              )}
              {streak.count > 0 && streak.count >= streak.record && (
                <p className="text-xs text-[#4ade80] mt-2">¡Nuevo récord!</p>
              )}
            </div>
          </div>
        </section>

        {/* Distribución por colección */}
        {stats.byCollection.length > 0 && (
          <section className="bg-[#16181c] rounded-xl p-4 border border-[#2f3336]">
            <h2 className="font-bold text-[#e7e9ea] mb-4">Por colección</h2>
            <div className="space-y-3">
              {stats.byCollection.map(c => (
                <div key={c.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[#e7e9ea] flex items-center gap-2">
                      <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: c.color || '#7c3aed' }} />
                      {c.name}
                    </span>
                    <span className="text-[#71767b]">{c.viewed}/{c.total}</span>
                  </div>
                  <div className="h-1.5 bg-[#2f3336] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${c.percent}%`, backgroundColor: c.color || '#7c3aed' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Distribución por dificultad */}
        <section className="bg-[#16181c] rounded-xl p-4 border border-[#2f3336]">
          <h2 className="font-bold text-[#e7e9ea] mb-4">Dificultad</h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl p-3 border border-[#f87171]/30 bg-[#f87171]/5 text-center">
              <p className="text-2xl font-bold text-[#f87171]">{stats.hard}</p>
              <p className="text-xs text-[#71767b] mt-0.5">Difícil</p>
            </div>
            <div className="rounded-xl p-3 border border-[#facc15]/30 bg-[#facc15]/5 text-center">
              <p className="text-2xl font-bold text-[#facc15]">{stats.normal}</p>
              <p className="text-xs text-[#71767b] mt-0.5">Normal</p>
            </div>
            <div className="rounded-xl p-3 border border-[#4ade80]/30 bg-[#4ade80]/5 text-center">
              <p className="text-2xl font-bold text-[#4ade80]">{stats.easy}</p>
              <p className="text-xs text-[#71767b] mt-0.5">Fácil</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
