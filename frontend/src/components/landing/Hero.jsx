import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Shield, Zap, CheckCircle2, Activity } from 'lucide-react'

const TRUST_BADGES = [
  'NIH Dataset Trained',
  'HIPAA Compliant Architecture',
  'ISO 13485 Compatible',
  'ACR Reporting Standards',
]

export default function Hero() {
  return (
    <section className="relative bg-gradient-hero overflow-hidden">
      {/* Subtle background grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cpath d='M 60 0 L 0 0 0 60' fill='none' stroke='%231D4ED8' stroke-width='1'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="section-container relative py-24 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-medical-50 border border-medical-100 text-medical-700 text-sm font-medium mb-8"
          >
            <div className="w-2 h-2 rounded-full bg-health-500 animate-pulse" />
            Powered by DenseNet121 · ResNet50 · EfficientNet-B4
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight"
          >
            AI-Powered{' '}
            <span className="text-gradient-medical">Medical Image Interpretation</span>
            {' '}for Modern Radiology
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Instant AI-assisted medical image analysis with radiology-grade reports,
            confidence scoring, and clinical recommendations — in seconds.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14"
          >
            <Link
              to="/dashboard"
              className="btn-primary btn-xl gap-2 shadow-lg hover:shadow-xl"
              id="hero-cta-dashboard"
            >
              Start Analysis
              <ArrowRight size={20} />
            </Link>
            <a
              href="#features"
              className="btn-secondary btn-xl"
              id="hero-cta-features"
            >
              See How It Works
            </a>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            {TRUST_BADGES.map((badge) => (
              <div key={badge} className="flex items-center gap-1.5 text-sm text-slate-400">
                <CheckCircle2 size={14} className="text-health-500 shrink-0" />
                {badge}
              </div>
            ))}
          </motion.div>
        </div>

        {/* Hero visual */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-16 max-w-5xl mx-auto"
        >
          <div className="relative rounded-3xl overflow-hidden shadow-card-xl border border-slate-200/60 bg-slate-900">
            {/* Mock dashboard UI */}
            <div className="bg-slate-800 px-4 py-3 flex items-center gap-2 border-b border-slate-700">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-health-500" />
              </div>
              <div className="flex-1 mx-4 h-5 rounded-md bg-slate-700 flex items-center px-3">
                <span className="text-slate-400 text-xs">medvision-ai.com/dashboard</span>
              </div>
            </div>
            <div className="bg-slate-50 p-6 grid grid-cols-3 gap-4 min-h-[280px]">
              {/* Left: upload zone mock */}
              <div className="col-span-1 bg-white rounded-2xl border-2 border-dashed border-medical-200 flex flex-col items-center justify-center p-6 gap-3">
                <div className="w-12 h-12 rounded-xl bg-medical-50 flex items-center justify-center">
                  <Activity size={22} className="text-medical-500" />
                </div>
                <div className="text-center">
                  <div className="h-3 bg-slate-200 rounded w-24 mx-auto mb-1.5" />
                  <div className="h-2 bg-slate-100 rounded w-16 mx-auto" />
                </div>
              </div>
              {/* Middle: analysis result mock */}
              <div className="col-span-2 space-y-3">
                <div className="bg-white rounded-2xl p-4 shadow-card">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-health-50 flex items-center justify-center">
                      <Zap size={14} className="text-health-600" />
                    </div>
                    <div>
                      <div className="h-3 bg-health-100 rounded w-32 mb-1" />
                      <div className="h-2 bg-slate-100 rounded w-20" />
                    </div>
                    <div className="ml-auto">
                      <div className="h-5 w-16 bg-health-50 border border-health-200 rounded-full" />
                    </div>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full w-full mb-2">
                    <div className="h-2 bg-medical-500 rounded-full" style={{ width: '87%' }} />
                  </div>
                  <div className="space-y-1.5">
                    {[90, 75, 60].map((w) => (
                      <div key={w} className="h-2 bg-slate-100 rounded" style={{ width: `${w}%` }} />
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Confidence', val: '94.2%', color: 'bg-health-500' },
                    { label: 'Findings', val: '4 items', color: 'bg-medical-500' },
                    { label: 'Model', val: 'DenseNet', color: 'bg-amber-400' },
                    { label: 'Time', val: '2.1s', color: 'bg-slate-400' },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-white rounded-xl p-3 shadow-card">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${stat.color}`} />
                        <span className="text-xs text-slate-400">{stat.label}</span>
                      </div>
                      <p className="text-sm font-semibold text-slate-800 mt-1">{stat.val}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
