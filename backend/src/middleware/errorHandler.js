'use strict';

const logger = require('../utils/logger');

/**
 * Global Express error-handling middleware.
 *
 * Must have exactly four parameters so Express recognises it as an error handler.
 * Mount this AFTER all routes and other middleware.
 *
 * Error priority (first match wins):
 *   1. Mongoose ValidationError  → 400
 *   2. Mongoose CastError        → 400
 *   3. MongoDB duplicate key     → 409
 *   4. Multer file type error    → 415
 *   5. Multer file size error    → 413
 *   6. AppError (operational)    → err.statusCode
 *   7. Everything else           → 500
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || err.status || 500;

  logger.error(`[${req.method}] ${req.path}`, {
    statusCode,
    message: err.message,
    ...(err.isOperational ? {} : { stack: err.stack }),
  });

  // ── Mongoose: schema validation failure ────────────────────────────────────
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error:   'Validation Error',
      details: Object.values(err.errors).map((e) => e.message),
    });
  }

  // ── Mongoose: invalid ObjectId format ─────────────────────────────────────
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error:   `Invalid ID format: "${err.value}"`,
    });
  }

  // ── MongoDB: duplicate unique key ──────────────────────────────────────────
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({
      success: false,
      error:   `A record with that ${field} already exists.`,
    });
  }

  // ── Multer: unsupported file type ──────────────────────────────────────────
  if (err.message?.includes('Only medical image formats')) {
    return res.status(415).json({
      success: false,
      error:   err.message,
    });
  }

  // ── Multer: file too large ─────────────────────────────────────────────────
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      error:   'File too large. Maximum allowed size is 10 MB.',
    });
  }

  // ── AppError (thrown intentionally by services) ────────────────────────────
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      error:   err.message,
    });
  }

  // ── Unhandled / unexpected errors ──────────────────────────────────────────
  res.status(statusCode).json({
    success: false,
    error:   statusCode === 500 ? 'Internal Server Error' : err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

/**
 * 404 handler — mounted after all routes.
 * Returns a clear JSON response instead of the default Express HTML page.
 */
function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error:   `Route not found: ${req.method} ${req.path}`,
  });
}

module.exports = { errorHandler, notFoundHandler };
