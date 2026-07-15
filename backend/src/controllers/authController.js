'use strict';

const authService  = require('../services/authService');
const asyncHandler = require('../utils/asyncHandler');

// ── POST /api/auth/register ────────────────────────────────────────────────────
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const result = await authService.register({ name, email, password });

  res.status(201).json({
    token:        result.accessToken,  // backward compat with existing frontend
    accessToken:  result.accessToken,
    refreshToken: result.refreshToken,
    user:         result.user,
  });
});

// ── POST /api/auth/login ───────────────────────────────────────────────────────
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const ip = req.ip || req.socket?.remoteAddress || '';
  const result = await authService.login({ email, password }, ip);

  res.json({
    token:        result.accessToken,
    accessToken:  result.accessToken,
    refreshToken: result.refreshToken,
    user:         result.user,
  });
});

// ── POST /api/auth/refresh ─────────────────────────────────────────────────────
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: tokenStr } = req.body;
  const ip = req.ip || req.socket?.remoteAddress || '';
  const result = await authService.refreshAccessToken(tokenStr, ip);

  res.json({
    token:        result.accessToken,
    accessToken:  result.accessToken,
    refreshToken: result.refreshToken,
    user:         result.user,
  });
});

// ── POST /api/auth/forgot-password ────────────────────────────────────────────
const forgotPassword = asyncHandler(async (req, res) => {
  const result = await authService.forgotPassword(req.body.email);
  res.json(result);
});

// ── POST /api/auth/reset-password ─────────────────────────────────────────────
const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  const result = await authService.resetPassword(token, password);
  res.json(result);
});

// ── GET /api/auth/verify-email ────────────────────────────────────────────────
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.query;
  const result = await authService.verifyEmail(token);
  res.json(result);
});

// ── POST /api/auth/logout ─────────────────────────────────────────────────────
const logout = asyncHandler(async (req, res) => {
  // req.user is guaranteed by the `protect` middleware, but use optional chaining for safety
  await authService.revokeAllTokens(req.user?._id);
  res.json({ success: true, message: 'Logged out successfully.' });
});

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
const getMe = asyncHandler(async (req, res) => {
  const result = await authService.getProfile(req.user._id);
  res.json({ success: true, ...result });
});

// ── PUT /api/auth/profile ─────────────────────────────────────────────────────
const updateProfile = asyncHandler(async (req, res) => {
  const result = await authService.updateProfile(req.user._id, req.body);
  res.json({ success: true, ...result });
});

module.exports = {
  register,
  login,
  refreshToken,
  forgotPassword,
  resetPassword,
  verifyEmail,
  logout,
  getMe,
  updateProfile,
};
