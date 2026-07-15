'use strict';

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const crypto   = require('crypto');
const { ALL_ROLES } = require('../constants/roles');
const env = require('../config/environment');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please tell us your name'],
      trim: true,
      maxlength: [60, 'Name can be at most 60 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ALL_ROLES,
      default: 'patient',
    },
    avatar: {
      type: String,
      default: '',
    },
    specialty: {
      type: String,
      default: '',
      maxlength: 80,
    },
    institution: {
      type: String,
      default: '',
      maxlength: 120,
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // ── Email verification ────────────────────────────────────────────────
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },

    // ── Password reset ────────────────────────────────────────────────────
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },

    // ── Activity tracking ─────────────────────────────────────────────────
    lastLoginAt: {
      type: Date,
    },

    // ── User preferences ──────────────────────────────────────────────────
    preferences: {
      theme: {
        type: String,
        enum: ['light', 'dark', 'system'],
        default: 'system',
      },
      defaultModality: {
        type: String,
        default: 'chest_xray',
      },
      notificationsEnabled: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Indexes ────────────────────────────────────────────────────────────────
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// ── Pre-save: hash password ────────────────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt    = await bcrypt.genSalt(env.auth.bcryptSaltRounds);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Instance method: compare password ─────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ── Instance method: create password reset token ──────────────────────────
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = new Date(
    Date.now() + env.auth.passwordResetExpiresMin * 60 * 1000
  );

  return resetToken;
};

// ── Instance method: create email verification token ──────────────────────
userSchema.methods.createEmailVerificationToken = function () {
  const verifyToken = crypto.randomBytes(32).toString('hex');

  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verifyToken)
    .digest('hex');

  return verifyToken;
};

// ── Virtual: computed initials ─────────────────────────────────────────────
userSchema.virtual('initials').get(function () {
  if (!this.name) return '?';
  return this.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
});

const User = mongoose.model('User', userSchema);
module.exports = User;
