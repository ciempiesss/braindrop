import { useBrainDrop } from '@/hooks/useBrainDrop';
import { Folder, ChevronRight } from 'lucide-react';

export function Collections() {
  const { collections } = useBrainDrop();

  return (
    <div className="h-screen flex flex-col">
      <header className="sticky top-0 z-10 bg-background border-b border-border p-4">
        <h1 className="text-xl font-bold">Colecciones</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid gap-3">
          {collections.map((collection) => (
            <div
              key={collection.id}
              className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${collection.color}20` }}
                >
                  <Folder className="w-6 h-6" style={{ color: collection.color }} />
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold group-hover:text-primary transition-colors">
                    {collection.name}
                  </h3>
                  {collection.description && (
                    <p className="text-sm text-muted-foreground">
                      {collection.description}
                    </p>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-2xl font-bold">{collection.dropCount}</span>
                  <p className="text-xs text-muted-foreground">drops</p>
                </div>

                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
