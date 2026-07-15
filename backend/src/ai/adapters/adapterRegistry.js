'use strict';

const DenseNetAdapter    = require('./denseNetAdapter');
const EfficientNetAdapter = require('./efficientNetAdapter');
const logger = require('../../utils/logger');

/**
 * Model Adapter Registry
 *
 * Central registry of all available vision model adapters.
 * Provides model selection by name or auto-selection by modality.
 *
 * To register a new model:
 *   1. Create an adapter extending ModelAdapter
 *   2. Add it to the `adapters` map below
 *
 * The pipeline calls: registry.getAdapter(modelName) or registry.getAdapterForModality(modalityId)
 */
const adapters = new Map();

// ── Register built-in adapters ─────────────────────────────────────────────
function initializeRegistry() {
  register(new DenseNetAdapter());
  register(new EfficientNetAdapter());

  logger.info('AI Model Registry initialized', {
    models: Array.from(adapters.keys()),
  });
}

/**
 * Register an adapter instance.
 * @param {import('./modelAdapter')} adapter
 */
function register(adapter) {
  adapters.set(adapter.modelName, adapter);
}

/**
 * Get an adapter by model name.
 * @param {string} modelName
 * @returns {import('./modelAdapter')|null}
 */
function getAdapter(modelName) {
  return adapters.get(modelName) || null;
}

/**
 * Get the best available adapter for a given modality.
 * Prefers models in order of registration.
 *
 * @param {string} modalityId
 * @returns {import('./modelAdapter')|null}
 */
function getAdapterForModality(modalityId) {
  for (const adapter of adapters.values()) {
    if (adapter.supportsModality(modalityId)) {
      return adapter;
    }
  }
  return null;
}

/**
 * List all registered model names.
 * @returns {string[]}
 */
function listModels() {
  return Array.from(adapters.keys());
}

/**
 * List models that support a given modality.
 * @param {string} modalityId
 * @returns {string[]}
 */
function listModelsForModality(modalityId) {
  return Array.from(adapters.values())
    .filter(a => a.supportsModality(modalityId))
    .map(a => a.modelName);
}

// Auto-initialize on first import
initializeRegistry();

module.exports = {
  register,
  getAdapter,
  getAdapterForModality,
  listModels,
  listModelsForModality,
};
