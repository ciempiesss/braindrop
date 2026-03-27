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
    <div className="fixed top-0 left-0 right-0 z-[100] bg-[#f87171] text-white px-4 py-3 flex items-center justify-between gap-3 shadow-lg">
      <p className="text-sm font-medium">⚠️ Almacenamiento lleno. Exporta tus datos para no perderlos.</p>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => exportData(drops, collections)}
          className="px-3 py-1 bg-white text-[#f87171] rounded-full text-xs font-bold hover:bg-white/90 transition-colors"
        >
          Exportar JSON
        </button>
        <button onClick={() => setVisible(false)} className="text-white/70 hover:text-white text-lg leading-none">✕</button>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4">🧠</div>
        <div className="w-6 h-6 border-2 border-[#7c3aed] border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    </div>
  );
}

function AppContent() {
  const { loading } = useBrainDrop();
  const [activeTab, setActiveTab] = useState<Tab>('feed');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const { getDropsForReview } = useBrainDrop();

  const dropsForReview = getDropsForReview().length;

  const handleTagClick = (tag: string) => {
    setTagFilter(tag);
    setActiveTab('feed');
  };

  if (loading) return <LoadingScreen />;

  const renderContent = () => {
    switch (activeTab) {
      case 'feed': return <Feed selectedTag={tagFilter} onClearTagFilter={() => setTagFilter(null)} />;
      case 'explore': return <Explore />;
      case 'progress': return <Progress />;
      case 'quiz': return <Quiz />;
      case 'collections': return <Collections />;
      case 'settings': return <Settings />;
      default: return <Feed />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
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
        <div className="flex-1 flex min-w-0 pl-[260px]">
          <main className="flex-1 min-w-0 overflow-y-auto">{renderContent()}</main>
          <RightSidebar onStartQuiz={() => setActiveTab('quiz')} onTagClick={handleTagClick} />
        </div>
      </div>

      {sidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 z-50 w-[260px] bg-[#0a0a0a] lg:hidden">
            <Sidebar
              activeTab={activeTab}
              onTabChange={(tab) => { setActiveTab(tab as Tab); setSidebarOpen(false); }}
              dropsForReview={dropsForReview}
              isOpen={true}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </>
      )}

      <div className="lg:hidden flex flex-col h-screen">
        <header className="flex items-center justify-between p-4 border-b border-[#2f3336] bg-[#0a0a0a] sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="text-2xl text-[#e7e9ea]">☰</button>
          <div className="text-xl font-extrabold bg-gradient-to-r from-[#7c3aed] to-[#2563eb] bg-clip-text text-transparent">
            🧠 BrainDrop
          </div>
          <div className="w-8" />
        </header>

        <main className="flex-1 overflow-y-auto pb-16">{renderContent()}</main>

        <nav className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a] border-t border-[#2f3336] z-30">
          <div className="flex justify-around py-2">
            {[
              { id: 'feed', icon: '🏠', label: 'Feed' },
              { id: 'explore', icon: '🔍', label: 'Explorar' },
              { id: 'progress', icon: '📈', label: 'Progreso' },
              { id: 'quiz', icon: '🎯', label: 'Quiz' },
              { id: 'collections', icon: '📚', label: 'Cols' },
              { id: 'settings', icon: '⚙️', label: 'Config' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as Tab)}
                className={cn(
                  'flex flex-col items-center py-2 px-2',
                  activeTab === item.id ? 'text-[#7c3aed]' : 'text-[#71767b]'
                )}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-[10px] mt-0.5">{item.label}</span>
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
