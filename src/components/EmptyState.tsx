interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="relative mb-5">
        <div className="absolute -inset-6 rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.18)_0%,transparent_70%)] animate-pulse" />
        <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl border border-white/[0.08] bg-[rgba(255,255,255,0.03)]">
          <span className="text-4xl quiz-float">{icon}</span>
        </div>
      </div>
      
      <h3 className="mb-2 font-display text-lg font-bold text-white/90 tracking-tight">
        {title}
      </h3>
      
      <p className="mb-5 max-w-[260px] text-sm text-white/40 leading-relaxed">
        {description}
      </p>
      
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
