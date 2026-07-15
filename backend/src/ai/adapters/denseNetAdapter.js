'use strict';

const ModelAdapter = require('./modelAdapter');
const logger = require('../../utils/logger');

/**
 * DenseNet121 Adapter
 *
 * Implements the ModelAdapter interface for DenseNet121.
 *
 * In production, this adapter would:
 *   - Load the DenseNet121 model weights (via ONNX Runtime, TensorFlow.js, or a Python gRPC service)
 *   - Preprocess the image to 224x224 normalized tensor
 *   - Run forward pass and extract class activation maps
 *   - Return structured findings with confidence scores
 *
 * Currently provides the structured pipeline architecture with medically-accurate
 * output formatting, ready for real model weight integration.
 *
 * Integration paths:
 *   1. ONNX Runtime (Node.js native) — best for edge deployment
 *   2. Python gRPC microservice — best for GPU inference
 *   3. TorchXRayVision via REST — easiest for prototyping
 */
class DenseNetAdapter extends ModelAdapter {
  get modelName() {
    return 'DenseNet121';
  }

  get modelVersion() {
    return '1.0.0';
  }

  get supportedModalities() {
    return ['chest_xray'];
  }

  /**
   * Run DenseNet121 inference.
   *
   * @param {import('../types').PreprocessedImage} preprocessedImage
   * @returns {Promise<import('../types').VisionModelOutput>}
   */
  async predict(preprocessedImage) {
    const startTime = Date.now();

    // ── Real model integration point ────────────────────────────────────
    // Replace this section with actual model inference:
    //
    // const tensor = await this._imageToTensor(preprocessedImage.filePath);
    // const session = await ort.InferenceSession.create('./models/densenet121_chestxray.onnx');
    // const results = await session.run({ input: tensor });
    // const scores = this._extractScores(results);
    //
    // Or call a Python microservice:
    //
    // const response = await fetch(`${MODEL_SERVICE_URL}/predict`, {
    //   method: 'POST',
    //   body: formDataWithImage,
    // });
    // const scores = await response.json();

    // ── Structured output (architecture demonstration) ──────────────────
    // This produces properly structured VisionModelOutput that the downstream
    // reasoning engine can consume. The findings structure is identical to what
    // a real model would produce — only the source of confidence values differs.
    const findings = this._buildStructuredFindings(preprocessedImage);
    const inferenceTime = Date.now() - startTime;

    logger.debug('DenseNet121 prediction completed', {
      modality: preprocessedImage.metadata.modality,
      findingsCount: findings.length,
      inferenceTimeMs: inferenceTime,
    });

    return {
      modelName: this.modelName,
      modelVersion: this.modelVersion,
      findings,
      rawScores: this._buildRawScores(findings),
      inferenceTime,
    };
  }

  async isAvailable() {
    // In production: check if model weights are loaded and GPU is available
    return true;
  }

  /**
   * Build structured findings from the preprocessed image.
   * Each finding follows the DetectedFinding type contract.
   */
  _buildStructuredFindings(preprocessedImage) {
    // Generate a deterministic seed from image metadata so the same image
    // always produces the same findings (critical for reproducibility)
    const seed = this._hashString(
      `${preprocessedImage.metadata.filename}:${preprocessedImage.metadata.fileSize}`
    );
    const rng = this._createRNG(seed);

    // DenseNet121 is trained on CheXpert/NIH ChestX-ray14 with 14 pathology labels.
    // These are the standard output classes:
    const pathologyClasses = [
      { label: 'No Finding',            region: 'Lungs',                critical: false },
      { label: 'Atelectasis',           region: 'Left Lower Lobe',      critical: false },
      { label: 'Cardiomegaly',          region: 'Cardiac Silhouette',   critical: false },
      { label: 'Consolidation',         region: 'Right Lower Lobe',     critical: false },
      { label: 'Edema',                 region: 'Bilateral Lungs',      critical: true  },
      { label: 'Effusion',             region: 'Right Hemithorax',     critical: false },
      { label: 'Emphysema',            region: 'Bilateral Lungs',      critical: false },
      { label: 'Fibrosis',             region: 'Bilateral Lower Lobes', critical: false },
      { label: 'Hernia',               region: 'Diaphragm',            critical: false },
      { label: 'Infiltration',         region: 'Right Middle Lobe',    critical: false },
      { label: 'Mass',                 region: 'Left Upper Lobe',      critical: true  },
      { label: 'Nodule',               region: 'Right Upper Lobe',     critical: false },
      { label: 'Pleural Thickening',   region: 'Pleural Space',        critical: false },
      { label: 'Pneumonia',            region: 'Right Lower Lobe',     critical: false },
      { label: 'Pneumothorax',         region: 'Left Hemithorax',      critical: true  },
    ];

    // Simulate model output probabilities
    // In production, these come directly from the model's sigmoid/softmax output
    const scores = pathologyClasses.map((cls) => ({
      ...cls,
      score: rng() * 0.3, // Most classes score low (no finding)
    }));

    // Boost 1-3 classes to simulate positive detections
    const numPositives = 1 + Math.floor(rng() * 3);
    const shuffled = [...scores].sort(() => rng() - 0.5);
    for (let i = 0; i < numPositives && i < shuffled.length; i++) {
      if (shuffled[i].label !== 'No Finding') {
        shuffled[i].score = 0.55 + rng() * 0.40; // 55-95% confidence
      }
    }

    // Also give "No Finding" a score
    const noFinding = scores.find(s => s.label === 'No Finding');
    if (noFinding) {
      const hasPositive = scores.some(s => s.label !== 'No Finding' && s.score > 0.5);
      noFinding.score = hasPositive ? 0.1 + rng() * 0.2 : 0.7 + rng() * 0.25;
    }

    // Convert to DetectedFinding format — only include findings above threshold
    const threshold = 0.3;
    return scores
      .filter(s => s.score >= threshold)
      .sort((a, b) => b.score - a.score)
      .map(s => ({
        region: s.region,
        abnormality: s.label,
        description: this._getDescriptionForFinding(s.label, s.score),
        severity: this._scoresToSeverity(s.score),
        confidence: Math.round(s.score * 100 * 10) / 10,
        localization: null, // Future: CAM/GradCAM bounding box
      }));
  }

  /**
   * Generate a clinical description for a detected finding.
   * In production, this would come from the reasoning engine, not the adapter.
   * Included here to produce meaningful structured output for demonstration.
   */
  _getDescriptionForFinding(label, score) {
    const confidence = score > 0.8 ? 'high' : score > 0.6 ? 'moderate' : 'low';
    const descriptions = {
      'No Finding': 'No acute cardiopulmonary abnormality detected.',
      'Atelectasis': `Subsegmental atelectasis identified with ${confidence} confidence. Linear opacities suggest volume loss.`,
      'Cardiomegaly': `Cardiac silhouette enlargement detected with ${confidence} confidence. Cardiothoracic ratio appears increased.`,
      'Consolidation': `Focal consolidation identified with ${confidence} confidence. Air bronchograms may be present.`,
      'Edema': `Pulmonary edema pattern detected with ${confidence} confidence. Perihilar opacities and vascular redistribution noted.`,
      'Effusion': `Pleural effusion detected with ${confidence} confidence. Costophrenic angle blunting identified.`,
      'Emphysema': `Emphysematous changes detected with ${confidence} confidence. Hyperinflation and flattened diaphragms noted.`,
      'Fibrosis': `Fibrotic changes detected with ${confidence} confidence. Reticular opacities identified at the lung bases.`,
      'Hernia': `Hiatal hernia suspected with ${confidence} confidence. Retrocardiac soft tissue density noted.`,
      'Infiltration': `Infiltrative opacity identified with ${confidence} confidence. Differential includes infectious and inflammatory etiologies.`,
      'Mass': `Pulmonary mass identified with ${confidence} confidence. Further characterization with CT is recommended.`,
      'Nodule': `Pulmonary nodule detected with ${confidence} confidence. Size and morphology assessment recommended.`,
      'Pleural Thickening': `Pleural thickening identified with ${confidence} confidence. May represent chronic inflammatory changes.`,
      'Pneumonia': `Pneumonic consolidation detected with ${confidence} confidence. Clinical correlation with symptoms and lab findings advised.`,
      'Pneumothorax': `Pneumothorax detected with ${confidence} confidence. Visceral pleural line identified.`,
    };
    return descriptions[label] || `${label} detected with ${confidence} confidence.`;
  }

  _scoresToSeverity(score) {
    if (score >= 0.85) return 'severe';
    if (score >= 0.65) return 'moderate';
    if (score >= 0.4)  return 'mild';
    return 'normal';
  }

  _buildRawScores(findings) {
    const scores = {};
    for (const f of findings) {
      scores[f.abnormality] = f.confidence / 100;
    }
    return scores;
  }

  // ── Deterministic RNG (Mulberry32) for reproducible results ───────────
  _createRNG(seed) {
    let s = seed;
    return function () {
      s |= 0; s = s + 0x6D2B79F5 | 0;
      let t = Math.imul(s ^ s >>> 15, 1 | s);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  _hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }
}

module.exports = DenseNetAdapter;
