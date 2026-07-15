import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Mail, Activity, AlertCircle } from 'lucide-react'
import { authApi } from '../api/authApi'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) {
      toast.error('Please enter your email address.')
      return
    }

    setIsLoading(true)
    try {
      const response = await authApi.forgotPassword(email)
      setIsSent(true)
      toast.success(response.data?.message || 'Password reset link sent!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send password reset link.')
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
          Reset your password
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
          Enter your email and we'll send you a secure link to reset your password.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 py-8 px-4 shadow-card-lg border border-slate-100 dark:border-slate-800 sm:rounded-3xl sm:px-10"
        >
          {isSent ? (
            <div className="text-center space-y-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-health-50 dark:bg-health-950/30 text-health-600">
                <Mail className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Check your email</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                We've sent a password reset link to <span className="font-semibold text-slate-700 dark:text-slate-300">{email}</span>.
              </p>
              <div className="mt-6">
                <Link
                  to="/login"
                  className="w-full btn-primary btn-md flex justify-center items-center"
                >
                  Return to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-slate-400 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Mail size={16} />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="input pl-11 dark:bg-slate-950 dark:border-slate-800 dark:text-white"
                    placeholder="name@institution.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                  {isLoading ? 'Sending Link...' : 'Send Reset Link'}
                </button>
              </div>

              <div className="flex items-center justify-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-medical-600 hover:text-medical-700 dark:text-medical-400"
                >
                  <ArrowLeft size={16} />
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  )
}
