import { motion } from 'framer-motion'
import clsx from 'clsx'
import { getConfidenceLevel } from '../../utils/formatters'

const colorMap = {
  health:  { bar: 'bg-health-500',  text: 'text-health-700',  bg: 'bg-health-50',  border: 'border-health-200' },
  medical: { bar: 'bg-medical-500', text: 'text-medical-700', bg: 'bg-medical-50', border: 'border-medical-200' },
  amber:   { bar: 'bg-amber-400',   text: 'text-amber-700',   bg: 'bg-amber-50',   border: 'border-amber-200' },
  rose:    { bar: 'bg-rose-400',    text: 'text-rose-700',    bg: 'bg-rose-50',    border: 'border-rose-200' },
}

export default function ConfidenceBar({
  value,
  label = 'Overall Confidence',
  showLabel = true,
  delay = 0,
  size = 'md',
}) {
  const level = getConfidenceLevel(value)
  const colors = colorMap[level.color] || colorMap.medical
  const isLarge = size === 'lg'

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex items-center justify-between mb-2">
          <span className={clsx('font-medium text-slate-600', isLarge ? 'text-sm' : 'text-xs')}>
            {label}
          </span>
          <div className={clsx(
            'flex items-center gap-2 px-2.5 py-0.5 rounded-full border',
            colors.bg, colors.border
          )}>
            <span className={clsx('font-bold', isLarge ? 'text-base' : 'text-sm', colors.text)}>
              {Number(value).toFixed(1)}%
            </span>
            <span className={clsx('text-2xs font-medium', colors.text)}>{level.label}</span>
          </div>
        </div>
      )}
      <div className={clsx('confidence-track', isLarge ? 'h-3' : 'h-2')}>
        <motion.div
          className={clsx('h-full rounded-full', colors.bar)}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(value, 100)}%` }}
          transition={{ duration: 1, delay, ease: [0.34, 1.2, 0.64, 1] }}
        />
      </div>
    </div>
  )
}
