'use strict';

/**
 * AI Pipeline — Shared Type Definitions (via JSDoc)
 *
 * These types define the contracts between pipeline stages.
 * Each stage receives the output of the previous stage and produces
 * a well-defined output structure.
 */

/**
 * @typedef {Object} ImageMetadata
 * @property {string} filename    - Original filename
 * @property {number} fileSize    - File size in bytes
 * @property {string} mimeType    - MIME type
 * @property {string} modality    - Imaging modality ID
 * @property {string} projection  - Projection type
 */

/**
 * @typedef {Object} PreprocessedImage
 * @property {ImageMetadata} metadata
 * @property {string} filePath           - Path to the preprocessed image
 * @property {Object} qualityAssessment
 * @property {string} qualityAssessment.rating   - 'diagnostic' | 'suboptimal' | 'non-diagnostic'
 * @property {number} qualityAssessment.score     - 0–100
 * @property {string[]} qualityAssessment.issues  - List of quality issues
 */

/**
 * @typedef {Object} DetectedFinding
 * @property {string} region       - Anatomical region
 * @property {string} abnormality  - Abnormality type
 * @property {string} description  - Detailed description
 * @property {string} severity     - 'normal' | 'mild' | 'moderate' | 'severe'
 * @property {number} confidence   - 0–100
 * @property {Object} [localization] - Bounding box { x, y, width, height }
 */

/**
 * @typedef {Object} VisionModelOutput
 * @property {string} modelName     - Model used
 * @property {string} modelVersion  - Model version
 * @property {DetectedFinding[]} findings
 * @property {Object} rawScores     - Raw model output scores
 * @property {number} inferenceTime - Milliseconds
 */

/**
 * @typedef {Object} ReasoningOutput
 * @property {string} primaryDiagnosis
 * @property {number} overallConfidence
 * @property {DetectedFinding[]} findings
 * @property {string} impression
 * @property {string[]} recommendations
 * @property {string[]} differentialDiagnoses
 * @property {string} urgencyLevel
 * @property {boolean} criticalFinding
 */

/**
 * @typedef {Object} ReportOutput
 * @property {string} findings      - Formatted findings text
 * @property {string} impression    - Formatted impression text
 * @property {string} recommendations - Formatted recommendations text
 * @property {string} technique     - Technique description
 */

/**
 * @typedef {Object} PatientExplanation
 * @property {string} explanation   - Patient-friendly text
 * @property {string} summary       - One-line summary
 * @property {string[]} nextSteps   - Actionable next steps
 */

/**
 * @typedef {Object} PipelineResult
 * @property {VisionModelOutput} vision
 * @property {ReasoningOutput} reasoning
 * @property {ReportOutput} report
 * @property {PatientExplanation} patientExplanation
 * @property {PreprocessedImage} preprocessing
 * @property {number} totalProcessingTime
 */

module.exports = {};
