'use strict';

const jwt  = require('jsonwebtoken');
const User = require('../models/User');
const env  = require('../config/environment');
const AppError = require('../utils/AppError');
const { hasMinimumRole } = require('../constants/roles');

/**
 * `protect` middleware — require a valid JWT on every protected route.
 *
 * Expects: `Authorization: Bearer <token>`
 * On success, attaches the authenticated user to `req.user`.
 */
const protect = async (req, res, next) => {
  try {
    // ── Extract token ──────────────────────────────────────────────────────
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : null;

    if (!token) {
      return next(AppError.unauthorized('Access denied. No token provided.'));
    }

    // ── Verify signature & expiry ──────────────────────────────────────────
    const decoded = jwt.verify(token, env.auth.jwtSecret);

    // ── Load user from database ────────────────────────────────────────────
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(AppError.unauthorized('The user associated with this token no longer exists.'));
    }

    if (!user.isActive) {
      return next(AppError.forbidden('This account has been deactivated.'));
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(AppError.unauthorized('Invalid token.'));
    }
    if (error.name === 'TokenExpiredError') {
      return next(AppError.unauthorized('Token expired. Please log in again.'));
    }
    next(error);
  }
};

/**
 * `optionalAuth` middleware — attach user to request if a valid token is present,
 * but allow the request through even without one.
 *
 * Useful for routes that show different data to authenticated vs. anonymous users.
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return next();

    const token   = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.auth.jwtSecret);
    const user    = await User.findById(decoded.id);

    if (user?.isActive) {
      req.user = user;
    }
  } catch {
    // Silently ignore invalid tokens for optional auth
  }
  next();
};

/**
 * `authorize` middleware factory — RBAC guard for role-based access.
 *
 * Usage:
 *   router.get('/admin', protect, authorize('admin'), handler)
 *   router.get('/rad',   protect, authorize('radiologist'), handler)
 *
 * Multiple roles may be passed; the user must satisfy at least one:
 *   router.delete('/report', protect, authorize('admin', 'radiologist'), handler)
 *
 * @param {...string} roles — Roles that are allowed to access the route
 */
const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    return next(AppError.unauthorized('Authentication required.'));
  }

  const isAllowed = roles.some((role) => hasMinimumRole(req.user.role, role));

  if (!isAllowed) {
    return next(AppError.forbidden(
      `Role "${req.user.role}" is not authorised to access this resource.`
    ));
  }

  next();
};

module.exports = { protect, optionalAuth, authorize };
