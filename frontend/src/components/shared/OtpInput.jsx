import { useRef, useState, useEffect } from 'react';

/**
 * OtpInput — 6-box OTP input with:
 *  - Auto-advance on digit entry
 *  - Backspace-to-previous-box behavior
 *  - Paste support (pastes all 6 digits at once)
 *  - Resend button with 60s countdown
 *  - onComplete(code) callback when all 6 digits filled
 *  - onResend() callback when resend is clicked
 */
export default function OtpInput({ onComplete, onResend, isLoading = false, error = null, attemptsRemaining = null }) {
  const [digits,   setDigits]   = useState(Array(6).fill(''));
  const [timer,    setTimer]    = useState(60);
  const [canResend,setCanResend]= useState(false);
  const refs = useRef([]);

  // ── Countdown timer ───────────────────────────────────────────────────────
  useEffect(() => {
    setTimer(60);
    setCanResend(false);
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // ── Reset timer when resend is clicked ────────────────────────────────────
  const handleResend = () => {
    if (!canResend) return;
    setDigits(Array(6).fill(''));
    setTimer(60);
    setCanResend(false);
    refs.current[0]?.focus();
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) { clearInterval(interval); setCanResend(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    onResend?.();
  };

  // ── Input handlers ────────────────────────────────────────────────────────
  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...digits];
    next[index] = value.slice(-1); // only keep last char
    setDigits(next);
    if (value && index < 5) refs.current[index + 1]?.focus();
    if (next.every((d) => d)) onComplete?.(next.join(''));
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        const next = [...digits]; next[index] = ''; setDigits(next);
      } else if (index > 0) {
        refs.current[index - 1]?.focus();
      }
    }
    if (e.key === 'ArrowLeft'  && index > 0) refs.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < 5) refs.current[index + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const next = Array(6).fill('');
    [...pasted].forEach((ch, i) => { next[i] = ch; });
    setDigits(next);
    const lastFilled = Math.min(pasted.length, 5);
    refs.current[lastFilled]?.focus();
    if (pasted.length === 6) onComplete?.(pasted);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* OTP boxes */}
      <div className="flex gap-3" onPaste={handlePaste}>
        {digits.map((digit, i) => (
          <input
            key={i}
            id={`otp-digit-${i}`}
            ref={(el) => { refs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            disabled={isLoading}
            className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 outline-none
              transition-all duration-150 font-mono
              bg-[var(--color-surface)] text-[var(--color-text-primary)]
              ${digit
                ? 'border-[var(--color-accent)] shadow-[0_0_0_3px_var(--color-accent-subtle)]'
                : 'border-[var(--color-border)] hover:border-[var(--color-accent-border)]'}
              focus:border-[var(--color-accent)] focus:shadow-[0_0_0_3px_var(--color-accent-subtle)]
              disabled:opacity-50 disabled:cursor-not-allowed`}
          />
        ))}
      </div>

      {/* Error + attempts remaining */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-[var(--color-error)]">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
          </svg>
          <span>
            {error}
            {attemptsRemaining !== null && attemptsRemaining > 0 && (
              <span className="ml-1 opacity-70">({attemptsRemaining} attempt{attemptsRemaining === 1 ? '' : 's'} left)</span>
            )}
          </span>
        </div>
      )}

      {/* Resend */}
      <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
        <span>Didn&apos;t receive it?</span>
        <button
          id="otp-resend-btn"
          onClick={handleResend}
          disabled={!canResend || isLoading}
          className={`font-semibold transition-colors duration-150 ${
            canResend && !isLoading
              ? 'text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] cursor-pointer'
              : 'text-[var(--color-text-muted)] cursor-not-allowed'
          }`}
        >
          {canResend ? 'Resend OTP' : `Resend in ${timer}s`}
        </button>
      </div>
    </div>
  );
}
