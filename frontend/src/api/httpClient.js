import axios from 'axios'
import toast from 'react-hot-toast'

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api' : 'https://xray-interpreter-backend.onrender.com/api'),
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ── Request interceptor — inject Bearer token ──────────────────────────────
httpClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('xray_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response interceptor — unwrap data, show errors ───────────────────────
httpClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'Something went wrong. Please try again.'

    // 401 means token expired or invalid — clear it so UI shows login
    if (error.response?.status === 401) {
      localStorage.removeItem('xray_token')
      // Let AuthContext handle the redirect — just let the error bubble
    } else if (error.response?.status !== 404) {
      toast.error(message)
    }

    return Promise.reject(new Error(message))
  }
)

export default httpClient
