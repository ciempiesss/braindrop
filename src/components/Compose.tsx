import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { DropType } from '@/types';
import { DROP_TYPE_CONFIG } from '@/types';
import DOMPurify from 'dompurify';
import { generateDropsFromTopic, type GeneratedDrop } from '@/lib/groq';
import { useBrainDrop } from '@/hooks/useBrainDrop';

const MAX_TITLE_LENGTH = 200;
const MAX_CONTENT_LENGTH = 5000;
const MAX_TAGS = 10;
const MAX_TAG_LENGTH = 30;
const MINIMIZED_KEY = 'braindrop_compose_minimized';

function loadMinimizedState(): boolean {
  try {
    const stored = localStorage.getItem(MINIMIZED_KEY);
    return stored === 'true';
  } catch {
    return false;
  }
}

interface ComposeProps {
  onSubmit: (drop: {
    title: string;
    content: string;
    type: DropType;
    tags: string[];
    codeSnippet?: string;
    visualContent?: string;
  }) => void;
  collectionId?: string;
}

const DROP_TYPES: DropType[] = ['definition', 'ruptura', 'puente', 'operativo', 'code'];

export function Compose({ onSubmit, collectionId }: ComposeProps) {
  const { collections } = useBrainDrop();
  const [isMinimized, setIsMinimized] = useState(loadMinimizedState);
  const [title, setTitle] = useState('');
  const [mode, setMode] = useState<'manual' | 'ai'>('manual');
  const [aiTopic, setAiTopic] = useState('');
  const [aiCollection, setAiCollection] = useState(collectionId || '');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiDrops, setAiDrops] = useState<GeneratedDrop[]>([]);
  const [aiError, setAiError] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(MINIMIZED_KEY, String(isMinimized));
    } catch {
      // ignore storage errors
    }
  }, [isMinimized]);

  const handleToggleMinimize = () => setIsMinimized(!isMinimized);
  const [content, setContent] = useState('');
  const [type, setType] = useState<DropType>('definition');
  const [tags, setTags] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [showVisual, setShowVisual] = useState(false);
  const [codeSnippet, setCodeSnippet] = useState('');
  const [visualContent, setVisualContent] = useState('');

  const handleGenerateAI = async () => {
    if (!aiTopic.trim()) return;
    setAiLoading(true);
    setAiError('');
    setAiDrops([]);
    try {
      const collectionName = collections.find(c => c.id === aiCollection)?.name || aiCollection;
      const drops = await generateDropsFromTopic(aiTopic.trim(), collectionName);
      setAiDrops(drops);
    } catch {
      setAiError('Error generando drops. Verifica tu API key de Groq.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleAcceptAIDrop = (drop: GeneratedDrop) => {
    onSubmit({
      title: DOMPurify.sanitize(drop.title, { ALLOWED_TAGS: [] }),
      content: DOMPurify.sanitize(drop.content, { ALLOWED_TAGS: [] }),
      type: drop.type,
      tags: drop.tags.map(t => DOMPurify.sanitize(t, { ALLOWED_TAGS: [] })),
      codeSnippet: drop.codeSnippet ? DOMPurify.sanitize(drop.codeSnippet, { ALLOWED_TAGS: [] }) : undefined,
    });
    setAiDrops(prev => prev.filter(d => d !== drop));
  };

  const handleAcceptAllAIDrops = () => {
    aiDrops.forEach(drop => {
      onSubmit({
        title: DOMPurify.sanitize(drop.title, { ALLOWED_TAGS: [] }),
        content: DOMPurify.sanitize(drop.content, { ALLOWED_TAGS: [] }),
        type: drop.type,
        tags: drop.tags.map(t => DOMPurify.sanitize(t, { ALLOWED_TAGS: [] })),
        codeSnippet: drop.codeSnippet ? DOMPurify.sanitize(drop.codeSnippet, { ALLOWED_TAGS: [] }) : undefined,
      });
    });
    setAiDrops([]);
    setAiTopic('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    if (title.length > MAX_TITLE_LENGTH || content.length > MAX_CONTENT_LENGTH) return;

    const sanitizedTitle = DOMPurify.sanitize(title.trim(), { ALLOWED_TAGS: [] });
    const sanitizedContent = DOMPurify.sanitize(content.trim(), { ALLOWED_TAGS: [] });
    const sanitizedTags = tags
      .split(',')
      .map((t) => DOMPurify.sanitize(t.trim(), { ALLOWED_TAGS: [] }))
      .filter(Boolean)
      .slice(0, MAX_TAGS)
      .map((t) => t.slice(0, MAX_TAG_LENGTH));

    onSubmit({
      title: sanitizedTitle,
      content: sanitizedContent,
      type,
      tags: sanitizedTags,
      codeSnippet: showCode ? DOMPurify.sanitize(codeSnippet, { ALLOWED_TAGS: ['code', 'pre'] }) : undefined,
      visualContent: showVisual ? DOMPurify.sanitize(visualContent, { ALLOWED_TAGS: [] }) : undefined,
    });

    setTitle('');
    setContent('');
    setTags('');
    setCodeSnippet('');
    setVisualContent('');
    setShowCode(false);
    setShowVisual(false);
  };

  if (isMinimized) {
    return (
      <div 
        onClick={handleToggleMinimize}
        className="p-4 border-b border-[#2f3336] bg-[#16181c] cursor-pointer hover:bg-[#1c1f23] transition-colors"
      >
        <div className="flex items-center justify-between">
          <span className="text-[#a0a0a0] font-medium">Crear drop +</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleMinimize();
            }}
            className="text-[#71767b] hover:text-white transition-colors"
          >
            ▲
          </button>
        </div>
      </div>
    );
  }

  const DROP_TYPE_COLORS: Record<string, string> = {
    definition: 'text-blue-400 border-blue-500/40 bg-blue-500/10',
    ruptura: 'text-red-400 border-red-500/40 bg-red-500/10',
    puente: 'text-purple-400 border-purple-500/40 bg-purple-500/10',
    operativo: 'text-amber-400 border-amber-500/40 bg-amber-500/10',
    code: 'text-violet-400 border-violet-500/40 bg-violet-500/10',
  };

  return (
    <div className="border-b border-[#2f3336]">
      {/* Header con toggle manual/IA y minimizar */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <div className="flex gap-1 bg-[#16181c] rounded-full p-1 border border-[#2f3336]">
          <button
            type="button"
            onClick={() => setMode('manual')}
            className={cn(
              'px-4 py-1.5 rounded-full text-[12px] font-medium transition-all',
              mode === 'manual'
                ? 'bg-[#7c3aed] text-white'
                : 'text-[#71767b] hover:text-white'
            )}
          >
            ✍️ Manual
          </button>
          <button
            type="button"
            onClick={() => setMode('ai')}
            className={cn(
              'px-4 py-1.5 rounded-full text-[12px] font-medium transition-all',
              mode === 'ai'
                ? 'bg-[#7c3aed] text-white'
                : 'text-[#71767b] hover:text-white'
            )}
          >
            🤖 IA
          </button>
        </div>
        <button
          type="button"
          onClick={handleToggleMinimize}
          className="text-[#71767b] hover:text-white transition-colors text-lg"
        >
          ▼
        </button>
      </div>

      {/* Modo manual */}
      {mode === 'manual' && (
        <form onSubmit={handleSubmit} className="px-5 pb-5">
          <div className="flex flex-wrap gap-2 mb-4">
            {DROP_TYPES.map((t) => {
              const config = DROP_TYPE_CONFIG[t];
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={cn(
                    'px-3.5 py-2 rounded-full text-[13px] transition-all border',
                    type === t
                      ? 'bg-[#7c3aed] border-[#7c3aed] text-white'
                      : 'bg-transparent border-[#2f3336] text-[#a0a0a0] hover:border-[#7c3aed] hover:text-[#7c3aed]'
                  )}
                >
                  {config.emoji} {config.label}
                </button>
              );
            })}
          </div>

          <input
            type="text"
            placeholder="Título del drop..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={MAX_TITLE_LENGTH}
            className="w-full bg-transparent text-lg font-semibold placeholder:text-[#71767b] focus:outline-none mb-2 text-white"
          />
          <div className="text-xs text-[#71767b] mb-2">{title.length}/{MAX_TITLE_LENGTH}</div>

          <textarea
            placeholder="¿Qué aprendiste hoy?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={MAX_CONTENT_LENGTH}
            rows={3}
            className="w-full bg-transparent text-base placeholder:text-[#71767b] focus:outline-none resize-none text-[#e0e0e0]"
          />
          <div className="text-xs text-[#71767b] mb-2">{content.length}/{MAX_CONTENT_LENGTH}</div>

          {showVisual && (
            <div className="mt-3 mb-3">
              <textarea
                placeholder="🎨 Diagrama ASCII, emojis, visual..."
                value={visualContent}
                onChange={(e) => setVisualContent(e.target.value)}
                rows={4}
                className="w-full bg-[#16181c] border border-[#2f3336] rounded-xl p-3 text-sm font-mono placeholder:text-[#71767b] focus:outline-none focus:border-[#7c3aed] text-[#a78bfa]"
              />
            </div>
          )}

          {showCode && (
            <div className="mt-3 mb-3">
              <textarea
                placeholder="// Pega tu código aquí..."
                value={codeSnippet}
                onChange={(e) => setCodeSnippet(e.target.value)}
                rows={4}
                className="w-full bg-[#16181c] border border-[#2f3336] rounded-xl p-3 text-xs font-mono placeholder:text-[#71767b] focus:outline-none focus:border-[#7c3aed] text-[#a78bfa]"
              />
            </div>
          )}

          <div className="flex items-center justify-between mt-3 pt-2">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setShowVisual(!showVisual)}
                className={cn('transition-colors text-lg', showVisual ? 'text-[#a78bfa]' : 'text-[#a0a0a0] hover:text-white')}
              >
                🎨
              </button>
              <button
                type="button"
                onClick={() => setShowCode(!showCode)}
                className={cn('transition-colors text-lg', showCode ? 'text-[#c084fc]' : 'text-[#a0a0a0] hover:text-white')}
              >
                💻
              </button>
              <input
                type="text"
                placeholder="tags, separados, por coma"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="bg-transparent text-sm w-40 placeholder:text-[#71767b] focus:outline-none text-[#e0e0e0]"
              />
            </div>
            <button
              type="submit"
              disabled={!title.trim() || !content.trim()}
              className={cn(
                'px-6 py-2.5 rounded-full font-bold text-[15px] transition-colors',
                title.trim() && content.trim()
                  ? 'bg-[#7c3aed] text-white hover:bg-[#6d28d9]'
                  : 'bg-[#2f3336] text-[#71767b] cursor-not-allowed'
              )}
            >
              Drop it! 🧠
            </button>
          </div>
        </form>
      )}

      {/* Modo IA */}
      {mode === 'ai' && (
        <div className="px-5 pb-5">
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="Tema o concepto a aprender..."
              value={aiTopic}
              onChange={(e) => setAiTopic(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleGenerateAI(); }}
              className="flex-1 bg-[#16181c] border border-[#2f3336] rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-[#71767b] focus:outline-none focus:border-[#7c3aed]"
            />
            <select
              value={aiCollection}
              onChange={(e) => setAiCollection(e.target.value)}
              className="bg-[#16181c] border border-[#2f3336] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#7c3aed] max-w-[140px]"
            >
              <option value="">Colección...</option>
              {collections.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleGenerateAI}
              disabled={!aiTopic.trim() || aiLoading}
              className={cn(
                'px-4 py-2.5 rounded-xl text-sm font-bold transition-all',
                aiTopic.trim() && !aiLoading
                  ? 'bg-[#7c3aed] text-white hover:bg-[#6d28d9]'
                  : 'bg-[#2f3336] text-[#71767b] cursor-not-allowed'
              )}
            >
              {aiLoading ? '⏳' : '✨ Generar'}
            </button>
          </div>

          {aiError && (
            <p className="text-red-400 text-xs mb-3">{aiError}</p>
          )}

          {aiLoading && (
            <div className="flex items-center gap-2 text-[#71767b] text-sm py-4">
              <span className="animate-pulse">🤖</span>
              <span>Generando drops...</span>
            </div>
          )}

          {aiDrops.length > 0 && (
            <div className="space-y-3 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#71767b]">{aiDrops.length} drop{aiDrops.length > 1 ? 's' : ''} generado{aiDrops.length > 1 ? 's' : ''}</span>
                {aiDrops.length > 1 && (
                  <button
                    type="button"
                    onClick={handleAcceptAllAIDrops}
                    className="text-xs text-[#7c3aed] hover:text-white transition-colors font-medium"
                  >
                    Aceptar todos →
                  </button>
                )}
              </div>
              {aiDrops.map((drop, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-white/10 bg-[#16181c] p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={cn('px-2.5 py-1 rounded-full text-[11px] font-semibold border', DROP_TYPE_COLORS[drop.type])}>
                      {DROP_TYPE_CONFIG[drop.type]?.emoji} {DROP_TYPE_CONFIG[drop.type]?.label}
                    </span>
                    <span className="text-xs text-white/30">{drop.tags.map(t => `#${t}`).join(' ')}</span>
                  </div>
                  <p className="text-white font-semibold text-sm mb-1">{drop.title}</p>
                  <p className="text-white/60 text-xs leading-relaxed mb-3">{drop.content}</p>
                  {drop.codeSnippet && (
                    <pre className="text-[10px] font-mono text-[#a78bfa] bg-black/30 rounded-lg p-2 mb-3 overflow-x-auto whitespace-pre-wrap">{drop.codeSnippet}</pre>
                  )}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleAcceptAIDrop(drop)}
                      className="flex-1 py-1.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-lg text-xs font-medium transition-colors"
                    >
                      ✓ Guardar
                    </button>
                    <button
                      type="button"
                      onClick={() => setAiDrops(prev => prev.filter((_, idx) => idx !== i))}
                      className="px-3 py-1.5 text-white/40 hover:text-red-400 rounded-lg text-xs transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
