'use strict';

const path = require('path');
const analysisRepository = require('../repositories/analysisRepository');
const reportRepository   = require('../repositories/reportRepository');
const { runPipeline, getPipelineInfo } = require('../ai/pipeline');
const env      = require('../config/environment');
const AppError = require('../utils/AppError');
const logger   = require('../utils/logger');

/**
 * Analysis Service
 *
 * Orchestrates the full analysis workflow:
 *   Upload → AI Pipeline → Save Analysis → Save Report → Link them together
 *
 * Controllers stay thin and delegate all business logic here.
 */
const analysisService = {
  /**
   * Create a new analysis from an uploaded image.
   *
   * @param {string|ObjectId} userId
   * @param {Express.Multer.File} file
   * @param {{ modality?, model?, patientId? }} options
   * @returns {Promise<{ analysis: Object, report: Object }>}
   */
  async createAnalysis(userId, file, options = {}) {
    if (!file) {
      throw AppError.badRequest('No image file uploaded.');
    }

    const { modality, model: modelName, patientId } = options;
    const resolvedModality = modality  || env.ai.defaultModality;
    const resolvedModel    = modelName || env.ai.defaultModel;

    // Absolute path where multer saved the file
    const filePath = path.resolve(__dirname, '../../uploads', file.filename);

    // ── Stage 1-5: Run the full AI pipeline ─────────────────────────────────
    const pipelineResult = await runPipeline(filePath, file, {
      modality:  resolvedModality,
      modelName: resolvedModel,
    });

    const { vision, reasoning, report, patientExplanation, preprocessing } = pipelineResult;

    // ── Save analysis to database ─────────────────────────────────────────────
    const analysis = await analysisRepository.create({
      userId,
      patientId:          patientId || undefined,
      imageUrl:           file.filename,
      imageName:          file.originalname,
      imageSize:          file.size,
      modality:           resolvedModality,
      status:             'completed',
      model:              vision.modelName,
      modelVersion:       vision.modelVersion,
      pipelineVersion:    env.ai.pipelineVersion,
      primaryDiagnosis:   reasoning.primaryDiagnosis,
      overallConfidence:  reasoning.overallConfidence,
      findings:           reasoning.findings,
      impression:         reasoning.impression,
      recommendations:    reasoning.recommendations,
      differentialDiagnoses: reasoning.differentialDiagnoses,
      patientExplanation: patientExplanation?.explanation ?? '',
      urgencyLevel:       reasoning.urgencyLevel,
      technicalQuality:   preprocessing.qualityAssessment.rating,
      projectionType:     preprocessing.metadata.projection,
      processingTime:     pipelineResult.totalProcessingTime,
      metadata: {
        engineVersion:       env.ai.pipelineVersion,
        visionInferenceTime: vision.inferenceTime,
        rawScores:           vision.rawScores,
      },
    });

    // ── Save report to database ───────────────────────────────────────────────
    const savedReport = await reportRepository.create({
      analysisId:            analysis._id,
      userId,
      findings:              report.findings,
      impression:            report.impression,
      recommendations:       report.recommendations,
      technique:             report.technique,
      differentialDiagnoses: reasoning.differentialDiagnoses,
      patientExplanation:    patientExplanation?.explanation ?? '',
      urgencyLevel:          reasoning.urgencyLevel,
      criticalFindings:      reasoning.criticalFinding,
      criticalFindingsNote:  reasoning.criticalFinding
        ? 'CRITICAL FINDING — Urgent clinical correlation required.'
        : undefined,
      tags: [reasoning.primaryDiagnosis, vision.modelName].filter(Boolean),
    });

    // ── Link report → analysis ────────────────────────────────────────────────
    await analysisRepository.updateById(analysis._id, { reportId: savedReport._id });
    analysis.reportId = savedReport._id;

    logger.info('Analysis created', {
      analysisId: analysis._id,
      diagnosis:  reasoning.primaryDiagnosis,
      urgency:    reasoning.urgencyLevel,
      model:      vision.modelName,
    });

    return { analysis, report: savedReport };
  },

  /**
   * Get a single analysis by ID scoped to the requesting user.
   *
   * @param {string} id
   * @param {string|ObjectId} userId
   */
  async getAnalysis(id, userId) {
    const analysis = await analysisRepository.findByIdAndUser(id, userId);
    if (!analysis) throw AppError.notFound('Analysis not found.');
    return analysis;
  },

  /**
   * Get a single analysis by ID without user scoping (admin only).
   *
   * @param {string} id
   */
  async getAnalysisById(id) {
    const analysis = await analysisRepository.findById(id, true);
    if (!analysis) throw AppError.notFound('Analysis not found.');
    return analysis;
  },

  /**
   * List analyses for a user with pagination, search, and filters.
   *
   * @param {string|ObjectId} userId
   * @param {Object} queryParams
   */
  async listAnalyses(userId, queryParams = {}) {
    const {
      page       = 1,
      limit      = 10,
      search,
      status,
      diagnosis,
      modality,
      urgencyLevel,
      sortBy     = 'createdAt',
      sortOrder  = 'desc',
    } = queryParams;

    return analysisRepository.list({
      userId,
      page:        parseInt(page,  10),
      limit:       parseInt(limit, 10),
      search,
      status,
      diagnosis,
      modality,
      urgencyLevel,
      sortBy,
      sortOrder,
    });
  },

  /**
   * Soft-delete an analysis and its associated report.
   *
   * @param {string} id
   * @param {string|ObjectId} userId
   */
  async deleteAnalysis(id, userId) {
    const analysis = await analysisRepository.softDelete(id, userId);
    if (!analysis) throw AppError.notFound('Analysis not found.');

    if (analysis.reportId) {
      await reportRepository.deleteById(analysis.reportId);
    }

    logger.info('Analysis deleted', { analysisId: id, userId });
    return { message: 'Analysis and associated report deleted successfully.' };
  },

  /**
   * Get dashboard statistics for a user.
   *
   * @param {string|ObjectId} userId
   */
  async getStats(userId) {
    return analysisRepository.getStats(userId);
  },

  /**
   * Get information about available AI models and modalities.
   */
  getPipelineInfo() {
    return getPipelineInfo();
  },
};

module.exports = analysisService;
