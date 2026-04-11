import { cn } from '@/lib/utils';
import { Home, Search, TrendingUp, Brain, Folder, Settings } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  dropsForReview: number;
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { id: 'feed', label: 'Feed', icon: Home },
  { id: 'explore', label: 'Explorar', icon: Search },
  { id: 'progress', label: 'Progreso', icon: TrendingUp },
  { id: 'quiz', label: 'Quiz', icon: Brain },
  { id: 'collections', label: 'Colecciones', icon: Folder },
  { id: 'settings', label: 'Config', icon: Settings },
];

export function Sidebar({ activeTab, onTabChange, dropsForReview, onClose }: SidebarProps) {
  return (
    <div className="flex h-full flex-col border-r border-white/5 bg-[radial-gradient(circle_at_top_left,rgba(108,132,190,0.18),transparent_42%),linear-gradient(180deg,#0d1118_0%,#10151d_100%)]">
      <div className="flex items-center justify-between px-5 pb-4 pt-6">
        <div>
          <div className="font-display text-[30px] font-black tracking-[-0.06em] text-white">
            BrainDrop
          </div>
          <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/32">
            Soft Workspace
          </div>
        </div>

        <button
          onClick={onClose}
          className="rounded-full border border-white/6 bg-[linear-gradient(180deg,rgba(23,29,39,0.96),rgba(17,22,31,0.98))] px-2.5 py-1 text-lg text-white/35 shadow-[8px_8px_20px_rgba(2,8,23,0.34),-5px_-5px_14px_rgba(255,255,255,0.03)] transition-colors hover:text-white/80"
        >
          x
        </button>
      </div>

      <nav className="flex-1 px-3 pb-4">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const showBadge = item.id === 'progress' && dropsForReview > 0;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                'mb-2 flex w-full items-center gap-3 rounded-[22px] border px-4 py-3.5 text-left text-[16px] transition-all',
                isActive
                  ? 'border-sky-300/10 bg-[linear-gradient(180deg,rgba(25,31,43,0.98),rgba(18,23,31,1))] font-bold text-white shadow-[14px_14px_28px_rgba(2,8,23,0.34),-8px_-8px_18px_rgba(255,255,255,0.03)]'
                  : 'border-white/4 bg-[linear-gradient(180deg,rgba(21,27,37,0.96),rgba(16,21,30,0.98))] text-white/72 shadow-[12px_12px_24px_rgba(2,8,23,0.28),-7px_-7px_16px_rgba(255,255,255,0.025)] hover:text-white'
              )}
            >
              <span className="flex min-w-[52px] items-center justify-center rounded-2xl border border-white/5 bg-[linear-gradient(180deg,rgba(24,31,42,0.94),rgba(18,23,31,0.98))] px-2 py-1.5 text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-white/52 shadow-[inset_3px_3px_8px_rgba(2,8,23,0.4),inset_-2px_-2px_6px_rgba(255,255,255,0.02)]">
                <item.icon size={18} />
              </span>
              <span>{item.label}</span>
              {showBadge ? (
                <span className="ml-auto rounded-full bg-gradient-to-r from-[#7c3aed] to-[#2563eb] px-2.5 py-1 text-[11px] font-bold text-white">
                  {dropsForReview}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-white/8 p-4">
        <div className="rounded-[24px] border border-white/5 bg-[linear-gradient(180deg,rgba(22,28,38,0.96),rgba(16,21,30,0.98))] px-4 py-4 text-center text-[12px] leading-5 text-white/42 shadow-[inset_4px_4px_10px_rgba(2,8,23,0.38),inset_-2px_-2px_8px_rgba(255,255,255,0.02)]">
          Hecho para pensar, repasar y volver sin perder el hilo.
        </div>
      </div>
    </div>
  );
}
