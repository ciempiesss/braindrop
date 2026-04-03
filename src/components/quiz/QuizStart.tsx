import { useBrainDrop } from '@/hooks/useBrainDrop';
import type { UseQuizReturn } from '@/hooks/useQuiz';
import type { Difficulty } from '@/types';

interface Props {
  quiz: UseQuizReturn;
}

const DIFFICULTY_LABELS: Record<Difficulty, { label: string; desc: string }> = {
  facil:   { label: 'Fácil',   desc: 'Recall directo' },
  medio:   { label: 'Medio',   desc: 'Comprensión' },
  dificil: { label: 'Difícil', desc: 'Aplicación' },
};

export function QuizStart({ quiz }: Props) {
  const { collections } = useBrainDrop();
  const { config, setConfig, availableDrops, dueDrops, curatedAvailable, canStart, startSession } = quiz;

  return (
    <div className="flex flex-col gap-6 px-1">
      {/* Stats */}
      <div className="flex gap-3">
        <div className="flex-1 bg-[#16181c] border border-[#2f3336] rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-[#e7e9ea]">{availableDrops}</p>
          <p className="text-xs text-[#71767b] mt-0.5">drops locales</p>
        </div>
        <div className="flex-1 bg-[#16181c] border border-[#2f3336] rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-[#a78bfa]">{curatedAvailable}</p>
          <p className="text-xs text-[#71767b] mt-0.5">preguntas curadas</p>
        </div>
        {dueDrops > 0 && (
          <div className="flex-1 bg-red-500/5 border border-red-500/30 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-red-400">{dueDrops}</p>
            <p className="text-xs text-red-400/70 mt-0.5">pendientes de repaso</p>
          </div>
        )}
      </div>

      {/* Colección */}
      <div>
        <p className="text-xs text-[#71767b] uppercase tracking-wide mb-2">Colección</p>
        <select
          value={config.collectionId ?? ''}
          onChange={e => setConfig({ collectionId: e.target.value || null })}
          className="w-full bg-[#16181c] border border-[#2f3336] rounded-xl px-4 py-3 text-[#e7e9ea] text-sm focus:outline-none focus:border-[#7c3aed]/60 appearance-none cursor-pointer"
        >
          <option value="">Todas las colecciones</option>
          {collections.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Dificultad */}
      <div>
        <p className="text-xs text-[#71767b] uppercase tracking-wide mb-2">Dificultad</p>
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(DIFFICULTY_LABELS) as Difficulty[]).map(d => (
            <button
              key={d}
              onClick={() => setConfig({ difficulty: d })}
              className={`py-3 rounded-xl text-sm font-semibold transition-all border ${
                config.difficulty === d
                  ? 'bg-[#7c3aed]/20 border-[#7c3aed] text-[#a78bfa]'
                  : 'bg-[#16181c] border-[#2f3336] text-[#71767b] hover:border-[#7c3aed]/40'
              }`}
            >
              <span className="block">{DIFFICULTY_LABELS[d].label}</span>
              <span className="block text-[10px] opacity-70 mt-0.5">{DIFFICULTY_LABELS[d].desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Cantidad */}
      <div>
        <p className="text-xs text-[#71767b] uppercase tracking-wide mb-2">Preguntas</p>
        <div className="grid grid-cols-3 gap-2">
          {([5, 10, 20] as const).map(n => (
            <button
              key={n}
              onClick={() => setConfig({ count: n })}
              className={`py-3 rounded-xl text-sm font-bold transition-all border ${
                config.count === n
                  ? 'bg-[#7c3aed]/20 border-[#7c3aed] text-[#a78bfa]'
                  : 'bg-[#16181c] border-[#2f3336] text-[#71767b] hover:border-[#7c3aed]/40'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Modo */}
      <div>
        <p className="text-xs text-[#71767b] uppercase tracking-wide mb-2">Modo de generación</p>
        <div className="grid grid-cols-3 gap-2">
          {([
            { value: 'curated', label: 'Curadas', desc: 'Escritas a mano' },
            { value: 'local',   label: 'Algoritmo', desc: 'De tus drops' },
            { value: 'ia',      label: 'IA 🤖',   desc: 'Con Groq' },
          ] as const).map(({ value, label, desc }) => (
            <button
              key={value}
              onClick={() => setConfig({ mode: value })}
              className={`py-3 rounded-xl text-sm font-semibold transition-all border ${
                config.mode === value
                  ? 'bg-[#7c3aed]/20 border-[#7c3aed] text-[#a78bfa]'
                  : 'bg-[#16181c] border-[#2f3336] text-[#71767b] hover:border-[#7c3aed]/40'
              }`}
            >
              <span className="block">{label}</span>
              <span className="block text-[10px] opacity-70 mt-0.5">{desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Botón empezar */}
      <button
        onClick={startSession}
        disabled={!canStart}
        className="w-full py-4 rounded-xl bg-[#7c3aed] text-white font-bold text-base transition-all hover:bg-[#6d28d9] disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {!canStart
          ? config.mode === 'curated'
            ? 'Sin preguntas curadas ni drops locales'
            : 'Sin drops disponibles'
          : 'Empezar sesion'}
      </button>
    </div>
  );
}
