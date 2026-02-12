import { useState } from 'react';
import { BrainDropProvider } from '@/hooks/useBrainDrop';
import { Sidebar } from '@/components/Sidebar';
import { Feed } from '@/components/Feed';
import { RightSidebar } from '@/components/RightSidebar';
import { Quiz } from '@/components/Quiz';
import { Collections } from '@/components/Collections';
import { useBrainDrop } from '@/hooks/useBrainDrop';
import { cn } from '@/lib/utils';

type Tab = 'feed' | 'explore' | 'progress' | 'quiz' | 'collections' | 'settings';

function AppContent() {
  const [activeTab, setActiveTab] = useState<Tab>('feed');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { getDropsForReview } = useBrainDrop();

  const dropsForReview = getDropsForReview().length;

  const renderContent = () => {
    switch (activeTab) {
      case 'feed':
        return <Feed />;
      case 'explore':
        return <Feed />;
      case 'quiz':
        return <Quiz />;
      case 'collections':
        return <Collections />;
      default:
        return <Feed />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] overflow-x-hidden">
      {/* Layout desktop: Sidebar + contenido */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as Tab)}
        dropsForReview={dropsForReview}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Layout desktop: contenido principal */}
      <div className="hidden lg:flex lg:min-h-screen lg:pl-[260px]">
        <div className="flex-1 flex">
          <main className="flex-1 min-w-0">
            {renderContent()}
          </main>
          <RightSidebar onStartQuiz={() => setActiveTab('quiz')} />
        </div>
      </div>

      {/* Layout móvil: 1 columna */}
      <div className="lg:hidden min-h-screen flex flex-col">
        {/* Header móvil */}
        <header className="flex items-center justify-between p-4 border-b border-[#2f3336] bg-[#0a0a0a] sticky top-0 z-30">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="text-2xl text-[#e7e9ea]"
          >
            ☰
          </button>
          <div className="text-xl font-extrabold bg-gradient-to-r from-[#7c3aed] to-[#2563eb] bg-clip-text text-transparent">
            🧠 BrainDrop
          </div>
          <div className="w-8" />
        </header>

        {/* Contenido principal */}
        <main className="flex-1 overflow-y-auto pb-16">
          {renderContent()}
        </main>

        {/* Bottom navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a] border-t border-[#2f3336] z-30">
          <div className="flex justify-around py-2">
            {[
              { id: 'feed', icon: '🏠', label: 'Feed' },
              { id: 'quiz', icon: '🎯', label: 'Quiz' },
              { id: 'collections', icon: '📚', label: 'Colecciones' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as Tab)}
                className={cn(
                  'flex flex-col items-center py-2 px-4',
                  activeTab === item.id ? 'text-[#7c3aed]' : 'text-[#71767b]'
                )}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-[11px] mt-0.5">{item.label}</span>
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
