import clsx from 'clsx'

const variantMap = {
  blue:    'badge-blue',
  green:   'badge-green',
  amber:   'badge-amber',
  rose:    'badge-rose',
  slate:   'badge-slate',
}

export default function Badge({ children, variant = 'slate', className, dot = false, ...props }) {
  return (
    <span className={clsx(variantMap[variant] || variantMap.slate, className)} {...props}>
      {dot && (
        <span
          className={clsx(
            'w-1.5 h-1.5 rounded-full shrink-0',
            variant === 'green' && 'bg-health-500',
            variant === 'blue'  && 'bg-medical-500',
            variant === 'amber' && 'bg-amber-500',
            variant === 'rose'  && 'bg-rose-500',
            variant === 'slate' && 'bg-slate-400',
          )}
        />
      )}
      {children}
    </span>
  )
}
