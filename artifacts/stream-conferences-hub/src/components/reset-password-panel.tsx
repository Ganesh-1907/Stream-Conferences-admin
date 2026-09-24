import { useState, FormEvent } from 'react';
import { ArrowRight, CheckCircle2, ShieldCheck, Mail, KeyRound, Eye, EyeOff } from 'lucide-react';
import { Link } from 'wouter';
import { API_BASE } from '@/lib/constants';

export function ResetPasswordPanel() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token') || '';
  const emailParam = urlParams.get('email') || '';

  const [identifier, setIdentifier] = useState(emailParam);
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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
    if (!token && (!otp || !identifier)) {
      setError('Please provide your Username/Email and the 6-Digit OTP code from your email.');
      return;
    }

    setLoading(true);
    try {
      const payload: any = { password };
      if (token) {
        payload.token = token;
      } else {
        payload.username = identifier.trim();
        payload.otp = otp.trim();
      }

      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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
          <div className="flex items-center justify-center gap-3 mb-2.5">
            <img
              src="/logo.jpg"
              alt="Stream Conferences"
              className="h-12 w-12 rounded-xl object-contain bg-white p-1 border border-foreground/10 shadow-md"
            />
            <span className="font-['Space_Grotesk'] font-black tracking-tight text-2xl text-foreground">
              Stream Conferences
            </span>
          </div>
          <p className="text-xs text-muted-foreground tracking-wider uppercase mt-2">Reset your password</p>
        </div>

        {done ? (
          <div className="text-center space-y-4">
            <CheckCircle2 className="mx-auto text-green-500" size={44} />
            <p className="text-sm font-bold text-foreground">Your password has been updated successfully.</p>
            <p className="text-xs text-muted-foreground">You can now sign in using your new credentials.</p>
            <Link href="/" className="cta-button justify-center py-3 text-sm font-bold tracking-wide mt-2">
              Back to sign in <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-sm rounded-lg text-center font-medium">
                {error}
              </div>
            )}

            {!token && (
              <>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
                    <Mail size={13} /> Username or Email
                  </label>
                  <input
                    required
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. mentor@example.com"
                    className="w-full px-4 py-2.5 bg-background border border-foreground/15 rounded-lg text-foreground focus:outline-none focus:border-secondary transition text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
                    <ShieldCheck size={13} /> 6-Digit OTP Code
                  </label>
                  <input
                    required
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full px-4 py-2.5 bg-background border border-foreground/15 rounded-lg text-foreground font-mono text-center tracking-[4px] text-base font-bold focus:outline-none focus:border-secondary transition"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <KeyRound size={13} /> New password
              </label>
              <div className="relative">
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 pr-10 bg-background border border-foreground/15 rounded-lg text-foreground focus:outline-none focus:border-secondary transition text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition p-1 cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <KeyRound size={13} /> Confirm password
              </label>
              <div className="relative">
                <input
                  required
                  type={showConfirm ? 'text' : 'password'}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 pr-10 bg-background border border-foreground/15 rounded-lg text-foreground focus:outline-none focus:border-secondary transition text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition p-1 cursor-pointer"
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full cta-button justify-center py-3 text-sm font-bold tracking-wide mt-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Updating Password...' : 'Update password'} <ArrowRight size={14} />
            </button>

            <div className="text-center pt-2">
              <Link href="/" className="text-xs text-muted-foreground hover:text-foreground transition">
                ← Back to sign in
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
