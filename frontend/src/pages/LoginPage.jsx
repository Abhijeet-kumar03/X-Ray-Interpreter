import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Activity, Mail, Lock, Eye, EyeOff, ArrowRight, Zap } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'

export default function LoginPage() {
  const { login, authError } = useAuth()
  const location = useLocation()

  const [form, setForm]       = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [fieldError, setFieldError] = useState({})

  const from = location.state?.from?.pathname || '/dashboard'

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setFieldError((prev) => ({ ...prev, [name]: '' }))
  }

  function validate() {
    const errors = {}
    if (!form.email.trim())    errors.email    = 'Email is required'
    if (!form.password.trim()) errors.password = 'Password is required'
    return errors
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errors = validate()
    if (Object.keys(errors).length) { setFieldError(errors); return }

    setIsLoading(true)
    await login({ email: form.email, password: form.password })
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-cream dark:bg-slate-950 flex transition-colors duration-200">
      {/* ── Left Panel — Branding ─────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="hidden lg:flex flex-col justify-between w-[42%] bg-gradient-to-br from-medical-700 via-medical-600 to-medical-800 p-12 relative overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-0 -left-16 w-80 h-80 rounded-full bg-medical-900/30 blur-2xl" />
        </div>

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur-sm border border-white/20">
            <Activity size={22} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-tight">MedVision AI</p>
            <div className="flex items-center gap-1.5">
              <Zap size={10} className="text-medical-200" />
              <p className="text-medical-200 text-xs font-semibold uppercase tracking-widest">Diagnostic Platform</p>
            </div>
          </div>
        </div>

        {/* Hero text */}
        <div className="relative space-y-6">
          <h1 className="text-4xl font-bold text-white leading-tight">
            AI-powered<br />radiology at<br />your fingertips
          </h1>
          <p className="text-medical-200 text-base leading-relaxed max-w-xs">
            Analyze chest X-rays with clinical-grade AI. Get structured reports in seconds, not hours.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-2">
            {[
              { value: '98.4%', label: 'Accuracy' },
              { value: '<8s', label: 'Per scan' },
              { value: '3 Models', label: 'AI engines' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/15">
                <p className="text-white font-bold text-xl">{stat.value}</p>
                <p className="text-medical-200 text-xs mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom badge */}
        <div className="relative flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-health-400 animate-pulse" />
          <p className="text-medical-200 text-sm">
            DenseNet121 · ResNet50 · EfficientNet-B4
          </p>
        </div>
      </motion.div>

      {/* ── Right Panel — Form ────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-medical-600 flex items-center justify-center">
              <Activity size={20} className="text-white" />
            </div>
            <p className="font-bold text-slate-800 dark:text-white">MedVision AI</p>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Welcome back</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm leading-relaxed">
              Sign in to your account to continue your diagnostic workflow.
            </p>
          </div>

          {/* Error from server */}
          {authError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm"
            >
              {authError}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Email */}
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@hospital.com"
                  className={`auth-input pl-10 dark:bg-slate-950 dark:border-slate-800 dark:text-white ${fieldError.email ? 'border-rose-400 focus:ring-rose-400' : ''}`}
                />
              </div>
              {fieldError.email && <p className="mt-1.5 text-xs text-rose-600">{fieldError.email}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-medical-600 hover:text-medical-700 dark:text-medical-400"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  id="login-password"
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={`auth-input pl-10 pr-11 dark:bg-slate-950 dark:border-slate-800 dark:text-white ${fieldError.password ? 'border-rose-400 focus:ring-rose-400' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldError.password && <p className="mt-1.5 text-xs text-rose-600">{fieldError.password}</p>}
            </div>

            {/* Submit */}
            <Button
              id="login-submit-button"
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              rightIcon={!isLoading ? <ArrowRight size={18} /> : null}
              className="mt-2"
            >
              {isLoading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
            <span className="text-xs text-slate-400 font-medium">New here?</span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
          </div>

          {/* Sign up link */}
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            Don&apos;t have an account?{' '}
            <Link
              to="/signup"
              className="text-medical-600 font-semibold hover:text-medical-700 dark:text-medical-400 transition-colors"
            >
              Create one — it&apos;s free
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
