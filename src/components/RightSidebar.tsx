import { useBrainDrop } from '@/hooks/useBrainDrop';

interface RightSidebarProps {
  onStartQuiz: () => void;
}

export function RightSidebar({ onStartQuiz }: RightSidebarProps) {
  const { drops, getDropsForReview } = useBrainDrop();
  
  const dropsForReview = getDropsForReview().length;
  const reviewedThisWeek = Math.floor(drops.length * 0.7);
  const weeklyGoal = 20;
  const progressPercent = Math.round((reviewedThisWeek / weeklyGoal) * 100);
  const progressDegrees = (progressPercent / 100) * 360;

  const allTags = Array.from(new Set(drops.flatMap((d) => d.tags))).slice(0, 8);

  return (
    <aside className="hidden lg:block w-[320px] p-5 bg-[#0a0a0a] flex-shrink-0">
      <div className="bg-[#16181c] rounded-2xl border border-[#2f3336] mb-4 overflow-hidden">
        <div className="p-4 border-b border-[#2f3336] font-extrabold text-[17px] text-[#e7e9ea]">
          Tu progreso semanal
        </div>
        <div className="flex items-center gap-3 p-4">
          <div 
            className="w-[60px] h-[60px] rounded-full flex items-center justify-center"
            style={{
              background: `conic-gradient(#7c3aed 0deg ${progressDegrees}deg, #2f3336 ${progressDegrees}deg 360deg)`
            }}
          >
            <div className="w-12 h-12 rounded-full bg-[#16181c] flex items-center justify-center font-extrabold text-[14px] text-[#e7e9ea]">
              {progressPercent}%
            </div>
          </div>
          <div className="text-[13px] text-[#b8b8b8]">
            <strong className="text-[#e7e9ea]">{reviewedThisWeek} de {weeklyGoal} drops</strong><br/>
            repasados esta semana
          </div>
        </div>
      </div>

      {dropsForReview > 0 && (
        <div className="bg-[#16181c] rounded-2xl border border-[#2f3336] mb-4 overflow-hidden">
          <div className="p-4 border-b border-[#2f3336] font-extrabold text-[17px] text-[#e7e9ea]">
            🕐 Hora de quiz
          </div>
          <div className="p-4 text-center">
            <p className="text-[14px] text-[#b8b8b8] mb-3">
              Tienes <strong className="text-[#e7e9ea]">{dropsForReview} drops</strong> listos para repasar
            </p>
            <button 
              onClick={onStartQuiz}
              className="bg-gradient-to-r from-[#7c3aed] to-[#2563eb] text-white px-6 py-3 rounded-full font-bold hover:opacity-90 transition-opacity"
            >
              Empezar Quiz 🎯
            </button>
          </div>
        </div>
      )}

      <div className="bg-[#16181c] rounded-2xl border border-[#2f3336] mb-4 overflow-hidden">
        <div className="p-4 border-b border-[#2f3336] font-extrabold text-[17px] text-[#e7e9ea]">
          Tus temas
        </div>
        <div className="flex flex-wrap gap-2 p-3">
          {allTags.map((tag) => (
            <span 
              key={tag}
              className="px-3 py-1.5 bg-[#1d1f23] rounded-full text-[13px] text-[#a78bfa] cursor-pointer hover:bg-[#2d2f33] transition-colors"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-[#16181c] rounded-2xl border border-[#2f3336] overflow-hidden">
        <div className="p-4 border-b border-[#2f3336] font-extrabold text-[17px] text-[#e7e9ea]">
          🔥 Trending drops
        </div>
        
        {[
          { title: 'Efecto Dunning-Kruger', count: 234 },
          { title: 'Ley de Parkinson', count: 189 },
          { title: 'Paradoja de Fermi', count: 156 },
        ].map((item) => (
          <div 
            key={item.title}
            className="p-3 cursor-pointer hover:bg-[#1d1f23] transition-colors border-b border-[#2f3336] last:border-b-0"
          >
            <div className="font-bold text-[14px] text-[#e7e9ea]">{item.title}</div>
            <div className="text-[13px] text-[#71767b] mt-0.5">{item.count} repeticiones esta semana</div>
          </div>
        ))}
      </div>
    </aside>
  );
}
