import { useState, useMemo } from 'react';
import { useBrainDrop } from '@/hooks/useBrainDrop';
import { DropCard } from '@/components/DropCard';
import { cn } from '@/lib/utils';
import type { DropType } from '@/types';
import { DROP_TYPE_CONFIG } from '@/types';

const TYPE_FILTERS: { value: DropType | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'definition', label: `${DROP_TYPE_CONFIG.definition.emoji} Definición` },
  { value: 'ruptura', label: `${DROP_TYPE_CONFIG.ruptura.emoji} Ruptura` },
  { value: 'puente', label: `${DROP_TYPE_CONFIG.puente.emoji} Puente` },
  { value: 'operativo', label: `${DROP_TYPE_CONFIG.operativo.emoji} Operativo` },
  { value: 'code', label: `${DROP_TYPE_CONFIG.code.emoji} Código` },
];

export function Explore() {
  const { drops, collections, searchDrops, toggleLike, markAsViewed, deleteDrop, updateDrop, isUserDrop } = useBrainDrop();
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<DropType | 'all'>('all');
  const [collectionFilter, setCollectionFilter] = useState<string>('all');
  const [originFilter, setOriginFilter] = useState<'all' | 'mine'>('all');

  const results = useMemo(() => {
    let base = query.trim() ? searchDrops(query) : [...drops];
    if (typeFilter !== 'all') base = base.filter(d => d.type === typeFilter);
    if (collectionFilter !== 'all') base = base.filter(d => d.collectionId === collectionFilter);
    if (originFilter === 'mine') base = base.filter(d => isUserDrop(d.id));
    return base;
  }, [query, typeFilter, collectionFilter, originFilter, drops, searchDrops, isUserDrop]);

  return (
    <div className="flex flex-col bg-[#0a0a0a] min-h-screen">
      <header className="sticky top-0 z-10 bg-[#0a0a0a] border-b border-[#2f3336]">
        <div className="p-4 px-5">
          <h1 className="text-[22px] font-extrabold text-[#e7e9ea] mb-3">Explorar</h1>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71767b]">🔍</span>
            <input
              type="text"
              placeholder="Buscar drops..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full bg-[#16181c] border border-[#2f3336] rounded-full pl-9 pr-4 py-2.5 text-[#e7e9ea] text-sm placeholder:text-[#71767b] focus:outline-none focus:border-[#7c3aed]"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71767b] hover:text-[#e7e9ea]"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="px-5 pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {TYPE_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setTypeFilter(f.value)}
              className={cn(
                'px-3 py-1.5 rounded-full text-[13px] whitespace-nowrap font-medium transition-all border',
                typeFilter === f.value
                  ? 'bg-[#7c3aed] border-[#7c3aed] text-white'
                  : 'border-[#2f3336] text-[#71767b] hover:border-[#7c3aed]/50'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="px-5 pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setOriginFilter(originFilter === 'mine' ? 'all' : 'mine')}
            className={cn(
              'px-3 py-1.5 rounded-full text-[13px] whitespace-nowrap font-medium transition-all border',
              originFilter === 'mine'
                ? 'border-white/30 bg-white/10 text-white'
                : 'border-[#2f3336] text-[#71767b] hover:border-white/20'
            )}
          >
            ✍️ Mis drops
          </button>
          <button
            onClick={() => setCollectionFilter('all')}
            className={cn(
              'px-3 py-1.5 rounded-full text-[13px] whitespace-nowrap font-medium transition-all border',
              collectionFilter === 'all'
                ? 'border-[#7c3aed] bg-[#7c3aed]/10 text-[#a78bfa]'
                : 'border-[#2f3336] text-[#71767b] hover:border-[#7c3aed]/50'
            )}
          >
            Todas las colecciones
          </button>
          {collections.map(c => (
            <button
              key={c.id}
              onClick={() => setCollectionFilter(c.id)}
              className={cn(
                'px-3 py-1.5 rounded-full text-[13px] whitespace-nowrap font-medium transition-all border',
                collectionFilter === c.id
                  ? 'border-[#7c3aed] bg-[#7c3aed]/10 text-[#a78bfa]'
                  : 'border-[#2f3336] text-[#71767b] hover:border-[#7c3aed]/50'
              )}
            >
              <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: c.color || '#7c3aed' }} />
              {c.name}
            </button>
          ))}
        </div>
      </header>

      <div className="p-4">
        {results.length === 0 ? (
          <div className="py-16 text-center text-[#71767b]">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-semibold text-[#e7e9ea] mb-1">Sin resultados</p>
            <p className="text-sm">
              {query ? `No hay drops para "${query}"` : 'Prueba cambiando los filtros'}
            </p>
          </div>
        ) : (
          <>
            <p className="text-[13px] text-[#71767b] mb-3">{results.length} drop{results.length !== 1 ? 's' : ''}</p>
            <div className="flex flex-col gap-3">
              {results.map(drop => (
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
          </>
        )}
      </div>
    </div>
  );
}
