import { useState, useEffect } from 'react';

export function SWUpdateToast() {
  const [waitingReg, setWaitingReg] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent).detail as ServiceWorkerRegistration;
      setWaitingReg(detail);
    };

    window.addEventListener('braindrop:sw-update-available', handler);
    return () => window.removeEventListener('braindrop:sw-update-available', handler);
  }, []);

  if (!waitingReg) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-white/10 bg-[linear-gradient(180deg,rgba(24,31,42,0.98),rgba(16,22,31,0.99))] px-5 py-3 shadow-[0_8px_32px_rgba(2,8,23,0.5)]">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-white">Nueva version disponible</span>
        <button
          onClick={() => {
            waitingReg.waiting?.postMessage({ type: 'SKIP_WAITING' });
            window.location.reload();
          }}
          className="rounded-full bg-[#7c3aed] px-4 py-1.5 text-xs font-bold text-white transition-colors hover:bg-[#6d28d9]"
        >
          Recargar
        </button>
        <button
          onClick={() => setWaitingReg(null)}
          className="text-sm text-white/30 hover:text-white/60"
        >
          x
        </button>
      </div>
    </div>
  );
}
