import type { ReactNode } from 'react';
import { useBrainDrop } from '@/hooks/useBrainDrop';

interface RightSidebarProps {
  onStartQuiz: () => void;
  onTagClick?: (tag: string) => void;
}

function ShellCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-white/5 bg-[linear-gradient(180deg,rgba(22,28,38,0.96),rgba(16,21,30,0.98))] shadow-[14px_14px_28px_rgba(2,8,23,0.28),-8px_-8px_18px_rgba(255,255,255,0.02)]">
      <div className="border-b border-white/6 px-5 py-4">
        <h3 className="font-display text-[24px] font-black tracking-[-0.05em] text-white">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

export function RightSidebar({ onStartQuiz, onTagClick }: RightSidebarProps) {
  const { drops, preferenceStats } = useBrainDrop();

  const viewedCount = drops.filter((drop) => drop.viewed).length;

  const tagCounts = drops.flatMap((drop) => drop.tags).reduce((acc, tag) => {
    acc[tag] = (acc[tag] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  return (
    <aside className="hidden w-[320px] flex-shrink-0 p-5 lg:block">
      <div className="space-y-4">
        <ShellCard title="Tu criterio">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-emerald-300/25 bg-emerald-500/10 p-3">
              <p className="text-2xl font-black text-emerald-100">{preferenceStats.totalLikes}</p>
              <p className="text-[12px] text-emerald-200/80">Me gustaron</p>
            </div>
            <div className="rounded-2xl border border-rose-300/25 bg-rose-500/10 p-3">
              <p className="text-2xl font-black text-rose-100">{preferenceStats.totalDislikes}</p>
              <p className="text-[12px] text-rose-200/80">No me gustaron</p>
            </div>
          </div>
          <p className="mt-3 text-[13px] text-white/62">
            {preferenceStats.totalRated > 0
              ? `Afinidad actual: ${preferenceStats.likeRate}% positiva`
              : 'Aun no tienes suficiente feedback para calcular afinidad'}
          </p>
        </ShellCard>

        <ShellCard title="Actividad">
          <p className="mb-4 text-[14px] leading-6 text-white/66">
            Vistos: <strong className="text-white">{viewedCount}</strong> drops.
          </p>
          <button
            onClick={onStartQuiz}
            className="w-full rounded-[18px] bg-gradient-to-r from-[#7c3aed] to-[#2563eb] px-5 py-3 text-[14px] font-bold text-white transition-opacity hover:opacity-95"
          >
            Empezar quiz
          </button>
        </ShellCard>

        <ShellCard title="Tags que te gustan">
          <div className="flex flex-wrap gap-2">
            {preferenceStats.topLikedTags.length === 0 ? (
              <span className="text-[13px] text-white/42">Aun sin suficientes likes</span>
            ) : (
              preferenceStats.topLikedTags.map(({ tag, count }) => (
                <button
                  key={tag}
                  onClick={() => onTagClick?.(tag)}
                  className="rounded-full border border-emerald-300/20 bg-emerald-500/10 px-3 py-1.5 text-[13px] text-emerald-100"
                >
                  {tag} ({count})
                </button>
              ))
            )}
          </div>
        </ShellCard>

        <ShellCard title="Tus temas">
          <div className="flex flex-wrap gap-2">
            {topTags.map(([tag]) => (
              <button
                key={tag}
                onClick={() => onTagClick?.(tag)}
                className="rounded-full border border-white/6 bg-[linear-gradient(180deg,rgba(24,31,42,0.96),rgba(18,23,31,0.98))] px-3 py-1.5 text-[13px] text-white/78 shadow-[8px_8px_16px_rgba(2,8,23,0.22),-4px_-4px_10px_rgba(255,255,255,0.02)] transition-colors hover:text-white"
              >
                {tag}
              </button>
            ))}
          </div>
        </ShellCard>
      </div>
    </aside>
  );
}
