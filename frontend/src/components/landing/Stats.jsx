import { motion, useInView } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'

const STATS = [
  { value: 112120, label: 'Chest X-rays in Training Dataset', suffix: '+' },
  { value: 16, label: 'Disease Categories Detected', suffix: '' },
  { value: 94.2, label: 'Average Diagnostic Accuracy', suffix: '%', isFloat: true },
  { value: 2.3, label: 'Seconds Average Analysis Time', suffix: 's', isFloat: true },
]

function AnimatedNumber({ target, suffix, isFloat, inView }) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (!inView) return
    const duration = 2000
    const steps = 60
    const increment = target / steps
    let step = 0
    const timer = setInterval(() => {
      step++
      setCurrent(Math.min(increment * step, target))
      if (step >= steps) clearInterval(timer)
    }, duration / steps)
    return () => clearInterval(timer)
  }, [inView, target])

  const display = isFloat ? current.toFixed(1) : Math.round(current).toLocaleString()
  return <span>{display}{suffix}</span>
}

export default function Stats() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="py-20 bg-gradient-to-br from-medical-900 to-medical-800 overflow-hidden relative">
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-medical-700/30 blur-3xl translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-health-900/30 blur-2xl -translate-x-1/2 translate-y-1/2" />

      <div className="section-container relative">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-white mb-3"
          >
            Backed by Clinical Research
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-medical-200 text-lg"
          >
            Trained on the world's largest open-source chest X-ray datasets
          </motion.p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl lg:text-5xl font-bold text-white mb-2">
                <AnimatedNumber
                  target={stat.value}
                  suffix={stat.suffix}
                  isFloat={stat.isFloat}
                  inView={isInView}
                />
              </div>
              <p className="text-medical-300 text-sm leading-snug">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {[
            { name: 'NIH Chest X-ray 14', count: '112,120 images' },
            { name: 'MIMIC-CXR', count: '227,827 images' },
            { name: 'Stanford CheXpert', count: '224,316 images' },
          ].map((ds) => (
            <div key={ds.name} className="rounded-2xl bg-white/5 border border-white/10 px-5 py-4 backdrop-blur-sm">
              <p className="text-white font-semibold text-sm">{ds.name}</p>
              <p className="text-medical-300 text-xs mt-0.5">{ds.count}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
