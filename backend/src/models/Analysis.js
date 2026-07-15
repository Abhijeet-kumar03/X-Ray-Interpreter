'use strict';

const mongoose = require('mongoose');
const { MODALITY_IDS } = require('../constants/modalities');

const findingSchema = new mongoose.Schema({
  region: { type: String, required: true },
  description: { type: String, required: true },
  abnormality: { type: String, default: '' },
  severity: {
    type: String,
    enum: ['normal', 'mild', 'moderate', 'severe'],
    default: 'normal',
  },
  confidence: { type: Number, min: 0, max: 100 },
  localization: {
    // Future: bounding box coordinates for overlay
    x: { type: Number },
    y: { type: Number },
    width: { type: Number },
    height: { type: Number },
  },
}, { _id: false });

const analysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  patientId: {
    type: String,
    default: () => `PAT-${Date.now().toString(36).toUpperCase()}`,
  },
  studyId: {
    type: String,
    unique: true,
    default: () => `STD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
  },

  // ── Image data ──────────────────────────────────────────────────────────
  imageUrl: { type: String, required: true },
  imageName: { type: String, required: true },
  imageSize: { type: Number },

  // ── Modality ────────────────────────────────────────────────────────────
  modality: {
    type: String,
    enum: MODALITY_IDS,
    default: 'chest_xray',
    index: true,
  },

  // ── Status ──────────────────────────────────────────────────────────────
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
  },

  // ── AI results ──────────────────────────────────────────────────────────
  model: { type: String, default: 'DenseNet121' },
  modelVersion: { type: String, default: '1.0.0' },
  pipelineVersion: { type: String, default: '3.0.0' },

  primaryDiagnosis: { type: String },
  overallConfidence: { type: Number, min: 0, max: 100 },
  findings: [findingSchema],
  impression: { type: String },
  recommendations: [String],
  differentialDiagnoses: [String],
  patientExplanation: { type: String },

  urgencyLevel: {
    type: String,
    enum: ['routine', 'non-urgent', 'semi-urgent', 'urgent', 'critical'],
    default: 'routine',
  },

  technicalQuality: {
    type: String,
    enum: ['diagnostic', 'suboptimal', 'non-diagnostic'],
    default: 'diagnostic',
  },
  projectionType: {
    type: String,
    default: 'PA (Posteroanterior)',
  },

  processingTime: { type: Number }, // milliseconds
  reportId: { type: mongoose.Schema.Types.ObjectId, ref: 'Report' },

  // ── Soft delete ─────────────────────────────────────────────────────────
  isDeleted: { type: Boolean, default: false, index: true },
  deletedAt: { type: Date },

  // ── Flexible metadata ───────────────────────────────────────────────────
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
}, {
  timestamps: true,
  toJSON:   { virtuals: true },
  toObject: { virtuals: true },
});

// ── Indexes ────────────────────────────────────────────────────────────────
analysisSchema.index({ createdAt: -1 });
analysisSchema.index({ status: 1 });
analysisSchema.index({ primaryDiagnosis: 1 });
analysisSchema.index({ urgencyLevel: 1 });
analysisSchema.index({ userId: 1, isDeleted: 1, createdAt: -1 });

// ── Default query filter: exclude soft-deleted ────────────────────────────
analysisSchema.pre(/^find/, function () {
  if (this.getFilter().isDeleted === undefined) {
    this.where({ isDeleted: { $ne: true } });
  }
});

// ── Virtual: public image URL ─────────────────────────────────────────────
analysisSchema.virtual('imagePublicUrl').get(function () {
  return this.imageUrl ? `/uploads/${this.imageUrl}` : null;
});

const Analysis = mongoose.model('Analysis', analysisSchema);
module.exports = Analysis;
