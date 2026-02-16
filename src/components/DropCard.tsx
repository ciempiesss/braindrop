import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { Drop, VisualData } from '@/types';
import { DROP_TYPE_CONFIG } from '@/types';
import { formatRelativeDate } from '@/lib/utils';
import DOMPurify from 'dompurify';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface DropCardProps {
  drop: Drop;
  onReview?: () => void;
  onAI?: () => void;
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
  } catch { }
  return '1';
}

const typeStyles: Record<string, { bg: string; text: string; icon: string; gradient: string }> = {
  definition: { bg: 'bg-blue-500/20 text-blue-400 border-blue-500/30', text: 'text-blue-400', icon: '💠', gradient: 'from-blue-500/30 to-purple-500/20' },
  analogy: { bg: 'bg-purple-500/20 text-purple-400 border-purple-500/30', text: 'text-purple-400', icon: '🔗', gradient: 'from-purple-500/30 to-pink-500/20' },
  hook: { bg: 'bg-amber-500/20 text-amber-400 border-amber-500/30', text: 'text-amber-400', icon: '⚡', gradient: 'from-amber-500/30 to-orange-500/20' },
  trivia: { bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', text: 'text-emerald-400', icon: '🎯', gradient: 'from-emerald-500/30 to-cyan-500/20' },
  insight: { bg: 'bg-rose-500/20 text-rose-400 border-rose-500/30', text: 'text-rose-400', icon: '💡', gradient: 'from-rose-500/30 to-red-500/20' },
  connection: { bg: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30', text: 'text-cyan-400', icon: '🧩', gradient: 'from-cyan-500/30 to-blue-500/20' },
  code: { bg: 'bg-violet-500/20 text-violet-400 border-violet-500/30', text: 'text-violet-400', icon: '⚙️', gradient: 'from-violet-500/30 to-indigo-500/20' },
};

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

export function DropCard({ drop, onReview, onAI }: DropCardProps) {
  const [fontScale, setFontScale] = useState(() => getFontScale());

  useEffect(() => {
    const handleStorage = () => setFontScale(getFontScale());
    window.addEventListener('storage', handleStorage);
    const interval = setInterval(() => setFontScale(getFontScale()), 500);
    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);

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
      className="p-4 border-b border-white/5 hover:bg-white/[0.02] transition-all cursor-pointer w-full"
      style={{ 
        background: 'linear-gradient(145deg, #0f0f14 0%, #0a0a0f 100%)',
        boxShadow: '0 1px 0 rgba(255,255,255,0.03) inset'
      }}
    >
      {/* Header with gradient badge */}
      <div className="flex items-center gap-2 mb-3">
        <span 
          className={cn(
            'px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all',
            styles.bg
          )}
          style={{
            background: `linear-gradient(135deg, ${styles.gradient})`,
            backdropFilter: 'blur(10px)'
          }}
        >
          <span className="mr-1">{styles.icon}</span>
          {config.label}
        </span>
        {drop.tags.length > 0 && (
          <div className="flex gap-1">
            {drop.tags.slice(0, 2).map((tag, i) => (
              <span key={i} className="text-[10px] text-white/30">#{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Title */}
      <h3 
        className="font-bold mb-2 text-white leading-tight"
        style={{ fontSize: `calc(18px * ${fontScale})` }}
      >
        {drop.title}
      </h3>

      {/* Content */}
      <p 
        className="text-white/60 leading-relaxed mb-3"
        style={{ fontSize: `calc(14px * ${fontScale})` }}
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(drop.content.replace(/\n/g, '<br>')) }}
      />

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

      {/* Code snippet (legacy) */}
      {drop.codeSnippet && !drop.visualData && (
        <div className="mt-3 rounded-xl overflow-hidden">
          <CodeVisual code={drop.codeSnippet} />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 mt-3 pt-2 border-t border-white/5">
        <button 
          onClick={onReview}
          className="flex items-center gap-1.5 text-white/40 hover:text-[#7c3aed] transition-colors text-xs"
        >
          <span className="text-sm">🔄</span>
          <span>Repetir</span>
        </button>
        <button className="flex items-center gap-1.5 text-white/40 hover:text-rose-400 transition-colors text-xs">
          <span className="text-sm">❤️</span>
          <span>Guardar</span>
        </button>
        <button 
          onClick={onAI}
          className="flex items-center gap-1.5 text-white/40 hover:text-[#7c3aed] transition-colors ml-auto text-xs"
        >
          <span>🤖</span>
          <span>IA</span>
        </button>
        <span className="text-white/30 text-xs">{formatRelativeDate(drop.createdAt)}</span>
      </div>
    </article>
  );
}
