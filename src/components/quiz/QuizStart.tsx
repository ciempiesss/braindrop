import { useBrainDrop } from '@/hooks/useBrainDrop';
import type { UseQuizReturn } from '@/hooks/useQuiz';
import type { Difficulty } from '@/types';

interface Props {
  quiz: UseQuizReturn;
}

const DIFFICULTY_LABELS: Record<Difficulty, { label: string; desc: string }> = {
  facil: { label: 'Facil', desc: 'Recall directo' },
  medio: { label: 'Medio', desc: 'Comprension' },
  dificil: { label: 'Dificil', desc: 'Aplicacion' },
};

export function QuizStart({ quiz }: Props) {
  const { collections } = useBrainDrop();
  const {
    config,
    setConfig,
    availableDrops,
    dueDrops,
    curatedAvailable,
    canStart,
    toggleCollectionFilter,
    clearCollectionFilter,
    startSession,
  } = quiz;

  return (
    <div className="quiz-fade-up flex flex-col gap-5 px-1">
      <div className="grid grid-cols-3 gap-3">
        <div className="quiz-card-hover rounded-2xl border border-white/10 bg-[linear-gradient(165deg,rgba(27,35,49,0.96),rgba(15,20,29,1))] p-3 text-center shadow-[0_10px_24px_rgba(2,8,23,0.24)]">
          <p className="text-2xl font-bold text-[#e7e9ea]">{availableDrops}</p>
          <p className="mt-0.5 text-xs text-[#71767b]">drops locales</p>
        </div>
        <div className="quiz-card-hover rounded-2xl border border-white/10 bg-[linear-gradient(165deg,rgba(27,35,49,0.96),rgba(15,20,29,1))] p-3 text-center shadow-[0_10px_24px_rgba(2,8,23,0.24)]">
          <p className="text-2xl font-bold text-[#a78bfa]">{curatedAvailable}</p>
          <p className="mt-0.5 text-xs text-[#71767b]">preguntas curadas</p>
        </div>
        {dueDrops > 0 ? (
          <div className="quiz-card-hover rounded-2xl border border-red-500/30 bg-red-500/8 p-3 text-center shadow-[0_10px_24px_rgba(2,8,23,0.24)]">
            <p className="text-2xl font-bold text-red-400">{dueDrops}</p>
            <p className="mt-0.5 text-xs text-red-400/70">pendientes</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/8 p-3 text-center">
            <p className="text-2xl font-bold text-emerald-400">0</p>
            <p className="mt-0.5 text-xs text-emerald-400/70">pendientes</p>
          </div>
        )}
      </div>

      <div>
        <p className="mb-2 text-xs uppercase tracking-wide text-[#71767b]">Coleccion base</p>
        <select
          value={config.collectionId ?? ''}
          onChange={(event) => setConfig({ collectionId: event.target.value || null })}
            className="w-full cursor-pointer appearance-none rounded-2xl border border-white/10 bg-[linear-gradient(165deg,rgba(27,35,49,0.96),rgba(15,20,29,1))] px-4 py-3 text-sm text-[#e7e9ea] shadow-[0_10px_24px_rgba(2,8,23,0.24)] transition-colors focus:border-[#7c3aed]/60 focus:outline-none"
        >
          <option value="">Todas las colecciones</option>
          {collections.map((collection) => (
            <option key={collection.id} value={collection.id}>
              {collection.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs uppercase tracking-wide text-[#71767b]">Categorias personalizadas</p>
          {(config.collectionIds?.length || 0) > 0 ? (
            <button
              onClick={() => clearCollectionFilter()}
              className="text-[11px] text-[#a78bfa] hover:text-[#c4b5fd]"
            >
              Limpiar
            </button>
          ) : null}
        </div>
        <p className="mb-2 text-[11px] text-[#71767b]">
          Si no eliges categorias, el quiz se balancea automaticamente.
        </p>
        <div className="flex flex-wrap gap-2">
          {collections.map((collection, i) => {
            const active = config.collectionIds?.includes(collection.id) ?? false;
            return (
              <button
                key={collection.id}
                onClick={() => toggleCollectionFilter(collection.id)}
                className={`quiz-btn-press rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-all ${
                  active
                    ? 'border-[#7c3aed] bg-[#7c3aed]/18 text-[#c4b5fd] shadow-[0_10px_24px_rgba(124,58,237,0.24)]'
                    : 'border-white/10 bg-[linear-gradient(165deg,rgba(27,35,49,0.96),rgba(15,20,29,1))] text-[#8b9096] hover:border-[#7c3aed]/45 hover:text-[#c4b5fd] hover:-translate-y-0.5'
                }`}
                style={{ animationDelay: `${i * 40}ms` }}
              >
                {collection.name}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs uppercase tracking-wide text-[#71767b]">Dificultad</p>
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(DIFFICULTY_LABELS) as Difficulty[]).map((difficulty) => (
            <button
              key={difficulty}
              onClick={() => setConfig({ difficulty })}
              className={`quiz-btn-press quiz-card-hover rounded-2xl border py-3 text-sm font-semibold transition-all ${
                config.difficulty === difficulty
                  ? 'border-[#7c3aed] bg-[#7c3aed]/20 text-[#a78bfa] shadow-[0_10px_24px_rgba(124,58,237,0.24)]'
                  : 'border-white/10 bg-[linear-gradient(165deg,rgba(27,35,49,0.96),rgba(15,20,29,1))] text-[#71767b] hover:border-[#7c3aed]/40'
              }`}
            >
              <span className="block">{DIFFICULTY_LABELS[difficulty].label}</span>
              <span className="mt-0.5 block text-[10px] opacity-70">
                {DIFFICULTY_LABELS[difficulty].desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs uppercase tracking-wide text-[#71767b]">Preguntas</p>
        <div className="grid grid-cols-3 gap-2">
          {([5, 10, 20] as const).map((count) => (
            <button
              key={count}
              onClick={() => setConfig({ count })}
              className={`quiz-btn-press quiz-card-hover rounded-2xl border py-3 text-sm font-bold transition-all ${
                config.count === count
                  ? 'border-[#7c3aed] bg-[#7c3aed]/20 text-[#a78bfa] shadow-[0_10px_24px_rgba(124,58,237,0.24)]'
                  : 'border-white/10 bg-[linear-gradient(165deg,rgba(27,35,49,0.96),rgba(15,20,29,1))] text-[#71767b] hover:border-[#7c3aed]/40'
              }`}
            >
              {count}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs uppercase tracking-wide text-[#71767b]">Modo</p>
        <div className="grid grid-cols-3 gap-2">
          {([
            { value: 'curated', label: 'Curadas', desc: 'Banco editorial' },
            { value: 'local', label: 'Local', desc: 'Tus drops' },
            { value: 'ia', label: 'IA', desc: 'Generado al vuelo' },
          ] as const).map(({ value, label, desc }) => (
            <button
              key={value}
              onClick={() => setConfig({ mode: value })}
              className={`quiz-btn-press quiz-card-hover rounded-2xl border py-3 text-sm font-semibold transition-all ${
                config.mode === value
                  ? 'border-[#7c3aed] bg-[#7c3aed]/20 text-[#a78bfa] shadow-[0_10px_24px_rgba(124,58,237,0.24)]'
                  : 'border-white/10 bg-[linear-gradient(165deg,rgba(27,35,49,0.96),rgba(15,20,29,1))] text-[#71767b] hover:border-[#7c3aed]/40'
              }`}
            >
              <span className="block">{label}</span>
              <span className="mt-0.5 block text-[10px] opacity-70">{desc}</span>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={startSession}
        disabled={!canStart}
        className="quiz-btn-press w-full rounded-2xl bg-[linear-gradient(135deg,#7c3aed,#5b21b6)] py-4 text-base font-black text-white shadow-[0_14px_32px_rgba(124,58,237,0.36)] transition-all hover:translate-y-[-1px] hover:brightness-110 hover:shadow-[0_18px_40px_rgba(124,58,237,0.45)] disabled:cursor-not-allowed disabled:opacity-40"
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
