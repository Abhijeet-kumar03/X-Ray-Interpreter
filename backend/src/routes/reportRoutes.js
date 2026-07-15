'use strict';

const express = require('express');
const router  = express.Router();
const reportController = require('../controllers/reportController');
const { protect }      = require('../middleware/authMiddleware');

// All report routes are protected
router.use(protect);

// ── GET /api/reports ────────────────────────────────────────────────────
router.get('/',    reportController.listReports);

// ── GET /api/reports/:id ────────────────────────────────────────────────
router.get('/:id', reportController.getReport);

// ── DELETE /api/reports/:id ─────────────────────────────────────────────
router.delete('/:id', reportController.deleteReport);

// ── POST /api/reports/:id/download — track download count ───────────────
router.post('/:id/download', reportController.incrementDownload);

module.exports = router;
