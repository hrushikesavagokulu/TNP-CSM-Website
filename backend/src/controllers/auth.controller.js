'use strict';

const bcrypt         = require('bcryptjs');
const User           = require('../models/User.model');
const AdminAllowList = require('../models/AdminAllowList.model');
const StudentNominal = require('../models/StudentNominal.model');
const otpService     = require('../services/otp.service');
const { generateAccessToken, generateRefreshToken, generateResetToken,
        verifyRefreshToken, verifyResetToken,
        ACCESS_COOKIE_OPTS, REFRESH_COOKIE_OPTS } = require('../utils/generateTokens');
const { sendResponse }  = require('../utils/apiResponse');
const asyncHandler       = require('../utils/asyncHandler');
const { getRedisClient } = require('../config/redis');

const BCRYPT_COST = 12;

// ── Helper: issue both JWT cookies ───────────────────────────────────────────
function issueTokenCookies(res, userId, role) {
  const accessToken  = generateAccessToken(userId, role);
  const refreshToken = generateRefreshToken(userId);
  res.cookie('accessToken',  accessToken,  ACCESS_COOKIE_OPTS);
  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTS);
}

// ── Helper: sanitize user for API response ────────────────────────────────────
function sanitizeUser(user) {
  const obj = user.toObject();
  delete obj.passwordHash;
  return obj;
}

// ── POST /auth/check-availability ────────────────────────────────────────────
const checkAvailability = asyncHandler(async (req, res) => {
  const { rollNo, email } = req.body;
  const taken = {};

  if (rollNo) {
    const exists = await User.exists({ rollNo: rollNo.toUpperCase() });
    taken.rollNo = !!exists;
  }
  if (email) {
    const exists = await User.exists({ email: email.toLowerCase() });
    taken.email = !!exists;
  }

  return sendResponse(res, 200, {
    success: true,
    data: taken,
    message: 'Availability checked',
  });
});

// ── POST /auth/register ───────────────────────────────────────────────────────
const register = asyncHandler(async (req, res) => {
  const { name, rollNo, email, phone, branch, year, password } = req.body;

  // Server-side uniqueness check (never trust check-availability alone)
  const [emailTaken, rollNoTaken] = await Promise.all([
    User.exists({ email: email.toLowerCase() }),
    User.exists({ rollNo: rollNo.toUpperCase() }),
  ]);

  if (emailTaken) {
    return sendResponse(res, 409, {
      success: false,
      message: 'An account with this email already exists.',
      error:   'EMAIL_TAKEN',
    });
  }
  if (rollNoTaken) {
    return sendResponse(res, 409, {
      success: false,
      message: 'An account with this roll number already exists.',
      error:   'ROLLNO_TAKEN',
    });
  }

  // ── Roster & Allowlist Registration Guard ─────────────────────────────────
  const isAllowedAdmin = await AdminAllowList.exists({ email: email.toLowerCase() });
  
  if (!isAllowedAdmin) {
    // If not a pre-approved admin, they MUST be present in the StudentNominal roster matching BOTH fields
    const nominalRecord = await StudentNominal.findOne({
      email: email.toLowerCase(),
      rollNo: rollNo.toUpperCase(),
    });

    if (!nominalRecord) {
      return sendResponse(res, 403, {
        success: false,
        message: 'Your email and roll number are not pre-approved on the student roster. Contact admin.',
        error:   'ROSTER_NOT_APPROVED',
      });
    }
  }

  // Stash registration payload in Redis (TTL 15 min)
  const redis = getRedisClient();
  const stashKey = `reg-stash:${email}`;
  await redis.set(stashKey, JSON.stringify({ name, rollNo, email, phone, branch, year, password }), 'EX', 900);

  // Generate and send OTP
  await otpService.generateAndSendOtp(email, 'register');

  return sendResponse(res, 200, {
    success: true,
    message: 'OTP sent to your email. It expires in 10 minutes.',
  });
});

// ── POST /auth/verify-otp ─────────────────────────────────────────────────────
const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  // Verify OTP (throws on failure with attemptsRemaining on err object)
  await otpService.verifyOtp(email, 'register', otp);

  // Retrieve stashed registration payload
  const redis    = getRedisClient();
  const stashKey = `reg-stash:${email}`;
  const stashed  = await redis.get(stashKey);

  if (!stashed) {
    return sendResponse(res, 400, {
      success: false,
      message: 'Registration session expired. Please start again.',
      error:   'STASH_EXPIRED',
    });
  }

  const payload = JSON.parse(stashed);

  // Hash password with cost 12
  const passwordHash = await bcrypt.hash(payload.password, BCRYPT_COST);

  // Determine user role (Check AdminAllowList)
  const isAdmin = await AdminAllowList.exists({ email: payload.email.toLowerCase() });
  const role = isAdmin ? 'admin' : 'student';

  // Create user
  const user = await User.create({
    name:         payload.name,
    rollNo:       payload.rollNo.toUpperCase(),
    email:        payload.email,
    phone:        payload.phone,
    branch:       payload.branch,
    year:         payload.year,
    role,
    passwordHash,
  });

  // Delete stash
  await redis.del(stashKey);

  // Issue tokens
  issueTokenCookies(res, user._id, user.role);

  return sendResponse(res, 201, {
    success: true,
    data:    sanitizeUser(user),
    message: 'Registration successful! Welcome to TMP.',
  });
});

// ── POST /auth/login ──────────────────────────────────────────────────────────
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Must select +passwordHash explicitly
  let user = await User.findOne({ email }).select('+passwordHash');

  const GENERIC_ERROR = 'Invalid email or password.';

  if (!user) {
    return sendResponse(res, 401, {
      success: false,
      message: GENERIC_ERROR,
      error:   'INVALID_CREDENTIALS',
    });
  }

  if (!user.isActive) {
    return sendResponse(res, 401, {
      success: false,
      message: 'Your account has been deactivated. Contact admin.',
      error:   'ACCOUNT_INACTIVE',
    });
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) {
    return sendResponse(res, 401, {
      success: false,
      message: GENERIC_ERROR,
      error:   'INVALID_CREDENTIALS',
    });
  }

  // ── Auto-Elevation: Check if email is in AdminAllowList ───────────────────
  const isAllowedAdmin = await AdminAllowList.exists({ email: user.email.toLowerCase() });
  if (isAllowedAdmin && user.role !== 'admin') {
    user.role = 'admin';
    await user.save();
    console.log(`[Auth] User ${user.email} elevated to admin dynamically on login`);
  }

  issueTokenCookies(res, user._id, user.role);

  return sendResponse(res, 200, {
    success: true,
    data:    sanitizeUser(user),
    message: 'Login successful.',
  });
});

// ── POST /auth/forgot-password ────────────────────────────────────────────────
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // ALWAYS respond the same message — prevent user enumeration
  const GENERIC_MSG = 'If an account with that email exists, an OTP has been sent.';

  const user = await User.findOne({ email });
  if (user) {
    try {
      await otpService.generateAndSendOtp(email, 'login-reset');
    } catch (err) {
      // Swallow rate-limit errors silently (still respond generically)
      if (err.statusCode !== 429) throw err;
    }
  }

  return sendResponse(res, 200, {
    success: true,
    message: GENERIC_MSG,
  });
});

// ── POST /auth/verify-reset-otp ───────────────────────────────────────────────
const verifyResetOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  await otpService.verifyOtp(email, 'login-reset', otp);

  // Issue a short-lived reset token (returned in body — not a cookie)
  const resetToken = generateResetToken(email);

  return sendResponse(res, 200, {
    success: true,
    data:    { resetToken },
    message: 'OTP verified. Use the resetToken to set a new password.',
  });
});

// ── POST /auth/reset-password ─────────────────────────────────────────────────
const resetPassword = asyncHandler(async (req, res) => {
  const { resetToken, newPassword } = req.body;

  let payload;
  try {
    payload = verifyResetToken(resetToken);
  } catch {
    return sendResponse(res, 400, {
      success: false,
      message: 'Reset token is invalid or has expired. Please start over.',
      error:   'INVALID_RESET_TOKEN',
    });
  }

  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_COST);
  await User.updateOne({ email: payload.email }, { passwordHash });

  return sendResponse(res, 200, {
    success: true,
    message: 'Password reset successful. You can now log in with your new password.',
  });
});

// ── POST /auth/logout ─────────────────────────────────────────────────────────
const logout = asyncHandler(async (req, res) => {
  res.clearCookie('accessToken',  { httpOnly: true, sameSite: 'strict' });
  res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'strict' });

  return sendResponse(res, 200, {
    success: true,
    message: 'Logged out successfully.',
  });
});

// ── POST /auth/refresh-token ──────────────────────────────────────────────────
const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;

  if (!token) {
    return sendResponse(res, 401, {
      success: false,
      message: 'No refresh token provided.',
      error:   'NO_REFRESH_TOKEN',
    });
  }

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    return sendResponse(res, 401, {
      success: false,
      message: 'Refresh token is invalid or expired. Please log in again.',
      error:   'INVALID_REFRESH_TOKEN',
    });
  }

  const user = await User.findById(payload.sub);
  if (!user || !user.isActive) {
    return sendResponse(res, 401, {
      success: false,
      message: 'User not found or inactive.',
      error:   'USER_NOT_FOUND',
    });
  }

  // Rotate both tokens
  issueTokenCookies(res, user._id, user.role);

  return sendResponse(res, 200, {
    success: true,
    message: 'Tokens refreshed.',
  });
});

// ── GET /auth/me ──────────────────────────────────────────────────────────────
// Used by frontend AuthContext to rehydrate on page refresh
const getMe = asyncHandler(async (req, res) => {
  return sendResponse(res, 200, {
    success: true,
    data:    sanitizeUser(req.user),
    message: 'Authenticated user retrieved.',
  });
});

module.exports = {
  checkAvailability,
  register,
  verifyOtp,
  login,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  logout,
  refreshToken,
  getMe,
};
