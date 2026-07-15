import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { Upload, Brain, FileText, Download, History, Search } from 'lucide-react'

const FEATURES = [
  {
    icon: Upload,
    title: 'Drag & Drop Upload',
    description: 'Simple JPEG, PNG, or DICOM medical image upload with real-time preview and instant validation.',
    color: 'medical',
  },
  {
    icon: Brain,
    title: 'AI Analysis Engine',
    description: 'Multi-model CNN pipeline (DenseNet121, ResNet50, EfficientNet-B4) trained on NIH CXR14, MIMIC-CXR, and CheXpert datasets.',
    color: 'health',
  },
  {
    icon: FileText,
    title: 'Radiology-Grade Reports',
    description: 'ACR-compliant structured reports with findings, impressions, differentials, and clinical recommendations.',
    color: 'medical',
  },
  {
    icon: Download,
    title: 'PDF Export',
    description: 'Professional branded PDF reports with structured findings tables, suitable for clinical records and referrals.',
    color: 'health',
  },
  {
    icon: History,
    title: 'Analysis History',
    description: 'Searchable archive of all past analyses with filtering, pagination, and quick re-access.',
    color: 'medical',
  },
  {
    icon: Search,
    title: 'Confidence Scoring',
    description: 'Per-finding confidence scores and an overall diagnostic confidence percentage from the AI ensemble.',
    color: 'health',
  },
]

function FeatureCard({ feature, delay }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
      className="card-hover p-6 group dark:bg-slate-900 dark:border-slate-800"
    >
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-all duration-200 group-hover:scale-110 ${
          feature.color === 'medical'
            ? 'bg-medical-50 border border-medical-100 dark:bg-medical-950/20 dark:border-medical-900/30'
            : 'bg-health-50 border border-health-100 dark:bg-health-950/20 dark:border-health-900/30'
        }`}
      >
        <feature.icon
          size={22}
          strokeWidth={1.8}
          className={feature.color === 'medical' ? 'text-medical-600 dark:text-medical-400' : 'text-health-600 dark:text-health-400'}
        />
      </div>
      <h3 className="text-base font-semibold text-slate-800 dark:text-white mb-2">{feature.title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{feature.description}</p>
    </motion.div>
  )
}

export default function Features() {
  return (
    <section id="features" className="py-24 bg-white dark:bg-slate-950 transition-colors">
      <div className="section-container">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-sm font-semibold text-medical-600 dark:text-medical-400 uppercase tracking-wider"
          >
            Platform Features
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-3 text-4xl font-bold text-slate-900 dark:text-white"
          >
            Everything Radiology Needs
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto"
          >
            A complete AI-assisted diagnostic workflow designed for clinical environments,
            built on the latest medical imaging research.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} delay={i * 0.08} />
          ))}
        </div>
      </div>
    </section>
  )
}

