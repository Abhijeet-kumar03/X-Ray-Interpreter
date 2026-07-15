'use strict';

const logger = require('../../utils/logger');

/**
 * Patient Explanation Generator
 *
 * Converts medical findings and reports into simple, patient-friendly language.
 * Avoids medical jargon and uses analogies where appropriate.
 * Provides clear next steps the patient can understand.
 *
 * @param {import('../types').ReasoningOutput} reasoningOutput
 * @returns {Promise<import('../types').PatientExplanation>}
 */
async function generateExplanation(reasoningOutput) {
  const { primaryDiagnosis, findings, recommendations, urgencyLevel, criticalFinding } = reasoningOutput;

  // ── Build patient-friendly summary ───────────────────────────────────
  const summary = buildSummary(primaryDiagnosis, urgencyLevel);

  // ── Build detailed explanation ───────────────────────────────────────
  const explanation = buildExplanation(primaryDiagnosis, findings, urgencyLevel, criticalFinding);

  // ── Build patient-friendly next steps ────────────────────────────────
  const nextSteps = buildNextSteps(recommendations, urgencyLevel);

  logger.debug('Patient explanation generated', {
    diagnosis: primaryDiagnosis,
    urgency: urgencyLevel,
  });

  return { summary, explanation, nextSteps };
}

/**
 * One-line summary for the patient.
 */
function buildSummary(primaryDiagnosis, urgencyLevel) {
  if (primaryDiagnosis === 'Normal' || primaryDiagnosis === 'No Finding') {
    return 'Your chest X-ray looks normal — no concerning findings were detected.';
  }

  const urgencyPrefix = {
    critical: 'Important: ',
    urgent: 'Please note: ',
    'semi-urgent': '',
    'non-urgent': '',
    routine: '',
  };

  const prefix = urgencyPrefix[urgencyLevel] || '';
  return `${prefix}Your X-ray shows signs of ${simplifyDiagnosis(primaryDiagnosis)}. Please review the details below and discuss with your doctor.`;
}

/**
 * Build a multi-paragraph explanation in plain English.
 */
function buildExplanation(primaryDiagnosis, findings, urgencyLevel, criticalFinding) {
  const parts = [];

  // Opening
  if (primaryDiagnosis === 'Normal' || primaryDiagnosis === 'No Finding') {
    parts.push(
      'The AI analysis of your chest X-ray did not find any signs of disease or abnormality. ' +
      'Your heart appears to be a normal size, your lungs look clear, and there are no signs ' +
      'of fluid buildup or other problems.'
    );
    parts.push(
      'This is a good result, but remember that an X-ray is just one tool your doctor uses. ' +
      'If you are still experiencing symptoms, your doctor may recommend additional tests.'
    );
    return parts.join('\n\n');
  }

  // Abnormal findings explanation
  if (criticalFinding) {
    parts.push(
      '⚠️ The AI analysis found something that may need urgent attention. ' +
      'Please contact your doctor or healthcare provider as soon as possible.'
    );
  }

  parts.push(`The AI analysis found signs of ${simplifyDiagnosis(primaryDiagnosis)} in your X-ray.`);

  // Explain each significant finding in simple terms
  const significantFindings = findings.filter(
    f => f.abnormality !== 'No Finding' && f.confidence > 40
  );

  if (significantFindings.length > 0) {
    parts.push('Here is what was found:');

    for (const finding of significantFindings.slice(0, 4)) {
      const simpleExplanation = getSimpleExplanation(finding.abnormality, finding.severity);
      if (simpleExplanation) {
        parts.push(`• ${simpleExplanation}`);
      }
    }
  }

  // Confidence note
  parts.push(
    '\nPlease keep in mind that this analysis was performed by an AI system and should be ' +
    'reviewed by a qualified radiologist or physician. AI results are meant to assist — ' +
    'not replace — your doctor\'s professional judgment.'
  );

  return parts.join('\n\n');
}

/**
 * Build patient-friendly next steps.
 */
function buildNextSteps(recommendations, urgencyLevel) {
  const steps = [];

  if (urgencyLevel === 'critical' || urgencyLevel === 'urgent') {
    steps.push('Contact your doctor or visit the emergency room as soon as possible.');
  } else if (urgencyLevel === 'semi-urgent') {
    steps.push('Schedule an appointment with your doctor to discuss these findings.');
  } else {
    steps.push('Share this report with your doctor at your next visit.');
  }

  // Convert medical recommendations to patient-friendly language
  if (recommendations && recommendations.length > 0) {
    const simpleRecs = recommendations
      .slice(0, 4)
      .map(rec => simplifyRecommendation(rec))
      .filter(Boolean);

    steps.push(...simpleRecs);
  }

  steps.push('Keep a copy of this report for your medical records.');

  return steps;
}

/**
 * Simplify a diagnosis name for patients.
 */
function simplifyDiagnosis(diagnosis) {
  const simpleNames = {
    'Atelectasis': 'a partially collapsed area in the lung',
    'Cardiomegaly': 'an enlarged heart',
    'Consolidation': 'an area of infection or fluid in the lung',
    'Edema': 'fluid buildup in the lungs',
    'Effusion': 'fluid buildup around the lung',
    'Emphysema': 'lung damage (emphysema)',
    'Fibrosis': 'scarring in the lungs',
    'Hernia': 'a hernia near the diaphragm',
    'Infiltration': 'an abnormal area in the lung that needs further evaluation',
    'Mass': 'a growth in the lung that needs urgent evaluation',
    'Nodule': 'a small spot in the lung that needs monitoring',
    'Pleural Thickening': 'thickening of the tissue around the lung',
    'Pneumonia': 'a lung infection (pneumonia)',
    'Pneumothorax': 'air leaking around the lung (collapsed lung)',
    'Normal': 'nothing abnormal',
    'No Finding': 'nothing abnormal',
  };

  return simpleNames[diagnosis] || diagnosis.toLowerCase();
}

/**
 * Get a simple explanation for a finding.
 */
function getSimpleExplanation(abnormality, severity) {
  const explanations = {
    'Atelectasis': 'A small area of the lung is not fully expanded. This is common and often improves with deep breathing exercises.',
    'Cardiomegaly': 'The heart appears larger than usual. This could mean the heart is working harder than normal and should be evaluated.',
    'Consolidation': 'An area in the lung appears denser than normal, which could mean there is an infection or inflammation.',
    'Edema': 'There appears to be extra fluid in the lungs. This is often related to heart function and may need treatment.',
    'Effusion': 'There is fluid around the lung. Your doctor may want to find out what is causing it.',
    'Emphysema': 'The lungs show signs of damage, which can make breathing harder over time.',
    'Fibrosis': 'There is scarring in the lungs. Your doctor will want to understand what caused it and monitor it.',
    'Mass': 'There is a growth in the lung that needs to be examined more closely with additional tests.',
    'Nodule': 'There is a small spot in the lung. Most nodules are harmless, but your doctor will want to monitor it.',
    'Pneumonia': 'There are signs of a lung infection. Your doctor can prescribe treatment to help you recover.',
    'Pneumothorax': 'Air has leaked into the space around the lung, which may need immediate treatment.',
  };

  let explanation = explanations[abnormality] || `${abnormality} was detected and should be discussed with your doctor.`;

  if (severity === 'severe') {
    explanation += ' This appears to be significant and should be addressed promptly.';
  }

  return explanation;
}

/**
 * Simplify a medical recommendation for patients.
 */
function simplifyRecommendation(recommendation) {
  // Remove common medical prefixes
  let simple = recommendation
    .replace(/^URGENT:\s*/i, '')
    .replace(/^Per .+ guidelines:\s*/i, '');

  // Replace common medical terms
  const replacements = [
    [/thoracentesis/gi, 'a procedure to remove fluid'],
    [/echocardiogram/gi, 'a heart ultrasound'],
    [/spirometry/gi, 'a breathing test'],
    [/bronchoscopy/gi, 'a lung examination procedure'],
    [/BNP\/NT-proBNP/gi, 'a blood test for heart function'],
    [/SpO2/gi, 'blood oxygen level'],
    [/CT chest/gi, 'a detailed chest scan (CT)'],
    [/HRCT/gi, 'a detailed scan'],
    [/PET-CT/gi, 'a specialized scan'],
    [/MRI/gi, 'an MRI scan'],
    [/pulmonology/gi, 'lung specialist'],
    [/cardiology/gi, 'heart specialist'],
  ];

  for (const [pattern, replacement] of replacements) {
    simple = simple.replace(pattern, replacement);
  }

  // Don't return recommendations that are too technical even after simplification
  if (simple.length > 150) {
    return 'Your doctor may recommend additional tests based on these findings.';
  }

  return simple;
}

module.exports = { generateExplanation };
