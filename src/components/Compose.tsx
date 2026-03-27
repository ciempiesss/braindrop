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

// ─── Neumorphism tokens ───────────────────────────────────────────────────────
const NEU_BASE = '#0f0f14';
const NEU_RAISED = '6px 6px 14px rgba(0,0,0,0.55), -3px -3px 8px rgba(255,255,255,0.025)';
const NEU_INSET = 'inset 3px 3px 7px rgba(0,0,0,0.5), inset -2px -2px 5px rgba(255,255,255,0.02)';
const NEU_PRESSED = 'inset 4px 4px 10px rgba(0,0,0,0.6), inset -2px -2px 6px rgba(255,255,255,0.015)';
const NEU_BTN_ACTIVE = '3px 3px 8px rgba(109,40,217,0.4), -2px -2px 6px rgba(139,71,245,0.15), inset 0 1px 0 rgba(255,255,255,0.06)';

function loadMinimizedState(): boolean {
  try {
    const stored = localStorage.getItem(MINIMIZED_KEY);
    if (stored === null) return true;
    return stored === 'true';
  } catch {
    return true;
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
  const [mode, setMode] = useState<'manual' | 'ai'>('manual');

  // Manual
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<DropType>('definition');
  const [tags, setTags] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [showVisual, setShowVisual] = useState(false);
  const [codeSnippet, setCodeSnippet] = useState('');
  const [visualContent, setVisualContent] = useState('');

  // AI
  const [aiTopic, setAiTopic] = useState('');
  const [aiCollection, setAiCollection] = useState(collectionId || '');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiDrops, setAiDrops] = useState<GeneratedDrop[]>([]);
  const [aiError, setAiError] = useState('');

  useEffect(() => {
    try { localStorage.setItem(MINIMIZED_KEY, String(isMinimized)); } catch { /* ignore */ }
  }, [isMinimized]);

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
      .map(t => DOMPurify.sanitize(t.trim(), { ALLOWED_TAGS: [] }))
      .filter(Boolean)
      .slice(0, MAX_TAGS)
      .map(t => t.slice(0, MAX_TAG_LENGTH));

    onSubmit({
      title: sanitizedTitle,
      content: sanitizedContent,
      type,
      tags: sanitizedTags,
      codeSnippet: showCode ? DOMPurify.sanitize(codeSnippet, { ALLOWED_TAGS: ['code', 'pre'] }) : undefined,
      visualContent: showVisual ? DOMPurify.sanitize(visualContent, { ALLOWED_TAGS: [] }) : undefined,
    });

    setTitle(''); setContent(''); setTags('');
    setCodeSnippet(''); setVisualContent('');
    setShowCode(false); setShowVisual(false);
  };

  // ─── Minimized ──────────────────────────────────────────────────────────────
  if (isMinimized) {
    return (
      <div
        onClick={() => setIsMinimized(false)}
        className="mx-4 my-3 px-5 py-3.5 rounded-2xl cursor-pointer flex items-center justify-between transition-all active:scale-[0.99]"
        style={{ background: NEU_BASE, boxShadow: NEU_RAISED }}
      >
        <span className="text-white/30 text-sm font-medium tracking-wide">Nuevo drop...</span>
        <span className="text-white/20 text-lg">+</span>
      </div>
    );
  }

  // ─── Expanded ───────────────────────────────────────────────────────────────
  return (
    <div
      className="mx-4 my-3 rounded-2xl overflow-hidden"
      style={{ background: NEU_BASE, boxShadow: NEU_RAISED }}
    >
      {/* Header: mode toggle + minimizar */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div
          className="flex rounded-xl p-1 gap-1"
          style={{ boxShadow: NEU_PRESSED, background: '#0a0a10' }}
        >
          {(['manual', 'ai'] as const).map(m => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className="px-4 py-1.5 rounded-lg text-[12px] font-semibold transition-all"
              style={{
                background: mode === m ? 'linear-gradient(135deg, #7c3aed, #5b21b6)' : 'transparent',
                color: mode === m ? '#fff' : 'rgba(255,255,255,0.3)',
                boxShadow: mode === m ? NEU_BTN_ACTIVE : 'none',
              }}
            >
              {m === 'manual' ? 'Manual' : 'IA'}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setIsMinimized(true)}
          className="text-white/20 hover:text-white/50 transition-colors text-sm px-2 py-1"
        >
          ✕
        </button>
      </div>

      {/* ─── Modo Manual ─────────────────────────────────────────────────── */}
      {mode === 'manual' && (
        <form onSubmit={handleSubmit} className="px-4 pb-4 space-y-3">
          {/* Type selector */}
          <div className="flex flex-wrap gap-1.5">
            {DROP_TYPES.map(t => {
              const cfg = DROP_TYPE_CONFIG[t];
              const active = type === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className="px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all"
                  style={{
                    background: active ? 'linear-gradient(135deg, #7c3aed22, #7c3aed11)' : '#0a0a10',
                    color: active ? '#a78bfa' : 'rgba(255,255,255,0.25)',
                    boxShadow: active ? `${NEU_PRESSED}, inset 0 0 0 1px rgba(124,58,237,0.3)` : NEU_PRESSED,
                    border: 'none',
                  }}
                >
                  {cfg.emoji} {cfg.label}
                </button>
              );
            })}
          </div>

          {/* Title */}
          <div
            className="rounded-xl px-4 py-3"
            style={{ boxShadow: NEU_INSET, background: '#0a0a10' }}
          >
            <input
              type="text"
              placeholder="Título..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={MAX_TITLE_LENGTH}
              className="w-full bg-transparent text-[15px] font-semibold placeholder:text-white/20 focus:outline-none text-white"
            />
            {title.length > 150 && (
              <span className="text-[10px] text-white/20">{title.length}/{MAX_TITLE_LENGTH}</span>
            )}
          </div>

          {/* Content */}
          <div
            className="rounded-xl px-4 py-3"
            style={{ boxShadow: NEU_INSET, background: '#0a0a10' }}
          >
            <textarea
              placeholder="¿Qué aprendiste?"
              value={content}
              onChange={e => setContent(e.target.value)}
              maxLength={MAX_CONTENT_LENGTH}
              rows={3}
              className="w-full bg-transparent text-[14px] placeholder:text-white/20 focus:outline-none resize-none text-white/80 leading-relaxed"
            />
            {content.length > 4000 && (
              <span className="text-[10px] text-white/20">{content.length}/{MAX_CONTENT_LENGTH}</span>
            )}
          </div>

          {/* Visual opcional */}
          {showVisual && (
            <div
              className="rounded-xl px-4 py-3"
              style={{ boxShadow: NEU_INSET, background: '#0a0a10' }}
            >
              <textarea
                placeholder="Diagrama ASCII, emojis, visual..."
                value={visualContent}
                onChange={e => setVisualContent(e.target.value)}
                rows={4}
                className="w-full bg-transparent text-sm font-mono placeholder:text-white/20 focus:outline-none text-[#a78bfa] leading-relaxed"
              />
            </div>
          )}

          {/* Code opcional */}
          {showCode && (
            <div
              className="rounded-xl px-4 py-3"
              style={{ boxShadow: NEU_INSET, background: '#080810' }}
            >
              <textarea
                placeholder="// Código..."
                value={codeSnippet}
                onChange={e => setCodeSnippet(e.target.value)}
                rows={4}
                className="w-full bg-transparent text-xs font-mono placeholder:text-white/20 focus:outline-none text-[#a78bfa] leading-relaxed"
              />
            </div>
          )}

          {/* Footer: extras + submit */}
          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => setShowVisual(!showVisual)}
              className="transition-colors text-sm"
              style={{ color: showVisual ? '#a78bfa' : 'rgba(255,255,255,0.2)' }}
              title="Visual"
            >
              🎨
            </button>
            <button
              type="button"
              onClick={() => setShowCode(!showCode)}
              className="transition-colors text-sm"
              style={{ color: showCode ? '#a78bfa' : 'rgba(255,255,255,0.2)' }}
              title="Código"
            >
              💻
            </button>
            <div
              className="flex-1 rounded-xl px-3 py-2"
              style={{ boxShadow: NEU_INSET, background: '#0a0a10' }}
            >
              <input
                type="text"
                placeholder="tags, separados, por coma"
                value={tags}
                onChange={e => setTags(e.target.value)}
                className="w-full bg-transparent text-[12px] placeholder:text-white/20 focus:outline-none text-white/60"
              />
            </div>
            <button
              type="submit"
              disabled={!title.trim() || !content.trim()}
              className="px-5 py-2.5 rounded-xl font-bold text-[13px] transition-all"
              style={{
                background: title.trim() && content.trim()
                  ? 'linear-gradient(135deg, #7c3aed, #5b21b6)'
                  : '#1a1a22',
                color: title.trim() && content.trim() ? '#fff' : 'rgba(255,255,255,0.2)',
                boxShadow: title.trim() && content.trim() ? NEU_BTN_ACTIVE : NEU_PRESSED,
                cursor: title.trim() && content.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              Drop
            </button>
          </div>
        </form>
      )}

      {/* ─── Modo IA ──────────────────────────────────────────────────────── */}
      {mode === 'ai' && (
        <div className="px-4 pb-4 space-y-3">
          {/* Input + colección + generar */}
          <div className="flex gap-2">
            <div
              className="flex-1 rounded-xl px-4 py-2.5"
              style={{ boxShadow: NEU_INSET, background: '#0a0a10' }}
            >
              <input
                type="text"
                placeholder="Tema o concepto..."
                value={aiTopic}
                onChange={e => setAiTopic(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleGenerateAI(); }}
                className="w-full bg-transparent text-sm placeholder:text-white/20 focus:outline-none text-white"
              />
            </div>
            <div
              className="rounded-xl px-3 py-2.5"
              style={{ boxShadow: NEU_INSET, background: '#0a0a10' }}
            >
              <select
                value={aiCollection}
                onChange={e => setAiCollection(e.target.value)}
                className="bg-transparent text-white/60 text-[12px] focus:outline-none max-w-[110px]"
              >
                <option value="">Colección</option>
                {collections.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerateAI}
            disabled={!aiTopic.trim() || aiLoading}
            className="w-full py-2.5 rounded-xl font-bold text-[13px] transition-all"
            style={{
              background: aiTopic.trim() && !aiLoading
                ? 'linear-gradient(135deg, #7c3aed, #5b21b6)'
                : '#1a1a22',
              color: aiTopic.trim() && !aiLoading ? '#fff' : 'rgba(255,255,255,0.2)',
              boxShadow: aiTopic.trim() && !aiLoading ? NEU_BTN_ACTIVE : NEU_PRESSED,
            }}
          >
            {aiLoading ? 'Generando...' : 'Generar drops'}
          </button>

          {aiError && <p className="text-red-400 text-xs">{aiError}</p>}

          {/* Lista de drops generados — scrolleable */}
          {aiDrops.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-white/30">{aiDrops.length} drops generados</span>
                {aiDrops.length > 1 && (
                  <button
                    type="button"
                    onClick={handleAcceptAllAIDrops}
                    className="text-[11px] text-[#7c3aed] hover:text-[#a78bfa] transition-colors font-semibold"
                  >
                    Guardar todos
                  </button>
                )}
              </div>

              {/* Contenedor scrolleable — fix para ver los 5 drops */}
              <div className="max-h-[52vh] overflow-y-auto space-y-2 pr-1" style={{ scrollbarWidth: 'thin' }}>
                {aiDrops.map((drop, i) => {
                  const cfg = DROP_TYPE_CONFIG[drop.type];
                  return (
                    <div
                      key={i}
                      className="rounded-xl p-3"
                      style={{ boxShadow: NEU_INSET, background: '#0a0a10' }}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-semibold text-white/40">
                          {cfg?.emoji} {cfg?.label}
                        </span>
                        <span className="text-[10px] text-white/20 truncate">
                          {drop.tags.slice(0, 3).map(t => `#${t}`).join(' ')}
                        </span>
                      </div>
                      <p className="text-white/90 font-semibold text-[13px] mb-1 leading-snug">{drop.title}</p>
                      <p className="text-white/45 text-[12px] leading-relaxed mb-2.5 line-clamp-3">{drop.content}</p>
                      {drop.codeSnippet && (
                        <pre className="text-[10px] font-mono text-[#a78bfa]/70 bg-black/30 rounded-lg p-2 mb-2.5 overflow-x-auto whitespace-pre-wrap line-clamp-3">
                          {drop.codeSnippet}
                        </pre>
                      )}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleAcceptAIDrop(drop)}
                          className="flex-1 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
                          style={{
                            background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
                            color: '#fff',
                            boxShadow: NEU_BTN_ACTIVE,
                          }}
                        >
                          Guardar
                        </button>
                        <button
                          type="button"
                          onClick={() => setAiDrops(prev => prev.filter((_, idx) => idx !== i))}
                          className="px-3 py-1.5 text-white/25 hover:text-red-400 rounded-lg text-[11px] transition-colors"
                          style={{ background: '#0a0a10', boxShadow: NEU_PRESSED }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
