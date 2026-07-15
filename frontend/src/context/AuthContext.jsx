import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../api/authApi'

const TOKEN_KEY = 'xray_token'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const navigate = useNavigate()

  const [user,      setUser]      = useState(null)
  const [token,     setToken]     = useState(() => localStorage.getItem(TOKEN_KEY))
  const [loading,   setLoading]   = useState(true)   // true on first load
  const [authError, setAuthError] = useState(null)

  // ── Persist / clear token ──────────────────────────────────────────────
  function saveToken(t) {
    setToken(t)
    if (t) localStorage.setItem(TOKEN_KEY, t)
    else   localStorage.removeItem(TOKEN_KEY)
  }

  // ── On mount — verify stored token ────────────────────────────────────
  useEffect(() => {
    async function verifyStoredToken() {
      const stored = localStorage.getItem(TOKEN_KEY)
      if (!stored) {
        setLoading(false)
        return
      }
      try {
        const res = await authApi.getMe()
        setUser(res.user)
      } catch {
        // Token is invalid or expired — wipe it
        saveToken(null)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    verifyStoredToken()
  }, [])

  // ── Register ──────────────────────────────────────────────────────────
  const register = useCallback(async ({ name, email, password }) => {
    setAuthError(null)
    try {
      const res = await authApi.register({ name, email, password })
      saveToken(res.token)
      setUser(res.user)
      navigate('/dashboard', { replace: true })
      return { success: true }
    } catch (err) {
      setAuthError(err.message)
      return { success: false, error: err.message }
    }
  }, [navigate])

  // ── Login ─────────────────────────────────────────────────────────────
  const login = useCallback(async ({ email, password }) => {
    setAuthError(null)
    try {
      const res = await authApi.login({ email, password })
      saveToken(res.token)
      setUser(res.user)
      navigate('/dashboard', { replace: true })
      return { success: true }
    } catch (err) {
      setAuthError(err.message)
      return { success: false, error: err.message }
    }
  }, [navigate])

  // ── Logout ────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    saveToken(null)
    setUser(null)
    navigate('/', { replace: true })
  }, [navigate])

  // ── Update profile ────────────────────────────────────────────────────
  const updateProfile = useCallback(async (data) => {
    try {
      const res = await authApi.updateProfile(data)
      setUser(res.user)
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }, [])

  const value = {
    user,
    token,
    loading,
    authError,
    isAuthenticated: !!user,
    login,
    logout,
    register,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// ── Hook ──────────────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
