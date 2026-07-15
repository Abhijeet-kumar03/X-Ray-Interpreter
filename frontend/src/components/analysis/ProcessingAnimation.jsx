import { motion } from 'framer-motion'
import { Activity, Brain, Cpu, Zap } from 'lucide-react'

const STAGES = [
  { icon: Activity, label: 'Loading image data', duration: 800 },
  { icon: Cpu,      label: 'Extracting features (CNN)', duration: 1200 },
  { icon: Brain,    label: 'Running disease classification', duration: 1400 },
  { icon: Zap,      label: 'Generating radiology report', duration: 600 },
]

export default function ProcessingAnimation() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8">
      {/* Pulsing scan animation */}
      <div className="relative w-32 h-32 mb-8">
        {/* Outer rings */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border-2 border-medical-200"
            animate={{ scale: [1, 1.6, 1.6], opacity: [0.6, 0, 0] }}
            transition={{
              duration: 2,
              delay: i * 0.6,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
        ))}
        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-medical-50 border-2 border-medical-200 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            >
              <Activity size={28} className="text-medical-600" />
            </motion.div>
          </div>
        </div>
        {/* Scan line */}
        <div className="absolute inset-4 rounded-full overflow-hidden">
          <motion.div
            className="w-full h-0.5 bg-gradient-to-r from-transparent via-medical-400 to-transparent"
            animate={{ y: [-60, 60, -60] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-slate-800 mb-1">AI Analysis in Progress</h3>
      <p className="text-sm text-slate-400 mb-8 text-center max-w-xs">
        Our multi-model AI pipeline is analyzing your X-ray for diagnostic patterns
      </p>

      {/* Pipeline stages */}
      <div className="w-full max-w-sm space-y-3">
        {STAGES.map((stage, i) => (
          <motion.div
            key={stage.label}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.4, duration: 0.4 }}
            className="flex items-center gap-3"
          >
            <motion.div
              className="w-8 h-8 rounded-lg bg-medical-50 border border-medical-100 flex items-center justify-center shrink-0"
              animate={{ borderColor: ['#BFDBFE', '#2563EB', '#BFDBFE'] }}
              transition={{ duration: 1.5, delay: i * 0.4, repeat: Infinity }}
            >
              <stage.icon size={15} className="text-medical-600" />
            </motion.div>
            <div className="flex-1">
              <p className="text-xs font-medium text-slate-700">{stage.label}</p>
              <motion.div
                className="h-0.5 bg-slate-100 rounded-full mt-1 overflow-hidden"
              >
                <motion.div
                  className="h-full bg-medical-400 rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{
                    delay: i * 0.4 + 0.2,
                    duration: stage.duration / 1000,
                    ease: 'easeInOut',
                  }}
                />
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.4 + stage.duration / 1000 + 0.1 }}
              className="text-health-500 shrink-0"
            >
              ✓
            </motion.div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
