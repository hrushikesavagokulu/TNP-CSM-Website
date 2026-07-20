import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import OtpInput from '../../components/shared/OtpInput';
import authService from '../../services/auth.service';

const STEPS = { EMAIL: 1, OTP: 2, NEW_PASSWORD: 3 };

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [step,       setStep]       = useState(STEPS.EMAIL);
  const [email,      setEmail]      = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPass,    setNewPass]    = useState('');
  const [confirmPass,setConfirmPass]= useState('');
  const [showPass,   setShowPass]   = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState(null);
  const [otpError,   setOtpError]   = useState(null);
  const [otpAttempts,setOtpAttempts]= useState(null);
  const [success,    setSuccess]    = useState(false);

  // ── Step 1: Send OTP ────────────────────────────────────────────────────────
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) { setError('Please enter your email.'); return; }
    setLoading(true);
    try {
      await authService.forgotPassword(email.trim().toLowerCase());
      setStep(STEPS.OTP);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP ─────────────────────────────────────────────────────
  const handleVerifyOtp = async (code) => {
    setOtpError(null);
    setLoading(true);
    try {
      const data = await authService.verifyResetOtp(email.trim().toLowerCase(), code);
      setResetToken(data.resetToken);
      setStep(STEPS.NEW_PASSWORD);
    } catch (err) {
      const data = err.response?.data;
      setOtpError(data?.message || 'Incorrect OTP. Please try again.');
      setOtpAttempts(data?.attemptsRemaining ?? null);
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: Reset password ─────────────────────────────────────────────────
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(null);
    if (newPass.length < 8)           { setError('Password must be at least 8 characters.'); return; }
    if (!/[0-9]/.test(newPass))       { setError('Password must contain at least one number.'); return; }
    if (newPass !== confirmPass)       { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      await authService.resetPassword(resetToken, newPass);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please start over.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await authService.forgotPassword(email.trim().toLowerCase());
      setOtpError(null);
      setOtpAttempts(null);
    } catch { /* silently fail */ }
  };

  // ── Progress indicator ─────────────────────────────────────────────────────
  const stepLabels = ['Email', 'Verify OTP', 'New Password'];

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="glass-card p-8">

          {/* Progress steps */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {stepLabels.map((label, i) => {
              const stepNum = i + 1;
              const isActive    = step === stepNum;
              const isCompleted = step > stepNum;
              return (
                <div key={label} className="flex items-center gap-2">
                  <div className={`flex items-center gap-1.5 text-xs font-medium transition-all ${
                    isCompleted ? 'text-[var(--color-success)]' :
                    isActive    ? 'text-[var(--color-accent)]'  :
                                  'text-[var(--color-text-muted)]'
                  }`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                      isCompleted ? 'bg-[var(--color-success)] border-[var(--color-success)] text-white' :
                      isActive    ? 'border-[var(--color-accent)] text-[var(--color-accent)]' :
                                    'border-[var(--color-border)] text-[var(--color-text-muted)]'
                    }`}>
                      {isCompleted ? '✓' : stepNum}
                    </div>
                    <span className="hidden sm:block">{label}</span>
                  </div>
                  {i < 2 && <div className={`w-8 h-px transition-all ${step > i + 1 ? 'bg-[var(--color-success)]' : 'bg-[var(--color-border)]'}`} />}
                </div>
              );
            })}
          </div>

          {/* Success state */}
          {success && (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-[var(--color-success-bg)] border border-[var(--color-success)]/30
                flex items-center justify-center mx-auto mb-4 text-3xl">✅</div>
              <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">Password Reset!</h2>
              <p className="text-sm text-[var(--color-text-muted)]">Redirecting you to login...</p>
            </div>
          )}

          {/* Step 1: Email */}
          {!success && step === STEPS.EMAIL && (
            <>
              <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Forgot Password</h1>
                <p className="text-sm text-[var(--color-text-muted)] mt-1">Enter your college email to receive an OTP</p>
              </div>
              {error && (
                <div className="mb-4 px-4 py-3 rounded-xl bg-[var(--color-error-bg)] border border-[var(--color-error)]/20 text-sm text-[var(--color-error)]">
                  {error}
                </div>
              )}
              <form onSubmit={handleSendOtp} noValidate className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="fp-email" className="text-sm font-medium text-[var(--color-text-secondary)]">College Email</label>
                  <input id="fp-email" type="email" placeholder="yourname@gprec.ac.in"
                    value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading}
                    className="w-full px-4 py-2.5 rounded-xl border text-sm
                      bg-[var(--color-surface)] text-[var(--color-text-primary)]
                      placeholder:text-[var(--color-text-muted)] border-[var(--color-border)]
                      focus:outline-none focus:border-[var(--color-accent)]
                      focus:shadow-[0_0_0_3px_var(--color-accent-subtle)]
                      disabled:opacity-50 transition-all" />
                </div>
                <button id="fp-send-otp-btn" type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                  {loading ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg> Sending...</> : 'Send OTP'}
                </button>
              </form>
            </>
          )}

          {/* Step 2: OTP */}
          {!success && step === STEPS.OTP && (
            <>
              <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Check Your Email</h1>
                <p className="text-sm text-[var(--color-text-muted)] mt-1">
                  Enter the 6-digit code sent to <span className="text-[var(--color-accent)] font-medium">{email}</span>
                </p>
              </div>
              <div className="flex flex-col items-center gap-4">
                <OtpInput
                  onComplete={handleVerifyOtp}
                  onResend={handleResend}
                  isLoading={loading}
                  error={otpError}
                  attemptsRemaining={otpAttempts}
                />
              </div>
            </>
          )}

          {/* Step 3: New password */}
          {!success && step === STEPS.NEW_PASSWORD && (
            <>
              <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Set New Password</h1>
                <p className="text-sm text-[var(--color-text-muted)] mt-1">Choose a strong password for your account</p>
              </div>
              {error && (
                <div className="mb-4 px-4 py-3 rounded-xl bg-[var(--color-error-bg)] border border-[var(--color-error)]/20 text-sm text-[var(--color-error)]">
                  {error}
                </div>
              )}
              <form onSubmit={handleResetPassword} noValidate className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="fp-new-pass" className="text-sm font-medium text-[var(--color-text-secondary)]">New Password</label>
                  <div className="relative">
                    <input id="fp-new-pass" type={showPass ? 'text' : 'password'}
                      placeholder="Min 8 chars, include a number"
                      value={newPass} onChange={(e) => setNewPass(e.target.value)} disabled={loading}
                      className="w-full px-4 py-2.5 pr-12 rounded-xl border text-sm
                        bg-[var(--color-surface)] text-[var(--color-text-primary)]
                        placeholder:text-[var(--color-text-muted)] border-[var(--color-border)]
                        focus:outline-none focus:border-[var(--color-accent)]
                        focus:shadow-[0_0_0_3px_var(--color-accent-subtle)]
                        disabled:opacity-50 transition-all" />
                    <button type="button" onClick={() => setShowPass((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
                      {showPass ? '🙈' : '👁'}
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="fp-confirm-pass" className="text-sm font-medium text-[var(--color-text-secondary)]">Confirm Password</label>
                  <input id="fp-confirm-pass" type="password" placeholder="Retype new password"
                    value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} disabled={loading}
                    className="w-full px-4 py-2.5 rounded-xl border text-sm
                      bg-[var(--color-surface)] text-[var(--color-text-primary)]
                      placeholder:text-[var(--color-text-muted)] border-[var(--color-border)]
                      focus:outline-none focus:border-[var(--color-accent)]
                      focus:shadow-[0_0_0_3px_var(--color-accent-subtle)]
                      disabled:opacity-50 transition-all" />
                </div>
                <button id="fp-reset-btn" type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                  {loading ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg> Resetting...</> : 'Reset Password'}
                </button>
              </form>
            </>
          )}

          <p className="text-center text-sm text-[var(--color-text-muted)] mt-6">
            Remember your password?{' '}
            <Link to="/login" className="text-[var(--color-accent)] font-medium hover:underline">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
