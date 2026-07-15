import httpClient from './httpClient'

export const reportsApi = {
  async getById(id) {
    return httpClient.get(`/reports/${id}`)
  },

  async list(params = {}) {
    return httpClient.get('/reports', { params })
  },

  async delete(id) {
    return httpClient.delete(`/reports/${id}`)
  },

  async trackDownload(id) {
    return httpClient.post(`/reports/${id}/download`).catch(() => {})
  },
}
