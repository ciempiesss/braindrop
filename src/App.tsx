import { useState, useEffect } from 'react';
import { BrainDropProvider } from '@/hooks/useBrainDrop';
import { Sidebar } from '@/components/Sidebar';
import { Feed } from '@/components/Feed';
import { RightSidebar } from '@/components/RightSidebar';
import { Quiz } from '@/components/Quiz';
import { Collections } from '@/components/Collections';
import { Settings } from '@/components/Settings';
import { Explore } from '@/components/Explore';
import { Progress } from '@/components/Progress';
import { useBrainDrop } from '@/hooks/useBrainDrop';
import { cn } from '@/lib/utils';
import { exportData } from '@/lib/exportImport';

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
  const { loading, getDropsForReview } = useBrainDrop();
  const [activeTab, setActiveTab] = useState<Tab>('feed');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tagFilter, setTagFilter] = useState<string | null>(null);

  const dropsForReview = getDropsForReview().length;

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
          dropsForReview={dropsForReview}
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
              dropsForReview={dropsForReview}
              isOpen={true}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </>
      ) : null}

      <div className="flex h-screen flex-col lg:hidden">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/6 bg-[rgba(15,20,29,0.9)] px-4 py-4 backdrop-blur-xl">
          <button onClick={() => setSidebarOpen(true)} className="text-2xl text-white">
            =
          </button>
          <div className="font-display text-xl font-black tracking-[-0.05em] text-white">
            BrainDrop
          </div>
          <div className="w-8" />
        </header>

        <main className="flex-1 overflow-y-auto pb-20">{renderContent()}</main>

        <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/6 bg-[rgba(15,20,29,0.94)] backdrop-blur-xl">
          <div className="flex justify-around px-2 py-2">
            {[
              { id: 'feed', icon: 'Home', label: 'Feed' },
              { id: 'explore', icon: 'Find', label: 'Explorar' },
              { id: 'progress', icon: 'Track', label: 'Progreso' },
              { id: 'quiz', icon: 'Quiz', label: 'Quiz' },
              { id: 'collections', icon: 'Stack', label: 'Cols' },
              { id: 'settings', icon: 'Prefs', label: 'Config' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as Tab)}
                className={cn(
                  'flex flex-col items-center rounded-[18px] px-2 py-2 text-[10px]',
                  activeTab === item.id ? 'text-white' : 'text-white/42'
                )}
              >
                <span className="text-[11px] font-semibold uppercase tracking-[0.08em]">{item.icon}</span>
                <span className="mt-1">{item.label}</span>
              </button>
            ))}
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
