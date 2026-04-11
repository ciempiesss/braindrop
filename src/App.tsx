import { useState, useEffect } from 'react';
import { BrainDropProvider } from '@/hooks/useBrainDrop';
import { Sidebar } from '@/components/Sidebar';
import { Feed } from '@/components/Feed';
import { RightSidebar } from '@/components/RightSidebar';
import { Quiz } from '@/components/Quiz';
import { Collections } from '@/components/Collections';
import { Settings, applyFontSizeFromSettings } from '@/components/Settings';
import { Explore } from '@/components/Explore';
import { Progress } from '@/components/Progress';
import { useBrainDrop } from '@/hooks/useBrainDrop';
import { cn } from '@/lib/utils';
import { exportData } from '@/lib/exportImport';
import {
  Home,
  Compass,
  TrendingUp,
  Brain,
  Layers,
  Settings as SettingsIcon,
  Menu,
} from 'lucide-react';

type Tab = 'feed' | 'explore' | 'progress' | 'quiz' | 'collections' | 'settings';

function StorageFullBanner() {
  const { drops, collections } = useBrainDrop();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = () => setVisible(true);
    window.addEventListener('braindrop:storage-full', handler);
    return () => window.removeEventListener('braindrop:storage-full', handler);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed left-0 right-0 top-0 z-[100] flex items-center justify-between gap-3 bg-[#f87171] px-4 py-3 text-white shadow-lg">
      <p className="text-sm font-medium">Almacenamiento lleno. Exporta tus datos para no perderlos.</p>
      <div className="flex flex-shrink-0 items-center gap-2">
        <button
          onClick={() => exportData(drops, collections)}
          className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#f87171] transition-colors hover:bg-white/90"
        >
          Exportar JSON
        </button>
        <button
          onClick={() => setVisible(false)}
          className="text-lg leading-none text-white/70 hover:text-white"
        >
          x
        </button>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(98,121,170,0.14),transparent_32%),linear-gradient(180deg,#0d1118_0%,#10151d_100%)]">
      <div className="text-center">
        <div className="font-display mb-4 text-4xl font-black tracking-[-0.06em] text-white">
          BrainDrop
        </div>
        <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-[#7c3aed] border-t-transparent" />
      </div>
    </div>
  );
}

function AppContent() {
  const { loading, drops, dropPreferences } = useBrainDrop();
  const [activeTab, setActiveTab] = useState<Tab>('feed');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tagFilter, setTagFilter] = useState<string | null>(null);

  useEffect(() => {
    applyFontSizeFromSettings();
  }, []);

  const pendingFeedback = drops.filter((drop) => drop.viewed && !dropPreferences[drop.id]).length;

  const handleTagClick = (tag: string) => {
    setTagFilter(tag);
    setActiveTab('feed');
  };

  if (loading) return <LoadingScreen />;

  const renderContent = () => {
    switch (activeTab) {
      case 'feed':
        return <Feed selectedTag={tagFilter} onClearTagFilter={() => setTagFilter(null)} />;
      case 'explore':
        return <Explore />;
      case 'progress':
        return <Progress />;
      case 'quiz':
        return <Quiz />;
      case 'collections':
        return <Collections />;
      case 'settings':
        return <Settings />;
      default:
        return <Feed />;
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(98,121,170,0.14),transparent_32%),linear-gradient(180deg,#0d1118_0%,#10151d_100%)]">
      <StorageFullBanner />

      <div className="hidden lg:block lg:fixed lg:inset-y-0 lg:left-0 lg:w-[260px] lg:z-50">
        <Sidebar
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab as Tab)}
          dropsForReview={pendingFeedback}
          isOpen={true}
          onClose={() => {}}
        />
      </div>

      <div className="hidden lg:flex lg:h-screen lg:overflow-hidden">
        <div className="flex min-w-0 flex-1 pl-[260px]">
          <main className="min-w-0 flex-1 overflow-y-auto">{renderContent()}</main>
          <RightSidebar onStartQuiz={() => setActiveTab('quiz')} onTagClick={handleTagClick} />
        </div>
      </div>

      {sidebarOpen ? (
        <>
          <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 z-50 w-[260px] lg:hidden">
            <Sidebar
              activeTab={activeTab}
              onTabChange={(tab) => {
                setActiveTab(tab as Tab);
                setSidebarOpen(false);
              }}
              dropsForReview={pendingFeedback}
              isOpen={true}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </>
      ) : null}

      <div className="flex h-screen flex-col lg:hidden">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/6 bg-[linear-gradient(180deg,rgba(15,20,29,0.96),rgba(13,17,23,0.98))] px-4 py-3 backdrop-blur-xl shadow-[0_4px_20px_rgba(2,8,23,0.4)]">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/8 bg-[linear-gradient(180deg,rgba(21,27,37,0.96),rgba(16,21,30,0.98))] text-white/70 shadow-[6px_6px_14px_rgba(2,8,23,0.32),-4px_-4px_10px_rgba(255,255,255,0.02)] transition-all hover:text-white active:scale-95"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="font-display text-xl font-black tracking-[-0.05em] text-white">
            BrainDrop
          </div>
          <div className="h-10 w-10" />
        </header>

        <main className="flex-1 overflow-y-auto pb-20">{renderContent()}</main>

        <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/6 bg-[linear-gradient(180deg,rgba(15,20,29,0.96),rgba(13,17,23,0.98))] px-2 pb-2 pt-2 backdrop-blur-xl shadow-[0_-8px_32px_rgba(2,8,23,0.4)]">
          <div className="flex items-center justify-around gap-1">
            {[
              { id: 'feed', Icon: Home, label: 'Feed' },
              { id: 'explore', Icon: Compass, label: 'Explorar' },
              { id: 'progress', Icon: TrendingUp, label: 'Progreso' },
              { id: 'quiz', Icon: Brain, label: 'Quiz' },
              { id: 'collections', Icon: Layers, label: 'Cols' },
              { id: 'settings', Icon: SettingsIcon, label: 'Config' },
            ].map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as Tab)}
                  className={cn(
                    'relative flex flex-col items-center gap-1 rounded-2xl px-3 py-2 transition-all duration-200',
                    isActive
                      ? 'text-white'
                      : 'text-white/42 hover:text-white/70'
                  )}
                >
                  {isActive && (
                    <div className="absolute -top-0.5 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#7c3aed] to-[#2563eb] shadow-[0_0_12px_rgba(124,58,237,0.6)]" />
                  )}
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-200',
                      isActive
                        ? 'border-[#7c3aed]/30 bg-[linear-gradient(180deg,rgba(124,58,237,0.15),rgba(37,99,235,0.08))] shadow-[inset_2px_2px_6px_rgba(2,8,23,0.4),inset_-1px_-1px_4px_rgba(255,255,255,0.03),0_4px_12px_rgba(124,58,237,0.2)]'
                        : 'border-white/5 bg-[linear-gradient(180deg,rgba(21,27,37,0.96),rgba(16,21,30,0.98))] shadow-[4px_4px_10px_rgba(2,8,23,0.28),-3px_-3px_8px_rgba(255,255,255,0.015)]'
                    )}
                  >
                    <item.Icon className={cn('h-[18px] w-[18px] transition-transform duration-200', isActive && 'scale-110')} />
                  </div>
                  <span className={cn('text-[10px] font-semibold tracking-[0.04em]', isActive && 'text-white/90')}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrainDropProvider>
      <AppContent />
    </BrainDropProvider>
  );
}

export default App;
