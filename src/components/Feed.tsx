import { useState, useMemo } from 'react';
import { useBrainDrop } from '@/hooks/useBrainDrop';
import { DropCard } from '@/components/DropCard';
import { Compose } from '@/components/Compose';
import { AIChat } from '@/components/AIChat';
import { cn } from '@/lib/utils';
import type { Drop } from '@/types';

export function Feed() {
  const { drops, addDrop } = useBrainDrop();
  const [activeTab, setActiveTab] = useState('para-ti');
  const [showCompose, setShowCompose] = useState(false);
  const [aiChatDrop, setAiChatDrop] = useState<Drop | null>(null);

  const sortedDrops = useMemo(
    () => [...drops].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [drops]
  );

  return (
    <div className="flex flex-col bg-[#0a0a0a]">
      <header className="sticky top-0 z-10 bg-[#0a0a0a] border-b border-[#2f3336]">
        <div className="p-4 px-5">
          <h1 className="text-[22px] font-extrabold text-[#e7e9ea]">Tu Feed de Aprendizaje</h1>
        </div>

        <div className="px-5 flex gap-1 overflow-x-auto scrollbar-hide">
          {['Para ti', 'Recientes', 'Repasar'].map((tab) => (
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
      <div className="flex-1">
        {sortedDrops.length === 0 ? (
          <div className="p-8 text-center text-[#71767b]">
            <p>No hay drops todavía</p>
          </div>
        ) : (
          sortedDrops.map((drop) => (
            <DropCard 
              key={drop.id} 
              drop={drop}
              onAI={() => setAiChatDrop(drop)}
            />
          ))
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
