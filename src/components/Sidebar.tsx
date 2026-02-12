import { cn } from '@/lib/utils';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  dropsForReview: number;
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { id: 'feed', label: 'Feed', icon: '🏠' },
  { id: 'explore', label: 'Explorar', icon: '🔍' },
  { id: 'progress', label: 'Progreso', icon: '📊' },
  { id: 'quiz', label: 'Quiz', icon: '🎯' },
  { id: 'collections', label: 'Colecciones', icon: '📚' },
  { id: 'settings', label: 'Config', icon: '⚙️' },
];

export function Sidebar({ activeTab, onTabChange, dropsForReview, onClose }: SidebarProps) {
  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] border-r border-[#2f3336]">
      <div className="p-5 flex items-center justify-between">
        <div className="text-[28px] font-extrabold bg-gradient-to-r from-[#7c3aed] to-[#2563eb] bg-clip-text text-transparent">
          🧠 BrainDrop
        </div>
        <button 
          onClick={onClose}
          className="text-2xl text-[#71767b] hover:text-[#e7e9ea]"
        >
          ✕
        </button>
      </div>

      <nav className="flex-1 px-3">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const showBadge = item.id === 'quiz' && dropsForReview > 0;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-full text-left transition-colors text-lg',
                isActive
                  ? 'bg-[#181818] font-bold text-[#e7e9ea]'
                  : 'text-[#e7e9ea] hover:bg-[#181818]'
              )}
            >
              <span className="text-[22px]">{item.icon}</span>
              <span>{item.label}</span>
              {showBadge && (
                <span className="ml-auto bg-[#7c3aed] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {dropsForReview}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#2f3336]">
        <div className="text-xs text-[#71767b] text-center">
          Hecho con 🧠 para aprender mejor
        </div>
      </div>
    </div>
  );
}
