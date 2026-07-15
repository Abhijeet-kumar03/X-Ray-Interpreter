import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { motion } from 'framer-motion'
import { Activity } from 'lucide-react'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  // Show a gentle full-screen spinner while we check the stored token
  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-14 h-14 rounded-2xl bg-medical-600 flex items-center justify-center shadow-lg">
            <Activity size={28} className="text-white animate-pulse" />
          </div>
          <p className="text-sm text-slate-400 font-medium">Loading your workspace…</p>
        </motion.div>
      </div>
    )
  }

  if (!isAuthenticated) {
    // Save where they were trying to go so we can redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
