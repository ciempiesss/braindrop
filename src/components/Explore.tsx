import { useMemo, useState } from 'react';

import { DropCard } from '@/components/DropCard';
import { useBrainDrop } from '@/hooks/useBrainDrop';
import { formatSubcategoryLabel } from '@/lib/dropContent';
import { cn } from '@/lib/utils';
import { DROP_TYPE_CONFIG } from '@/types';
import type { DropType } from '@/types';

const TYPE_FILTERS: { value: DropType | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'definition', label: `${DROP_TYPE_CONFIG.definition.emoji} Definicion` },
  { value: 'ruptura', label: `${DROP_TYPE_CONFIG.ruptura.emoji} Ruptura` },
  { value: 'puente', label: `${DROP_TYPE_CONFIG.puente.emoji} Puente` },
  { value: 'operativo', label: `${DROP_TYPE_CONFIG.operativo.emoji} Operativo` },
  { value: 'code', label: `${DROP_TYPE_CONFIG.code.emoji} Codigo` },
];

export function Explore() {
  const {
    drops,
    collections,
    searchDrops,
    toggleLike,
    markAsViewed,
    deleteDrop,
    updateDrop,
    isUserDrop,
  } = useBrainDrop();
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<DropType | 'all'>('all');
  const [collectionFilter, setCollectionFilter] = useState<string>('all');
  const [originFilter, setOriginFilter] = useState<'all' | 'mine'>('all');

  const results = useMemo(() => {
    let base = query.trim() ? searchDrops(query) : [...drops];
    if (typeFilter !== 'all') base = base.filter((drop) => drop.type === typeFilter);
    if (collectionFilter !== 'all') base = base.filter((drop) => drop.collectionId === collectionFilter);
    if (originFilter === 'mine') base = base.filter((drop) => isUserDrop(drop.id));
    return base;
  }, [query, typeFilter, collectionFilter, originFilter, drops, searchDrops, isUserDrop]);

  const topSubcategories = useMemo(() => {
    const counts: Record<string, number> = {};
    results.forEach((drop) => {
      const sub = drop.tags[0];
      if (!sub) return;
      counts[sub] = (counts[sub] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([tag]) => formatSubcategoryLabel(tag));
  }, [results]);

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top_left,rgba(98,121,170,0.14),transparent_34%),linear-gradient(180deg,#0d1118_0%,#10151d_100%)]">
      <header className="sticky top-0 z-10 border-b border-white/6 bg-[rgba(15,20,29,0.86)] backdrop-blur-xl">
        <div className="px-5 pb-3 pt-4">
          <h1 className="mb-1 font-display text-[26px] font-black tracking-[-0.05em] text-white">Explorar</h1>
          <p className="mb-3 text-[12px] text-white/45">
            {topSubcategories.length > 0
              ? `Mas presentes: ${topSubcategories.join(' • ')}`
              : 'Busca por concepto, subcategoria o tipo.'}
          </p>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35">🔎</span>
            <input
              type="text"
              placeholder="Buscar drops..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full rounded-full border border-white/10 bg-[rgba(14,20,29,0.88)] pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-[#7c3aed]/55 focus:outline-none"
            />
            {query ? (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/80"
              >
                x
              </button>
            ) : null}
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto px-5 pb-3 scrollbar-hide">
          {TYPE_FILTERS.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setTypeFilter(filter.value)}
              className={cn(
                'whitespace-nowrap rounded-full border px-3 py-1.5 text-[13px] font-medium transition-all',
                typeFilter === filter.value
                  ? 'border-[#7c3aed]/60 bg-[#7c3aed]/20 text-white'
                  : 'border-white/12 bg-white/[0.03] text-white/55 hover:border-[#7c3aed]/40'
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto px-5 pb-3 scrollbar-hide">
          <button
            onClick={() => setOriginFilter(originFilter === 'mine' ? 'all' : 'mine')}
            className={cn(
              'whitespace-nowrap rounded-full border px-3 py-1.5 text-[13px] font-medium transition-all',
              originFilter === 'mine'
                ? 'border-white/24 bg-white/10 text-white'
                : 'border-white/12 bg-white/[0.03] text-white/55 hover:border-white/20'
            )}
          >
            Mis drops
          </button>
          <button
            onClick={() => setCollectionFilter('all')}
            className={cn(
              'whitespace-nowrap rounded-full border px-3 py-1.5 text-[13px] font-medium transition-all',
              collectionFilter === 'all'
                ? 'border-[#7c3aed] bg-[#7c3aed]/16 text-[#cab5ff]'
                : 'border-white/12 bg-white/[0.03] text-white/55 hover:border-[#7c3aed]/40'
            )}
          >
            Todas las colecciones
          </button>
          {collections.map((collection) => (
            <button
              key={collection.id}
              onClick={() => setCollectionFilter(collection.id)}
              className={cn(
                'whitespace-nowrap rounded-full border px-3 py-1.5 text-[13px] font-medium transition-all',
                collectionFilter === collection.id
                  ? 'border-[#7c3aed] bg-[#7c3aed]/16 text-[#cab5ff]'
                  : 'border-white/12 bg-white/[0.03] text-white/55 hover:border-[#7c3aed]/40'
              )}
            >
              <span
                className="mr-1.5 inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: collection.color || '#7c3aed' }}
              />
              {collection.name}
            </button>
          ))}
        </div>
      </header>

      <div className="p-4">
        {results.length === 0 ? (
          <div className="py-16 text-center text-white/52">
            <p className="mb-3 text-3xl">🔎</p>
            <p className="mb-1 font-semibold text-white">Sin resultados</p>
            <p className="text-sm">
              {query ? `No hay drops para "${query}"` : 'Prueba cambiando los filtros'}
            </p>
          </div>
        ) : (
          <>
            <p className="mb-3 text-[13px] text-white/45">
              {results.length} drop{results.length !== 1 ? 's' : ''}
            </p>
            <div className="flex flex-col">
              {results.map((drop) => (
                <DropCard
                  key={drop.id}
                  drop={drop}
                  onToggleLike={toggleLike}
                  onMarkViewed={markAsViewed}
                  onDelete={deleteDrop}
                  onEdit={(updated) => updateDrop(updated.id, updated)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
