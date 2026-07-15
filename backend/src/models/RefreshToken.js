'use strict';

const mongoose = require('mongoose');
const crypto   = require('crypto');

const refreshTokenSchema = new mongoose.Schema(
  {
    userId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
      index:    true,
    },
    token: {
      type:     String,
      required: true,
      unique:   true,
    },
    expiresAt: {
      type:     Date,
      required: true,
      index:    { expires: 0 }, // TTL index — MongoDB auto-deletes expired documents
    },
    isRevoked: {
      type:    Boolean,
      default: false,
    },
    createdByIp: {
      type:    String,
      default: '',
    },
    replacedByToken: {
      type:    String,
      default: null,
    },
  },
  { timestamps: true }
);

/**
 * Generate a cryptographically secure refresh token string (80 hex chars).
 *
 * @returns {string}
 */
refreshTokenSchema.statics.generateToken = function () {
  return crypto.randomBytes(40).toString('hex');
};

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);
module.exports = RefreshToken;
