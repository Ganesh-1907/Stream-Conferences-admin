import { useState, FormEvent } from 'react';
import { ArrowRight, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { useAppStore } from '@/store/app-store';
import { API_BASE } from '@/lib/constants';

export function LoginPanel() {
  const { theme, toggle } = useTheme();
  const {
    loginError,
    loginLoading,
    usernameInput,
    passwordInput,
    setUsernameInput,
    setPasswordInput,
    handleLogin,
  } = useAppStore();
  const [mode, setMode] = useState<'login' | 'forgot'>('login');
  const [forgotUsername, setForgotUsername] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');

  const handleForgot = async (e: FormEvent) => {
    e.preventDefault();
    setForgotMessage('');
    setForgotLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: forgotUsername }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      setForgotMessage(data.message || 'If the account exists, a reset link has been sent.');
    } catch (err: any) {
      setForgotMessage(err.message || 'Request failed');
    } finally {
      setForgotLoading(false);
    }
  };



  return (
    <div className="site-shell bg-grid flex items-center justify-center min-h-screen px-4">
      <div className="absolute top-4 right-4">
        <button className="icon-button" onClick={toggle} aria-label="Toggle theme">
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>

      <div className="w-full max-w-md bg-card border border-foreground/15 p-8 rounded-2xl shadow-2xl relative overflow-hidden reveal visible">
        <div className="absolute top-0 left-0 w-full h-[6px] bg-accent"></div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="brand-mark object-cover">SC</span>
            <span className="brand-word text-xl font-bold">Admin Console</span>
          </div>
          <p className="text-xs text-muted-foreground tracking-widest uppercase">Stream Conferences Management Portal</p>
        </div>

        {mode === 'forgot' ? (
          <form onSubmit={handleForgot} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Username</label>
              <input
                required
                type="text"
                value={forgotUsername}
                onChange={(e) => setForgotUsername(e.target.value)}
                placeholder="e.g. admin or mentor"
                className="w-full px-4 py-3 bg-background border border-foreground/15 rounded-lg text-foreground focus:outline-none focus:border-secondary transition"
              />
            </div>

            {forgotMessage && (
              <div className="p-3 bg-secondary/10 border border-secondary/30 text-secondary text-sm rounded-lg text-center font-medium">
                {forgotMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={forgotLoading}
              className="w-full cta-button justify-center py-3 text-sm font-bold tracking-wide mt-2"
            >
              {forgotLoading ? 'Sending...' : 'Send reset link'} <ArrowRight size={14} />
            </button>

            <button
              type="button"
              onClick={() => { setMode('login'); setForgotMessage(''); }}
              className="w-full text-xs text-muted-foreground hover:text-foreground transition"
            >
              ← Back to sign in
            </button>
          </form>
        ) : (
          <>
            {loginError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-sm rounded-lg text-center font-medium">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Username or Email</label>
                <input
                  required
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="e.g. admin or email@example.com"
                  className="w-full px-4 py-3 bg-background border border-foreground/15 rounded-lg text-foreground focus:outline-none focus:border-secondary transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Password</label>
                <input
                  required
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-background border border-foreground/15 rounded-lg text-foreground focus:outline-none focus:border-secondary transition"
                />
              </div>

              <div className="flex justify-end items-center text-xs">
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-secondary hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full cta-button justify-center py-3 text-sm font-bold tracking-wide mt-2"
              >
                {loginLoading ? 'Verifying with DB...' : 'Sign In'} <ArrowRight size={14} />
              </button>
            </form>
          </>
        )}

        <div className="mt-8 pt-6 border-t border-foreground/10 text-center text-xs text-muted-foreground space-y-1">
          <p>Demo accounts seeded automatically:</p>
          <p><strong className="text-foreground">Admin:</strong> admin / admin123</p>
          <p><strong className="text-foreground">Mentor:</strong> mentor / mentor123</p>
        </div>
      </div>
    </div>
  );
}
