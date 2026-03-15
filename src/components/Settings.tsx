import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Type, RotateCcw, Folder, Eye, EyeOff, Brain, Download, Upload, Target } from 'lucide-react';
import { useBrainDrop } from '@/hooks/useBrainDrop';
import { exportData, importData } from '@/lib/exportImport';

export type FontSize = 'sm' | 'md' | 'lg' | 'xl';
export type QuizMode = 'ia' | 'pregenerated';
export type QuizCount = 5 | 10 | 20;

interface Settings {
  fontSize: FontSize;
  visibleCollections: string[];
  quizMode: QuizMode;
  quizCount: QuizCount;
  weeklyGoal: number;
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

const QUIZ_COUNT_OPTIONS: { value: QuizCount; label: string }[] = [
  { value: 5, label: '5 preguntas' },
  { value: 10, label: '10 preguntas' },
  { value: 20, label: '20 preguntas' },
];

const WEEKLY_GOAL_OPTIONS = [5, 10, 20, 30, 50];

export function loadSettings(): Settings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        fontSize: parsed.fontSize || 'md',
        visibleCollections: parsed.visibleCollections || [],
        quizMode: parsed.quizMode || 'pregenerated',
        quizCount: parsed.quizCount || 10,
        weeklyGoal: parsed.weeklyGoal || 20,
      };
    }
  } catch {
    // ignore
  }
  return { fontSize: 'md', visibleCollections: [], quizMode: 'pregenerated', quizCount: 10, weeklyGoal: 20 };
}

function applyFontSize(fontSize: FontSize) {
  document.documentElement.style.setProperty('--font-size-base', FONT_SIZE_MAP[fontSize]);
}

export function Settings() {
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const { collections, drops } = useBrainDrop();
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetCountdown, setResetCountdown] = useState(3);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [importError, setImportError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    applyFontSize(settings.fontSize);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const handleFontSizeChange = (fontSize: FontSize) => {
    setSettings((prev) => ({ ...prev, fontSize }));
  };

  const handleQuizModeChange = (quizMode: QuizMode) => {
    setSettings((prev) => ({ ...prev, quizMode }));
  };

  const handleQuizCountChange = (quizCount: QuizCount) => {
    setSettings((prev) => ({ ...prev, quizCount }));
  };

  const handleWeeklyGoalChange = (weeklyGoal: number) => {
    setSettings((prev) => ({ ...prev, weeklyGoal }));
  };

  const toggleCollectionVisibility = (collectionId: string) => {
    setSettings((prev) => {
      const currentlyVisible = prev.visibleCollections;
      if (currentlyVisible.includes(collectionId)) {
        return { ...prev, visibleCollections: currentlyVisible.filter(id => id !== collectionId) };
      } else {
        return { ...prev, visibleCollections: [...currentlyVisible, collectionId] };
      }
    });
  };

  const isCollectionVisible = (collectionId: string) => {
    return settings.visibleCollections.length === 0 || settings.visibleCollections.includes(collectionId);
  };

  const handleResetClick = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      setResetCountdown(3);
      let count = 3;
      countdownRef.current = setInterval(() => {
        count -= 1;
        setResetCountdown(count);
        if (count <= 0) {
          if (countdownRef.current) clearInterval(countdownRef.current);
        }
      }, 1000);
      resetTimerRef.current = setTimeout(() => {
        setConfirmReset(false);
        setResetCountdown(3);
      }, 3000);
    } else {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
      const defaultSettings: Settings = { fontSize: 'md', visibleCollections: [], quizMode: 'pregenerated', quizCount: 10, weeklyGoal: 20 };
      setSettings(defaultSettings);
      applyFontSize(defaultSettings.fontSize);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSettings));
      setConfirmReset(false);
      setResetCountdown(3);
    }
  };

  const handleExport = () => {
    exportData(drops, collections);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError('');
    try {
      const data = await importData(file);
      // Merge: existing drops/collections not overwritten by same ID
      const existingDropIds = new Set(drops.map(d => d.id));
      const newDrops = data.drops.filter(d => !existingDropIds.has(d.id));
      const existingColIds = new Set(collections.map(c => c.id));
      const newCols = data.collections.filter(c => !existingColIds.has(c.id));
      // Save merged to localStorage directly (context will pick it up on reload)
      const mergedDrops = [...drops, ...newDrops];
      const mergedCols = [...collections, ...newCols];
      localStorage.setItem('bd_drops', JSON.stringify(mergedDrops));
      localStorage.setItem('bd_collections', JSON.stringify(mergedCols));
      alert(`Importados: ${newDrops.length} drops y ${newCols.length} colecciones nuevas. Recarga la app para ver los cambios.`);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Error al importar');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
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
            <Target className="w-5 h-5 text-[#7c3aed]" />
            <h2 className="text-lg font-semibold">Goal semanal</h2>
          </div>
          <p className="text-sm text-[#71767b] mb-3">Drops a repasar por semana</p>
          <div className="flex gap-2 flex-wrap">
            {WEEKLY_GOAL_OPTIONS.map(goal => (
              <button
                key={goal}
                onClick={() => handleWeeklyGoalChange(goal)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors border',
                  settings.weeklyGoal === goal
                    ? 'bg-[#7c3aed] border-[#7c3aed] text-white'
                    : 'border-[#2f3336] text-[#71767b] hover:border-[#7c3aed]/50'
                )}
              >
                {goal}
              </button>
            ))}
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
            <Brain className="w-5 h-5 text-[#7c3aed]" />
            <h2 className="text-lg font-semibold">Quiz</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-[#71767b] mb-2 block">Modo de generación</label>
              <div className="flex gap-2">
                <button
                  onClick={() => handleQuizModeChange('ia')}
                  className={cn(
                    'flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2',
                    settings.quizMode === 'ia'
                      ? 'bg-[#7c3aed] text-white'
                      : 'bg-[#181818] text-[#71767b] hover:text-[#e7e9ea]'
                  )}
                >
                  🤖 IA
                </button>
                <button
                  onClick={() => handleQuizModeChange('pregenerated')}
                  className={cn(
                    'flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2',
                    settings.quizMode === 'pregenerated'
                      ? 'bg-[#7c3aed] text-white'
                      : 'bg-[#181818] text-[#71767b] hover:text-[#e7e9ea]'
                  )}
                >
                  📝 Pre-generado
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm text-[#71767b] mb-2 block">Preguntas por sesión</label>
              <div className="flex gap-2">
                {QUIZ_COUNT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleQuizCountChange(option.value)}
                    className={cn(
                      'flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors',
                      settings.quizCount === option.value
                        ? 'bg-[#7c3aed] text-white'
                        : 'bg-[#181818] text-[#71767b] hover:text-[#e7e9ea]'
                    )}
                  >
                    {option.value}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#16181c] rounded-xl p-4 border border-[#2f3336]">
          <div className="flex items-center gap-3 mb-4">
            <Download className="w-5 h-5 text-[#7c3aed]" />
            <h2 className="text-lg font-semibold">Datos</h2>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleExport}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg border border-[#2f3336] hover:border-[#7c3aed]/50 text-[#71767b] hover:text-[#e7e9ea] transition-colors"
            >
              <Download className="w-4 h-4" />
              Exportar todo (JSON)
            </button>

            <div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg border border-[#2f3336] hover:border-[#7c3aed]/50 text-[#71767b] hover:text-[#e7e9ea] transition-colors"
              >
                <Upload className="w-4 h-4" />
                Importar backup
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
              {importError && <p className="text-xs text-[#f87171] mt-1.5">{importError}</p>}
              <p className="text-xs text-[#71767b] mt-1.5">Los drops con el mismo ID no se duplican</p>
            </div>
          </div>
        </section>

        <section className="bg-[#16181c] rounded-xl p-4 border border-[#2f3336]">
          <div className="flex items-center gap-3 mb-4">
            <RotateCcw className="w-5 h-5 text-[#7c3aed]" />
            <h2 className="text-lg font-semibold">Restablecer</h2>
          </div>

          <button
            onClick={handleResetClick}
            className={cn(
              'w-full py-3 px-4 rounded-lg border transition-colors',
              confirmReset
                ? 'border-[#f87171] text-[#f87171] bg-[#f87171]/10'
                : 'border-[#2f3336] hover:border-[#f87171] hover:text-[#f87171] text-[#71767b]'
            )}
          >
            {confirmReset
              ? `¿Confirmar? Toca de nuevo (${resetCountdown}s)`
              : 'Restaurar valores predeterminados'}
          </button>
        </section>

        <section className="text-center text-sm text-[#71767b] py-4">
          <p>BrainDrop v1.0.0</p>
        </section>
      </div>
    </div>
  );
}
