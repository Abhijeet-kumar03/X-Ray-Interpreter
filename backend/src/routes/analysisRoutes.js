'use strict';

const express = require('express');
const router  = express.Router();
const analysisController = require('../controllers/analysisController');
const { protect }        = require('../middleware/authMiddleware');
const { audit }          = require('../middleware/audit');
const { validate, schemas } = require('../middleware/validate');

// All analysis routes are protected
router.use(protect);

// ── GET /api/analysis/stats ─────────────────────── (must be before /:id)
router.get('/stats',         analysisController.getStats);

// ── GET /api/analysis/pipeline-info
router.get('/pipeline-info', analysisController.getPipelineInfo);

// ── POST /api/analysis ──────────────────────────────────────────────────
router.post('/',
  analysisController.upload.single('image'),
  validate(schemas.createAnalysis),
  audit('CREATED', 'Analysis'),
  analysisController.createAnalysis
);

// ── GET /api/analysis ───────────────────────────────────────────────────
router.get('/', analysisController.listAnalyses);

// ── GET /api/analysis/:id ───────────────────────────────────────────────
router.get('/:id', analysisController.getAnalysis);

// ── DELETE /api/analysis/:id ────────────────────────────────────────────
router.delete('/:id',
  audit('DELETED', 'Analysis'),
  analysisController.deleteAnalysis
);

module.exports = router;

