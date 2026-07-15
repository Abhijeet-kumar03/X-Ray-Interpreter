'use strict';

const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  analysisId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Analysis',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  reportNumber: {
    type: String,
    unique: true,
    default: () => `RPT-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
  },
  version: {
    type: Number,
    default: 1,
  },
  institution: {
    type: String,
    default: 'MedVision AI Diagnostic Center',
  },
  radiologistName: {
    type: String,
    default: 'MedVision AI Diagnostic System v3.0',
  },
  clinicalHistory: {
    type: String,
    default: 'Radiograph obtained for evaluation.',
  },
  technique: { type: String },

  // ── Report content ──────────────────────────────────────────────────────
  findings: { type: String, required: true },
  impression: { type: String, required: true },
  recommendations: { type: String },
  differentialDiagnoses: [String],
  patientExplanation: { type: String },
  urgencyLevel: {
    type: String,
    enum: ['routine', 'non-urgent', 'semi-urgent', 'urgent', 'critical'],
    default: 'routine',
  },

  // ── Critical findings ───────────────────────────────────────────────────
  criticalFindings: { type: Boolean, default: false },
  criticalFindingsNote: { type: String },

  // ── Tracking ────────────────────────────────────────────────────────────
  downloadCount: { type: Number, default: 0 },
  viewCount: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['draft', 'finalized', 'amended'],
    default: 'finalized',
  },
  tags: [String],
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
}, {
  timestamps: true,
  toJSON:   { virtuals: true },
  toObject: { virtuals: true },
});

// ── Indexes ────────────────────────────────────────────────────────────────
reportSchema.index({ analysisId: 1 });
reportSchema.index({ createdAt: -1 });
reportSchema.index({ criticalFindings: 1 });
reportSchema.index({ tags: 1 });
reportSchema.index({ userId: 1, createdAt: -1 });

const Report = mongoose.model('Report', reportSchema);
module.exports = Report;
