'use strict';

const { getModality } = require('../../constants/modalities');
const logger = require('../../utils/logger');

/**
 * Image Preprocessor
 *
 * Validates the uploaded image, extracts metadata, and assesses technical quality.
 * In a production system with real vision models, this stage would also:
 *   - Resize/normalize pixel values
 *   - Apply CLAHE or histogram equalization
 *   - Convert DICOM to standard image format
 *   - Strip PHI from DICOM headers
 *
 * This is the first stage of the AI pipeline.
 *
 * @param {string} filePath - Path to the uploaded file
 * @param {Object} fileInfo - { filename, originalname, size, mimetype }
 * @param {string} modalityId - Modality identifier (e.g., 'chest_xray')
 * @returns {Promise<import('../types').PreprocessedImage>}
 */
async function preprocessImage(filePath, fileInfo, modalityId = 'chest_xray') {
  const startTime = Date.now();

  const modality = getModality(modalityId);
  if (!modality) {
    throw new Error(`Unsupported modality: ${modalityId}`);
  }

  // Validate file
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (fileInfo.mimetype && !allowedMimeTypes.includes(fileInfo.mimetype)) {
    logger.warn('Non-standard MIME type for medical image', { mimetype: fileInfo.mimetype });
  }

  // Quality assessment heuristics
  // In production, a dedicated quality-check model (e.g., an orientation classifier
  // or exposure analyzer) would run here.
  const qualityAssessment = assessImageQuality(fileInfo);

  const metadata = {
    filename: fileInfo.originalname || fileInfo.filename,
    fileSize: fileInfo.size || 0,
    mimeType: fileInfo.mimetype || 'image/jpeg',
    modality: modalityId,
    projection: modality.defaultProjection,
  };

  logger.debug('Image preprocessed', {
    modality: modalityId,
    quality: qualityAssessment.rating,
    timeMs: Date.now() - startTime,
  });

  return {
    metadata,
    filePath,
    qualityAssessment,
  };
}

/**
 * Basic image quality assessment using file metadata.
 * A real implementation would analyze pixel data for exposure, noise, rotation, etc.
 */
function assessImageQuality(fileInfo) {
  const issues = [];
  const size = fileInfo.size || 0;

  // Very small files are likely corrupted or thumbnail-quality
  if (size < 50 * 1024) {
    issues.push('Image file size is very small — may be low resolution');
  }

  // Very large files may have artifacts or be uncompressed
  if (size > 8 * 1024 * 1024) {
    issues.push('Image file size is very large — consider compression');
  }

  let rating = 'diagnostic';
  let score = 90;

  if (issues.length > 0) {
    rating = 'suboptimal';
    score = 65;
  }

  return { rating, score, issues };
}

module.exports = { preprocessImage };
