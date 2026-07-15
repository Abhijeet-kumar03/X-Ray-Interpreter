'use strict';

const env = require('../config/environment');

/**
 * Lightweight structured logger.
 * In production, outputs JSON for log aggregation.
 * In development, outputs human-readable formatted logs.
 */
const logger = {
  _format(level, message, meta = {}) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...meta,
    };

    if (env.isProduction) {
      return JSON.stringify(entry);
    }

    const prefix = {
      info:  '  ℹ',
      warn:  '  ⚠️',
      error: '  ✖',
      debug: '  🔍',
    }[level] || '  •';

    const metaStr = Object.keys(meta).length
      ? ` ${JSON.stringify(meta)}`
      : '';

    return `${prefix} [${level.toUpperCase()}] ${message}${metaStr}`;
  },

  info(message, meta) {
    console.log(this._format('info', message, meta));
  },

  warn(message, meta) {
    console.warn(this._format('warn', message, meta));
  },

  error(message, meta) {
    console.error(this._format('error', message, meta));
  },

  debug(message, meta) {
    if (!env.isProduction) {
      console.debug(this._format('debug', message, meta));
    }
  },
};

module.exports = logger;
