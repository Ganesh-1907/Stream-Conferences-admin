import { useState, FormEvent } from 'react';
import { ArrowRight, ShieldAlert } from 'lucide-react';
import { useAppStore } from '@/store/app-store';

export function ForceChangePasswordPanel() {
  const { changePassword, handleLogout } = useAppStore();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await changePassword(password);
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="site-shell bg-grid flex items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-md bg-card border border-foreground/15 p-8 rounded-2xl shadow-2xl relative overflow-hidden reveal visible">
        <div className="absolute top-0 left-0 w-full h-[6px] bg-secondary"></div>

        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="brand-mark object-cover">SC</span>
            <span className="brand-word text-xl font-bold text-foreground">Admin Console</span>
          </div>
          <h2 className="text-lg font-bold text-foreground mb-1">Update Temporary Password</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            For your security, you must set a permanent password before accessing the system.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-xs rounded-lg text-center font-medium flex items-center gap-2 justify-center">
              <ShieldAlert size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">New Password</label>
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
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Confirm New Password</label>
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
            {loading ? 'Updating Password...' : 'Update Password & Login'} <ArrowRight size={14} />
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full text-xs text-muted-foreground hover:text-foreground transition mt-4"
          >
            Cancel & Sign Out
          </button>
        </form>
      </div>
    </div>
  );
}
