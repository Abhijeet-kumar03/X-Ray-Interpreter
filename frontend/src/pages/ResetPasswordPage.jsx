import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Activity, Lock, CheckCircle, AlertTriangle } from 'lucide-react'
import { authApi } from '../api/authApi'
import toast from 'react-hot-toast'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!token) {
      toast.error('Reset token is missing from the URL.')
      return
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long.')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }

    setIsLoading(true)
    try {
      const response = await authApi.resetPassword(token, password)
      setIsSuccess(true)
      toast.success(response.data?.message || 'Password reset successfully!')
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to reset password.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-hero dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex items-center justify-center gap-3 mb-6 group">
          <div className="w-10 h-10 rounded-2xl bg-medical-600 flex items-center justify-center shadow-md shadow-medical-500/20 group-hover:bg-medical-700 transition-colors">
            <Activity size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">MedVision AI</span>
        </Link>
        <h2 className="text-center text-3xl font-extrabold text-slate-900 dark:text-white">
          Reset password
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
          Enter and confirm your new secure password.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 py-8 px-4 shadow-card-lg border border-slate-100 dark:border-slate-800 sm:rounded-3xl sm:px-10"
        >
          {!token ? (
            <div className="text-center space-y-4 py-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-rose-50 dark:bg-rose-950/30 text-rose-600">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Invalid Reset Link</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                The password reset token is missing or has expired. Please request a new link.
              </p>
              <div className="mt-6">
                <Link
                  to="/forgot-password"
                  className="w-full btn-primary btn-md flex justify-center items-center"
                >
                  Request New Link
                </Link>
              </div>
            </div>
          ) : isSuccess ? (
            <div className="text-center space-y-4 py-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-health-50 dark:bg-health-950/30 text-health-600">
                <CheckCircle className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Success!</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Your password has been reset. Redirecting you to sign in...
              </p>
              <div className="mt-6">
                <Link
                  to="/login"
                  className="w-full btn-primary btn-md flex justify-center items-center"
                >
                  Go to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="password" className="block text-xs font-semibold text-slate-400 dark:text-slate-300 uppercase tracking-wider mb-2">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Lock size={16} />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="input pl-11 dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-semibold text-slate-400 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Lock size={16} />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    className="input pl-11 dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn-primary btn-md flex justify-center items-center gap-2"
                >
                  {isLoading ? 'Resetting Password...' : 'Reset Password'}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  )
}
