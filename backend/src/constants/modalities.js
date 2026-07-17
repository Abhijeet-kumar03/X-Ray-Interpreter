'use strict';

/**
 * Imaging Modality Registry
 *
 * Each entry defines the modality metadata and which AI model adapters support it.
 *
 * To add a new modality:
 *   1. Add an entry here with `enabled: true`
 *   2. Create or extend a ModelAdapter that declares this modality in `supportedModalities`
 *   3. Register the adapter in `adapterRegistry.js`
 */
const MODALITIES = {
  chest_xray: {
    id:                'chest_xray',
    label:             'Chest X-Ray',
    bodyPart:          'Chest',
    defaultProjection: 'PA (Posteroanterior)',
    // Adapters: DenseNet121, EfficientNet-B4
    supportedModels:   ['DenseNet121', 'EfficientNet-B4'],
    enabled:            true,
  },

  // ── Musculoskeletal ──────────────────────────────────────────────────────
  spine_xray: {
    id:                'spine_xray',
    label:             'Spine X-Ray',
    bodyPart:          'Spine',
    defaultProjection: 'AP / Lateral',
    supportedModels:   ['SpineNet-V1'],
    enabled:            true,
  },
  knee_xray: {
    id:                'knee_xray',
    label:             'Knee X-Ray',
    bodyPart:          'Knee',
    defaultProjection: 'AP / Lateral',
    supportedModels:   ['KneeNet-V1'],
    enabled:            true,
  },
  foot_xray: {
    id:                'foot_xray',
    label:             'Foot X-Ray',
    bodyPart:          'Foot',
    defaultProjection: 'AP / Oblique / Lateral',
    supportedModels:   ['FootNet-V1'],
    enabled:            true,
  },
  hand_xray: {
    id:                'hand_xray',
    label:             'Hand X-Ray',
    bodyPart:          'Hand',
    defaultProjection: 'PA',
    supportedModels:   [],
    enabled:            false,
  },
  wrist_xray: {
    id:                'wrist_xray',
    label:             'Wrist X-Ray',
    bodyPart:          'Wrist',
    defaultProjection: 'PA / Lateral',
    supportedModels:   [],
    enabled:            false,
  },
  elbow_xray: {
    id:                'elbow_xray',
    label:             'Elbow X-Ray',
    bodyPart:          'Elbow',
    defaultProjection: 'AP / Lateral',
    supportedModels:   [],
    enabled:            false,
  },
  shoulder_xray: {
    id:                'shoulder_xray',
    label:             'Shoulder X-Ray',
    bodyPart:          'Shoulder',
    defaultProjection: 'AP',
    supportedModels:   [],
    enabled:            false,
  },
  skull_xray: {
    id:                'skull_xray',
    label:             'Skull X-Ray',
    bodyPart:          'Skull',
    defaultProjection: 'AP / Lateral',
    supportedModels:   [],
    enabled:            false,
  },
  pelvis_xray: {
    id:                'pelvis_xray',
    label:             'Pelvis X-Ray',
    bodyPart:          'Pelvis',
    defaultProjection: 'AP',
    supportedModels:   [],
    enabled:            false,
  },
  dental_xray: {
    id:                'dental_xray',
    label:             'Dental X-Ray',
    bodyPart:          'Dental',
    defaultProjection: 'Panoramic',
    supportedModels:   [],
    enabled:            false,
  },

  // ── Advanced Imaging ─────────────────────────────────────────────────────
  mri: {
    id:                'mri',
    label:             'MRI',
    bodyPart:          'Variable',
    defaultProjection: 'Variable',
    // SpineNet handles spine MRI; extend with organ-specific adapters as needed
    supportedModels:   ['SpineNet-V1'],
    enabled:            true,
  },
  ct: {
    id:                'ct',
    label:             'CT Scan',
    bodyPart:          'Variable',
    defaultProjection: 'Axial',
    supportedModels:   [],
    enabled:            false,   // Planned: CTNet adapter
  },

  // ── Ultrasound ───────────────────────────────────────────────────────────
  ultrasound: {
    id:                'ultrasound',
    label:             'Abdominal Ultrasound',
    bodyPart:          'Abdomen / Pelvis',
    defaultProjection: 'B-Mode',
    supportedModels:   ['SonoNet-Abdominal-V1'],
    enabled:            true,
  },
  breast_ultrasound: {
    id:                'breast_ultrasound',
    label:             'Breast Ultrasound',
    bodyPart:          'Breast',
    defaultProjection: 'B-Mode',
    supportedModels:   ['BreastSono-V1'],
    enabled:            true,
  },
  mammography: {
    id:                'mammography',
    label:             'Mammography',
    bodyPart:          'Breast',
    defaultProjection: 'CC / MLO',
    // BreastSono-V1 also covers mammography pattern detection
    supportedModels:   ['BreastSono-V1'],
    enabled:            true,
  },
};

const MODALITY_IDS       = Object.keys(MODALITIES);
const ENABLED_MODALITIES = Object.values(MODALITIES).filter((m) => m.enabled);

/**
 * Look up a modality by its ID.
 * @param {string} id
 * @returns {Object|null}
 */
function getModality(id) {
  return MODALITIES[id] || null;
}

/**
 * Returns true if the modality exists and is enabled.
 * @param {string} id
 * @returns {boolean}
 */
function isModalityEnabled(id) {
  return MODALITIES[id]?.enabled === true;
}

module.exports = { MODALITIES, MODALITY_IDS, ENABLED_MODALITIES, getModality, isModalityEnabled };
