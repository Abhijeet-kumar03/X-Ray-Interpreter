import httpClient from './httpClient'

export const analysisApi = {
  /**
   * Upload an X-ray and trigger AI analysis
   * @param {File} file - The image file
   * @param {Object} options - { patientId, model }
   * @param {Function} onProgress - Upload progress callback
   */
  async create(file, options = {}, onProgress) {
    const formData = new FormData()
    formData.append('image', file)
    if (options.patientId) formData.append('patientId', options.patientId)
    if (options.model) formData.append('model', options.model)
    if (options.modality) formData.append('modality', options.modality)

    return httpClient.post('/analysis', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(pct)
        }
      },
    })
  },

  /**
   * Fetch a single analysis by ID
   */
  async getById(id) {
    return httpClient.get(`/analysis/${id}`)
  },

  /**
   * List analyses with pagination, search, and filters
   */
  async list(params = {}) {
    return httpClient.get('/analysis', { params })
  },

  /**
   * Delete analysis and its associated report
   */
  async delete(id) {
    return httpClient.delete(`/analysis/${id}`)
  },

  /**
   * Fetch analysis statistics
   */
  async getStats() {
    return httpClient.get('/analysis/stats')
  },
}
