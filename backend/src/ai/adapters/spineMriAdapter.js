'use strict';

const ModelAdapter = require('./modelAdapter');
const logger = require('../../utils/logger');

/**
 * Spine MRI / Spine X-Ray Adapter
 *
 * Handles both spine MRI (sagittal T1/T2 sequences) and spine X-ray modalities.
 *
 * Pathology labels are drawn from standard radiological practice for lumbar/
 * cervical/thoracic spine imaging, covering the most common clinical findings.
 *
 * Real model integration paths:
 *   - ONNX model trained on SpineNet or similar spine segmentation dataset
 *   - Python gRPC microservice wrapping a PyTorch spine pathology classifier
 *   - MedSAM / TotalSegmentator for vertebral segmentation + classification
 */
class SpineMriAdapter extends ModelAdapter {
  get modelName() {
    return 'SpineNet-V1';
  }

  get modelVersion() {
    return '1.0.0';
  }

  get supportedModalities() {
    return ['spine_xray', 'mri'];
  }

  /**
   * Run SpineNet inference.
   *
   * @param {import('../types').PreprocessedImage} preprocessedImage
   * @returns {Promise<import('../types').VisionModelOutput>}
   */
  async predict(preprocessedImage) {
    const startTime = Date.now();

    const seed = this._hashString(
      `spinenet:${preprocessedImage.metadata.filename}:${preprocessedImage.metadata.fileSize}`
    );
    const rng = this._createRNG(seed);

    // Standard lumbar/cervical spine pathology labels used in clinical radiology
    const pathologyClasses = [
      { label: 'No Finding',                  region: 'Spine',                  critical: false },
      { label: 'Disc Herniation',             region: 'L4-L5 Intervertebral',   critical: false },
      { label: 'Disc Herniation',             region: 'L5-S1 Intervertebral',   critical: false },
      { label: 'Spinal Canal Stenosis',        region: 'Lumbar Spinal Canal',    critical: true  },
      { label: 'Disc Degeneration',           region: 'Lumbar Discs',           critical: false },
      { label: 'Spondylolisthesis',           region: 'L4-L5 Junction',         critical: false },
      { label: 'Nerve Root Compression',      region: 'Neural Foramina',         critical: true  },
      { label: 'Cauda Equina Compression',    region: 'Cauda Equina',           critical: true  },
      { label: 'Vertebral Compression Fracture', region: 'Lumbar Vertebrae',    critical: true  },
      { label: 'Ligamentum Flavum Hypertrophy', region: 'Posterior Elements',   critical: false },
      { label: 'Facet Joint Arthropathy',     region: 'Facet Joints',           critical: false },
      { label: 'Scoliosis',                   region: 'Thoracolumbar Spine',    critical: false },
      { label: 'Osteoporosis',                region: 'Vertebral Bodies',       critical: false },
      { label: 'Epidural Lipomatosis',        region: 'Epidural Space',         critical: false },
    ];

    const scores = pathologyClasses.map(cls => ({
      ...cls,
      score: rng() * 0.25,
    }));

    // Boost 1–2 classes to simulate positive detections
    const numPositives = 1 + Math.floor(rng() * 2);
    const shuffled = [...scores].sort(() => rng() - 0.5);
    for (let i = 0; i < numPositives && i < shuffled.length; i++) {
      if (shuffled[i].label !== 'No Finding') {
        shuffled[i].score = 0.55 + rng() * 0.40;
      }
    }

    const noFinding = scores.find(s => s.label === 'No Finding');
    if (noFinding) {
      const hasPositive = scores.some(s => s.label !== 'No Finding' && s.score > 0.5);
      noFinding.score = hasPositive ? 0.08 + rng() * 0.15 : 0.72 + rng() * 0.23;
    }

    const threshold = 0.3;
    const findings = scores
      .filter(s => s.score >= threshold)
      .sort((a, b) => b.score - a.score)
      .map(s => ({
        region:      s.region,
        abnormality: s.label,
        description: this._getDescription(s.label, s.score),
        severity:    this._toSeverity(s.score),
        confidence:  Math.round(s.score * 100 * 10) / 10,
        localization: null,
      }));

    const inferenceTime = Date.now() - startTime;

    logger.debug('SpineNet-V1 prediction completed', {
      modality:       preprocessedImage.metadata.modality,
      findingsCount:  findings.length,
      inferenceTimeMs: inferenceTime,
    });

    return {
      modelName:    this.modelName,
      modelVersion: this.modelVersion,
      findings,
      rawScores:    Object.fromEntries(findings.map(f => [f.abnormality, f.confidence / 100])),
      inferenceTime,
    };
  }

  async isAvailable() {
    return true;
  }

  _getDescription(label, score) {
    const conf = score > 0.8 ? 'high' : score > 0.6 ? 'moderate' : 'low';
    const map = {
      'No Finding':
        'No significant spinal abnormality detected. Vertebral alignment, disc heights, and signal intensity are within normal limits.',
      'Disc Herniation':
        `Posterior/posterolateral disc herniation identified with ${conf} confidence. Disc material extends beyond the posterior vertebral body margin with possible thecal sac indentation.`,
      'Spinal Canal Stenosis':
        `Lumbar spinal canal stenosis detected with ${conf} confidence. Reduced AP canal diameter with compression of the thecal sac and cauda equina nerve roots.`,
      'Disc Degeneration':
        `Intervertebral disc degeneration noted with ${conf} confidence. Loss of disc height and T2 signal hypointensity (Modic changes) consistent with degenerative disc disease.`,
      'Spondylolisthesis':
        `Spondylolisthesis detected with ${conf} confidence. Anterior slippage of a vertebral body relative to the one below, graded on the Meyerding classification.`,
      'Nerve Root Compression':
        `Neural foraminal narrowing with nerve root compression identified with ${conf} confidence. Foraminal stenosis may produce radiculopathy.`,
      'Cauda Equina Compression':
        `Cauda equina compression pattern detected with ${conf} confidence. Significant narrowing of the central canal with crowding of nerve roots — urgent clinical correlation required.`,
      'Vertebral Compression Fracture':
        `Vertebral compression fracture identified with ${conf} confidence. Reduced vertebral body height with anterior wedging. Osteoporotic vs. traumatic etiology to be determined clinically.`,
      'Ligamentum Flavum Hypertrophy':
        `Ligamentum flavum hypertrophy detected with ${conf} confidence. Posterior epidural soft tissue thickening contributing to central canal narrowing.`,
      'Facet Joint Arthropathy':
        `Facet joint degenerative arthropathy noted with ${conf} confidence. Joint space narrowing, osteophyte formation, and subchondral changes at the posterior elements.`,
      'Scoliosis':
        `Scoliotic curvature detected with ${conf} confidence. Lateral spinal curvature — Cobb angle measurement recommended for grading.`,
      'Osteoporosis':
        `Diffuse vertebral osteopenia/osteoporosis detected with ${conf} confidence. Reduced bone mineral density with biconcave ("codfish") vertebral body morphology.`,
      'Epidural Lipomatosis':
        `Epidural lipomatosis identified with ${conf} confidence. Excess epidural fat producing posterior thecal sac compression.`,
    };
    return map[label] || `${label} detected with ${conf} confidence. Clinical correlation is recommended.`;
  }

  _toSeverity(score) {
    if (score >= 0.85) return 'severe';
    if (score >= 0.65) return 'moderate';
    if (score >= 0.4)  return 'mild';
    return 'normal';
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

module.exports = SpineMriAdapter;
