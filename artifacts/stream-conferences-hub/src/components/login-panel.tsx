import { useState, FormEvent } from 'react';
import { ArrowRight, Moon, Sun, KeyRound, ShieldCheck, Mail, CheckCircle2, AlertCircle, Check, Eye, EyeOff } from 'lucide-react';
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
  const [forgotStep, setForgotStep] = useState<'request' | 'verify' | 'new_password'>('request');
  const [forgotUsername, setForgotUsername] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  // Step 1: Send OTP to email
  const handleForgotRequest = async (e: FormEvent) => {
    e.preventDefault();
    setForgotMessage('');
    setForgotError('');
    setForgotLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: forgotUsername.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send reset code');
      }

      setForgotMessage(data.message || 'OTP code sent to your email.');
      setOtpCode('');
      setForgotStep('verify');
    } catch (err: any) {
      setForgotError(err.message || 'Request failed. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotMessage('');

    if (!otpCode || otpCode.trim().length !== 6) {
      setForgotError('Please enter the complete 6-digit OTP code.');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: forgotUsername.trim(),
          otp: otpCode.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid or expired OTP code');
      }

      setForgotMessage('OTP verified successfully! Please enter your new password.');
      setForgotStep('new_password');
    } catch (err: any) {
      setForgotError(err.message || 'OTP verification failed. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  // Step 3: Set New Password
  const handleResetSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotMessage('');

    if (newPassword.length < 6) {
      setForgotError('New password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setForgotError('Passwords do not match');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: forgotUsername.trim(),
          otp: otpCode.trim(),
          password: newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setResetSuccess(true);
      setForgotMessage('Password updated successfully! You can now sign in.');
      setTimeout(() => {
        resetForgotState();
      }, 1500);
    } catch (err: any) {
      setForgotError(err.message || 'Failed to reset password');
    } finally {
      setForgotLoading(false);
    }
  };

  const resetForgotState = () => {
    setMode('login');
    setForgotStep('request');
    setForgotMessage('');
    setForgotError('');
    setOtpCode('');
    setNewPassword('');
    setConfirmPassword('');
    setResetSuccess(false);
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
          <p className="text-xs text-muted-foreground tracking-wider uppercase mt-2">Management Portal</p>
        </div>

        {mode === 'forgot' ? (
          <div>
            {/* Step Indicator */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
                forgotStep === 'request'
                  ? 'bg-secondary text-secondary-foreground shadow-sm'
                  : 'bg-muted/60 text-muted-foreground'
              }`}>
                <span>1. Request</span>
              </div>
              <span className="text-muted-foreground/40 text-xs">→</span>
              <div className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
                forgotStep === 'verify'
                  ? 'bg-secondary text-secondary-foreground shadow-sm'
                  : 'bg-muted/60 text-muted-foreground'
              }`}>
                <span>2. Verify OTP</span>
              </div>
              <span className="text-muted-foreground/40 text-xs">→</span>
              <div className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
                forgotStep === 'new_password'
                  ? 'bg-secondary text-secondary-foreground shadow-sm'
                  : 'bg-muted/60 text-muted-foreground'
              }`}>
                <span>3. New Password</span>
              </div>
            </div>

            {/* STEP 1: Enter Username/Email */}
            {forgotStep === 'request' && (
              <form onSubmit={handleForgotRequest} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                    <Mail size={13} /> Username or Email Address
                  </label>
                  <input
                    required
                    type="text"
                    value={forgotUsername}
                    onChange={(e) => setForgotUsername(e.target.value)}
                    placeholder="e.g. admin or mentor@example.com"
                    className="w-full px-4 py-3 bg-background border border-foreground/15 rounded-lg text-foreground focus:outline-none focus:border-secondary transition"
                  />
                  <p className="text-[11px] text-muted-foreground mt-1.5">
                    We will send a 6-digit verification OTP to your registered email.
                  </p>
                </div>

                {forgotError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-xs rounded-lg text-center font-medium flex items-center gap-2 justify-center">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{forgotError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full cta-button justify-center py-3 text-sm font-bold tracking-wide mt-2 cursor-pointer disabled:opacity-50"
                >
                  {forgotLoading ? 'Sending OTP...' : 'Send OTP'} <ArrowRight size={14} />
                </button>

                <button
                  type="button"
                  onClick={resetForgotState}
                  className="w-full text-xs text-muted-foreground hover:text-foreground transition cursor-pointer text-center block pt-1"
                >
                  ← Back to sign in
                </button>
              </form>
            )}

            {/* STEP 2: Verify OTP Only */}
            {forgotStep === 'verify' && (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                {forgotMessage && (
                  <div className="p-3 bg-secondary/10 border border-secondary/30 text-secondary text-xs rounded-lg text-center font-medium">
                    {forgotMessage}
                  </div>
                )}

                {forgotError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-xs rounded-lg text-center font-medium flex items-center gap-2 justify-center">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{forgotError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-secondary" /> Enter 6-Digit OTP Code
                  </label>
                  <input
                    required
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full px-4 py-3 bg-background border border-foreground/15 rounded-lg text-foreground font-mono text-center tracking-[6px] text-xl font-bold focus:outline-none focus:border-secondary transition"
                  />
                  <p className="text-[11px] text-muted-foreground mt-1.5 text-center">
                    Check your email inbox for the 6-digit verification code.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading || otpCode.length !== 6}
                  className="w-full cta-button justify-center py-3 text-sm font-bold tracking-wide mt-2 cursor-pointer disabled:opacity-50"
                >
                  {forgotLoading ? 'Verifying OTP...' : 'Verify OTP'} <ArrowRight size={14} />
                </button>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotStep('request');
                      setForgotError('');
                    }}
                    className="text-muted-foreground hover:text-foreground transition cursor-pointer"
                  >
                    ← Change Email
                  </button>
                  <button
                    type="button"
                    onClick={handleForgotRequest}
                    disabled={forgotLoading}
                    className="text-secondary hover:underline transition cursor-pointer font-semibold"
                  >
                    Resend OTP
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: Set New Password */}
            {forgotStep === 'new_password' && (
              <form onSubmit={handleResetSubmit} className="space-y-4">
                {resetSuccess ? (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-sm rounded-xl text-center font-medium flex flex-col items-center gap-2">
                    <CheckCircle2 size={36} />
                    <span>{forgotMessage}</span>
                  </div>
                ) : (
                  <>
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs rounded-lg text-center font-bold flex items-center justify-center gap-1.5">
                      <Check size={14} /> OTP Verified! Please choose a new password.
                    </div>

                    {forgotError && (
                      <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-xs rounded-lg text-center font-medium flex items-center gap-2 justify-center">
                        <AlertCircle size={14} className="shrink-0" />
                        <span>{forgotError}</span>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
                        <KeyRound size={13} /> New Password
                      </label>
                      <div className="relative">
                        <input
                          required
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-4 py-2.5 pr-10 bg-background border border-foreground/15 rounded-lg text-foreground focus:outline-none focus:border-secondary transition text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition p-1 cursor-pointer"
                          aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                        >
                          {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
                        <KeyRound size={13} /> Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          required
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-4 py-2.5 pr-10 bg-background border border-foreground/15 rounded-lg text-foreground focus:outline-none focus:border-secondary transition text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition p-1 cursor-pointer"
                          aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                        >
                          {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="w-full cta-button justify-center py-3 text-sm font-bold tracking-wide mt-2 cursor-pointer disabled:opacity-50"
                    >
                      {forgotLoading ? 'Updating Password...' : 'Update Password'} <ArrowRight size={14} />
                    </button>

                    <div className="text-center pt-1">
                      <button
                        type="button"
                        onClick={resetForgotState}
                        className="text-xs text-muted-foreground hover:text-foreground transition cursor-pointer"
                      >
                        Cancel and back to sign in
                      </button>
                    </div>
                  </>
                )}
              </form>
            )}
          </div>
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
                <div className="relative">
                  <input
                    required
                    type={showPassword ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 pr-11 bg-background border border-foreground/15 rounded-lg text-foreground focus:outline-none focus:border-secondary transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition p-1 cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end items-center text-xs">
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-secondary hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full cta-button justify-center py-3 text-sm font-bold tracking-wide mt-2 cursor-pointer disabled:opacity-50"
              >
                {loginLoading ? 'Verifying with DB...' : 'Sign In'} <ArrowRight size={14} />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
