import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { useBrainDrop } from '@/hooks/useBrainDrop';
import { DropCard } from '@/components/DropCard';
import { Compose } from '@/components/Compose';
import { AIChat } from '@/components/AIChat';
import { cn } from '@/lib/utils';
import type { Drop } from '@/types';

const SETTINGS_KEY = 'braindrop_settings';

function loadVisibleCollections(): string[] {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      const settings = JSON.parse(stored);
      return settings.visibleCollections || [];
    }
  } catch {
    // ignore storage errors
  }
  return [];
}

const defaultVisibleCollections = typeof window !== 'undefined' ? loadVisibleCollections() : [];

export function Feed({ 
  selectedTag, 
  onClearTagFilter 
}: { 
  selectedTag?: string | null; 
  onClearTagFilter?: () => void;
}) {
  const { drops, addDrop, toggleLike, markAsViewed, deleteDrop, updateDrop } = useBrainDrop();
  const [activeTab, setActiveTab] = useState('para-ti');
  const [showCompose, setShowCompose] = useState(false);
  const [aiChatDrop, setAiChatDrop] = useState<Drop | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showRefreshIndicator, setShowRefreshIndicator] = useState(false);
  const [visibleCollections, setVisibleCollections] = useState<string[]>(defaultVisibleCollections);
  
  const touchStartY = useRef(0);
  const currentPullDistance = useRef(0);
  
  useEffect(() => {
    const handleStorage = () => setVisibleCollections(loadVisibleCollections());
    window.addEventListener('storage', handleStorage);
    const interval = setInterval(() => setVisibleCollections(loadVisibleCollections()), 1000);
    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);

  const sortedDrops = useMemo(
    () => [...drops].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [drops]
  );

  const filteredDrops = useMemo(() => {
    let filtered = sortedDrops;
    
    if (selectedTag) {
      filtered = filtered.filter(drop => drop.tags.includes(selectedTag));
    }
    
    // Algoritmo Mezcla inteligente para "Para Ti"
    if (activeTab === 'para-ti') {
      const now = new Date();
      
      // Bucket A: No vistos (nuevos)
      const nuevos = filtered.filter(d => d.viewed !== true);
      
      // Bucket B: Por repasar (SM-2 dice que hay que revisar)
      const porRepasar = filtered.filter(d => 
        d.viewed === true && new Date(d.nextReviewDate) <= now
      );
      
      // Bucket C: Vistos recientemente (para variedad)
      const recientes = filtered.filter(d => 
        d.viewed === true && new Date(d.nextReviewDate) > now
      ).slice(0, Math.floor(filtered.length * 0.2));
      
      // Mezcla: 40% nuevos + 35% por repasar + 25% recientes
      const maxNuevos = Math.floor(20 * 0.4);
      const maxPorRepasar = Math.floor(20 * 0.35);
      const maxRecientes = Math.floor(20 * 0.25);
      
      const resultado = [
        ...nuevos.slice(0, maxNuevos),
        ...porRepasar.slice(0, maxPorRepasar),
        ...recientes.slice(0, maxRecientes)
      ];
      
      // DIVERSIDAD: no más de 3 del mismo tipo consecutively
      const diversificado: Drop[] = [];
      let lastType = '';
      let sameTypeCount = 0;
      
      for (const drop of resultado) {
        if (drop.type === lastType && sameTypeCount >= 3) {
          continue;
        }
        diversificado.push(drop);
        if (drop.type === lastType) {
          sameTypeCount++;
        } else {
          lastType = drop.type;
          sameTypeCount = 1;
        }
      }
      
      return diversificado;
    }
    
    if (activeTab === 'favoritos') {
      return filtered.filter(drop => drop.liked);
    }
    
    if (visibleCollections.length > 0) {
      filtered = filtered.filter(drop => 
        drop.collectionId && visibleCollections.includes(drop.collectionId)
      );
    }
    
    if (showRefreshIndicator) {
      // Pull-to-refresh "Ambos": no vistos + por repasar
      const now = new Date();
      const noVistos = filtered.filter(d => d.viewed !== true);
      const porRepasar = filtered.filter(d => 
        d.viewed === true && new Date(d.nextReviewDate) <= now
      );
      return [...noVistos, ...porRepasar].slice(0, 20);
    }
    
    return filtered;
  }, [sortedDrops, activeTab, showRefreshIndicator, visibleCollections, selectedTag]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    currentPullDistance.current = 0;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartY.current;
    
    if (diff > 0 && window.scrollY === 0) {
      currentPullDistance.current = diff;
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (currentPullDistance.current > 100) {
      setIsRefreshing(true);
      setShowRefreshIndicator(true);
      
      setTimeout(() => {
        setIsRefreshing(false);
        setShowRefreshIndicator(false);
      }, 1000);
    }
    currentPullDistance.current = 0;
  }, []);

  return (
    <div className="flex flex-col bg-[#0a0a0a]">
      <header className="sticky top-0 z-10 bg-[#0a0a0a] border-b border-[#2f3336]">
        {selectedTag && (
          <div className="px-5 py-2 bg-[#7c3aed]/20 border-b border-[#7c3aed]/30 flex items-center justify-between">
            <span className="text-[14px] text-[#a78bfa]">
              Filtrando por: <strong>{selectedTag}</strong>
            </span>
            <button 
              onClick={onClearTagFilter}
              className="text-[14px] text-[#71767b] hover:text-[#e7e9ea]"
            >
              ✕
            </button>
          </div>
        )}
        <div className="p-4 px-5">
          <h1 className="text-[22px] font-extrabold text-[#e7e9ea]">Tu Feed de Aprendizaje</h1>
        </div>

        <div className="px-5 flex gap-1 overflow-x-auto scrollbar-hide">
          {['Para ti', 'Recientes', 'Favoritos'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase().replace(' ', '-'))}
              className={cn(
                'px-5 py-3 text-[15px] font-semibold transition-all whitespace-nowrap',
                activeTab === tab.toLowerCase().replace(' ', '-')
                  ? 'text-[#e7e9ea] border-b-[3px] border-[#7c3aed]'
                  : 'text-[#71767b] hover:bg-[#181818] hover:text-[#e7e9ea] rounded-lg'
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      {/* Compose - Solo desktop */}
      <div className="hidden lg:block">
        <Compose onSubmit={addDrop} />
      </div>

      {/* Compose modal móvil */}
      {showCompose && (
        <div className="lg:hidden fixed inset-0 z-50 bg-[#0a0a0a]">
          <div className="flex items-center justify-between p-4 border-b border-[#2f3336]">
            <h2 className="font-bold text-[#e7e9ea]">Nuevo Drop</h2>
            <button 
              onClick={() => setShowCompose(false)}
              className="text-[#71767b] text-xl"
            >
              ✕
            </button>
          </div>
          <Compose onSubmit={(drop) => {
            addDrop(drop);
            setShowCompose(false);
          }} />
        </div>
      )}

      {/* Lista de drops */}
      <div 
        className="flex-1"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {isRefreshing && (
          <div className="flex items-center justify-center gap-2 p-4 text-[#71767b]">
            <div className="w-5 h-5 border-2 border-[#7c3aed] border-t-transparent rounded-full animate-spin" />
            <span>Buscando nuevos drops...</span>
          </div>
        )}
        {filteredDrops.length === 0 ? (
          <div className="p-8 text-center text-[#71767b]">
            <p>No hay drops todavía</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 p-4">
            {filteredDrops.map((drop) => (
              <DropCard 
                key={drop.id} 
                drop={drop}
                onAI={() => setAiChatDrop(drop)}
                onToggleLike={toggleLike}
                onMarkViewed={markAsViewed}
                onDelete={deleteDrop}
                onEdit={(updatedDrop) => updateDrop(updatedDrop.id, updatedDrop)}
              />
            ))}
          </div>
        )}
      </div>

      {/* FAB móvil */}
      <button
        onClick={() => setShowCompose(true)}
        className="lg:hidden fixed bottom-20 right-4 w-14 h-14 bg-[#7c3aed] rounded-full flex items-center justify-center text-2xl shadow-lg hover:bg-[#6d28d9] transition-colors z-30"
      >
        +
      </button>

      {/* AI Chat */}
      {aiChatDrop && (
        <AIChat 
          dropTitle={aiChatDrop.title}
          dropContent={aiChatDrop.content}
          dropType={aiChatDrop.type}
          onClose={() => setAiChatDrop(null)}
        />
      )}
    </div>
  );
}
