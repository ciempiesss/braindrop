import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Type, RotateCcw, Folder, Eye, EyeOff } from 'lucide-react';
import { useBrainDrop } from '@/hooks/useBrainDrop';

export type FontSize = 'sm' | 'md' | 'lg' | 'xl';

interface Settings {
  fontSize: FontSize;
  visibleCollections: string[];
}

const STORAGE_KEY = 'braindrop_settings';

const FONT_SIZE_OPTIONS: { value: FontSize; label: string; size: string }[] = [
  { value: 'sm', label: 'Pequeño', size: '14px' },
  { value: 'md', label: 'Mediano', size: '17px' },
  { value: 'lg', label: 'Grande', size: '20px' },
  { value: 'xl', label: 'Extra Grande', size: '24px' },
];

const FONT_SIZE_MAP: Record<FontSize, string> = {
  sm: '14px',
  md: '17px',
  lg: '20px',
  xl: '24px',
};

function loadSettings(): Settings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        fontSize: parsed.fontSize || 'md',
        visibleCollections: parsed.visibleCollections || []
      };
    }
  } catch {
    console.warn('Error loading settings');
  }
  return { fontSize: 'md', visibleCollections: [] };
}

function applyFontSize(fontSize: FontSize) {
  document.documentElement.style.setProperty('--font-size-base', FONT_SIZE_MAP[fontSize]);
}

export function Settings() {
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const { collections } = useBrainDrop();

  useEffect(() => {
    applyFontSize(settings.fontSize);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const handleFontSizeChange = (fontSize: FontSize) => {
    setSettings((prev) => ({ ...prev, fontSize }));
  };

  const toggleCollectionVisibility = (collectionId: string) => {
    setSettings((prev) => {
      const currentlyVisible = prev.visibleCollections;
      if (currentlyVisible.includes(collectionId)) {
        return {
          ...prev,
          visibleCollections: currentlyVisible.filter(id => id !== collectionId)
        };
      } else {
        return {
          ...prev,
          visibleCollections: [...currentlyVisible, collectionId]
        };
      }
    });
  };

  const isCollectionVisible = (collectionId: string) => {
    return settings.visibleCollections.length === 0 || settings.visibleCollections.includes(collectionId);
  };

  const resetSettings = () => {
    const defaultSettings: Settings = { fontSize: 'md', visibleCollections: [] };
    setSettings(defaultSettings);
    applyFontSize(defaultSettings.fontSize);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSettings));
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e7e9ea]">
      <header className="sticky top-0 z-10 bg-[#0a0a0a] border-b border-[#2f3336] p-4">
        <h1 className="text-xl font-bold">Configuración</h1>
      </header>

      <div className="p-4 space-y-6">
        <section className="bg-[#16181c] rounded-xl p-4 border border-[#2f3336]">
          <div className="flex items-center gap-3 mb-4">
            <Type className="w-5 h-5 text-[#7c3aed]" />
            <h2 className="text-lg font-semibold">Tamaño de fuente</h2>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {FONT_SIZE_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleFontSizeChange(option.value)}
                className={cn(
                  'p-3 rounded-lg border transition-all text-left',
                  settings.fontSize === option.value
                    ? 'border-[#7c3aed] bg-[#7c3aed]/10 text-[#e7e9ea]'
                    : 'border-[#2f3336] hover:border-[#7c3aed]/50 text-[#71767b]'
                )}
              >
                <div className="font-medium">{option.label}</div>
                <div className="text-sm opacity-70" style={{ fontSize: option.size }}>
                  Aa
                </div>
              </button>
            ))}
          </div>

          <div className="mt-4 p-3 bg-[#0a0a0a] rounded-lg">
            <p className="text-sm text-[#71767b] mb-2">Vista previa:</p>
            <p style={{ fontSize: FONT_SIZE_MAP[settings.fontSize] }}>
              El veloz murciélago hindú comía feliz cardillo y kiwi.
            </p>
          </div>
        </section>

        <section className="bg-[#16181c] rounded-xl p-4 border border-[#2f3336]">
          <div className="flex items-center gap-3 mb-4">
            <Folder className="w-5 h-5 text-[#7c3aed]" />
            <h2 className="text-lg font-semibold">Colecciones en Home</h2>
          </div>
          
          <p className="text-sm text-[#71767b] mb-4">
            Selecciona las colecciones que quieres ver en el feed. Si no seleccionas ninguna, se muestran todas.
          </p>

          <div className="space-y-2">
            {collections.map((collection) => (
              <button
                key={collection.id}
                onClick={() => toggleCollectionVisibility(collection.id)}
                className={cn(
                  'w-full flex items-center justify-between p-3 rounded-lg border transition-all',
                  isCollectionVisible(collection.id)
                    ? 'border-[#7c3aed] bg-[#7c3aed]/10 text-[#e7e9ea]'
                    : 'border-[#2f3336] hover:border-[#7c3aed]/50 text-[#71767b]'
                )}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: collection.color || '#7c3aed' }}
                  />
                  <span className="font-medium">{collection.name}</span>
                  <span className="text-xs text-white/40">({collection.dropCount})</span>
                </div>
                {isCollectionVisible(collection.id) ? (
                  <Eye className="w-4 h-4 text-[#7c3aed]" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
              </button>
            ))}
          </div>
        </section>

        <section className="bg-[#16181c] rounded-xl p-4 border border-[#2f3336]">
          <div className="flex items-center gap-3 mb-4">
            <RotateCcw className="w-5 h-5 text-[#7c3aed]" />
            <h2 className="text-lg font-semibold">Restablecer</h2>
          </div>

          <button
            onClick={resetSettings}
            className="w-full py-3 px-4 rounded-lg border border-[#2f3336] hover:border-[#f87171] hover:text-[#f87171] transition-colors text-[#71767b]"
          >
            Restaurar valores predeterminados
          </button>
        </section>

        <section className="text-center text-sm text-[#71767b] py-4">
          <p>BrainDrop v1.0.0</p>
        </section>
      </div>
    </div>
  );
}
