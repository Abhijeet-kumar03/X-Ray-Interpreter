import httpClient from './httpClient'

export const authApi = {
  /**
   * Register a new user account
   * @param {{ name: string, email: string, password: string }} data
   */
  async register(data) {
    return httpClient.post('/auth/register', data)
  },

  /**
   * Log in with email + password
   * @param {{ email: string, password: string }} data
   */
  async login(data) {
    return httpClient.post('/auth/login', data)
  },

  /**
   * Fetch the currently authenticated user
   */
  async getMe() {
    return httpClient.get('/auth/me')
  },

  /**
   * Update the current user's profile
   * @param {{ name?: string, avatar?: string, specialty?: string, institution?: string }} data
   */
  async updateProfile(data) {
    return httpClient.put('/auth/profile', data)
  },

  /**
   * Request password reset link
   * @param {string} email
   */
  async forgotPassword(email) {
    return httpClient.post('/auth/forgot-password', { email })
  },

  /**
   * Reset password with token
   * @param {string} token
   * @param {string} password
   */
  async resetPassword(token, password) {
    return httpClient.post('/auth/reset-password', { token, password })
  },

  /**
   * Verify email using a token
   * @param {string} token
   */
  async verifyEmail(token) {
    return httpClient.get('/auth/verify-email', { params: { token } })
  },
}
