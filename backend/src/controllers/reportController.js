'use strict';

const reportService = require('../services/reportService');
const asyncHandler  = require('../utils/asyncHandler');

// ── GET /api/reports/:id ───────────────────────────────────────────────────
const getReport = asyncHandler(async (req, res) => {
  const report = await reportService.getReport(req.params.id);
  res.json({ success: true, data: report });
});

// ── GET /api/reports ───────────────────────────────────────────────────────
const listReports = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const result = await reportService.listReports(userId, req.query);

  res.json({
    success: true,
    data: result.reports,
    pagination: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    },
  });
});

// ── DELETE /api/reports/:id ────────────────────────────────────────────────
const deleteReport = asyncHandler(async (req, res) => {
  const result = await reportService.deleteReport(req.params.id);
  res.json({ success: true, ...result });
});

// ── POST /api/reports/:id/download ─────────────────────────────────────────
const incrementDownload = asyncHandler(async (req, res) => {
  const result = await reportService.trackDownload(req.params.id);
  res.json(result);
});

module.exports = { getReport, listReports, deleteReport, incrementDownload };
