import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Type, RotateCcw } from 'lucide-react';

export type FontSize = 'sm' | 'md' | 'lg' | 'xl';

interface Settings {
  fontSize: FontSize;
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
    if (stored) return JSON.parse(stored);
  } catch {
    console.warn('Error loading settings');
  }
  return { fontSize: 'md' };
}

function applyFontSize(fontSize: FontSize) {
  document.documentElement.style.setProperty('--font-size-base', FONT_SIZE_MAP[fontSize]);
}

export function Settings() {
  const [settings, setSettings] = useState<Settings>(loadSettings);

  useEffect(() => {
    applyFontSize(settings.fontSize);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const handleFontSizeChange = (fontSize: FontSize) => {
    setSettings((prev) => ({ ...prev, fontSize }));
  };

  const resetSettings = () => {
    const defaultSettings = { fontSize: 'md' as FontSize };
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
