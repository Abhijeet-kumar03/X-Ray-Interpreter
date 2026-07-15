'use strict';

/**
 * Base Model Adapter Interface
 *
 * Every vision model adapter MUST extend this class and implement all methods.
 * This ensures the pipeline can swap models without any code changes upstream.
 *
 * To add a new model to MedVision AI:
 *   1. Create a new adapter file (e.g., vitAdapter.js)
 *   2. Extend ModelAdapter
 *   3. Implement all abstract methods
 *   4. Register it in adapterRegistry.js
 *
 * The pipeline calls:  adapter.predict(preprocessedImage) → VisionModelOutput
 */
class ModelAdapter {
  /**
   * @returns {string} Human-readable model name
   */
  get modelName() {
    throw new Error('ModelAdapter.modelName must be implemented');
  }

  /**
   * @returns {string} Semantic version of this adapter
   */
  get modelVersion() {
    throw new Error('ModelAdapter.modelVersion must be implemented');
  }

  /**
   * @returns {string[]} List of modality IDs this model can process
   */
  get supportedModalities() {
    throw new Error('ModelAdapter.supportedModalities must be implemented');
  }

  /**
   * Run inference on a preprocessed image.
   *
   * @param {import('../types').PreprocessedImage} preprocessedImage
   * @returns {Promise<import('../types').VisionModelOutput>}
   */
  async predict(preprocessedImage) {
    throw new Error('ModelAdapter.predict() must be implemented');
  }

  /**
   * Check if this model is ready to serve predictions.
   * Implementations should verify model weights are loaded, GPU is available, etc.
   *
   * @returns {Promise<boolean>}
   */
  async isAvailable() {
    throw new Error('ModelAdapter.isAvailable() must be implemented');
  }

  /**
   * Check if this adapter supports a given modality.
   * @param {string} modalityId
   * @returns {boolean}
   */
  supportsModality(modalityId) {
    return this.supportedModalities.includes(modalityId);
  }
}

module.exports = ModelAdapter;
