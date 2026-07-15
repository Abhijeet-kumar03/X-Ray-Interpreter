'use strict';

const express = require('express');
const router  = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { audit } = require('../middleware/audit');

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// User management
router.get('/users', adminController.listUsers);
router.put('/users/:id/status', audit('ADMIN_UPDATE_USER_STATUS', 'User'), adminController.updateUserStatus);
router.put('/users/:id/role', audit('ADMIN_UPDATE_USER_ROLE', 'User'), adminController.updateUserRole);

// System-wide data inspection
router.get('/analyses', adminController.listAllAnalyses);
router.get('/audit-logs', adminController.listAuditLogs);

module.exports = router;
