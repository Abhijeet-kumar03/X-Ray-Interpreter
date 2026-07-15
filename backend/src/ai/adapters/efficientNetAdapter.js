'use strict';

const ModelAdapter = require('./modelAdapter');
const logger = require('../../utils/logger');

/**
 * EfficientNet-B4 Adapter
 *
 * Demonstrates multi-model support in the adapter registry.
 * EfficientNet-B4 was used in the CheXpert competition with strong performance.
 *
 * Integration: same three paths as DenseNet (ONNX, gRPC, REST).
 * The adapter interface is identical — the pipeline doesn't care which model runs.
 */
class EfficientNetAdapter extends ModelAdapter {
  get modelName() {
    return 'EfficientNet-B4';
  }

  get modelVersion() {
    return '1.0.0';
  }

  get supportedModalities() {
    return ['chest_xray'];
  }

  async predict(preprocessedImage) {
    const startTime = Date.now();

    // ── Real model integration point (identical interface to DenseNet) ───
    // Replace with actual EfficientNet-B4 inference.

    const seed = this._hashString(
      `effnet:${preprocessedImage.metadata.filename}:${preprocessedImage.metadata.fileSize}`
    );
    const rng = this._createRNG(seed);

    const pathologyClasses = [
      { label: 'No Finding', region: 'Lungs' },
      { label: 'Atelectasis', region: 'Left Lower Lobe' },
      { label: 'Cardiomegaly', region: 'Cardiac Silhouette' },
      { label: 'Consolidation', region: 'Right Lower Lobe' },
      { label: 'Edema', region: 'Bilateral Lungs' },
      { label: 'Effusion', region: 'Right Hemithorax' },
      { label: 'Pneumonia', region: 'Right Lower Lobe' },
      { label: 'Pneumothorax', region: 'Left Hemithorax' },
    ];

    const scores = pathologyClasses.map(cls => ({
      ...cls,
      score: rng() * 0.25,
    }));

    const numPositives = 1 + Math.floor(rng() * 2);
    const shuffled = [...scores].sort(() => rng() - 0.5);
    for (let i = 0; i < numPositives; i++) {
      if (shuffled[i].label !== 'No Finding') {
        shuffled[i].score = 0.6 + rng() * 0.35;
      }
    }

    const noFinding = scores.find(s => s.label === 'No Finding');
    if (noFinding) {
      const hasPositive = scores.some(s => s.label !== 'No Finding' && s.score > 0.5);
      noFinding.score = hasPositive ? 0.1 + rng() * 0.15 : 0.75 + rng() * 0.2;
    }

    const findings = scores
      .filter(s => s.score >= 0.3)
      .sort((a, b) => b.score - a.score)
      .map(s => ({
        region: s.region,
        abnormality: s.label,
        description: `${s.label} detected. Confidence: ${Math.round(s.score * 100)}%. Further clinical correlation recommended.`,
        severity: s.score >= 0.85 ? 'severe' : s.score >= 0.65 ? 'moderate' : s.score >= 0.4 ? 'mild' : 'normal',
        confidence: Math.round(s.score * 100 * 10) / 10,
        localization: null,
      }));

    const inferenceTime = Date.now() - startTime;

    logger.debug('EfficientNet-B4 prediction completed', {
      findingsCount: findings.length,
      inferenceTimeMs: inferenceTime,
    });

    return {
      modelName: this.modelName,
      modelVersion: this.modelVersion,
      findings,
      rawScores: Object.fromEntries(findings.map(f => [f.abnormality, f.confidence / 100])),
      inferenceTime,
    };
  }

  async isAvailable() {
    return true;
  }

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

module.exports = EfficientNetAdapter;
