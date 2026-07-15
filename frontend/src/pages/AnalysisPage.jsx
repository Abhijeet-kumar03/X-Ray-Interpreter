import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft, FileText, Brain, Cpu, Clock,
  Shield, Image, AlertTriangle, CheckCircle, User
} from 'lucide-react'
import ImageViewer from '../components/viewer/ImageViewer'
import { useAnalysis } from '../hooks/useAnalysis'
import { AnimatedCard, Card, CardHeader, CardTitle } from '../components/ui/Card'
import ConfidenceBar from '../components/analysis/ConfidenceBar'
import FindingsPanel from '../components/analysis/FindingsPanel'
import ReportViewer from '../components/analysis/ReportViewer'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { SkeletonAnalysis } from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'
import {
  formatDateTime,
  formatFileSize,
  formatProcessingTime,
  formatConfidence,
  getImageUrl,
  getSeverityConfig
} from '../utils/formatters'
import { useState } from 'react'

const TABS = [
  { id: 'findings', label: 'Findings', icon: Brain },
  { id: 'report',   label: 'Full Report', icon: FileText },
  { id: 'explanation', label: 'Patient Explanation', icon: User },
]

export default function AnalysisPage() {
  const { id } = useParams()
  const { analysis, report, isLoading, error } = useAnalysis(id)
  const [activeTab, setActiveTab] = useState('findings')

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <SkeletonAnalysis />
      </div>
    )
  }

  if (error || !analysis) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <EmptyState
          icon={AlertTriangle}
          title="Analysis not found"
          description="This analysis may have been deleted or the ID is invalid."
          action={
            <Link to="/dashboard">
              <Button variant="primary" size="md">Go to Dashboard</Button>
            </Link>
          }
        />
      </div>
    )
  }

  const reportData = report || (typeof analysis.reportId === 'object' ? analysis.reportId : null)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Back nav */}
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-6"
      >
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
          id="back-to-dashboard"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Image + meta */}
        <div className="space-y-5">
          {/* Medical Image Viewer */}
          <AnimatedCard delay={0} padding={false} className="overflow-hidden">
            {analysis.imageUrl ? (
              <ImageViewer
                imageUrl={getImageUrl(analysis.imageUrl)}
                findings={analysis.findings}
              />
            ) : (
              <div className="bg-slate-900 w-full h-48 flex items-center justify-center">
                <Image size={40} className="text-slate-600" />
              </div>
            )}
            <div className="p-4 space-y-2 dark:bg-slate-900">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">{analysis.imageName}</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                {[
                  { label: 'Size', value: formatFileSize(analysis.imageSize) },
                  { label: 'Quality', value: analysis.technicalQuality || '—' },
                  { label: 'Date', value: formatDateTime(analysis.createdAt) },
                  { label: 'Patient', value: analysis.patientId || '—' },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="text-2xs text-slate-400">{item.label}</p>
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300 capitalize">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedCard>

          {/* AI result summary */}
          <AnimatedCard delay={0.08}>
            <CardHeader>
              <CardTitle className="text-sm">Diagnosis</CardTitle>
              {analysis.primaryDiagnosis?.toLowerCase().includes('normal') ? (
                <CheckCircle size={16} className="text-health-500" />
              ) : (
                <AlertTriangle size={16} className="text-amber-500" />
              )}
            </CardHeader>

            <p className="text-xl font-bold text-slate-900 mb-4">
              {analysis.primaryDiagnosis}
            </p>

            <ConfidenceBar
              value={analysis.overallConfidence}
              label="Overall Confidence"
              size="lg"
            />

            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3">
              {[
                { label: 'AI Model', value: analysis.model, icon: Cpu },
                { label: 'Proc. Time', value: formatProcessingTime(analysis.processingTime), icon: Clock },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <item.icon size={13} className="text-slate-400 shrink-0" />
                  <div>
                    <p className="text-2xs text-slate-400">{item.label}</p>
                    <p className="text-xs font-semibold text-slate-700">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </AnimatedCard>

          {/* Study info */}
          <AnimatedCard delay={0.12} padding={false}>
            <div className="px-5 py-3 border-b border-slate-100">
              <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-1.5">
                <Shield size={12} className="text-slate-400" />
                Study Information
              </h3>
            </div>
            <div className="divide-y divide-slate-50">
              {[
                { label: 'Study ID',    value: analysis.studyId },
                { label: 'Report ID',   value: reportData?.reportNumber || '—' },
                { label: 'Findings',    value: `${analysis.findings?.length || 0} items` },
                { label: 'Status',      value: analysis.status },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between px-5 py-2.5">
                  <span className="text-xs text-slate-400">{item.label}</span>
                  <span className="text-xs font-semibold text-slate-700 capitalize">{item.value || '—'}</span>
                </div>
              ))}
            </div>
          </AnimatedCard>
        </div>

        {/* Right: Tabs — findings / report */}
        <div className="xl:col-span-2 space-y-5">
          <AnimatedCard delay={0.1}>
            {/* Tabs */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-5">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  id={`tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-150 ${
                    activeTab === tab.id
                      ? 'bg-white text-slate-800 shadow-card'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <tab.icon size={15} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {activeTab === 'findings' ? (
              <FindingsPanel analysis={analysis} />
            ) : activeTab === 'report' ? (
              reportData ? (
                <ReportViewer report={reportData} analysis={analysis} />
              ) : (
                <EmptyState
                  icon={FileText}
                  title="Report not yet generated"
                  description="The full radiology report for this analysis is being prepared."
                />
              )
            ) : (
              <div className="space-y-6">
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
                  <h3 className="text-base font-bold text-slate-800 dark:text-white mb-3">AI Patient Explanation</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {analysis.patientExplanation || 'No patient explanation is available for this analysis.'}
                  </p>
                </div>
                
                {analysis.differentialDiagnoses && analysis.differentialDiagnoses.length > 0 && (
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Understanding the Findings</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                      The AI identified signs that strongly align with {analysis.primaryDiagnosis}. Other potential considerations include:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {analysis.differentialDiagnoses.map((d, i) => (
                        <span key={i} className="px-2 py-1 rounded bg-slate-100 text-slate-700 dark:bg-slate-950 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </AnimatedCard>
        </div>
      </div>
    </div>
  )
}
