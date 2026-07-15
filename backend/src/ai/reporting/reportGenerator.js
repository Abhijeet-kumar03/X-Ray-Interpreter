'use strict';

const logger = require('../../utils/logger');

/**
 * Radiology Report Generator
 *
 * Assembles a professional radiology report from reasoning output.
 * Uses systematic anatomical ordering consistent with ACR reporting standards:
 *   Lungs & Airways → Pleural Spaces → Cardiac → Mediastinum → Bones → Diaphragm
 *
 * Reports are composed dynamically — not selected from templates.
 * Each report is unique because it's assembled from the actual findings.
 *
 * @param {import('../types').ReasoningOutput} reasoningOutput
 * @param {import('../types').PreprocessedImage} preprocessedImage
 * @returns {Promise<import('../types').ReportOutput>}
 */
async function generateReport(reasoningOutput, preprocessedImage) {
  const { findings, impression, recommendations, urgencyLevel, criticalFinding } = reasoningOutput;
  const { metadata, qualityAssessment } = preprocessedImage;

  // ── Build technique section ──────────────────────────────────────────
  const technique = buildTechnique(metadata, qualityAssessment);

  // ── Build structured findings by anatomical region ───────────────────
  const findingsText = buildFindingsText(findings, qualityAssessment);

  // ── Build impression section ─────────────────────────────────────────
  const impressionText = buildImpressionText(impression, criticalFinding, urgencyLevel);

  // ── Build recommendations section ────────────────────────────────────
  const recommendationsText = buildRecommendationsText(recommendations);

  logger.debug('Report generated', {
    sections: { technique: !!technique, findings: !!findingsText, impression: !!impressionText },
  });

  return {
    findings: findingsText,
    impression: impressionText,
    recommendations: recommendationsText,
    technique,
  };
}

/**
 * Build the technique description based on image metadata.
 */
function buildTechnique(metadata, quality) {
  const parts = [];

  const projection = metadata.projection || 'PA (Posteroanterior)';
  const modality = metadata.modality || 'chest_xray';

  if (modality === 'chest_xray') {
    parts.push(`Single ${projection} view of the chest obtained in the upright position.`);
  } else {
    parts.push(`${projection} view obtained.`);
  }

  if (quality) {
    const qualityStr = quality.rating === 'diagnostic'
      ? 'Technical quality is diagnostic.'
      : quality.rating === 'suboptimal'
        ? 'Technical quality is suboptimal but interpretable.'
        : 'Technical quality is non-diagnostic. Repeat imaging may be warranted.';
    parts.push(qualityStr);
  }

  return parts.join(' ');
}

/**
 * Build findings text organized by anatomical region.
 * Follows ACR systematic reporting order.
 */
function buildFindingsText(findings, quality) {
  // Group findings by anatomical region
  const regionOrder = [
    'Lungs', 'Left Lower Lobe', 'Right Lower Lobe', 'Left Upper Lobe', 'Right Upper Lobe',
    'Right Middle Lobe', 'Bilateral Lungs', 'Bilateral Lower Lobes',
    'Pleural Space', 'Right Hemithorax', 'Left Hemithorax',
    'Cardiac Silhouette',
    'Mediastinum', 'Pulmonary Vasculature',
    'Bony Structures', 'Diaphragm',
  ];

  const regionMap = new Map();
  for (const f of findings) {
    const region = f.region || 'Other';
    if (!regionMap.has(region)) regionMap.set(region, []);
    regionMap.get(region).push(f);
  }

  const sections = [];

  // Process regions in standard order
  for (const region of regionOrder) {
    if (regionMap.has(region)) {
      const regionFindings = regionMap.get(region);
      regionMap.delete(region);
      const text = formatRegionFindings(region, regionFindings);
      if (text) sections.push(text);
    }
  }

  // Process any remaining regions not in the standard order
  for (const [region, regionFindings] of regionMap) {
    const text = formatRegionFindings(region, regionFindings);
    if (text) sections.push(text);
  }

  // Add summary for regions not mentioned
  if (!regionMap.has('Bony Structures') && !findings.some(f => f.region?.includes('Bon') || f.region?.includes('Rib'))) {
    sections.push('BONY THORAX: Visualized osseous structures are intact without acute fracture.');
  }

  return sections.join('\n\n');
}

/**
 * Format findings for a single anatomical region.
 */
function formatRegionFindings(region, findings) {
  const header = region.toUpperCase().replace(/ /g, ' ');
  const descriptions = findings.map(f => f.description).filter(Boolean);

  if (descriptions.length === 0) return null;

  return `${header}: ${descriptions.join(' ')}`;
}

/**
 * Build the impression text with numbered points.
 */
function buildImpressionText(impression, criticalFinding, urgencyLevel) {
  const lines = [];

  if (criticalFinding) {
    lines.push('*** CRITICAL FINDING — Urgent clinical correlation required. ***');
    lines.push('');
  }

  // Split impression into logical sentences and number them
  const sentences = impression
    .split(/\.\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  sentences.forEach((sentence, i) => {
    const cleanSentence = sentence.endsWith('.') ? sentence : `${sentence}.`;
    lines.push(`${i + 1}. ${cleanSentence}`);
  });

  return lines.join('\n');
}

/**
 * Build recommendations text with numbered items.
 */
function buildRecommendationsText(recommendations) {
  if (!recommendations || recommendations.length === 0) {
    return '1. Clinical correlation with patient history and physical examination.';
  }

  return recommendations
    .map((rec, i) => `${i + 1}. ${rec}`)
    .join('\n');
}

module.exports = { generateReport };
