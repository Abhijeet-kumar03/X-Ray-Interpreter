import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FileText, Eye, Trash2, AlertTriangle, Image } from 'lucide-react'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import { formatRelative, formatConfidence, formatFileSize, getDiagnosisCategory, getImageUrl } from '../../utils/formatters'
import clsx from 'clsx'

const categoryColorMap = {
  normal:    'green',
  infection: 'amber',
  cardiac:   'rose',
  pleural:   'amber',
  oncology:  'rose',
  trauma:    'amber',
  other:     'slate',
}

export default function ReportCard({ analysis, onDelete, index = 0 }) {
  const category = getDiagnosisCategory(analysis.primaryDiagnosis)
  const badgeVariant = categoryColorMap[category] || 'slate'
  const analysisId = analysis._id || analysis.id
  const reportId = analysis.reportId?._id || analysis.reportId
  const isCritical = analysis.reportId?.criticalFindings

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="card-hover group"
    >
      <div className="flex items-start gap-4 p-5">
        {/* X-ray thumbnail */}
        <div className="w-16 h-16 rounded-xl bg-slate-900 overflow-hidden shrink-0 border border-slate-200">
          {analysis.imageUrl ? (
            <img
              src={getImageUrl(analysis.imageUrl)}
              alt="X-ray thumbnail"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'flex'
              }}
            />
          ) : null}
          <div className="hidden w-full h-full items-center justify-center bg-slate-800">
            <Image size={20} className="text-slate-500" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-semibold text-slate-800 truncate">
                  {analysis.primaryDiagnosis || 'Analysis Pending'}
                </h3>
                {isCritical && (
                  <span className="flex items-center gap-1 text-2xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded-full">
                    <AlertTriangle size={10} />
                    Critical
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge variant={badgeVariant}>{analysis.primaryDiagnosis?.split(' ')[0] || '—'}</Badge>
                <span className="text-2xs text-slate-400">{formatRelative(analysis.createdAt)}</span>
                {analysis.overallConfidence && (
                  <>
                    <span className="text-2xs text-slate-300">·</span>
                    <span className="text-2xs text-slate-400">
                      {formatConfidence(analysis.overallConfidence)} confidence
                    </span>
                  </>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1.5 truncate">
                {analysis.imageName} &nbsp;·&nbsp; {analysis.model}
                {analysis.patientId && ` · ${analysis.patientId}`}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
              {reportId && (
                <Link to={`/report/${reportId}`}>
                  <Button
                    id={`view-report-${analysisId}`}
                    variant="ghost"
                    size="sm"
                    leftIcon={<FileText size={14} />}
                    className="text-xs"
                  >
                    Report
                  </Button>
                </Link>
              )}
              <Link to={`/analysis/${analysisId}`}>
                <Button
                  id={`view-analysis-${analysisId}`}
                  variant="ghost"
                  size="sm"
                  leftIcon={<Eye size={14} />}
                  className="text-xs"
                >
                  View
                </Button>
              </Link>
              <button
                id={`delete-analysis-${analysisId}`}
                onClick={() => onDelete(analysisId)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
