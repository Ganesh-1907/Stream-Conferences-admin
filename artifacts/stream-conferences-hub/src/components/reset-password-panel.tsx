import { useState, FormEvent } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'wouter';
import { API_BASE } from '@/lib/constants';

export function ResetPasswordPanel() {
  const token = new URLSearchParams(window.location.search).get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    if (!token) {
      setError('Reset token is missing. Please use the link from your email.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password');
      setDone(true);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="site-shell bg-grid flex items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-md bg-card border border-foreground/15 p-8 rounded-2xl shadow-2xl relative overflow-hidden reveal visible">
        <div className="absolute top-0 left-0 w-full h-[6px] bg-accent"></div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="brand-mark object-cover">SC</span>
            <span className="brand-word text-xl font-bold">Admin Console</span>
          </div>
          <p className="text-xs text-muted-foreground tracking-widest uppercase">Reset your password</p>
        </div>

        {done ? (
          <div className="text-center space-y-4">
            <CheckCircle2 className="mx-auto text-green-500" size={40} />
            <p className="text-sm font-medium">Your password has been updated successfully.</p>
            <Link href="/" className="cta-button justify-center py-3 text-sm font-bold tracking-wide">
              Back to sign in <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-sm rounded-lg text-center font-medium">
                {error}
              </div>
            )}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">New password</label>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-background border border-foreground/15 rounded-lg text-foreground focus:outline-none focus:border-secondary transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Confirm password</label>
              <input
                required
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-background border border-foreground/15 rounded-lg text-foreground focus:outline-none focus:border-secondary transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full cta-button justify-center py-3 text-sm font-bold tracking-wide mt-2"
            >
              {loading ? 'Updating...' : 'Update password'} <ArrowRight size={14} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
