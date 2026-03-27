import { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';
import { generateDropsFromTopic, type GeneratedDrop } from '@/lib/groq';
import { useBrainDrop } from '@/hooks/useBrainDrop';
import { DROP_TYPE_CONFIG } from '@/types';
import type { DropType } from '@/types';

const MAX_TITLE_LENGTH = 200;
const MAX_CONTENT_LENGTH = 5000;
const MAX_TAGS = 10;
const MAX_TAG_LENGTH = 30;
const MINIMIZED_KEY = 'braindrop_compose_minimized';

const SHELL_BASE = '#121722';
const SHELL_RAISED =
  '14px 14px 28px rgba(2,8,23,0.28), -8px -8px 18px rgba(255,255,255,0.02)';
const SHELL_INSET =
  'inset 4px 4px 10px rgba(2,8,23,0.36), inset -2px -2px 8px rgba(255,255,255,0.02)';
const BUTTON_ACTIVE =
  '8px 8px 18px rgba(74, 76, 173, 0.26), inset 0 1px 0 rgba(255,255,255,0.05)';

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
  const [mode, setMode] = useState<'manual' | 'ai'>('ai');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<DropType>('definition');
  const [tags, setTags] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [showVisual, setShowVisual] = useState(false);
  const [codeSnippet, setCodeSnippet] = useState('');
  const [visualContent, setVisualContent] = useState('');
  const [aiTopic, setAiTopic] = useState('');
  const [aiCollection, setAiCollection] = useState(collectionId || '');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiDrops, setAiDrops] = useState<GeneratedDrop[]>([]);
  const [aiError, setAiError] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(MINIMIZED_KEY, String(isMinimized));
    } catch {
      // ignore
    }
  }, [isMinimized]);

  const inputStyle = {
    background: '#0f141d',
    boxShadow: SHELL_INSET,
  };

  const handleGenerateAI = async () => {
    if (!aiTopic.trim()) return;
    setAiLoading(true);
    setAiError('');
    setAiDrops([]);
    try {
      const collectionName = collections.find((c) => c.id === aiCollection)?.name || aiCollection;
      const drops = await generateDropsFromTopic(aiTopic.trim(), collectionName);
      setAiDrops(drops);
    } catch {
      setAiError('Error generando drops. Verifica tu API key de Groq.');
    } finally {
      setAiLoading(false);
    }
  };

  const saveAIDrop = (drop: GeneratedDrop) => {
    onSubmit({
      title: DOMPurify.sanitize(drop.title, { ALLOWED_TAGS: [] }),
      content: DOMPurify.sanitize(drop.content, { ALLOWED_TAGS: [] }),
      type: drop.type,
      tags: drop.tags.map((tag) => DOMPurify.sanitize(tag, { ALLOWED_TAGS: [] })),
      codeSnippet: drop.codeSnippet
        ? DOMPurify.sanitize(drop.codeSnippet, { ALLOWED_TAGS: [] })
        : undefined,
    });
    setAiDrops((prev) => prev.filter((item) => item !== drop));
  };

  const saveAllAIDrops = () => {
    aiDrops.forEach((drop) => saveAIDrop(drop));
    setAiTopic('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    if (title.length > MAX_TITLE_LENGTH || content.length > MAX_CONTENT_LENGTH) return;

    const sanitizedTags = tags
      .split(',')
      .map((tag) => DOMPurify.sanitize(tag.trim(), { ALLOWED_TAGS: [] }))
      .filter(Boolean)
      .slice(0, MAX_TAGS)
      .map((tag) => tag.slice(0, MAX_TAG_LENGTH));

    onSubmit({
      title: DOMPurify.sanitize(title.trim(), { ALLOWED_TAGS: [] }),
      content: DOMPurify.sanitize(content.trim(), { ALLOWED_TAGS: [] }),
      type,
      tags: sanitizedTags,
      codeSnippet: showCode
        ? DOMPurify.sanitize(codeSnippet, { ALLOWED_TAGS: ['code', 'pre'] })
        : undefined,
      visualContent: showVisual
        ? DOMPurify.sanitize(visualContent, { ALLOWED_TAGS: [] })
        : undefined,
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
        onClick={() => setIsMinimized(false)}
        className="mx-4 my-4 flex cursor-pointer items-center justify-between rounded-[26px] border border-white/5 px-5 py-4 transition-all active:scale-[0.99]"
        style={{ background: SHELL_BASE, boxShadow: SHELL_RAISED }}
      >
        <div>
          <div className="text-[15px] font-semibold text-white/72">Nuevo drop...</div>
          <div className="mt-1 text-[12px] text-white/34">
            Captura una idea o genera variaciones con IA
          </div>
        </div>
        <span className="rounded-full border border-white/6 px-3 py-1 text-lg text-white/35">+</span>
      </div>
    );
  }

  return (
    <div
      className="mx-4 my-4 rounded-[28px] border border-white/5"
      style={{ background: SHELL_BASE, boxShadow: SHELL_RAISED }}
    >
      <div className="flex items-center justify-between border-b border-white/6 px-4 pb-3 pt-4">
        <div
          className="flex gap-1 rounded-[18px] p-1"
          style={{ background: '#0f141d', boxShadow: SHELL_INSET }}
        >
          {(['manual', 'ai'] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setMode(value)}
              className="rounded-[14px] px-4 py-2 text-[12px] font-semibold transition-all"
              style={{
                background:
                  mode === value ? 'linear-gradient(135deg, #7c3aed, #2563eb)' : 'transparent',
                color: mode === value ? '#fff' : 'rgba(255,255,255,0.48)',
                boxShadow: mode === value ? BUTTON_ACTIVE : 'none',
              }}
            >
              {value === 'manual' ? 'Manual' : 'IA'}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setIsMinimized(true)}
          className="rounded-full border border-white/6 px-2.5 py-1 text-sm text-white/32 transition-colors hover:text-white/70"
        >
          x
        </button>
      </div>

      {mode === 'manual' ? (
        <form onSubmit={handleSubmit} className="space-y-3 px-4 pb-4 pt-4">
          <div className="flex flex-wrap gap-2">
            {DROP_TYPES.map((dropType) => {
              const config = DROP_TYPE_CONFIG[dropType];
              const active = type === dropType;
              return (
                <button
                  key={dropType}
                  type="button"
                  onClick={() => setType(dropType)}
                  className="rounded-[16px] border px-3 py-2 text-[11px] font-semibold transition-all"
                  style={{
                    background: active ? 'rgba(124,58,237,0.18)' : '#0f141d',
                    borderColor: active ? 'rgba(167,139,250,0.28)' : 'rgba(255,255,255,0.05)',
                    color: active ? '#d7c8ff' : 'rgba(255,255,255,0.5)',
                    boxShadow: SHELL_INSET,
                  }}
                >
                  {config.emoji} {config.label}
                </button>
              );
            })}
          </div>

          <div className="rounded-[20px] px-4 py-3" style={inputStyle}>
            <input
              type="text"
              placeholder="Titulo..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={MAX_TITLE_LENGTH}
              className="w-full bg-transparent text-[16px] font-semibold text-white placeholder:text-white/24 focus:outline-none"
            />
          </div>

          <div className="rounded-[20px] px-4 py-3" style={inputStyle}>
            <textarea
              placeholder="Que aprendiste?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={MAX_CONTENT_LENGTH}
              rows={4}
              className="w-full resize-none bg-transparent text-[14px] leading-relaxed text-white/80 placeholder:text-white/24 focus:outline-none"
            />
          </div>

          {showVisual ? (
            <div className="rounded-[20px] px-4 py-3" style={inputStyle}>
              <textarea
                placeholder="Visual o estructura rapida..."
                value={visualContent}
                onChange={(e) => setVisualContent(e.target.value)}
                rows={4}
                className="w-full resize-none bg-transparent text-sm leading-relaxed text-[#c9b5ff] placeholder:text-white/24 focus:outline-none"
              />
            </div>
          ) : null}

          {showCode ? (
            <div className="rounded-[20px] px-4 py-3" style={inputStyle}>
              <textarea
                placeholder="// Codigo..."
                value={codeSnippet}
                onChange={(e) => setCodeSnippet(e.target.value)}
                rows={4}
                className="font-code w-full resize-none bg-transparent text-xs leading-relaxed text-[#c9b5ff] placeholder:text-white/24 focus:outline-none"
              />
            </div>
          ) : null}

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => setShowVisual((prev) => !prev)}
              className="rounded-[16px] border border-white/6 px-3 py-2 text-xs text-white/58"
              style={{ background: '#0f141d', boxShadow: SHELL_INSET }}
            >
              Visual
            </button>
            <button
              type="button"
              onClick={() => setShowCode((prev) => !prev)}
              className="rounded-[16px] border border-white/6 px-3 py-2 text-xs text-white/58"
              style={{ background: '#0f141d', boxShadow: SHELL_INSET }}
            >
              Codigo
            </button>
            <div className="flex-1 rounded-[18px] px-3 py-2" style={inputStyle}>
              <input
                type="text"
                placeholder="tags, separados por coma"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full bg-transparent text-[12px] text-white/62 placeholder:text-white/24 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={!title.trim() || !content.trim()}
              className="rounded-[18px] px-5 py-2.5 text-[13px] font-bold transition-all"
              style={{
                background:
                  title.trim() && content.trim()
                    ? 'linear-gradient(135deg, #7c3aed, #2563eb)'
                    : '#171d27',
                color: title.trim() && content.trim() ? '#fff' : 'rgba(255,255,255,0.24)',
                boxShadow: title.trim() && content.trim() ? BUTTON_ACTIVE : SHELL_INSET,
              }}
            >
              Guardar
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-3 px-4 pb-4 pt-4">
          <div className="flex gap-2">
            <div className="flex-1 rounded-[20px] px-4 py-3" style={inputStyle}>
              <input
                type="text"
                placeholder="Tema o concepto..."
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleGenerateAI();
                }}
                className="w-full bg-transparent text-sm text-white placeholder:text-white/24 focus:outline-none"
              />
            </div>
            <div className="rounded-[20px] px-3 py-3" style={inputStyle}>
              <select
                value={aiCollection}
                onChange={(e) => setAiCollection(e.target.value)}
                className="max-w-[120px] bg-transparent text-[12px] text-white/65 focus:outline-none"
              >
                <option value="">Coleccion</option>
                {collections.map((collection) => (
                  <option key={collection.id} value={collection.id}>
                    {collection.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerateAI}
            disabled={!aiTopic.trim() || aiLoading}
            className="w-full rounded-[18px] py-3 text-[13px] font-bold transition-all"
            style={{
              background:
                aiTopic.trim() && !aiLoading
                  ? 'linear-gradient(135deg, #7c3aed, #2563eb)'
                  : '#171d27',
              color: aiTopic.trim() && !aiLoading ? '#fff' : 'rgba(255,255,255,0.24)',
              boxShadow: aiTopic.trim() && !aiLoading ? BUTTON_ACTIVE : SHELL_INSET,
            }}
          >
            {aiLoading ? 'Generando...' : 'Generar drops'}
          </button>

          {aiError ? <p className="text-xs text-red-400">{aiError}</p> : null}

          {aiDrops.length > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-white/34">{aiDrops.length} drops generados</span>
                {aiDrops.length > 1 ? (
                  <button
                    type="button"
                    onClick={saveAllAIDrops}
                    className="text-[11px] font-semibold text-[#c9b5ff]"
                  >
                    Guardar todos
                  </button>
                ) : null}
              </div>

              <div className="max-h-[52vh] space-y-2 overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
                {aiDrops.map((drop, index) => {
                  const config = DROP_TYPE_CONFIG[drop.type];
                  return (
                    <div
                      key={`${drop.title}-${index}`}
                      className="rounded-[22px] border border-white/5 p-4"
                      style={{ background: '#0f141d', boxShadow: SHELL_INSET }}
                    >
                      <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold text-white/42">
                        <span>
                          {config.emoji} {config.label}
                        </span>
                        <span className="truncate">
                          {drop.tags.slice(0, 3).map((tag) => `#${tag}`).join(' ')}
                        </span>
                      </div>
                      <p className="mb-1 text-[14px] font-semibold leading-snug text-white">{drop.title}</p>
                      <p className="mb-3 line-clamp-3 text-[12px] leading-relaxed text-white/50">
                        {drop.content}
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => saveAIDrop(drop)}
                          className="flex-1 rounded-[16px] py-2 text-[11px] font-semibold text-white"
                          style={{
                            background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                            boxShadow: BUTTON_ACTIVE,
                          }}
                        >
                          Guardar
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setAiDrops((prev) => prev.filter((_, currentIndex) => currentIndex !== index))
                          }
                          className="rounded-[16px] px-3 py-2 text-[11px] text-white/32"
                          style={{ background: '#151b25', boxShadow: SHELL_INSET }}
                        >
                          x
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
