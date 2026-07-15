'use strict';

/**
 * Wraps an async route handler so thrown errors are forwarded to Express
 * error-handling middleware automatically.
 *
 * Usage:  router.get('/path', asyncHandler(myController))
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
