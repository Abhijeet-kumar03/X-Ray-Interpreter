import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  UploadCloud, Brain, FileText, History,
  TrendingUp, Clock, CheckCircle, AlertCircle
} from 'lucide-react'
import UploadZone from '../components/dashboard/UploadZone'
import ImagePreview from '../components/dashboard/ImagePreview'
import AnalysisControls from '../components/dashboard/AnalysisControls'
import { AnimatedCard, CardHeader, CardTitle } from '../components/ui/Card'
import { useUpload } from '../hooks/useUpload'
import useAppStore from '../store/appStore'
import { formatRelative, formatConfidence } from '../utils/formatters'
import { analysisApi } from '../api/analysisApi'

export default function DashboardPage() {
  const { selectedFile, previewUrl, selectFile, clearFile, analyze } = useUpload()
  const { isAnalyzing, uploadProgress, analyses, setAnalyses } = useAppStore()

  const [stats, setStats] = useState(null)
  const [isLoadingStats, setIsLoadingStats] = useState(true)

  useEffect(() => {
    // Load stats
    setIsLoadingStats(true)
    analysisApi.getStats()
      .then((res) => {
        if (res?.data) {
          setStats(res.data)
        }
      })
      .catch((err) => console.error('Failed to load stats:', err))
      .finally(() => setIsLoadingStats(false))

    // Load recent analyses list to keep store updated
    analysisApi.list({ limit: 10 })
      .then((res) => {
        if (res?.data) {
          setAnalyses(res.data)
        }
      })
      .catch((err) => console.error('Failed to load analyses:', err))
  }, [setAnalyses])

  const recentAnalyses = analyses.slice(0, 3)

  // Configure dynamic statistics cards
  const quickStats = [
    {
      label: 'Total Reports',
      value: stats ? stats.total : '0',
      icon: FileText,
      color: 'text-medical-600 dark:text-medical-400',
      bg: 'bg-medical-50 dark:bg-medical-950/20 border border-medical-100 dark:border-medical-900/35'
    },
    {
      label: 'Analyzed This Week',
      value: stats ? stats.thisWeek : '0',
      icon: Clock,
      color: 'text-health-600 dark:text-health-400',
      bg: 'bg-health-50 dark:bg-health-950/20 border border-health-100 dark:border-health-900/35'
    },
    {
      label: 'Critical Findings',
      value: stats ? stats.criticalCount : '0',
      icon: AlertCircle,
      color: stats?.criticalCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400',
      bg: stats?.criticalCount > 0
        ? 'bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/35'
        : 'bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60'
    },
    {
      label: 'Accuracy Rate',
      value: '94.2%',
      icon: TrendingUp,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/35'
    },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">AI Medical Image Analysis</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
          Upload a medical scan to receive an AI-generated radiology report in seconds.
        </p>
      </motion.div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {quickStats.map((stat, i) => (
          <AnimatedCard key={stat.label} delay={i * 0.06} padding={false} className="dark:bg-slate-900 dark:border-slate-800">
            <div className="flex items-center gap-4 p-4">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
                <stat.icon size={18} className={stat.color} />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-800 dark:text-white">
                  {isLoadingStats ? '...' : stat.value}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{stat.label}</p>
              </div>
            </div>
          </AnimatedCard>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload + Controls — left 2/3 */}
        <div className="lg:col-span-2 space-y-5">
          <AnimatedCard delay={0.1} className="dark:bg-slate-900 dark:border-slate-800">
            <CardHeader className="dark:border-slate-800">
              <CardTitle className="flex items-center gap-2 dark:text-white">
                <UploadCloud size={18} className="text-medical-500" />
                Upload Diagnostic Scan
              </CardTitle>
              {selectedFile && (
                <button
                  onClick={clearFile}
                  className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-650 dark:hover:text-slate-350 transition-colors"
                  id="clear-file-button"
                >
                  Clear
                </button>
              )}
            </CardHeader>

            <UploadZone
              onFileSelect={selectFile}
              selectedFile={selectedFile}
              isAnalyzing={isAnalyzing}
            />

            {previewUrl && (
              <div className="mt-4">
                <ImagePreview previewUrl={previewUrl} fileName={selectedFile?.name} />
              </div>
            )}
          </AnimatedCard>

          {/* Analysis tips */}
          <AnimatedCard delay={0.18} padding={false} className="dark:bg-slate-900 dark:border-slate-800">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Best Practices</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
              {[
                { icon: CheckCircle, text: 'Use standard PA / AP projections where applicable', color: 'text-health-500' },
                { icon: CheckCircle, text: 'Ensure image is sharp and well-exposed', color: 'text-health-500' },
                { icon: AlertCircle, text: 'AI is supplementary — always verify clinically', color: 'text-amber-500' },
                { icon: AlertCircle, text: 'Not for emergency or ICU decisions alone', color: 'text-amber-500' },
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-2.5 px-5 py-3 border-b border-r border-slate-50 dark:border-slate-800/50 last:border-b-0">
                  <tip.icon size={14} className={`${tip.color} shrink-0 mt-0.5`} />
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{tip.text}</p>
                </div>
              ))}
            </div>
          </AnimatedCard>
        </div>

        {/* Analysis controls + recent — right 1/3 */}
        <div className="space-y-5">
          <AnimatedCard delay={0.15} className="dark:bg-slate-900 dark:border-slate-800">
            <CardHeader className="dark:border-slate-800">
              <CardTitle className="flex items-center gap-2 dark:text-white">
                <Brain size={18} className="text-medical-500" />
                Analysis Settings
              </CardTitle>
            </CardHeader>
            <AnalysisControls
              onAnalyze={analyze}
              isAnalyzing={isAnalyzing}
              uploadProgress={uploadProgress}
              hasFile={!!selectedFile}
            />
          </AnimatedCard>

          {/* Recent analyses */}
          {recentAnalyses.length > 0 && (
            <AnimatedCard delay={0.2} padding={false} className="dark:bg-slate-900 dark:border-slate-800">
              <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                  <History size={15} className="text-slate-400 dark:text-slate-500" />
                  Recent Analyses
                </h3>
                <Link to="/history" className="text-xs text-medical-600 dark:text-medical-455 hover:text-medical-700 font-medium">
                  View all
                </Link>
              </div>
              <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {recentAnalyses.map((a) => (
                  <Link
                    key={a._id || a.id}
                    to={`/analysis/${a._id || a.id}`}
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-850/20 transition-colors"
                  >
                    <div className="w-2 h-2 rounded-full bg-health-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-205 truncate">
                        {a.primaryDiagnosis}
                      </p>
                      <p className="text-2xs text-slate-400 dark:text-slate-500 mt-0.5">{formatRelative(a.createdAt)}</p>
                    </div>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 shrink-0">
                      {formatConfidence(a.overallConfidence)}
                    </span>
                  </Link>
                ))}
              </div>
            </AnimatedCard>
          )}
        </div>
      </div>
    </div>
  )
}
