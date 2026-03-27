import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useViewedObserver } from '@/hooks/useViewedObserver';
import { cn } from '@/lib/utils';
import type { Drop, VisualData } from '@/types';
import { DROP_TYPE_CONFIG } from '@/types';
import { formatRelativeDate } from '@/lib/utils';
import DOMPurify from 'dompurify';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useBrainDrop } from '@/hooks/useBrainDrop';
import { SAMPLE_DROPS } from '@/data/seed';
import { editDropWithAI } from '@/lib/groq';

interface DropCardProps {
  drop: Drop;
  onAI?: () => void;
  onToggleLike?: (id: string) => void;
  onMarkViewed?: (id: string) => void;
  onDelete?: (id: string) => void;
  onEdit?: (drop: Drop) => void;
  onReview?: (id: string, quality: number) => void;
}

const STORAGE_KEY = 'braindrop_settings';

type FontSize = 'sm' | 'md' | 'lg' | 'xl';

const FONT_SIZE_SCALE: Record<FontSize, string> = {
  sm: '0.82',
  md: '1',
  lg: '1.2',
  xl: '1.45',
};

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

const typeStyles: Record<string, { bg: string; text: string; icon: string; gradient: string; cardBorder: string; cardBorderExpanded: string; cardAccent: string; rupturaGlow: string }> = {
  definition: { bg: 'bg-blue-500/20 text-blue-400 border-blue-500/30', text: 'text-blue-400', icon: '📐', gradient: 'from-blue-500/30 to-purple-500/20', cardBorder: 'border-l-[4px] border-l-blue-500/40', cardBorderExpanded: 'border-l-[4px] border-l-blue-500/70', cardAccent: '', rupturaGlow: '' },
  ruptura: { bg: 'bg-red-500/20 text-red-400 border-red-500/30', text: 'text-red-400', icon: '⚡', gradient: 'from-red-500/30 to-rose-500/20', cardBorder: 'border-l-[5px] border-l-red-500/80', cardBorderExpanded: 'border-l-[5px] border-l-red-500', cardAccent: 'bg-gradient-to-r from-red-500/[0.06] to-transparent', rupturaGlow: 'shadow-[inset_0_0_40px_rgba(239,68,68,0.04)]' },
  puente: { bg: 'bg-purple-500/20 text-purple-400 border-purple-500/30', text: 'text-purple-400', icon: '🌀', gradient: 'from-purple-500/30 to-pink-500/20', cardBorder: 'border-l-[4px] border-l-purple-500/40', cardBorderExpanded: 'border-l-[4px] border-l-purple-500/70', cardAccent: '', rupturaGlow: '' },
  operativo: { bg: 'bg-amber-500/20 text-amber-400 border-amber-500/30', text: 'text-amber-400', icon: '🔧', gradient: 'from-amber-500/30 to-orange-500/20', cardBorder: 'border-l-[4px] border-l-amber-500/40', cardBorderExpanded: 'border-l-[4px] border-l-amber-500/70', cardAccent: 'bg-gradient-to-r from-amber-500/[0.03] to-transparent', rupturaGlow: '' },
  code: { bg: 'bg-violet-500/20 text-violet-400 border-violet-500/30', text: 'text-violet-400', icon: '💻', gradient: 'from-violet-500/30 to-indigo-500/20', cardBorder: 'border-l-[4px] border-l-violet-500/40', cardBorderExpanded: 'border-l-[4px] border-l-violet-500/70', cardAccent: '', rupturaGlow: '' },
};

// ── Inline markdown: **bold**, ==highlight==, first-sentence hook ────────
function renderInlineMarkdown(text: string): string {
  let html = text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-[#e7e9ea] font-semibold">$1</strong>')
    .replace(/==(.+?)==/g, '<mark class="bg-purple-500/20 text-purple-300 px-0.5 rounded">$1</mark>')
    .replace(/\n/g, '<br>');

  // First sentence hook: primera frase blanca, resto desvanece — clave para AUDHD
  const firstDot = html.indexOf('. ');
  if (firstDot > 0 && firstDot < 200) {
    html =
      '<span class="text-white/90 font-medium">' +
      html.slice(0, firstDot + 1) +
      '</span>' +
      html.slice(firstDot + 1);
  }

  return html;
}

// ── Tag color from string hash ───────────────────────────────────────────
function tagHue(tag: string): number {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

// ============= VISUAL COMPONENTS =============

const FlowVisual = ({ data }: { data: VisualData }) => {
  const nodes = data?.nodes;
  if (!nodes || nodes.length === 0) return null;
  return (
    <div className="relative py-3">
      <div className="flex items-center justify-between gap-1 overflow-x-auto pb-2">
        {nodes.map((node, i) => (
          <React.Fragment key={i}>
            <div className="flex flex-col items-center min-w-0 group">
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all duration-300 group-hover:scale-110"
                style={{ 
                  background: `linear-gradient(135deg, ${node.color}30 0%, ${node.color}15 100%)`,
                  border: `1px solid ${node.color}50`,
                  boxShadow: `0 0 20px ${node.color}20`
                }}
              >
                {node.icon}
              </div>
              <span className="mt-2 text-[11px] font-bold text-white">{node.label}</span>
              {node.desc && <span className="text-[9px] text-white/40">{node.desc}</span>}
            </div>
            {i < nodes.length - 1 && (
              <svg width="20" height="20" className="text-white/30 flex-shrink-0" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

const MatrixVisual = ({ data }: { data: VisualData }) => {
  if (!data.items) return null;
  return (
    <div className="grid grid-cols-2 gap-2">
      {data.items.map((item, i) => (
        <div 
          key={i} 
          className={`${item.bg} ${item.border} border rounded-xl p-3 text-center transition-all hover:scale-[1.02]`}
        >
          <div className={`text-sm font-bold ${item.text}`}>{item.severity}</div>
          <div className="text-xs text-white/50 mt-1">→ {item.priority}</div>
        </div>
      ))}
    </div>
  );
};

const CodeVisual = ({ code }: { code?: string }) => {
  if (!code) return null;
  return (
    <div className="rounded-xl overflow-hidden border border-white/10">
      <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border-b border-white/10">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500/60"></span>
          <span className="w-3 h-3 rounded-full bg-yellow-500/60"></span>
          <span className="w-3 h-3 rounded-full bg-green-500/60"></span>
        </div>
        <span className="text-xs text-white/40 ml-2">query.sql</span>
      </div>
      <SyntaxHighlighter
        language="sql"
        style={oneDark}
        customStyle={{ 
          margin: 0, 
          padding: '1rem', 
          fontSize: '12px',
          background: 'linear-gradient(180deg, #0d0d12 0%, #12121a 100%)',
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};

const FunnelVisual = ({ data }: { data: VisualData }) => {
  if (!data.steps) return null;
  return (
    <div className="space-y-1.5 py-2">
      {data.steps.map((step, i) => (
        <div 
          key={i}
          className="flex items-center gap-3 p-2.5 rounded-lg transition-all hover:scale-[1.01]"
          style={{ 
            background: `linear-gradient(90deg, ${step.color}20 0%, ${step.color}10 100%)`,
            borderLeft: `4px solid ${step.color}`,
            width: `${100 - i * 16}%`,
            minWidth: '180px'
          }}
        >
          <span className="text-lg">{step.icon}</span>
          <span className="text-sm font-medium text-white">{step.label}</span>
        </div>
      ))}
    </div>
  );
};

const PyramidVisual = ({ data }: { data: VisualData }) => {
  if (!data.levels) return null;
  return (
    <div className="py-3 space-y-1.5">
      {data.levels.map((level, i) => (
        <div key={i} className="flex items-center gap-2">
          <div 
            className="rounded-r-lg py-2.5 text-xs font-bold text-white text-right transition-all duration-500"
            style={{ 
              width: level.width, 
              background: `linear-gradient(90deg, ${level.color}90, ${level.color})`,
              boxShadow: `0 0 15px ${level.color}40`
            }}
          >
            {level.count}
          </div>
          <span className="text-xs text-white/60">{level.label}</span>
        </div>
      ))}
    </div>
  );
};

const ComparisonVisual = ({ data }: { data: VisualData }) => {
  if (!data.comparison) return null;
  return (
    <div className="space-y-1">
      {data.comparison.map((item, i) => (
        <div key={i} className="flex text-[11px] border-b border-white/5 pb-1">
          <span className="w-1/2 text-white/80 font-medium truncate pr-3">{item.left}</span>
          <span className="w-1/2 text-white/40 border-l border-white/10 pl-3 truncate">{item.right}</span>
        </div>
      ))}
    </div>
  );
};

// ============= MAIN CARD =============

const SEED_IDS = new Set(SAMPLE_DROPS.map(d => d.id));

function getMasteryRing(drop: Drop): string {
  // No ring for drops never reviewed
  if (!drop.viewed || drop.repetitionCount === 0) return 'none';
  const { interval, easeFactor, status } = drop;
  if (status === 'relearn') return '0 0 0 2px rgba(239,68,68,0.4)'; // red — struggling
  if (interval >= 21 && easeFactor > 2.5) return '0 0 0 2.5px rgba(52,211,153,0.55)'; // green — mastered
  if (interval >= 7) return '0 0 0 2px rgba(124,58,237,0.45)'; // purple — consolidating
  return '0 0 0 1.5px rgba(255,255,255,0.12)'; // subtle — learning
}

export function DropCard({ drop, onAI, onToggleLike, onMarkViewed, onDelete, onEdit, onReview }: DropCardProps) {
  const [fontScale, setFontScale] = useState(() => getFontScale());
  const { toggleLike: contextToggleLike } = useBrainDrop();
  const isUserCreated = !SEED_IDS.has(drop.id);
  const [cardExpanded, setCardExpanded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [reviewDone, setReviewDone] = useState<'easy' | 'hard' | null>(null);
  const [editMode, setEditMode] = useState<'manual' | 'ai'>('manual');
  const [editForm, setEditForm] = useState({
    title: drop.title,
    content: drop.content,
    type: drop.type,
    tags: drop.tags.join(', '),
    codeSnippet: drop.codeSnippet || '',
  });
  const [aiInstruction, setAiInstruction] = useState('');
  const [aiEditing, setAiEditing] = useState(false);
  const [aiError, setAiError] = useState('');

  const handleToggleLike = onToggleLike || contextToggleLike;

  const cardRef = useRef<HTMLElement>(null);
  const handleViewed = useCallback(() => {
    if (onMarkViewed) onMarkViewed(drop.id);
  }, [drop.id, onMarkViewed]);
  useViewedObserver(cardRef, handleViewed, { skip: drop.viewed === true });

  useEffect(() => {
    const handleStorage = () => setFontScale(getFontScale());
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  // Bug 1 fix — reset expanded state when the drop changes identity
  useEffect(() => {
    setCardExpanded(false);
    setShowDeleteConfirm(false);
    setReviewDone(null);
  }, [drop.id]);

  const config = DROP_TYPE_CONFIG[drop.type];
  const styles = typeStyles[drop.type];
  const hasVisual = drop.visualContent || drop.visualData;

  const renderVisual = () => {
    if (drop.visualContent && !drop.visualData) {
      return (
        <pre className="font-mono text-xs text-[#a78bfa] whitespace-pre-wrap bg-black/30 p-3 rounded-lg">
          {DOMPurify.sanitize(drop.visualContent)}
        </pre>
      );
    }

    if (!drop.visualData) return null;
    const data = drop.visualData;

    switch (data.type) {
      case 'flow': return <FlowVisual data={data} />;
      case 'matrix': return <MatrixVisual data={data} />;
      case 'code': return <CodeVisual code={data.code} />;
      case 'funnel': return <FunnelVisual data={data} />;
      case 'pyramid': return <PyramidVisual data={data} />;
      case 'comparison': return <ComparisonVisual data={data} />;
      default: return null;
    }
  };

  return (
    <article
      ref={cardRef}
      onClick={() => !cardExpanded && setCardExpanded(true)}
      className={cn(
        "px-5 border-b border-white/5 w-full select-none",
        cardExpanded ? "py-4" : "py-3",
        "transition-[background,box-shadow,border-color,padding] duration-200 ease-out",
        !cardExpanded && "hover:bg-white/[0.02] cursor-pointer",
        cardExpanded ? styles.cardBorderExpanded : styles.cardBorder,
        styles.cardAccent,
        !cardExpanded && styles.rupturaGlow,
      )}
      style={{
        background: cardExpanded
          ? 'linear-gradient(145deg, #121218 0%, #0c0c12 100%)'
          : 'linear-gradient(145deg, #0f0f14 0%, #0a0a0f 100%)',
        boxShadow: '0 1px 0 rgba(255,255,255,0.03) inset',
        position: 'relative',
      }}
    >
      {/* Header: badge — siempre visible. Tags + mastery solo en expanded */}
      <div className={cn("flex items-center gap-2", cardExpanded ? "mb-3" : "mb-2")}>
        <span
          className={cn(
            'rounded-full font-semibold border transition-all',
            cardExpanded ? 'px-2.5 py-1 text-[10px]' : 'px-2 py-0.5 text-[9px]',
            styles.bg
          )}
          style={{
            background: `linear-gradient(135deg, ${styles.gradient})`,
            backdropFilter: 'blur(10px)',
            boxShadow: cardExpanded ? getMasteryRing(drop) : 'none',
          }}
        >
          <span className="mr-1">{styles.icon}</span>
          {config.label}
        </span>
        {/* Origin + tags — solo expanded */}
        {cardExpanded && isUserCreated && (
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 text-white/30 font-medium">
            tuyo
          </span>
        )}
        {cardExpanded && drop.tags.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {drop.tags.slice(0, 3).map((tag, i) => {
              const hue = tagHue(tag);
              return (
                <span
                  key={i}
                  className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                  style={{
                    color: `hsl(${hue}, 50%, 65%)`,
                    backgroundColor: `hsla(${hue}, 50%, 40%, 0.08)`,
                  }}
                >
                  #{tag}
                </span>
              );
            })}
          </div>
        )}
        {/* Reviewed indicator — collapsed only */}
        {!cardExpanded && reviewDone && (
          <span className="ml-auto text-[10px] text-white/20">
            {reviewDone === 'easy' ? '✓' : '↺'}
          </span>
        )}
      </div>

      {/* Title — siempre visible */}
      <h3
        className={cn(
          "font-extrabold mb-1.5",
          cardExpanded ? "text-[#e7e9ea]" : "text-white"
        )}
        style={{
          fontSize: `calc(${cardExpanded ? 20 : 17}px * ${fontScale})`,
          lineHeight: '1.3',
          letterSpacing: '-0.02em',
        }}
      >
        {drop.title}
      </h3>

      {/* Content — collapsed: N líneas según tipo. Expanded: full */}
      {(() => {
        const rendered = renderInlineMarkdown(drop.content);
        const sanitized = DOMPurify.sanitize(rendered);
        return (
          <div
            className={cn(
              cardExpanded ? "text-white/55" : "text-white/30",
              !cardExpanded && drop.type === 'definition' && 'line-clamp-1',
              !cardExpanded && drop.type === 'ruptura' && 'line-clamp-3',
              !cardExpanded && drop.type !== 'definition' && drop.type !== 'ruptura' && 'line-clamp-2',
            )}
            style={{
              fontSize: `calc(${cardExpanded ? 15.5 : 14.5}px * ${fontScale})`,
              lineHeight: cardExpanded ? '1.75' : '1.6',
              wordSpacing: '0.02em',
            }}
            dangerouslySetInnerHTML={{ __html: sanitized }}
          />
        );
      })()}

      {/* Fix F — Collapsed inline extras por tipo */}
      {!cardExpanded && drop.type === 'operativo' && drop.content.includes('\n') && (
        <div className="flex flex-col gap-0.5 mt-1.5">
          {drop.content.split('\n').filter(Boolean).slice(0, 2).map((line, i) => (
            <span key={i} className="text-[12px] text-amber-400/50 flex items-start gap-1.5">
              <span className="text-[10px] mt-0.5 opacity-40">{i + 1}.</span>
              {line.trim()}
            </span>
          ))}
        </div>
      )}
      {!cardExpanded && drop.type === 'code' && drop.codeSnippet && (
        <div className="mt-1.5 px-3 py-1.5 rounded-lg bg-black/40 font-mono text-[11px] text-violet-400/60 line-clamp-2">
          {drop.codeSnippet.split('\n').slice(0, 2).join('\n')}
        </div>
      )}

      {/* Expanded content */}
      {cardExpanded && (
        <>
          {/* Visual */}
          {hasVisual && (
            <div
              className="mt-3 rounded-xl p-4"
              style={{
                background: 'linear-gradient(145deg, rgba(124, 58, 237, 0.08) 0%, rgba(37, 99, 235, 0.04) 100%)',
                border: '1px solid rgba(124, 58, 237, 0.15)'
              }}
            >
              {renderVisual()}
            </div>
          )}

          {/* Code snippet */}
          {drop.codeSnippet && !drop.visualData && (
            <div className="mt-3 rounded-xl overflow-hidden">
              <CodeVisual code={drop.codeSnippet} />
            </div>
          )}

          {/* Review buttons — en expanded, si fue visto */}
          {onReview && drop.viewed && (
            <div className="mt-3 mb-1">
              {reviewDone ? (
                <p className="text-[11px] text-white/30 text-center">
                  {reviewDone === 'easy' ? '✓ Espaciado al siguiente nivel' : '✓ Vuelve pronto a repasarlo'}
                </p>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); onReview(drop.id, 2); setReviewDone('hard'); }}
                    className="flex-1 py-1.5 rounded-xl text-[12px] font-semibold transition-all border border-red-500/20 text-red-400/70 hover:border-red-500/50 hover:text-red-400 hover:bg-red-500/5"
                  >
                    {drop.status === 'relearn' ? 'Sin entender' : 'Difícil'}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onReview(drop.id, 4); setReviewDone('easy'); }}
                    className="flex-1 py-1.5 rounded-xl text-[12px] font-semibold transition-all border border-emerald-500/20 text-emerald-400/70 hover:border-emerald-500/50 hover:text-emerald-400 hover:bg-emerald-500/5"
                  >
                    {drop.status === 'relearn' ? 'Ya lo entendí' : drop.easeFactor > 2.8 ? 'Muy fácil' : 'Fácil'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Action bar */}
          <div className="flex items-center gap-3 mt-4 pt-2.5 border-t border-white/[0.04]">
            {showDeleteConfirm ? (
              <span className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20">
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete?.(drop.id); }}
                  className="text-[11px] text-red-400 hover:text-red-300 font-bold transition-colors"
                >
                  Borrar
                </button>
                <span className="text-red-500/30 text-[10px]">|</span>
                <button
                  onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(false); }}
                  className="text-[11px] text-white/30 hover:text-white/60 transition-colors"
                >
                  Cancelar
                </button>
              </span>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); }}
                className="text-white/20 hover:text-red-400 transition-colors text-[13px]"
              >
                ␡
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); setShowEditModal(true); }}
              className="text-white/25 hover:text-[#7c3aed] transition-colors text-[11px]"
            >
              ✏️
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleToggleLike(drop.id); }}
              className={cn(
                "transition-colors text-[11px]",
                drop.liked ? "text-rose-400" : "text-white/25 hover:text-rose-400"
              )}
            >
              {drop.liked ? '❤️' : '🤍'}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onAI?.(); }}
              className="text-white/25 hover:text-[#7c3aed] transition-colors text-[11px]"
            >
              🤖 IA
            </button>
            <span className="text-white/15 text-[10px] ml-auto">{formatRelativeDate(drop.createdAt)}</span>
          </div>

          {/* Cerrar */}
          <button
            onClick={(e) => { e.stopPropagation(); setCardExpanded(false); }}
            className="w-full mt-3 text-[11px] text-white/20 hover:text-white/40 transition-colors text-center"
          >
            ↑ Cerrar
          </button>
        </>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setShowEditModal(false); }}>
          <div className="bg-[#1a1a1f] rounded-2xl w-full max-w-lg border border-white/10 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/5">
              <div className="flex gap-1 bg-black/30 rounded-full p-1">
                <button
                  onClick={() => setEditMode('manual')}
                  className={cn('px-4 py-1.5 rounded-full text-[12px] font-medium transition-all', editMode === 'manual' ? 'bg-[#7c3aed] text-white' : 'text-white/40 hover:text-white')}
                >
                  ✍️ Manual
                </button>
                <button
                  onClick={() => setEditMode('ai')}
                  className={cn('px-4 py-1.5 rounded-full text-[12px] font-medium transition-all', editMode === 'ai' ? 'bg-[#7c3aed] text-white' : 'text-white/40 hover:text-white')}
                >
                  🤖 IA
                </button>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-white/30 hover:text-white transition-colors text-lg">✕</button>
            </div>

            <div className="overflow-y-auto px-6 py-4 flex-1">
              {/* Modo manual */}
              {editMode === 'manual' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-white/40 mb-1">Título</label>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#7c3aed]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 mb-1">Tipo</label>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(DROP_TYPE_CONFIG).map(([key, cfg]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setEditForm({ ...editForm, type: key as Drop['type'] })}
                          className={cn(
                            'px-3 py-1.5 rounded-full text-[12px] border transition-all',
                            editForm.type === key
                              ? 'bg-[#7c3aed] border-[#7c3aed] text-white'
                              : 'border-white/10 text-white/40 hover:border-[#7c3aed] hover:text-[#7c3aed]'
                          )}
                        >
                          {cfg.emoji} {cfg.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 mb-1">Contenido</label>
                    <textarea
                      value={editForm.content}
                      onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                      rows={5}
                      className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#7c3aed] resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 mb-1">Código (opcional)</label>
                    <textarea
                      value={editForm.codeSnippet}
                      onChange={(e) => setEditForm({ ...editForm, codeSnippet: e.target.value })}
                      rows={3}
                      placeholder="// snippet opcional..."
                      className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-[#a78bfa] text-xs font-mono focus:outline-none focus:border-[#7c3aed] resize-none placeholder:text-white/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 mb-1">Tags (separados por coma)</label>
                    <input
                      type="text"
                      value={editForm.tags}
                      onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                      className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#7c3aed]"
                    />
                  </div>
                </div>
              )}

              {/* Modo IA */}
              {editMode === 'ai' && (
                <div className="space-y-4">
                  {/* Preview del drop actual */}
                  <div className="rounded-xl border border-white/5 bg-black/20 p-4">
                    <p className="text-[10px] text-white/30 mb-2 uppercase tracking-wider">Drop actual</p>
                    <p className="text-white font-semibold text-sm mb-1">{editForm.title}</p>
                    <p className="text-white/50 text-xs leading-relaxed line-clamp-3">{editForm.content}</p>
                  </div>

                  <div>
                    <label className="block text-xs text-white/40 mb-2">¿Qué quieres cambiar?</label>
                    <textarea
                      value={aiInstruction}
                      onChange={(e) => setAiInstruction(e.target.value)}
                      rows={3}
                      placeholder={'Ej: "Hazlo más conciso", "Cambia el tipo a operativo y agrega pasos concretos", "Mejora el tono, que sea más directo"...'}
                      className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#7c3aed] resize-none placeholder:text-white/20"
                    />
                  </div>

                  {aiError && <p className="text-red-400 text-xs">{aiError}</p>}

                  <button
                    onClick={async () => {
                      if (!aiInstruction.trim() || aiEditing) return;
                      setAiEditing(true);
                      setAiError('');
                      try {
                        const result = await editDropWithAI(
                          { title: editForm.title, content: editForm.content, type: editForm.type, tags: editForm.tags.split(',').map(t => t.trim()).filter(Boolean), codeSnippet: editForm.codeSnippet || undefined },
                          aiInstruction
                        );
                        setEditForm({
                          title: result.title,
                          content: result.content,
                          type: result.type,
                          tags: result.tags.join(', '),
                          codeSnippet: result.codeSnippet || '',
                        });
                        setEditMode('manual');
                        setAiInstruction('');
                      } catch {
                        setAiError('Error al editar con IA. Verifica tu API key de Groq.');
                      } finally {
                        setAiEditing(false);
                      }
                    }}
                    disabled={!aiInstruction.trim() || aiEditing}
                    className={cn(
                      'w-full py-2.5 rounded-xl text-sm font-bold transition-all',
                      aiInstruction.trim() && !aiEditing
                        ? 'bg-[#7c3aed] hover:bg-[#6d28d9] text-white'
                        : 'bg-white/5 text-white/30 cursor-not-allowed'
                    )}
                  >
                    {aiEditing ? '⏳ Editando...' : '✨ Aplicar con IA'}
                  </button>

                  <p className="text-[11px] text-white/25 text-center">La IA aplica los cambios y te lleva al modo manual para revisar antes de guardar.</p>
                </div>
              )}
            </div>

            {/* Footer — solo en modo manual */}
            {editMode === 'manual' && (
              <div className="flex gap-3 px-6 py-4 border-t border-white/5">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2 text-white/40 hover:text-white transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    onEdit?.({
                      ...drop,
                      title: DOMPurify.sanitize(editForm.title, { ALLOWED_TAGS: [] }),
                      content: DOMPurify.sanitize(editForm.content, { ALLOWED_TAGS: [] }),
                      type: editForm.type,
                      tags: editForm.tags.split(',').map(t => DOMPurify.sanitize(t.trim(), { ALLOWED_TAGS: [] })).filter(Boolean),
                      codeSnippet: editForm.codeSnippet ? DOMPurify.sanitize(editForm.codeSnippet, { ALLOWED_TAGS: [] }) : undefined,
                    });
                    setShowEditModal(false);
                  }}
                  className="flex-1 bg-[#7c3aed] hover:bg-[#6d28d9] text-white py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  Guardar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
