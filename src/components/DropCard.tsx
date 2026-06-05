import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import DOMPurify from 'dompurify';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { useBrainDrop } from '@/hooks/useBrainDrop';
import { useViewedObserver } from '@/hooks/useViewedObserver';
import { editDropWithAI } from '@/lib/groq';
import { formatSubcategoryLabel } from '@/lib/dropContent';
import { cn, formatRelativeDate } from '@/lib/utils';
import type { Drop } from '@/types';

interface DropCardProps {
  drop: Drop;
  onAI?: () => void;
  onToggleLike?: (id: string) => void;
  onMarkViewed?: (id: string) => void;
  onDelete?: (id: string) => void;
  onEdit?: (drop: Drop) => void;
}

const STORAGE_KEY = 'bd_settings';
type FontSize = 'sm' | 'md' | 'lg' | 'xl';

const FONT_SIZE_SCALE: Record<FontSize, string> = {
  sm: '0.82',
  md: '1',
  lg: '1.2',
  xl: '1.45',
};

const TYPE_STYLES = {
  definition: { label: 'Definicion', icon: '[]', rail: 'from-sky-500 to-blue-400', chip: 'bg-sky-500/15 text-sky-200 border-sky-400/20', hint: 'bg-sky-500/10 border-sky-400/15 text-sky-100/85', hover: 'hover:border-sky-300/40 hover:text-sky-100' },
  ruptura: { label: 'Ruptura', icon: '!!', rail: 'from-rose-600 to-pink-400', chip: 'bg-rose-500/15 text-rose-200 border-rose-400/20', hint: 'bg-rose-500/10 border-rose-400/15 text-rose-100/85', hover: 'hover:border-rose-300/40 hover:text-rose-100' },
  puente: { label: 'Puente', icon: '><', rail: 'from-teal-500 to-cyan-400', chip: 'bg-teal-500/15 text-teal-200 border-teal-400/20', hint: 'bg-teal-500/10 border-teal-400/15 text-teal-100/85', hover: 'hover:border-teal-300/40 hover:text-teal-100' },
  operativo: { label: 'Operativo', icon: '::', rail: 'from-amber-600 to-orange-400', chip: 'bg-amber-500/15 text-amber-200 border-amber-400/20', hint: 'bg-amber-500/10 border-amber-400/15 text-amber-100/85', hover: 'hover:border-amber-300/40 hover:text-amber-100' },
  code: { label: 'Codigo', icon: '</>', rail: 'from-violet-600 to-indigo-400', chip: 'bg-violet-500/15 text-violet-200 border-violet-400/20', hint: 'bg-violet-500/10 border-violet-400/15 text-violet-100/85', hover: 'hover:border-violet-300/40 hover:text-violet-100' },
} as const;

function getFontScale(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const settings = JSON.parse(stored);
      return FONT_SIZE_SCALE[settings.fontSize as FontSize] || '1';
    }
  } catch {
    // ignore storage errors
  }
  return '1';
}

function getSeconds(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(20, Math.ceil(((words / 180) * 60) / 5) * 5);
}

function getMeta(drop: Drop): { time: string; load: string } {
  const seconds = getSeconds(drop.content);
  const load = {
    definition: 'Baja carga',
    ruptura: 'Foco alto',
    puente: 'Conector',
    operativo: 'Alta utilidad',
    code: 'Lectura tecnica',
  }[drop.type];
  return { time: seconds >= 60 ? `${Math.max(1, Math.round(seconds / 60))} min` : `${seconds}s`, load };
}

function normalize(text: string): string {
  return text.replace(/\r/g, '').trim();
}

function hookFrom(text: string): string {
  const compact = normalize(text).replace(/\s+/g, ' ');
  const match = compact.match(/^.*?[.!?](?:\s|$)/);
  return (match ? match[0] : compact).trim();
}

function detailFrom(text: string, hook: string): string {
  const compact = normalize(text).replace(/\n+/g, ' ');
  return compact.startsWith(hook) ? compact.slice(hook.length).trim() : compact;
}

function actionLines(text: string): string[] {
  const normalized = normalize(text);
  const pieces = normalized.includes('\n')
    ? normalized.split('\n')
    : normalized.split(/(?<=[.!?])\s+/);
  return pieces.map((line) => line.replace(/^[\s\-*0-9.]+/, '').trim()).filter(Boolean).slice(0, 3);
}

function strip(text: string): string {
  return DOMPurify.sanitize(text, { ALLOWED_TAGS: [] });
}

function renderInline(text: string): string {
  return DOMPurify.sanitize(
    text.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>').replace(/==(.+?)==/g, '<mark class="rounded bg-white/10 px-1 text-white">$1</mark>').replace(/\n/g, '<br>')
  );
}

function CodeBlock({ code }: { code?: string }) {
  if (!code) return null;
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b1020]">
      <div className="flex items-center gap-2 border-b border-white/10 bg-white/5 px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-rose-400/70" />
          <span className="h-3 w-3 rounded-full bg-amber-300/70" />
          <span className="h-3 w-3 rounded-full bg-emerald-400/70" />
        </div>
        <span className="ml-2 text-xs text-white/45">snippet</span>
      </div>
      <SyntaxHighlighter language="sql" style={oneDark} customStyle={{ margin: 0, padding: '1rem', fontSize: '12px', fontFamily: '"JetBrains Mono", monospace', background: 'linear-gradient(180deg, #09111f 0%, #111827 100%)' }}>
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

export function DropCard({ drop, onAI, onToggleLike, onMarkViewed, onDelete, onEdit }: DropCardProps) {
  const [fontScale, setFontScale] = useState(() => getFontScale());
  const [expanded, setExpanded] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editMode, setEditMode] = useState<'manual' | 'ai'>('manual');
  const [aiInstruction, setAiInstruction] = useState('');
  const [aiEditing, setAiEditing] = useState(false);
  const [aiError, setAiError] = useState('');
  const [editForm, setEditForm] = useState({ title: drop.title, content: drop.content, type: drop.type, tags: drop.tags.join(', '), codeSnippet: drop.codeSnippet || '' });

  const { toggleLike: contextToggleLike, dropPreferences, setDropPreference } = useBrainDrop();
  const cardRef = useRef<HTMLElement>(null);
  const style = TYPE_STYLES[drop.type];
  const meta = getMeta(drop);
  const hook = useMemo(() => hookFrom(drop.content), [drop.content]);
  const detail = useMemo(() => detailFrom(drop.content, hook), [drop.content, hook]);
  const lines = useMemo(() => actionLines(drop.content), [drop.content]);

  const handleViewed = useCallback(() => {
    if (onMarkViewed) onMarkViewed(drop.id);
  }, [drop.id, onMarkViewed]);

  useViewedObserver(cardRef, handleViewed, { skip: drop.viewed === true });

  useEffect(() => {
    const handleStorage = () => setFontScale(getFontScale());
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    setExpanded(false);
    setShowFullContent(false);
  }, [drop.id]);

  const toggleLike = onToggleLike || contextToggleLike;
  const preference = dropPreferences[drop.id];
  const subcategory = formatSubcategoryLabel(drop.tags[0]);
  const contentHtml = renderInline(detail || drop.content);

  return (
    <article
      ref={cardRef}
      onClick={() => {
        if (!expanded) setExpanded(true);
      }}
      className={cn(
        'group relative w-full overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0f1318] transition-all duration-200 ease-out',
        !expanded && 'cursor-pointer hover:border-white/[0.12]'
      )}
    >
      <div className={cn('px-4', expanded ? 'pb-4 pt-3' : 'py-3')}>
        {expanded ? (
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold', style.chip)}>
              {style.icon} {style.label}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] text-white/60">{subcategory}</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] text-white/60">{meta.time}</span>
          </div>
        ) : null}

        <h3 className="font-display font-bold tracking-tight text-white" style={{ fontSize: `calc(${expanded ? 20 : 17}px * ${fontScale})`, lineHeight: expanded ? '1.2' : '1.3' }}>
          {drop.title}
        </h3>

        {!expanded ? (
          <p className="mt-1.5 text-[13px] leading-snug text-white/55" style={{ fontSize: `calc(13px * ${fontScale})` }}>
            {hook}
            {detail && detail !== hook ? ` ${showFullContent ? detail : detail.slice(0, 80)}${!showFullContent && detail.length > 80 ? '...' : ''}` : ''}
          </p>
        ) : (
          <p className="mt-2 text-[14px] leading-relaxed text-white/80" dangerouslySetInnerHTML={{ __html: contentHtml }} />
        )}

        {!expanded && detail && detail.length > 80 ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowFullContent(!showFullContent);
            }}
            className="mt-1.5 text-[11px] text-violet-400/60 hover:text-violet-300"
          >
            {showFullContent ? 'ver menos' : 'ver mas'}
          </button>
        ) : null}

        {!expanded ? (
          <div className="mt-2.5 flex items-center justify-end gap-2">
            <button
              onClick={(event) => {
                event.stopPropagation();
                if (window.confirm('Eliminar este drop?')) {
                  onDelete?.(drop.id);
                }
              }}
              className="rounded-lg border border-white/10 px-2 py-1 text-[10px] text-white/40 hover:border-rose-400/30 hover:text-rose-300"
            >
              Eliminar
            </button>
            <button
              onClick={(event) => {
                event.stopPropagation();
                toggleLike(drop.id);
              }}
              className={cn('rounded-lg border px-2 py-1 text-[10px] transition-colors', drop.liked ? 'border-rose-400/30 text-rose-300' : 'border-white/10 text-white/40 hover:border-white/25 hover:text-white/70')}
            >
              {drop.liked ? 'Te gusta' : 'Me gusta'}
            </button>
            <span className="text-[10px] text-white/30">{formatRelativeDate(drop.createdAt)}</span>
          </div>
        ) : null}

        {expanded ? (
          <>
            {drop.type === 'operativo' && lines.length > 0 ? (
              <div className="mt-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                <ul className="space-y-1.5">
                  {lines.map((line) => (
                    <li key={line} className="text-[13px] leading-relaxed text-white/70">{line}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {drop.visualContent ? <pre className="mt-3 whitespace-pre-wrap rounded-xl border border-white/[0.06] bg-[#111827] p-3 text-[11px] text-violet-100/80">{strip(drop.visualContent)}</pre> : null}
            {drop.codeSnippet ? <CodeBlock code={drop.codeSnippet} /> : null}

            <div className="mt-3 flex gap-2">
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  setDropPreference(drop.id, preference === 'like' ? null : 'like');
                }}
                className={cn(
                  'flex-1 rounded-xl border py-2 text-[12px] font-semibold transition-colors',
                  preference === 'like'
                    ? 'border-emerald-400/30 bg-emerald-500/15 text-emerald-200'
                    : 'border-white/10 text-white/50 hover:border-white/20 hover:text-white/70'
                )}
              >
                Me gusto
              </button>
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  setDropPreference(drop.id, preference === 'dislike' ? null : 'dislike');
                }}
                className={cn(
                  'flex-1 rounded-xl border py-2 text-[12px] font-semibold transition-colors',
                  preference === 'dislike'
                    ? 'border-rose-400/30 bg-rose-500/15 text-rose-200'
                    : 'border-white/10 text-white/50 hover:border-white/20 hover:text-white/70'
                )}
              >
                No me gusto
              </button>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-white/[0.05] pt-3">
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  if (window.confirm('Eliminar este drop?')) {
                    onDelete?.(drop.id);
                  }
                }}
                className="rounded-lg border border-white/10 px-2.5 py-1 text-[11px] text-white/40 hover:border-rose-400/30 hover:text-rose-300"
              >
                Eliminar
              </button>

              <button
                onClick={(event) => {
                  event.stopPropagation();
                  setShowEditModal(true);
                }}
                className="rounded-lg border border-white/10 px-2.5 py-1 text-[11px] text-white/40 hover:border-white/25 hover:text-white/70"
              >
                Editar
              </button>
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  toggleLike(drop.id);
                }}
                className={cn('rounded-lg border px-2.5 py-1 text-[11px] transition-colors', drop.liked ? 'border-rose-400/30 text-rose-300' : 'border-white/10 text-white/40 hover:border-white/25 hover:text-white/70')}
              >
                {drop.liked ? 'Guardado' : 'Guardar'}
              </button>
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  onAI?.();
                }}
                className="rounded-lg border border-white/10 px-2.5 py-1 text-[11px] text-white/40 hover:border-white/25 hover:text-white/70"
              >
                IA
              </button>
              <span className="ml-auto text-[10px] text-white/30">{formatRelativeDate(drop.createdAt)}</span>
            </div>

            <button
              onClick={(event) => {
                event.stopPropagation();
                setExpanded(false);
              }}
              className="mt-3 w-full rounded-xl border border-white/8 bg-white/[0.02] py-2 text-[11px] text-white/40 transition-colors hover:text-white/70 hover:border-white/15"
            >
              Cerrar
            </button>
          </>
        ) : null}
      </div>

      {showEditModal ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) setShowEditModal(false);
          }}
        >
          <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl border border-white/10 bg-[#1a1a1f]">
            <div className="flex items-center justify-between border-b border-white/5 px-6 pb-4 pt-5">
              <div className="flex gap-1 rounded-full bg-black/30 p-1">
                <button onClick={() => setEditMode('manual')} className={cn('rounded-full px-4 py-1.5 text-[12px] font-medium transition-all', editMode === 'manual' ? 'bg-[#7c3aed] text-white' : 'text-white/40 hover:text-white')}>Manual</button>
                <button onClick={() => setEditMode('ai')} className={cn('rounded-full px-4 py-1.5 text-[12px] font-medium transition-all', editMode === 'ai' ? 'bg-[#7c3aed] text-white' : 'text-white/40 hover:text-white')}>IA</button>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-lg text-white/30 transition-colors hover:text-white">x</button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {editMode === 'manual' ? (
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-xs text-white/40">Titulo</label>
                    <input type="text" value={editForm.title} onChange={(event) => setEditForm({ ...editForm, title: event.target.value })} className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white focus:border-[#7c3aed] focus:outline-none" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-white/40">Tipo</label>
                    <div className="flex flex-wrap gap-2">
                      {(Object.keys(TYPE_STYLES) as Array<Drop['type']>).map((type) => (
                        <button key={type} type="button" onClick={() => setEditForm({ ...editForm, type })} className={cn('rounded-full border px-3 py-1.5 text-[12px] transition-all', editForm.type === type ? 'border-[#7c3aed] bg-[#7c3aed] text-white' : 'border-white/10 text-white/40 hover:border-[#7c3aed] hover:text-[#7c3aed]')}>
                          {TYPE_STYLES[type].label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-white/40">Contenido</label>
                    <textarea value={editForm.content} onChange={(event) => setEditForm({ ...editForm, content: event.target.value })} rows={5} className="w-full resize-none rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white focus:border-[#7c3aed] focus:outline-none" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-white/40">Codigo (opcional)</label>
                    <textarea value={editForm.codeSnippet} onChange={(event) => setEditForm({ ...editForm, codeSnippet: event.target.value })} rows={3} placeholder="// snippet opcional..." className="font-code w-full resize-none rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs text-violet-200 focus:border-[#7c3aed] focus:outline-none placeholder:text-white/20" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-white/40">Tags (separados por coma)</label>
                    <input type="text" value={editForm.tags} onChange={(event) => setEditForm({ ...editForm, tags: event.target.value })} className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white focus:border-[#7c3aed] focus:outline-none" />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-xl border border-white/5 bg-black/20 p-4">
                    <p className="mb-2 text-[10px] uppercase tracking-wider text-white/30">Drop actual</p>
                    <p className="mb-1 text-sm font-semibold text-white">{editForm.title}</p>
                    <p className="line-clamp-3 text-xs leading-relaxed text-white/50">{editForm.content}</p>
                  </div>
                  <div>
                    <label className="mb-2 block text-xs text-white/40">Que quieres cambiar</label>
                    <textarea value={aiInstruction} onChange={(event) => setAiInstruction(event.target.value)} rows={3} placeholder='Ej: "Hazlo mas conciso", "Cambia el tipo a operativo", "Mejora el tono"...' className="w-full resize-none rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white focus:border-[#7c3aed] focus:outline-none placeholder:text-white/20" />
                  </div>
                  {aiError ? <p className="text-xs text-red-400">{aiError}</p> : null}
                  <button
                    onClick={async () => {
                      if (!aiInstruction.trim() || aiEditing) return;
                      setAiEditing(true);
                      setAiError('');
                      try {
                        const result = await editDropWithAI({ title: editForm.title, content: editForm.content, type: editForm.type, tags: editForm.tags.split(',').map((tag) => tag.trim()).filter(Boolean), codeSnippet: editForm.codeSnippet || undefined }, aiInstruction);
                        setEditForm({ title: result.title, content: result.content, type: result.type, tags: result.tags.join(', '), codeSnippet: result.codeSnippet || '' });
                        setEditMode('manual');
                        setAiInstruction('');
                      } catch {
                        setAiError('Error al editar con IA. Verifica tu API key de Groq.');
                      } finally {
                        setAiEditing(false);
                      }
                    }}
                    disabled={!aiInstruction.trim() || aiEditing}
                    className={cn('w-full rounded-xl py-2.5 text-sm font-bold transition-all', aiInstruction.trim() && !aiEditing ? 'bg-[#7c3aed] text-white hover:bg-[#6d28d9]' : 'cursor-not-allowed bg-white/5 text-white/30')}
                  >
                    {aiEditing ? 'Editando...' : 'Aplicar con IA'}
                  </button>
                  <p className="text-center text-[11px] text-white/25">La IA aplica los cambios y te devuelve al modo manual para revisar antes de guardar.</p>
                </div>
              )}
            </div>

            {editMode === 'manual' ? (
              <div className="flex gap-3 border-t border-white/5 px-6 py-4">
                <button onClick={() => setShowEditModal(false)} className="flex-1 py-2 text-sm text-white/40 transition-colors hover:text-white">Cancelar</button>
                <button
                  onClick={() => {
                    onEdit?.({
                      ...drop,
                      title: strip(editForm.title),
                      content: strip(editForm.content),
                      type: editForm.type,
                      tags: editForm.tags.split(',').map((tag) => strip(tag.trim())).filter(Boolean),
                      codeSnippet: editForm.codeSnippet ? strip(editForm.codeSnippet) : undefined,
                    });
                    setShowEditModal(false);
                  }}
                  className="flex-1 rounded-xl bg-[#7c3aed] py-2 text-sm font-medium text-white transition-colors hover:bg-[#6d28d9]"
                >
                  Guardar
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </article>
  );
}
