'use strict';

const AuditLog = require('../models/AuditLog');
const logger   = require('../utils/logger');

/**
 * Audit logging middleware.
 *
 * Logs significant API actions (state-changing requests) for compliance and debugging.
 * Read-only GET requests are intentionally not logged to reduce noise.
 * The log is written asynchronously (fire-and-forget) so it never blocks the response.
 *
 * Usage:
 *   router.post('/action', protect, audit('CREATED', 'Analysis'), handler)
 *
 * @param {string} action   — Verb describing the action (e.g. 'CREATED', 'LOGIN', 'DELETED')
 * @param {string} resource — Resource type affected (e.g. 'Analysis', 'Report', 'User')
 */
function audit(action, resource) {
  return (req, res, next) => {
    const originalEnd = res.end;

    res.end = function (...args) {
      // Only write audit entries for successful responses (< 400)
      if (res.statusCode < 400) {
        AuditLog.create({
          userId:     req.user?._id || null,
          action,
          resource,
          resourceId: req.params?.id || '',
          details: {
            method:     req.method,
            path:       req.originalUrl,
            statusCode: res.statusCode,
          },
          ip:        req.ip || req.socket?.remoteAddress || '',
          userAgent: req.get('User-Agent') || '',
        }).catch((err) => {
          logger.error('Failed to write audit log', { error: err.message });
        });
      }

      return originalEnd.apply(this, args);
    };

    next();
  };
}

module.exports = { audit };
