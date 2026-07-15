'use strict';

const jwt    = require('jsonwebtoken');
const crypto = require('crypto');
const userRepository = require('../repositories/userRepository');
const RefreshToken   = require('../models/RefreshToken');
const env      = require('../config/environment');
const AppError = require('../utils/AppError');
const logger   = require('../utils/logger');

/**
 * Auth Service — all authentication business logic.
 * Controllers stay thin and delegate here.
 */
const authService = {
  /**
   * Register a new user.
   */
  async register({ name, email, password }) {
    if (!name?.trim() || !email?.trim() || !password) {
      throw AppError.badRequest('Name, email and password are required.');
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await userRepository.findByEmail(normalizedEmail);
    if (existing) {
      throw AppError.conflict('An account with that email already exists.');
    }

    const User = require('../models/User');
    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      password,
    });

    const verificationToken = user.createEmailVerificationToken();
    await user.save();

    const accessToken  = this.signAccessToken(user._id);
    const refreshToken = await this.createRefreshToken(user._id);

    logger.info('User registered', { userId: user._id, email: normalizedEmail });

    return {
      accessToken,
      refreshToken,
      user: this.sanitizeUser(user),
      ...(env.isDevelopment && { verificationToken }),
    };
  },

  /**
   * Authenticate with email + password.
   */
  async login({ email, password }, ip = '') {
    if (!email?.trim() || !password) {
      throw AppError.badRequest('Email and password are required.');
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await userRepository.findByEmail(normalizedEmail, true);

    if (!user) {
      throw AppError.unauthorized('Invalid email or password.');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw AppError.unauthorized('Invalid email or password.');
    }

    if (!user.isActive) {
      throw AppError.forbidden('This account has been deactivated.');
    }

    // Update last login
    await userRepository.updateById(user._id, { lastLoginAt: new Date() });

    const accessToken  = this.signAccessToken(user._id);
    const refreshToken = await this.createRefreshToken(user._id, ip);

    logger.info('User logged in', { userId: user._id });

    return {
      accessToken,
      refreshToken,
      user: this.sanitizeUser(user),
    };
  },

  /**
   * Refresh the access token using a refresh token.
   */
  async refreshAccessToken(refreshTokenStr, ip = '') {
    const stored = await RefreshToken.findOne({
      token: refreshTokenStr,
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    });

    if (!stored) {
      throw AppError.unauthorized('Invalid or expired refresh token.');
    }

    const user = await userRepository.findById(stored.userId);
    if (!user || !user.isActive) {
      throw AppError.unauthorized('User not found or deactivated.');
    }

    // Rotate: revoke old token, issue new pair
    stored.isRevoked = true;
    await stored.save();

    const newAccessToken  = this.signAccessToken(user._id);
    const newRefreshToken = await this.createRefreshToken(user._id, ip);

    // Link old token to new for audit trail
    stored.replacedByToken = newRefreshToken;
    await stored.save();

    logger.info('Token refreshed', { userId: user._id });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: this.sanitizeUser(user),
    };
  },

  /**
   * Revoke all refresh tokens for a user (logout from all devices).
   */
  async revokeAllTokens(userId) {
    await RefreshToken.updateMany({ userId, isRevoked: false }, { isRevoked: true });
    logger.info('All refresh tokens revoked', { userId });
  },

  /**
   * Initiate forgot password flow.
   */
  async forgotPassword(email) {
    if (!email?.trim()) {
      throw AppError.badRequest('Email is required.');
    }

    const user = await userRepository.findByEmail(email);
    if (!user) {
      // Don't reveal if email exists — always return success
      return { message: 'If an account with that email exists, a password reset link has been sent.' };
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // In production: send email with reset link containing resetToken
    // await emailService.sendPasswordReset(user.email, resetToken);

    logger.info('Password reset requested', { userId: user._id });

    return {
      message: 'If an account with that email exists, a password reset link has been sent.',
      // DEVELOPMENT ONLY — remove in production
      ...(env.isDevelopment && { resetToken }),
    };
  },

  /**
   * Reset password using a reset token.
   */
  async resetPassword(token, newPassword) {
    if (!token || !newPassword) {
      throw AppError.badRequest('Token and new password are required.');
    }

    if (newPassword.length < 6) {
      throw AppError.badRequest('Password must be at least 6 characters.');
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await userRepository.findByResetToken(hashedToken);

    if (!user) {
      throw AppError.badRequest('Invalid or expired password reset token.');
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Revoke all existing refresh tokens
    await this.revokeAllTokens(user._id);

    logger.info('Password reset completed', { userId: user._id });

    return { message: 'Password has been reset successfully. Please log in with your new password.' };
  },

  /**
   * Verify email using a verification token.
   */
  async verifyEmail(token) {
    if (!token) {
      throw AppError.badRequest('Verification token is required.');
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await userRepository.findByVerificationToken(hashedToken);

    if (!user) {
      throw AppError.badRequest('Invalid or expired email verification token.');
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();

    logger.info('Email verified', { userId: user._id });

    return { message: 'Email verified successfully.' };
  },

  /**
   * Update user profile (non-sensitive fields only).
   */
  async updateProfile(userId, updates) {
    const allowedFields = ['name', 'avatar', 'specialty', 'institution', 'preferences'];
    const sanitized = {};
    for (const field of allowedFields) {
      if (updates[field] !== undefined) sanitized[field] = updates[field];
    }

    const user = await userRepository.updateById(userId, sanitized);
    if (!user) throw AppError.notFound('User not found.');

    return { user: this.sanitizeUser(user) };
  },

  /**
   * Get current user profile.
   */
  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) throw AppError.notFound('User not found.');
    return { user: this.sanitizeUser(user) };
  },

  // ── Helpers ─────────────────────────────────────────────────────────────

  signAccessToken(userId) {
    return jwt.sign({ id: userId }, env.auth.jwtSecret, {
      expiresIn: env.auth.jwtExpiresIn,
    });
  },

  async createRefreshToken(userId, ip = '') {
    const token = RefreshToken.generateToken();
    const expiresAt = new Date(
      Date.now() + env.auth.refreshTokenExpiresInDays * 24 * 60 * 60 * 1000
    );

    await RefreshToken.create({ userId, token, expiresAt, createdByIp: ip });
    return token;
  },

  sanitizeUser(user) {
    return {
      _id:         user._id,
      name:        user.name,
      email:       user.email,
      role:        user.role,
      avatar:      user.avatar || '',
      specialty:   user.specialty || '',
      institution: user.institution || '',
      initials:    user.initials || '?',
      preferences: user.preferences || {},
      createdAt:   user.createdAt,
      lastLoginAt: user.lastLoginAt,
    };
  },
};

module.exports = authService;
