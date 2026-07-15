'use strict';

const AppError = require('../utils/AppError');

/**
 * Express validation middleware.
 *
 * Validates request `body`, `query`, and `params` against a simple rule schema.
 *
 * Usage:
 *   const { validate, schemas } = require('../middleware/validate');
 *   router.post('/login', validate(schemas.login), controller.login);
 *
 * Rule properties:
 *   - required {boolean}   — field must be present and non-empty
 *   - type {string}        — 'string' | 'number' | 'boolean' | 'email'
 *   - minLength {number}   — minimum string length
 *   - enum {string[]}      — value must be one of these
 */
function validate(schema) {
  return (req, res, next) => {
    const errors = [];

    if (schema.body)   errors.push(...checkFields(req.body,   schema.body,   'body'));
    if (schema.query)  errors.push(...checkFields(req.query,  schema.query,  'query'));
    if (schema.params) errors.push(...checkFields(req.params, schema.params, 'params'));

    if (errors.length > 0) {
      return next(AppError.badRequest(`Validation failed: ${errors.join(', ')}`));
    }

    next();
  };
}

/**
 * Check a data object against a rules map.
 * Returns an array of error strings (empty array if all pass).
 *
 * @param {Object} data
 * @param {Object} rules
 * @param {string} source — 'body' | 'query' | 'params' (for error messages)
 * @returns {string[]}
 */
function checkFields(data = {}, rules, source) {
  const errors = [];

  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field];
    const isMissing = value === undefined || value === null || value === '';

    if (rule.required && isMissing) {
      errors.push(`[${source}] '${field}' is required`);
      continue; // Skip further checks for this field
    }

    // Only run type/length checks when a value is present
    if (!isMissing) {
      if (rule.type === 'string' && typeof value !== 'string') {
        errors.push(`[${source}] '${field}' must be a string`);
      } else if (rule.type === 'number' && isNaN(Number(value))) {
        errors.push(`[${source}] '${field}' must be a number`);
      } else if (rule.type === 'boolean' && typeof value !== 'boolean' && value !== 'true' && value !== 'false') {
        errors.push(`[${source}] '${field}' must be a boolean`);
      } else if (rule.type === 'email' && !/^\S+@\S+\.\S+$/.test(value)) {
        errors.push(`[${source}] '${field}' must be a valid email address`);
      }

      if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
        errors.push(`[${source}] '${field}' must be at least ${rule.minLength} characters`);
      }

      if (rule.enum && !rule.enum.includes(value)) {
        errors.push(`[${source}] '${field}' must be one of: ${rule.enum.join(', ')}`);
      }
    }
  }

  return errors;
}

// ── Request schemas ────────────────────────────────────────────────────────────

const schemas = {
  register: {
    body: {
      name:     { type: 'string', required: true, minLength: 2 },
      email:    { type: 'email',  required: true },
      password: { type: 'string', required: true, minLength: 6 },
    },
  },

  login: {
    body: {
      email:    { type: 'email',  required: true },
      password: { type: 'string', required: true },
    },
  },

  refreshToken: {
    body: {
      refreshToken: { type: 'string', required: true },
    },
  },

  forgotPassword: {
    body: {
      email: { type: 'email', required: true },
    },
  },

  resetPassword: {
    body: {
      token:    { type: 'string', required: true },
      password: { type: 'string', required: true, minLength: 6 },
    },
  },

  createAnalysis: {
    body: {
      modality:  { type: 'string' },
      model:     { type: 'string' },
      patientId: { type: 'string' },
    },
  },
};

module.exports = { validate, schemas };
