import clsx from 'clsx'

export function Skeleton({ className, ...props }) {
  return <div className={clsx('skeleton', className)} {...props} />
}

export function SkeletonText({ lines = 3, className }) {
  return (
    <div className={clsx('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={clsx('h-4', i === lines - 1 ? 'w-3/4' : 'w-full')}
        />
      ))}
    </div>
  )
}

export function SkeletonCard({ className }) {
  return (
    <div className={clsx('card p-6 space-y-4', className)}>
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <SkeletonText lines={4} />
    </div>
  )
}

export function SkeletonAnalysis() {
  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex gap-6">
          <Skeleton className="w-48 h-48 rounded-xl shrink-0" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-2 w-full rounded-full" />
            <SkeletonText lines={3} />
          </div>
        </div>
      </div>
      <SkeletonCard />
      <SkeletonCard />
    </div>
  )
}
