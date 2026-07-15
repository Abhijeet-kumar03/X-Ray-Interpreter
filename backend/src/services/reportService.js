'use strict';

const reportRepository = require('../repositories/reportRepository');
const analysisRepository = require('../repositories/analysisRepository');
const AppError = require('../utils/AppError');

/**
 * Report Service — business logic for report operations.
 */
const reportService = {
  async getReport(id) {
    const report = await reportRepository.findById(id, true);
    if (!report) throw AppError.notFound('Report not found.');

    // Increment view count asynchronously (fire-and-forget)
    reportRepository.incrementViewCount(id).catch(() => {});

    return report;
  },

  async listReports(userId, queryParams = {}) {
    const {
      page = 1,
      limit = 10,
      search,
      criticalOnly,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = queryParams;

    return reportRepository.list({
      userId,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      search,
      criticalOnly: criticalOnly === 'true',
      sortBy,
      sortOrder,
    });
  },

  async deleteReport(id) {
    const report = await reportRepository.findById(id);
    if (!report) throw AppError.notFound('Report not found.');

    await reportRepository.deleteById(id);

    // Clear reference in analysis
    if (report.analysisId) {
      await analysisRepository.updateById(report.analysisId, { $unset: { reportId: 1 } });
    }

    return { message: 'Report deleted successfully.' };
  },

  async trackDownload(id) {
    await reportRepository.incrementDownloadCount(id);
    return { success: true };
  },
};

module.exports = reportService;
