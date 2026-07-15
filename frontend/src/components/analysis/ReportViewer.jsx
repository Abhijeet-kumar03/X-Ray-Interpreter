import { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, Printer, AlertTriangle, FileText, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import { formatDate, formatDateTime, formatProcessingTime, formatConfidence } from '../../utils/formatters'
import { exportReportToPDF } from '../../utils/pdfExport'
import { reportsApi } from '../../api/reportsApi'

export default function ReportViewer({ report, analysis }) {
  const [isExporting, setIsExporting] = useState(false)

  if (!report) return null

  async function handlePDFExport() {
    setIsExporting(true)
    try {
      await reportsApi.trackDownload(report._id || report.id)
      const filename = await exportReportToPDF(report, analysis)
      toast.success(`Report exported: ${filename}`)
    } catch (err) {
      toast.error('Export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  function handlePrint() {
    window.print()
  }

  const reportId = report._id || report.id
  const institution = report.institution || 'MedVision AI Diagnostic Center'
  const reportNumber = report.reportNumber || '—'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      {/* Actions bar */}
      <div className="flex items-center gap-3 no-print">
        <Button
          id="export-pdf-button"
          onClick={handlePDFExport}
          isLoading={isExporting}
          variant="primary"
          size="sm"
          leftIcon={<Download size={15} />}
        >
          Export PDF
        </Button>
        <Button
          id="print-report-button"
          onClick={handlePrint}
          variant="secondary"
          size="sm"
          leftIcon={<Printer size={15} />}
        >
          Print
        </Button>

        {report.criticalFindings && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold ml-auto">
            <AlertTriangle size={14} />
            Critical Finding
          </div>
        )}
      </div>

      {/* Medical report document */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden print-card">
        {/* Report header */}
        <div className="bg-medical-700 px-6 py-5 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-medical-200 uppercase tracking-widest mb-1">
                Radiology Report
              </p>
              <h2 className="text-xl font-bold">MedVision AI</h2>
              <p className="text-medical-200 text-sm mt-0.5">{institution}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 justify-end">
                <Shield size={14} className="text-medical-300" />
                <span className="text-xs text-medical-300">CONFIDENTIAL</span>
              </div>
              <p className="text-xs text-medical-200 mt-2">Report No.</p>
              <p className="text-sm font-mono font-bold">{reportNumber}</p>
            </div>
          </div>
        </div>

        {/* Report metadata grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border-b border-slate-100">
          {[
            { label: 'Patient ID',    value: analysis?.patientId || '—' },
            { label: 'Study ID',      value: analysis?.studyId || '—' },
            { label: 'Date & Time',   value: formatDateTime(report.createdAt) },
            { label: 'AI Model',      value: analysis?.model || '—' },
            { label: 'Projection',    value: analysis?.projectionType || 'PA' },
            { label: 'Image Quality', value: analysis?.technicalQuality || '—' },
            { label: 'Proc. Time',    value: formatProcessingTime(analysis?.processingTime) },
            { label: 'Status',        value: report.status || 'finalized' },
          ].map((item, i) => (
            <div key={item.label} className="px-4 py-3 border-b border-r border-slate-100 last:border-r-0">
              <p className="text-2xs text-slate-400 uppercase tracking-wide font-medium">{item.label}</p>
              <p className="text-sm font-semibold text-slate-800 mt-0.5 truncate capitalize">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Primary diagnosis & confidence */}
        {analysis && (
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-0.5">Primary Diagnosis</p>
                <p className="text-lg font-bold text-slate-900">{analysis.primaryDiagnosis}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-0.5">Overall Confidence</p>
                <p className="text-2xl font-bold text-medical-700">{formatConfidence(analysis.overallConfidence)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Report body */}
        <div className="px-6 py-5 space-y-6">
          {/* Technique */}
          <section>
            <h4 className="text-xs font-bold text-medical-700 uppercase tracking-widest border-b-2 border-medical-100 pb-1.5 mb-3">
              Technique
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed">
              {report.technique || 'Single PA view of the chest obtained in the upright position. Technical quality is diagnostic.'}
            </p>
          </section>

          {/* Findings */}
          <section>
            <h4 className="text-xs font-bold text-medical-700 uppercase tracking-widest border-b-2 border-medical-100 pb-1.5 mb-3">
              Findings
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-serif">
              {report.findings}
            </p>
          </section>

          {/* Impression */}
          <section>
            <h4 className="text-xs font-bold text-medical-700 uppercase tracking-widest border-b-2 border-medical-100 pb-1.5 mb-3">
              Impression
            </h4>
            <div className="bg-slate-50 rounded-xl p-4 border-l-4 border-medical-400">
              <p className="text-sm text-slate-800 font-medium leading-relaxed whitespace-pre-wrap">
                {report.impression}
              </p>
            </div>
          </section>

          {/* Recommendations */}
          {report.recommendations && (
            <section>
              <h4 className="text-xs font-bold text-medical-700 uppercase tracking-widest border-b-2 border-medical-100 pb-1.5 mb-3">
                Recommendations
              </h4>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {report.recommendations}
              </p>
            </section>
          )}

          {/* Critical findings note */}
          {report.criticalFindings && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 flex items-start gap-3">
              <AlertTriangle size={16} className="text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-rose-800">Critical Finding</p>
                <p className="text-xs text-rose-700 mt-0.5">
                  {report.criticalFindingsNote || 'Urgent clinical correlation required. Please contact the responsible clinician immediately.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Disclaimer footer */}
        <div className="px-6 py-4 bg-amber-50 border-t border-amber-100">
          <p className="text-2xs text-amber-750 dark:text-amber-400 leading-relaxed">
            <strong>Disclaimer:</strong> This report is generated by an AI-assisted diagnostic platform (MedVision AI).
            It is intended for use by qualified healthcare professionals only and does not replace clinical judgment,
            physical examination, or consultation with a board-certified radiologist. All AI-generated findings require
            clinical correlation. Not for standalone clinical decision-making.
          </p>
        </div>
      </div>
    </motion.div>
  )
}
