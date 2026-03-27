import { useState } from 'react';
import { supabase } from '@/lib/supabase';

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
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">🧠</div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[#7c3aed] to-[#2563eb] bg-clip-text text-transparent">
            BrainDrop
          </h1>
          <p className="text-[#71767b] mt-2 text-sm">Tu feed de aprendizaje</p>
        </div>

        {sent ? (
          <div className="text-center">
            <div className="text-4xl mb-4">📬</div>
            <p className="text-[#e7e9ea] font-semibold mb-2">Revisa tu correo</p>
            <p className="text-[#71767b] text-sm">
              Enviamos un link a <span className="text-[#a78bfa]">{email}</span>.
              <br />Haz clic en él para entrar.
            </p>
            <button
              onClick={() => setSent(false)}
              className="mt-6 text-sm text-[#71767b] hover:text-[#e7e9ea] transition-colors"
            >
              Usar otro correo
            </button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              autoFocus
              className="w-full bg-[#16161a] border border-[#2f3336] rounded-xl px-4 py-3 text-[#e7e9ea] text-[15px] placeholder:text-[#4a4f56] focus:outline-none focus:border-[#7c3aed]/60"
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full py-3 bg-[#7c3aed] text-white font-bold rounded-xl text-[15px] hover:bg-[#6d28d9] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? 'Enviando...' : 'Entrar con email'}
            </button>
            <p className="text-center text-[#4a4f56] text-xs">
              Te enviamos un link mágico, sin contraseña.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
