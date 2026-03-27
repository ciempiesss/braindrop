import type { ReactNode } from 'react';
import { useBrainDrop } from '@/hooks/useBrainDrop';
import { loadSettings } from '@/components/Settings';

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
        <h3 className="font-display text-[24px] font-black tracking-[-0.05em] text-white">
          {title}
        </h3>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

export function RightSidebar({ onStartQuiz, onTagClick }: RightSidebarProps) {
  const { drops, getDropsForReview } = useBrainDrop();

  const dropsForReview = getDropsForReview().length;
  const weeklyGoal = loadSettings().weeklyGoal ?? 20;

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const reviewedThisWeek = drops.filter((drop) => {
    if (!drop.lastReviewDate) return false;
    const reviewDate = new Date(drop.lastReviewDate);
    return reviewDate >= sevenDaysAgo;
  }).length;

  const progressPercent = Math.min(100, Math.round((reviewedThisWeek / weeklyGoal) * 100));
  const progressDegrees = (progressPercent / 100) * 360;

  const tagCounts = drops.flatMap((drop) => drop.tags).reduce((acc, tag) => {
    acc[tag] = (acc[tag] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const trending = topTags.slice(0, 5);

  return (
    <aside className="hidden w-[320px] flex-shrink-0 p-5 lg:block">
      <div className="space-y-4">
        <ShellCard title="Tu semana">
          <div className="flex items-center gap-4">
            <div
              className="flex h-[70px] w-[70px] items-center justify-center rounded-full shadow-[inset_4px_4px_10px_rgba(2,8,23,0.35),inset_-2px_-2px_8px_rgba(255,255,255,0.025)]"
              style={{
                background: `conic-gradient(#60a5fa 0deg ${progressDegrees}deg, rgba(255,255,255,0.08) ${progressDegrees}deg 360deg)`,
              }}
            >
              <div className="flex h-[54px] w-[54px] items-center justify-center rounded-full bg-[#121722] text-[14px] font-black text-white">
                {progressPercent}%
              </div>
            </div>

            <div className="text-[13px] leading-6 text-white/62">
              <strong className="block text-[16px] text-white">
                {reviewedThisWeek} de {weeklyGoal} drops
              </strong>
              repasados esta semana
            </div>
          </div>
        </ShellCard>

        {dropsForReview > 0 ? (
          <ShellCard title="Repaso listo">
            <p className="mb-4 text-[14px] leading-6 text-white/66">
              Tienes <strong className="text-white">{dropsForReview} drops</strong> esperando una ronda de quiz.
            </p>
            <button
              onClick={onStartQuiz}
              className="w-full rounded-[18px] bg-gradient-to-r from-[#7c3aed] to-[#2563eb] px-5 py-3 text-[14px] font-bold text-white transition-opacity hover:opacity-95"
            >
              Empezar quiz
            </button>
          </ShellCard>
        ) : null}

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

        <ShellCard title="Trending">
          <div className="space-y-2">
            {trending.length === 0 ? (
              <div className="text-[14px] text-white/42">Sin datos suficientes todavia</div>
            ) : (
              trending.map(([tag, count]) => (
                <button
                  key={tag}
                  onClick={() => onTagClick?.(tag)}
                  className="flex w-full items-center justify-between rounded-[20px] border border-white/6 bg-[linear-gradient(180deg,rgba(23,29,40,0.96),rgba(18,23,31,0.98))] px-4 py-3 text-left shadow-[10px_10px_20px_rgba(2,8,23,0.24),-5px_-5px_12px_rgba(255,255,255,0.02)] transition-colors hover:text-white"
                >
                  <span className="font-semibold text-white">{tag}</span>
                  <span className="text-[13px] text-white/45">{count} drops</span>
                </button>
              ))
            )}
          </div>
        </ShellCard>
      </div>
    </aside>
  );
}
