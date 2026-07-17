'use strict';

const { preprocessImage } = require('./preprocessing/preprocessor');
const adapterRegistry      = require('./adapters/adapterRegistry');
const { reason }           = require('./reasoning/reasoningEngine');
const { generateReport }   = require('./reporting/reportGenerator');
const { generateExplanation } = require('./reporting/patientExplainer');
const env    = require('../config/environment');
const logger = require('../utils/logger');
const AppError = require('../utils/AppError');

/**
 * AI Analysis Pipeline
 *
 * Orchestrates the full analysis flow:
 *
 *   Medical Image
 *        ↓
 *   Preprocessing (validate, quality check)
 *        ↓
 *   Vision Model (adapter pattern — any model)
 *        ↓
 *   Detected Findings
 *        ↓
 *   Reasoning Engine (clinical interpretation)
 *        ↓
 *   Report Generator (professional radiology report)
 *        ↓
 *   Patient Explainer (simple English explanation)
 *
 * Each stage is independently replaceable. The pipeline's job is purely orchestration.
 *
 * @param {string} filePath     - Path to the uploaded image file
 * @param {Object} fileInfo     - { filename, originalname, size, mimetype }
 * @param {Object} options      - { modelName?, modality? }
 * @returns {Promise<import('./types').PipelineResult>}
 */
async function runPipeline(filePath, fileInfo, options = {}) {
  const startTime = Date.now();
  const modalityId = options.modality || env.ai.defaultModality;
  const modelName  = options.modelName || env.ai.defaultModel;

  logger.info('AI Pipeline started', { modality: modalityId, model: modelName });

  // ── Stage 1: Preprocessing ───────────────────────────────────────────
  const preprocessed = await preprocessImage(filePath, fileInfo, modalityId);

  // ── Stage 2: Vision Model ────────────────────────────────────────────
  let adapter = adapterRegistry.getAdapter(modelName);

  // If the named adapter exists but doesn't support this modality,
  // fall back to the modality-specific adapter automatically.
  if (adapter && !adapter.supportsModality(modalityId)) {
    logger.debug(`Model "${adapter.modelName}" does not support modality "${modalityId}". Auto-selecting modality-specific adapter.`);
    adapter = adapterRegistry.getAdapterForModality(modalityId);
  } else if (!adapter) {
    // Named adapter not found — try to find any adapter that supports this modality
    adapter = adapterRegistry.getAdapterForModality(modalityId);
  }

  if (!adapter) {
    throw AppError.badRequest(
      `No AI model available for modality "${modalityId}". ` +
      `Available models: ${adapterRegistry.listModels().join(', ')}`
    );
  }

  if (!adapter.supportsModality(modalityId)) {
    throw AppError.badRequest(
      `Model "${adapter.modelName}" does not support modality "${modalityId}". ` +
      `Supported modalities: ${adapter.supportedModalities.join(', ')}`
    );
  }


  const isModelReady = await adapter.isAvailable();
  if (!isModelReady) {
    throw new AppError(`Model "${adapter.modelName}" is currently unavailable.`, 503);
  }

  const visionOutput = await adapter.predict(preprocessed);

  // ── Stage 3: Clinical Reasoning ──────────────────────────────────────
  const reasoningOutput = await reason(visionOutput, { modality: modalityId });

  // ── Stage 4: Report Generation ───────────────────────────────────────
  const report = await generateReport(reasoningOutput, preprocessed);

  // ── Stage 5: Patient Explanation ─────────────────────────────────────
  const patientExplanation = await generateExplanation(reasoningOutput);

  const totalProcessingTime = Date.now() - startTime;

  logger.info('AI Pipeline completed', {
    diagnosis: reasoningOutput.primaryDiagnosis,
    confidence: reasoningOutput.overallConfidence,
    urgency: reasoningOutput.urgencyLevel,
    model: adapter.modelName,
    totalTimeMs: totalProcessingTime,
  });

  return {
    vision: visionOutput,
    reasoning: reasoningOutput,
    report,
    patientExplanation,
    preprocessing: preprocessed,
    totalProcessingTime,
  };
}

/**
 * Get information about available models and modalities.
 */
function getPipelineInfo() {
  return {
    version: env.ai.pipelineVersion,
    availableModels: adapterRegistry.listModels(),
    defaultModel: env.ai.defaultModel,
    defaultModality: env.ai.defaultModality,
  };
}

module.exports = { runPipeline, getPipelineInfo };
