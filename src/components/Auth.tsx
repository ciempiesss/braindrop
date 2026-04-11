import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Mail } from 'lucide-react';

export function Auth() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(98,121,170,0.16),transparent_38%),linear-gradient(180deg,#0d1118_0%,#10151d_100%)] flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(24,31,42,0.96),rgba(16,22,31,0.98))] p-6 shadow-[14px_14px_34px_rgba(2,8,23,0.28),-8px_-8px_18px_rgba(255,255,255,0.02)]">
          <div className="text-center mb-8">
            <svg width="56" height="56" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-4">
              <defs>
                <linearGradient id="authBrainGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#7c3aed"/>
                  <stop offset="100%" stopColor="#06b6d4"/>
                </linearGradient>
              </defs>
              <circle cx="20" cy="20" r="18" stroke="url(#authBrainGrad)" strokeWidth="2" fill="none" opacity="0.3"/>
              <circle cx="20" cy="14" r="3" fill="url(#authBrainGrad)"/>
              <circle cx="12" cy="22" r="2.5" fill="url(#authBrainGrad)"/>
              <circle cx="28" cy="22" r="2.5" fill="url(#authBrainGrad)"/>
              <circle cx="16" cy="28" r="2" fill="url(#authBrainGrad)"/>
              <circle cx="24" cy="28" r="2" fill="url(#authBrainGrad)"/>
              <line x1="20" y1="14" x2="12" y2="22" stroke="url(#authBrainGrad)" strokeWidth="1.5" opacity="0.6"/>
              <line x1="20" y1="14" x2="28" y2="22" stroke="url(#authBrainGrad)" strokeWidth="1.5" opacity="0.6"/>
              <line x1="12" y1="22" x2="16" y2="28" stroke="url(#authBrainGrad)" strokeWidth="1.5" opacity="0.6"/>
              <line x1="28" y1="22" x2="24" y2="28" stroke="url(#authBrainGrad)" strokeWidth="1.5" opacity="0.6"/>
              <line x1="12" y1="22" x2="28" y2="22" stroke="url(#authBrainGrad)" strokeWidth="1.5" opacity="0.4"/>
              <line x1="16" y1="28" x2="24" y2="28" stroke="url(#authBrainGrad)" strokeWidth="1.5" opacity="0.4"/>
            </svg>
            <h1 className="font-display text-[28px] font-black tracking-[-0.05em] bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] bg-clip-text text-transparent">
              BrainDrop
            </h1>
            <p className="text-white/42 mt-2 text-sm">Tu feed de aprendizaje</p>
          </div>

          {sent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-[linear-gradient(180deg,rgba(124,58,237,0.2),rgba(6,182,212,0.2))] flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-[#7c3aed]" />
              </div>
              <p className="text-[#e7e9ea] font-semibold mb-2">Revisa tu correo</p>
              <p className="text-white/42 text-sm">
                Enviamos un link a <span className="text-[#7c3aed]">{email}</span>.
                <br />Haz clic en él para entrar.
              </p>
              <button
                onClick={() => setSent(false)}
                className="mt-6 text-sm text-white/42 hover:text-white/70 transition-colors"
              >
                Usar otro correo
              </button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  autoFocus
                  className="w-full bg-[#0a0a0a] border border-white/8 rounded-xl px-4 py-3.5 text-[#e7e9ea] text-[15px] placeholder:text-white/25 focus:outline-none focus:border-[#7c3aed]/50 shadow-[inset_4px_4px_8px_rgba(2,8,23,0.4),inset_-2px_-2px_6px_rgba(255,255,255,0.02)]"
                />
                {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
              </div>
              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full py-3.5 bg-[linear-gradient(135deg,#7c3aed,#6d28d9)] text-white font-bold rounded-xl text-[15px] hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[6px_6px_16px_rgba(2,8,23,0.4)]"
              >
                {loading ? 'Enviando...' : 'Entrar con email'}
              </button>
              <p className="text-center text-white/25 text-xs">
                Te enviamos un link mágico, sin contraseña.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
