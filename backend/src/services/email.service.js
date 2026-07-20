'use strict';

const { getTransporter } = require('../config/mailer');

// ── OTP email template ────────────────────────────────────────────────────────
function buildOtpHtml(otpCode, purpose) {
  const purposeLabels = {
    'register':                'account registration',
    'login-reset':             'password reset',
    'profile-password-change': 'password change',
  };
  const label = purposeLabels[purpose] || 'verification';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>TMP OTP Verification</title>
  <style>
    body { margin:0; padding:0; font-family: 'Segoe UI', Arial, sans-serif; background:#0f172a; color:#f1f5f9; }
    .container { max-width:480px; margin:40px auto; background:#1e293b; border-radius:16px; overflow:hidden; border:1px solid #334155; }
    .header { background: linear-gradient(135deg, #5a6ef8, #818cf8); padding:32px 24px; text-align:center; }
    .header h1 { margin:0; font-size:24px; font-weight:700; color:#fff; letter-spacing:-0.5px; }
    .header p { margin:4px 0 0; color:rgba(255,255,255,0.75); font-size:14px; }
    .body { padding:32px 24px; }
    .otp-box { background:#0f172a; border:1px solid #334155; border-radius:12px; padding:24px; text-align:center; margin:24px 0; }
    .otp-code { font-size:42px; font-weight:800; letter-spacing:8px; color:#818cf8; font-family:monospace; }
    .otp-expires { font-size:13px; color:#64748b; margin-top:8px; }
    .note { font-size:13px; color:#64748b; line-height:1.6; border-top:1px solid #334155; padding-top:20px; margin-top:24px; }
    .footer { padding:16px 24px; text-align:center; font-size:12px; color:#475569; border-top:1px solid #334155; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>TMP Platform</h1>
      <p>GPREC — CSM Department</p>
    </div>
    <div class="body">
      <p>Your one-time verification code for <strong>${label}</strong> is:</p>
      <div class="otp-box">
        <div class="otp-code">${otpCode}</div>
        <div class="otp-expires">Expires in 10 minutes</div>
      </div>
      <div class="note">
        If you did not request this code, please ignore this email. Do not share this code with anyone.
        TMP staff will never ask for your OTP.
      </div>
    </div>
    <div class="footer">© ${new Date().getFullYear()} TMP Platform · GPREC CSM Department</div>
  </div>
</body>
</html>`;
}

// ── Exports ───────────────────────────────────────────────────────────────────

/**
 * Send an OTP verification email.
 * Falls back to console.log if no SMTP transporter is configured (dev mode).
 */
async function sendOtpEmail(toEmail, otpCode, purpose) {
  const transporter = getTransporter();

  if (!transporter) {
    // Dev fallback — log to console so the developer can see the code
    console.log(`\n[OTP DEV] ─────────────────────────────`);
    console.log(`[OTP DEV] To:      ${toEmail}`);
    console.log(`[OTP DEV] Purpose: ${purpose}`);
    console.log(`[OTP DEV] Code:    ${otpCode}`);
    console.log(`[OTP DEV] ─────────────────────────────\n`);
    return;
  }

  await transporter.sendMail({
    from:    process.env.SMTP_FROM || `"TMP Platform" <${process.env.SMTP_USER}>`,
    to:      toEmail,
    subject: `Your TMP verification code: ${otpCode}`,
    html:    buildOtpHtml(otpCode, purpose),
  });
}

/**
 * Generic reusable email sender for other phases (announcements, events, etc.)
 */
async function sendGenericEmail(to, subject, html) {
  const transporter = getTransporter();
  if (!transporter) {
    console.log(`[Email DEV] To: ${to} | Subject: ${subject}`);
    return;
  }
  await transporter.sendMail({
    from:    process.env.SMTP_FROM || `"TMP Platform" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
}

module.exports = { sendOtpEmail, sendGenericEmail };
