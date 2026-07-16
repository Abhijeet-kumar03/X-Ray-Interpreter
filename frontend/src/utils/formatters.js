import { format, formatDistanceToNow, parseISO } from 'date-fns'

export function formatDate(dateStr, fmt = 'MMM d, yyyy') {
  if (!dateStr) return '—'
  try {
    const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr
    return format(date, fmt)
  } catch {
    return '—'
  }
}

export function formatDateTime(dateStr) {
  return formatDate(dateStr, 'MMM d, yyyy · HH:mm')
}

export function formatRelative(dateStr) {
  if (!dateStr) return '—'
  try {
    const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr
    return formatDistanceToNow(date, { addSuffix: true })
  } catch {
    return '—'
  }
}

export function formatFileSize(bytes) {
  if (!bytes) return '—'
  const units = ['B', 'KB', 'MB', 'GB']
  let value = bytes
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit++
  }
  return `${value.toFixed(value < 10 ? 1 : 0)} ${units[unit]}`
}

export function formatProcessingTime(ms) {
  if (!ms) return '—'
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

export function formatConfidence(value) {
  if (value === null || value === undefined) return '—'
  return `${Number(value).toFixed(1)}%`
}

export function getConfidenceLevel(value) {
  if (value >= 90) return { label: 'Very High', color: 'health' }
  if (value >= 75) return { label: 'High', color: 'medical' }
  if (value >= 60) return { label: 'Moderate', color: 'amber' }
  return { label: 'Low', color: 'rose' }
}

export function getSeverityConfig(severity) {
  const map = {
    normal:   { label: 'Normal',   badgeClass: 'badge-green' },
    mild:     { label: 'Mild',     badgeClass: 'badge-blue' },
    moderate: { label: 'Moderate', badgeClass: 'badge-amber' },
    severe:   { label: 'Severe',   badgeClass: 'badge-rose' },
  }
  return map[severity] || map['normal']
}

export function getDiagnosisCategory(diagnosis) {
  if (!diagnosis) return 'unknown'
  const d = diagnosis.toLowerCase()
  if (d.includes('normal') || d.includes('clear')) return 'normal'
  if (d.includes('pneumoni') || d.includes('covid')) return 'infection'
  if (d.includes('cardio') || d.includes('edema')) return 'cardiac'
  if (d.includes('effusion') || d.includes('pneumothorax')) return 'pleural'
  if (d.includes('nodule') || d.includes('mass') || d.includes('tumor')) return 'oncology'
  if (d.includes('fracture')) return 'trauma'
  return 'other'
}

export function truncate(str, maxLength = 80) {
  if (!str) return ''
  return str.length > maxLength ? `${str.slice(0, maxLength)}…` : str
}

export function capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function getImageUrl(imageUrl) {
  if (!imageUrl) return null
  if (imageUrl.startsWith('http') || imageUrl.startsWith('blob:')) return imageUrl
  const baseUploadUrl = import.meta.env.VITE_UPLOAD_URL || (import.meta.env.DEV ? '/uploads' : 'https://xray-interpreterbackend.vercel.app/uploads')
  return `${baseUploadUrl}/${imageUrl}`
}
