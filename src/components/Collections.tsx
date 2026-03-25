import { useState, useMemo } from 'react';
import { useBrainDrop } from '@/hooks/useBrainDrop';
import { DropCard } from '@/components/DropCard';
import { Compose } from '@/components/Compose';
import { Folder, ChevronRight, ArrowLeft } from 'lucide-react';
import type { Collection } from '@/types';

export function Collections() {
  const { collections, drops, addDrop, deleteDrop, updateDrop, toggleLike, markAsViewed } = useBrainDrop();
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [showCompose, setShowCompose] = useState(false);

  const collectionDrops = useMemo(
    () => selectedCollection
      ? drops.filter((drop) => drop.collectionId === selectedCollection.id)
      : [],
    [selectedCollection, drops]
  );

  const dropCounts = useMemo(
    () => {
      const counts: Record<string, number> = {};
      drops.forEach((drop) => {
        if (drop.collectionId) {
          counts[drop.collectionId] = (counts[drop.collectionId] || 0) + 1;
        }
      });
      return counts;
    },
    [drops]
  );

  if (selectedCollection) {
    return (
      <div className="h-screen flex flex-col bg-[#0a0a0a]">
        <header className="sticky top-0 z-10 bg-[#0a0a0a] border-b border-[#2f3336] p-4">
          <button
            onClick={() => setSelectedCollection(null)}
            className="flex items-center gap-2 text-[#71767b] hover:text-[#e7e9ea] mb-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver
          </button>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${selectedCollection.color}20` }}
            >
              <Folder className="w-5 h-5" style={{ color: selectedCollection.color }} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#e7e9ea]">{selectedCollection.name}</h1>
              <p className="text-sm text-[#71767b]">{collectionDrops.length} drops</p>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto relative">
          {collectionDrops.length === 0 ? (
            <div className="p-8 text-center text-[#71767b]">
              <p>No hay drops en esta colección aún</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {collectionDrops.map((drop) => (
                <DropCard
                  key={drop.id}
                  drop={drop}
                  onToggleLike={toggleLike}
                  onMarkViewed={markAsViewed}
                  onDelete={deleteDrop}
                  onEdit={updated => updateDrop(updated.id, updated)}
                />
              ))}
            </div>
          )}

          {/* FAB agregar drop */}
          <button
            onClick={() => setShowCompose(true)}
            className="fixed bottom-24 right-4 w-14 h-14 bg-[#7c3aed] rounded-full flex items-center justify-center text-2xl shadow-lg hover:bg-[#6d28d9] transition-colors z-30 lg:bottom-6"
            title="Agregar drop a esta colección"
          >
            ＋
          </button>
        </div>

        {showCompose && (
          <div className="fixed inset-0 z-50 bg-[#0a0a0a] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-[#2f3336]">
              <h2 className="font-bold text-[#e7e9ea]">Nuevo Drop en {selectedCollection.name}</h2>
              <button onClick={() => setShowCompose(false)} className="text-[#71767b] text-xl">✕</button>
            </div>
            <Compose
              collectionId={selectedCollection.id}
              onSubmit={(drop) => {
                addDrop({ ...drop, collectionId: selectedCollection.id });
                setShowCompose(false);
              }}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#0a0a0a]">
      <header className="sticky top-0 z-10 bg-[#0a0a0a] border-b border-[#2f3336] p-4">
        <h1 className="text-xl font-bold text-[#e7e9ea]">Colecciones</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid gap-3">
          {collections.map((collection) => (
            <button
              key={collection.id}
              onClick={() => setSelectedCollection(collection)}
              className="w-full text-left bg-[#16181c] border border-[#2f3336] rounded-xl p-4 hover:border-[#7c3aed] transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${collection.color}20` }}
                >
                  <Folder className="w-6 h-6" style={{ color: collection.color }} />
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-[#e7e9ea] group-hover:text-[#7c3aed] transition-colors">
                    {collection.name}
                  </h3>
                  {collection.description && (
                    <p className="text-sm text-[#71767b]">
                      {collection.description}
                    </p>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-2xl font-bold text-[#e7e9ea]">{dropCounts[collection.id] || 0}</span>
                  <p className="text-xs text-[#71767b]">drops</p>
                </div>

                <ChevronRight className="w-5 h-5 text-[#71767b]" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
