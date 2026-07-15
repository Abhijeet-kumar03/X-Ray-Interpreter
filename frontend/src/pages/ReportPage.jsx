import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, ExternalLink, AlertTriangle, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import ReportViewer from '../components/analysis/ReportViewer'
import { SkeletonCard } from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'
import Button from '../components/ui/Button'
import { reportsApi } from '../api/reportsApi'

export default function ReportPage() {
  const { id } = useParams()
  const [report, setReport] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchReport() {
      setIsLoading(true)
      try {
        const result = await reportsApi.getById(id)
        const reportData = result.data
        setReport(reportData)
        // Analysis is populated inside reportData.analysisId
        if (reportData.analysisId && typeof reportData.analysisId === 'object') {
          setAnalysis(reportData.analysisId)
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }
    fetchReport()
  }, [id])

  if (isLoading) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <SkeletonCard />
        <div className="mt-5"><SkeletonCard /></div>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <EmptyState
          icon={AlertTriangle}
          title="Report not found"
          description="This report may have been deleted or the ID is invalid."
          action={
            <Link to="/history">
              <Button variant="primary" size="md">View History</Button>
            </Link>
          }
        />
      </div>
    )
  }

  const analysisId = analysis?._id || analysis?.id || report.analysisId

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Back nav */}
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <Link
          to={analysisId ? `/analysis/${analysisId}` : '/history'}
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
          id="back-from-report"
        >
          <ArrowLeft size={16} />
          {analysisId ? 'Back to Analysis' : 'Back to History'}
        </Link>
        {analysisId && (
          <Link to={`/analysis/${analysisId}`}>
            <Button
              id="view-analysis-from-report"
              variant="secondary"
              size="sm"
              rightIcon={<ExternalLink size={14} />}
            >
              View Analysis
            </Button>
          </Link>
        )}
      </motion.div>

      <ReportViewer report={report} analysis={analysis} />
    </div>
  )
}
