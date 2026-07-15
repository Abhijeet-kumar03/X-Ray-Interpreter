'use strict';

const medicalKnowledge = require('./medicalKnowledge');
const logger = require('../../utils/logger');

/**
 * Clinical Reasoning Engine
 *
 * Takes structured findings from the vision model and produces:
 *   - Primary diagnosis with confidence
 *   - Clinical impression
 *   - Differential diagnoses
 *   - Urgency level
 *   - Evidence-based recommendations
 *
 * This engine composes interpretations dynamically from the medical knowledge base
 * rather than selecting from a fixed set of templates.
 *
 * @param {import('../types').VisionModelOutput} visionOutput
 * @returns {Promise<import('../types').ReasoningOutput>}
 */
async function reason(visionOutput) {
  const { findings, modelName } = visionOutput;

  if (!findings || findings.length === 0) {
    return buildNormalResult(modelName);
  }

  // ── Identify the primary finding (highest confidence abnormal finding) ──
  const abnormalFindings = findings.filter(
    f => f.abnormality !== 'No Finding' && f.confidence > 30
  );

  if (abnormalFindings.length === 0) {
    return buildNormalResult(modelName);
  }

  // Sort by confidence descending
  abnormalFindings.sort((a, b) => b.confidence - a.confidence);
  const primaryFinding = abnormalFindings[0];

  // ── Look up medical knowledge for the primary finding ────────────────
  const knowledge = medicalKnowledge.getKnowledge(primaryFinding.abnormality);

  // ── Determine primary diagnosis ──────────────────────────────────────
  const primaryDiagnosis = primaryFinding.abnormality;
  const overallConfidence = primaryFinding.confidence;

  // ── Build clinical impression ────────────────────────────────────────
  const impression = buildImpression(abnormalFindings, knowledge);

  // ── Collect recommendations from all positive findings ───────────────
  const recommendations = collectRecommendations(abnormalFindings);

  // ── Collect differential diagnoses ───────────────────────────────────
  const differentialDiagnoses = collectDifferentials(abnormalFindings);

  // ── Determine urgency level (highest urgency among findings) ─────────
  const urgencyLevel = determineUrgency(abnormalFindings);

  // ── Check for critical findings ──────────────────────────────────────
  const criticalFinding = urgencyLevel === 'critical' || urgencyLevel === 'urgent';

  // ── Enrich findings with severity descriptions ───────────────────────
  const enrichedFindings = findings.map(f => {
    const fKnowledge = medicalKnowledge.getKnowledge(f.abnormality);
    const severityDesc = fKnowledge
      ? medicalKnowledge.getSeverityDescription(f.abnormality, f.severity)
      : null;
    return {
      ...f,
      severityDescription: severityDesc || '',
      clinicalSignificance: fKnowledge?.clinicalSignificance || '',
    };
  });

  logger.debug('Clinical reasoning completed', {
    primaryDiagnosis,
    confidence: overallConfidence,
    urgency: urgencyLevel,
    findingsCount: abnormalFindings.length,
  });

  return {
    primaryDiagnosis,
    overallConfidence,
    findings: enrichedFindings,
    impression,
    recommendations,
    differentialDiagnoses,
    urgencyLevel,
    criticalFinding,
  };
}

/**
 * Build a normal/no-finding result.
 */
function buildNormalResult(modelName) {
  const knowledge = medicalKnowledge.getKnowledge('No Finding');
  return {
    primaryDiagnosis: 'Normal',
    overallConfidence: 92.0,
    findings: [{
      region: 'Lungs',
      abnormality: 'No Finding',
      description: 'No acute cardiopulmonary abnormality detected. Lungs are clear. Heart size is normal. No pleural effusion or pneumothorax.',
      severity: 'normal',
      confidence: 92.0,
      localization: null,
      severityDescription: '',
      clinicalSignificance: knowledge?.clinicalSignificance || '',
    }],
    impression: 'No acute cardiopulmonary abnormality. The lungs are clear bilaterally without focal consolidation, effusion, or pneumothorax. Cardiac silhouette is within normal limits. Mediastinal contours and osseous structures are unremarkable.',
    recommendations: knowledge?.recommendations || ['No immediate follow-up required.'],
    differentialDiagnoses: knowledge?.differentials || [],
    urgencyLevel: 'routine',
    criticalFinding: false,
  };
}

/**
 * Build a clinical impression from the top findings.
 * Composes a unique paragraph based on what was actually detected.
 */
function buildImpression(abnormalFindings, primaryKnowledge) {
  const parts = [];

  // Primary finding impression
  const primary = abnormalFindings[0];
  parts.push(
    `${primary.abnormality} identified in the ${primary.region.toLowerCase()} ` +
    `with ${primary.confidence.toFixed(1)}% confidence.`
  );

  if (primaryKnowledge?.clinicalSignificance) {
    parts.push(primaryKnowledge.clinicalSignificance);
  }

  // Secondary findings
  if (abnormalFindings.length > 1) {
    const secondaryDescriptions = abnormalFindings.slice(1, 4).map(f =>
      `${f.abnormality} (${f.region.toLowerCase()}, ${f.confidence.toFixed(1)}%)`
    );

    parts.push(
      `Additional findings include: ${secondaryDescriptions.join('; ')}.`
    );
  }

  // Severity context
  const severeFinding = abnormalFindings.find(f => f.severity === 'severe');
  if (severeFinding) {
    parts.push(
      `Of note, ${severeFinding.abnormality.toLowerCase()} demonstrates severe characteristics requiring urgent clinical attention.`
    );
  }

  parts.push('Clinical correlation is advised.');

  return parts.join(' ');
}

/**
 * Collect unique recommendations from all positive findings.
 */
function collectRecommendations(abnormalFindings) {
  const seen = new Set();
  const recommendations = [];

  for (const finding of abnormalFindings) {
    const knowledge = medicalKnowledge.getKnowledge(finding.abnormality);
    if (!knowledge?.recommendations) continue;

    for (const rec of knowledge.recommendations) {
      if (!seen.has(rec)) {
        seen.add(rec);
        recommendations.push(rec);
      }
    }
  }

  return recommendations.length > 0
    ? recommendations
    : ['Clinical correlation with patient history and physical examination.'];
}

/**
 * Collect unique differential diagnoses from all positive findings.
 */
function collectDifferentials(abnormalFindings) {
  const seen = new Set();
  const differentials = [];

  for (const finding of abnormalFindings) {
    const knowledge = medicalKnowledge.getKnowledge(finding.abnormality);
    if (!knowledge?.differentials) continue;

    for (const diff of knowledge.differentials) {
      if (!seen.has(diff)) {
        seen.add(diff);
        differentials.push(diff);
      }
    }
  }

  return differentials.slice(0, 8); // Limit to top 8
}

/**
 * Determine the highest urgency level among all findings.
 */
function determineUrgency(abnormalFindings) {
  const urgencyOrder = ['routine', 'non-urgent', 'semi-urgent', 'urgent', 'critical'];
  let maxUrgency = 'routine';

  for (const finding of abnormalFindings) {
    const knowledge = medicalKnowledge.getKnowledge(finding.abnormality);
    if (!knowledge) continue;

    const findingUrgency = knowledge.urgency || 'routine';
    if (urgencyOrder.indexOf(findingUrgency) > urgencyOrder.indexOf(maxUrgency)) {
      maxUrgency = findingUrgency;
    }
  }

  return maxUrgency;
}

module.exports = { reason };
