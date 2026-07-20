import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import OtpInput from '../../components/shared/OtpInput';
import authService from '../../services/auth.service';

const BRANCHES = ['CSM', 'CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'AIDS', 'AIML'];

// ── Field input component ─────────────────────────────────────────────────────
function Field({ id, label, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-[var(--color-text-secondary)]">
        {label}
      </label>
      {children}
      {error && (
        <p className="text-xs text-[var(--color-error)] flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
}

function Input({ id, type = 'text', placeholder, value, onChange, onBlur, disabled, className = '' }) {
  return (
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      disabled={disabled}
      className={`w-full px-4 py-2.5 rounded-xl border text-sm
        bg-[var(--color-surface)] text-[var(--color-text-primary)]
        placeholder:text-[var(--color-text-muted)]
        border-[var(--color-border)]
        focus:outline-none focus:border-[var(--color-accent)]
        focus:shadow-[0_0_0_3px_var(--color-accent-subtle)]
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-all duration-150 ${className}`}
    />
  );
}

export default function Register() {
  const navigate  = useNavigate();
  const { verifyOtp } = useAuth();

  // ── Form state ─────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    name: '', rollNo: '', email: '', phone: '',
    branch: '', year: '', password: '', confirmPassword: '',
  });
  const [errors,       setErrors]       = useState({});
  const [availability, setAvailability] = useState({ email: null, rollNo: null });
  const [otpStep,      setOtpStep]      = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [otpError,     setOtpError]     = useState(null);
  const [otpAttempts,  setOtpAttempts]  = useState(null);
  const [globalError,  setGlobalError]  = useState(null);
  const [showPass,     setShowPass]     = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  // ── Inline availability check ───────────────────────────────────────────────
  const checkField = useCallback(async (field) => {
    if (!form[field]) return;
    try {
      const res = await authService.checkAvailability({ [field]: form[field] });
      setAvailability((prev) => ({ ...prev, [field]: res[field] }));
      if (res[field]) {
        setErrors((prev) => ({ ...prev, [field]: `This ${field === 'rollNo' ? 'roll number' : 'email'} is already registered.` }));
      } else {
        setErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
      }
    } catch { /* ignore network errors on blur */ }
  }, [form]);

  // ── Client-side validation ──────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.name.trim())      e.name  = 'Name is required';
    if (!form.rollNo.trim())    e.rollNo = 'Roll number is required';
    if (!form.email.trim())     e.email  = 'Email is required';
    if (!/^[6-9]\d{9}$/.test(form.phone)) e.phone = 'Enter a valid 10-digit mobile number';
    if (!form.branch)           e.branch = 'Select your branch';
    if (!form.year)             e.year   = 'Select your year';
    if (form.password.length < 8)         e.password = 'Password must be at least 8 characters';
    if (!/[0-9]/.test(form.password))     e.password = 'Password must contain at least one number';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (availability.email)    e.email  = 'This email is already registered.';
    if (availability.rollNo)   e.rollNo = 'This roll number is already registered.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Step 1: Send OTP ────────────────────────────────────────────────────────
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setGlobalError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      await authService.register({
        name:   form.name.trim(),
        rollNo: form.rollNo.trim(),
        email:  form.email.trim().toLowerCase(),
        phone:  form.phone.trim(),
        branch: form.branch,
        year:   Number(form.year),
        password: form.password,
      });
      setOtpStep(true);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send OTP. Please try again.';
      const code = err.response?.data?.error;
      if (code === 'EMAIL_TAKEN')  setErrors((p) => ({ ...p, email:  msg }));
      else if (code === 'ROLLNO_TAKEN') setErrors((p) => ({ ...p, rollNo: msg }));
      else setGlobalError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP ─────────────────────────────────────────────────────
  const handleVerifyOtp = async (code) => {
    setOtpError(null);
    setLoading(true);
    try {
      await verifyOtp(form.email.trim().toLowerCase(), code);
      navigate('/dashboard');
    } catch (err) {
      const data = err.response?.data;
      setOtpError(data?.message || 'Incorrect OTP. Please try again.');
      setOtpAttempts(data?.attemptsRemaining ?? null);
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Resend OTP ─────────────────────────────────────────────────────
  const handleResend = async () => {
    try {
      await authService.register({
        name: form.name.trim(), rollNo: form.rollNo.trim(),
        email: form.email.trim().toLowerCase(), phone: form.phone.trim(),
        branch: form.branch, year: Number(form.year), password: form.password,
      });
      setOtpError(null);
      setOtpAttempts(null);
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Could not resend OTP.');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">

        {/* Card */}
        <div className="glass-card p-8">
          {!otpStep ? (
            <>
              {/* Header */}
              <div className="mb-8 text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl
                  bg-[var(--color-accent-subtle)] border border-[var(--color-accent-border)] mb-4">
                  <svg className="w-7 h-7 text-[var(--color-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Create Account</h1>
                <p className="text-sm text-[var(--color-text-muted)] mt-1">Register with your GPREC Gmail</p>
              </div>

              {globalError && (
                <div className="mb-4 px-4 py-3 rounded-xl bg-[var(--color-error-bg)] border border-[var(--color-error)]/20 text-sm text-[var(--color-error)]">
                  {globalError}
                </div>
              )}

              <form onSubmit={handleSendOtp} noValidate className="flex flex-col gap-4">
                <Field id="reg-name" label="Full Name" error={errors.name}>
                  <Input id="reg-name" placeholder="e.g. Ravi Kumar" value={form.name} onChange={set('name')} disabled={loading} />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field id="reg-rollno" label="Roll Number" error={errors.rollNo}>
                    <Input id="reg-rollno" placeholder="e.g. 22B91A6601"
                      value={form.rollNo} onChange={set('rollNo')}
                      onBlur={() => checkField('rollNo')} disabled={loading} />
                  </Field>
                  <Field id="reg-year" label="Year" error={errors.year}>
                    <select id="reg-year" value={form.year} onChange={set('year')} disabled={loading}
                      className="w-full px-4 py-2.5 rounded-xl border text-sm
                        bg-[var(--color-surface)] text-[var(--color-text-primary)]
                        border-[var(--color-border)] focus:outline-none focus:border-[var(--color-accent)]
                        focus:shadow-[0_0_0_3px_var(--color-accent-subtle)]
                        disabled:opacity-50 transition-all">
                      <option value="">Select</option>
                      {[1,2,3,4].map((y) => <option key={y} value={y}>Year {y}</option>)}
                    </select>
                  </Field>
                </div>

                <Field id="reg-email" label="College Gmail (@gprec.ac.in)" error={errors.email}>
                  <Input id="reg-email" type="email" placeholder="yourname@gprec.ac.in"
                    value={form.email} onChange={set('email')}
                    onBlur={() => checkField('email')} disabled={loading} />
                </Field>

                <Field id="reg-phone" label="Phone Number" error={errors.phone}>
                  <Input id="reg-phone" type="tel" placeholder="9876543210"
                    value={form.phone} onChange={set('phone')} disabled={loading} />
                </Field>

                <Field id="reg-branch" label="Branch" error={errors.branch}>
                  <select id="reg-branch" value={form.branch} onChange={set('branch')} disabled={loading}
                    className="w-full px-4 py-2.5 rounded-xl border text-sm
                      bg-[var(--color-surface)] text-[var(--color-text-primary)]
                      border-[var(--color-border)] focus:outline-none focus:border-[var(--color-accent)]
                      focus:shadow-[0_0_0_3px_var(--color-accent-subtle)]
                      disabled:opacity-50 transition-all">
                    <option value="">Select branch</option>
                    {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </Field>

                <Field id="reg-password" label="Password" error={errors.password}>
                  <div className="relative">
                    <Input id="reg-password" type={showPass ? 'text' : 'password'}
                      placeholder="Min 8 chars, include a number"
                      value={form.password} onChange={set('password')} disabled={loading} />
                    <button type="button" onClick={() => setShowPass((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]">
                      {showPass ? '🙈' : '👁'}
                    </button>
                  </div>
                </Field>

                <Field id="reg-confirm" label="Confirm Password" error={errors.confirmPassword}>
                  <Input id="reg-confirm" type="password" placeholder="Retype password"
                    value={form.confirmPassword} onChange={set('confirmPassword')} disabled={loading} />
                </Field>

                <button id="reg-submit-btn" type="submit" disabled={loading}
                  className="btn-primary w-full mt-2 flex items-center justify-center gap-2">
                  {loading ? (
                    <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg> Sending OTP...</>
                  ) : 'Send OTP to Gmail'}
                </button>
              </form>
            </>
          ) : (
            /* OTP step */
            <>
              <div className="mb-8 text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl
                  bg-[var(--color-accent-subtle)] border border-[var(--color-accent-border)] mb-4">
                  <svg className="w-7 h-7 text-[var(--color-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Verify Email</h1>
                <p className="text-sm text-[var(--color-text-muted)] mt-1">
                  Enter the 6-digit code sent to <span className="text-[var(--color-accent)] font-medium">{form.email}</span>
                </p>
              </div>
              <div className="flex flex-col items-center gap-6">
                <OtpInput
                  onComplete={handleVerifyOtp}
                  onResend={handleResend}
                  isLoading={loading}
                  error={otpError}
                  attemptsRemaining={otpAttempts}
                />
                <button type="button" onClick={() => setOtpStep(false)}
                  className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors">
                  ← Change email / details
                </button>
              </div>
            </>
          )}

          {/* Footer link */}
          {!otpStep && (
            <p className="text-center text-sm text-[var(--color-text-muted)] mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-[var(--color-accent)] font-medium hover:underline">Login</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
