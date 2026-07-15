import clsx from 'clsx'
import { motion } from 'framer-motion'

export function Card({ children, className, hover = false, interactive = false, padding = true, ...props }) {
  const base = interactive ? 'card-interactive' : hover ? 'card-hover' : 'card'
  return (
    <div className={clsx(base, padding && 'p-6', className)} {...props}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className, ...props }) {
  return (
    <div className={clsx('flex items-center justify-between mb-4', className)} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className, ...props }) {
  return (
    <h3 className={clsx('text-base font-semibold text-slate-800', className)} {...props}>
      {children}
    </h3>
  )
}

export function CardBody({ children, className, ...props }) {
  return (
    <div className={clsx('text-slate-600', className)} {...props}>
      {children}
    </div>
  )
}

export function AnimatedCard({ children, className, delay = 0, hover = false, interactive = false, padding = true, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: 'easeOut' }}
      className={clsx(
        interactive ? 'card-interactive' : hover ? 'card-hover' : 'card',
        padding && 'p-6',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  )
}
