'use strict';

const analysisService = require('../services/analysisService');
const asyncHandler    = require('../utils/asyncHandler');
const { upload }      = require('../middleware/upload');

// ── POST /api/analysis ─────────────────────────────────────────────────────
const createAnalysis = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { patientId, model, modality } = req.body;

  const result = await analysisService.createAnalysis(userId, req.file, {
    patientId,
    model,
    modality,
  });

  res.status(201).json({
    success: true,
    data: result,
  });
});

// ── GET /api/analysis ──────────────────────────────────────────────────────
const listAnalyses = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const result = await analysisService.listAnalyses(userId, req.query);

  res.json({
    success: true,
    data: result.analyses,
    pagination: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    },
  });
});

// ── GET /api/analysis/stats ────────────────────────────────────────────────
const getStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const stats = await analysisService.getStats(userId);

  res.json({
    success: true,
    data: stats,
  });
});

// ── GET /api/analysis/pipeline-info ────────────────────────────────────────
const getPipelineInfo = asyncHandler(async (req, res) => {
  const info = analysisService.getPipelineInfo();
  res.json({ success: true, data: info });
});

// ── GET /api/analysis/:id ──────────────────────────────────────────────────
const getAnalysis = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const analysis = await analysisService.getAnalysis(req.params.id, userId);

  res.json({ success: true, data: analysis });
});

// ── DELETE /api/analysis/:id ───────────────────────────────────────────────
const deleteAnalysis = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const result = await analysisService.deleteAnalysis(req.params.id, userId);

  res.json({ success: true, ...result });
});

module.exports = {
  createAnalysis,
  listAnalyses,
  getAnalysis,
  deleteAnalysis,
  getStats,
  getPipelineInfo,
  upload,
};
