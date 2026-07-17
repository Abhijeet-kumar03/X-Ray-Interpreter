'use strict';

const express = require('express');
const router  = express.Router();
const authController              = require('../controllers/authController');
const { protect }                 = require('../middleware/authMiddleware');
const { audit }                   = require('../middleware/audit');
const { validate, schemas }       = require('../middleware/validate');

// ── Public routes ──────────────────────────────────────────────────────────────
router.post('/register',
  validate(schemas.register),
  audit('REGISTER', 'User'),
  authController.register,
);

router.post('/login',
  validate(schemas.login),
  audit('LOGIN', 'User'),
  authController.login,
);

router.post('/refresh',
  validate(schemas.refreshToken),   
  authController.refreshToken,
);

router.post('/forgot-password',
  validate(schemas.forgotPassword),
  authController.forgotPassword,
);

router.post('/reset-password',
  validate(schemas.resetPassword),
  authController.resetPassword,
);

router.get('/verify-email', authController.verifyEmail);

// ── Protected routes ───────────────────────────────────────────────────────────
router.get('/me',      protect, authController.getMe);
router.put('/profile', protect, audit('UPDATE_PROFILE', 'User'), authController.updateProfile);
router.post('/logout', protect, audit('LOGOUT', 'User'),         authController.logout);

module.exports = router;
