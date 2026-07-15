import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Activity, Mail, Lock, Eye, EyeOff, User, ArrowRight, Zap, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'

const PERKS = [
  'Instant AI analysis in under 8 seconds',
  'Structured clinical reports with one click',
  'Full history with search and filters',
  'Export to PDF for medical records',
]

export default function SignupPage() {
  const { register, authError } = useAuth()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
  })
  const [showPass, setShowPass]   = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [fieldError, setFieldError] = useState({})

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setFieldError((prev) => ({ ...prev, [name]: '' }))
  }

  function validate() {
    const errors = {}
    if (!form.name.trim())    errors.name    = 'Full name is required'
    if (!form.email.trim())   errors.email   = 'Email is required'
    if (!form.password)       errors.password = 'Password is required'
    else if (form.password.length < 6) errors.password = 'Password must be at least 6 characters'
    if (form.password !== form.confirm) errors.confirm = 'Passwords do not match'
    return errors
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errors = validate()
    if (Object.keys(errors).length) { setFieldError(errors); return }

    setIsLoading(true)
    await register({ name: form.name, email: form.email, password: form.password })
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

        {/* Hero */}
        <div className="relative space-y-6">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Start interpreting<br />images smarter<br />today
          </h1>
          <p className="text-medical-200 text-base leading-relaxed max-w-xs">
            Join radiologists and clinicians who trust our AI-powered platform for faster, more accurate reads.
          </p>

          {/* Perks */}
          <ul className="space-y-3 pt-2">
            {PERKS.map((perk) => (
              <li key={perk} className="flex items-center gap-3">
                <CheckCircle2 size={17} className="text-health-400 shrink-0" />
                <span className="text-medical-100 text-sm">{perk}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-health-400 animate-pulse" />
          <p className="text-medical-200 text-sm">DenseNet121 · ResNet50 · EfficientNet-B4</p>
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
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Create your account</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm leading-relaxed">
              Get started in seconds — no credit card required.
            </p>
          </div>

          {authError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm"
            >
              {authError}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Full name */}
            <div>
              <label htmlFor="signup-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Full name
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  id="signup-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Dr. Jane Smith"
                  className={`auth-input pl-10 dark:bg-slate-950 dark:border-slate-800 dark:text-white ${fieldError.name ? 'border-rose-400 focus:ring-rose-400' : ''}`}
                />
              </div>
              {fieldError.name && <p className="mt-1.5 text-xs text-rose-600">{fieldError.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="signup-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  id="signup-email"
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
              <label htmlFor="signup-password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  id="signup-password"
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
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

            {/* Confirm password */}
            <div>
              <label htmlFor="signup-confirm" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Confirm password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  id="signup-confirm"
                  name="confirm"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={form.confirm}
                  onChange={handleChange}
                  placeholder="Repeat your password"
                  className={`auth-input pl-10 pr-11 dark:bg-slate-950 dark:border-slate-800 dark:text-white ${fieldError.confirm ? 'border-rose-400 focus:ring-rose-400' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldError.confirm && <p className="mt-1.5 text-xs text-rose-600">{fieldError.confirm}</p>}
            </div>

            <Button
              id="signup-submit-button"
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              rightIcon={!isLoading ? <ArrowRight size={18} /> : null}
              className="mt-2"
            >
              {isLoading ? 'Creating account…' : 'Create account'}
            </Button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
            <span className="text-xs text-slate-400 font-medium">Already have one?</span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
          </div>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-medical-600 font-semibold hover:text-medical-700 dark:text-medical-400 transition-colors"
            >
              Sign in instead
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
