import { motion } from 'framer-motion'
import { AlertTriangle, CheckCircle, Info, Stethoscope } from 'lucide-react'
import clsx from 'clsx'
import Badge from '../ui/Badge'
import ConfidenceBar from './ConfidenceBar'
import { getSeverityConfig, formatConfidence } from '../../utils/formatters'

const severityIconMap = {
  normal:   { icon: CheckCircle, color: 'text-health-500' },
  mild:     { icon: Info,        color: 'text-medical-500' },
  moderate: { icon: AlertTriangle, color: 'text-amber-500' },
  severe:   { icon: AlertTriangle, color: 'text-rose-500' },
}

function FindingRow({ finding, index }) {
  const severity = getSeverityConfig(finding.severity)
  const { icon: Icon, color } = severityIconMap[finding.severity] || severityIconMap.normal

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="border border-slate-100 rounded-xl p-4 hover:border-slate-200 hover:shadow-card transition-all"
    >
      <div className="flex items-start gap-3">
        <div className={clsx('shrink-0 mt-0.5', color)}>
          <Icon size={16} strokeWidth={1.8} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className="text-sm font-semibold text-slate-800">{finding.region}</span>
            <Badge variant={
              finding.severity === 'normal' ? 'green' :
              finding.severity === 'mild' ? 'blue' :
              finding.severity === 'moderate' ? 'amber' : 'rose'
            }>
              {severity.label}
            </Badge>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">{finding.description}</p>
          {finding.confidence != null && (
            <div className="mt-2">
              <ConfidenceBar
                value={finding.confidence}
                label="Finding confidence"
                delay={index * 0.1}
                size="sm"
              />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function FindingsPanel({ analysis }) {
  const { findings = [], impression, recommendations = [], differentialDiagnoses = [] } = analysis

  return (
    <div className="space-y-6">
      {/* Findings */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-medical-600 rounded-full" />
          <h4 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">
            Structured Findings ({findings.length})
          </h4>
        </div>
        <div className="space-y-3">
          {findings.map((finding, i) => (
            <FindingRow key={i} finding={finding} index={i} />
          ))}
        </div>
      </div>

      {/* Impression */}
      {impression && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-5 bg-health-500 rounded-full" />
            <h4 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">Impression</h4>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{impression}</p>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-5 bg-amber-400 rounded-full" />
            <h4 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">
              Recommendations
            </h4>
          </div>
          <div className="space-y-2">
            {recommendations.map((rec, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-xl p-3"
              >
                <span className="text-xs font-bold text-amber-600 shrink-0 mt-0.5 w-5 text-center">
                  {i + 1}
                </span>
                <p className="text-sm text-slate-700 leading-relaxed">{rec}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Differentials */}
      {differentialDiagnoses.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-5 bg-slate-400 rounded-full" />
            <h4 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">
              Differential Diagnoses
            </h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {differentialDiagnoses.map((diag, i) => (
              <Badge key={i} variant="slate">
                {diag}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
