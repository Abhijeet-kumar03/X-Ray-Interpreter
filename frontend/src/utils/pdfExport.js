import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatDate, formatDateTime, formatConfidence, formatProcessingTime } from './formatters'

const BRAND_BLUE  = [37, 99, 235]    // medical-600
const BRAND_GREEN = [22, 163, 74]    // health-600
const SLATE_800   = [30, 41, 59]
const SLATE_600   = [71, 85, 105]
const SLATE_400   = [148, 163, 184]
const SLATE_100   = [241, 245, 249]
const WHITE       = [255, 255, 255]
const ROSE_600    = [225, 29, 72]

/**
 * Generate a professional PDF radiology report
 * @param {Object} report - Report object from API
 * @param {Object} analysis - Analysis object from API
 */
export async function exportReportToPDF(report, analysis) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 18
  const contentW = pageW - margin * 2
  let y = 0

  // ── Header Band ────────────────────────────────────────────
  doc.setFillColor(...BRAND_BLUE)
  doc.rect(0, 0, pageW, 28, 'F')

  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...WHITE)
  doc.text('MEDVISION AI PLATFORM', margin, 12)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('AI-Assisted Radiology Report  •  Diagnostic Imaging Division', margin, 19)
  doc.setFontSize(8)
  doc.text('CONFIDENTIAL MEDICAL RECORD — For authorized use only', pageW - margin, 19, { align: 'right' })

  // ── Green accent bar ───────────────────────────────────────
  doc.setFillColor(...BRAND_GREEN)
  doc.rect(0, 28, pageW, 2.5, 'F')

  y = 40

  // ── Report Header Info ─────────────────────────────────────
  const reportNumber = report.reportNumber || '—'
  const studyId      = analysis?.studyId    || '—'
  const patientId    = analysis?.patientId  || '—'
  const reportDate   = formatDateTime(report.createdAt)
  const model        = analysis?.model      || '—'
  const diagnosis    = analysis?.primaryDiagnosis || '—'
  const confidence   = formatConfidence(analysis?.overallConfidence)

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')

  const col1x = margin
  const col2x = pageW / 2 + 5
  const lineH = 6

  const infoRows = [
    ['Report Number:',  reportNumber,    'Study ID:',     studyId],
    ['Patient ID:',     patientId,       'Date & Time:',  reportDate],
    ['AI Model:',       model,           'Projection:',   analysis?.projectionType || 'PA'],
    ['Diagnosis:',      diagnosis,       'Confidence:',   confidence],
  ]

  doc.setFillColor(...SLATE_100)
  doc.roundedRect(margin, y - 4, contentW, infoRows.length * lineH + 8, 2, 2, 'F')

  infoRows.forEach((row, i) => {
    const rowY = y + i * lineH
    doc.setTextColor(...SLATE_400)
    doc.setFont('helvetica', 'normal')
    doc.text(row[0], col1x + 4, rowY)
    doc.setTextColor(...SLATE_800)
    doc.setFont('helvetica', 'bold')
    doc.text(row[1], col1x + 40, rowY)

    doc.setTextColor(...SLATE_400)
    doc.setFont('helvetica', 'normal')
    doc.text(row[2], col2x, rowY)
    doc.setTextColor(...SLATE_800)
    doc.setFont('helvetica', 'bold')
    doc.text(row[3], col2x + 36, rowY)
  })

  y += infoRows.length * lineH + 12

  // ── Critical Finding Banner ────────────────────────────────
  if (report.criticalFindings) {
    doc.setFillColor(...ROSE_600)
    doc.roundedRect(margin, y, contentW, 10, 2, 2, 'F')
    doc.setTextColor(...WHITE)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.text('⚠  CRITICAL FINDING — Urgent clinical correlation required', pageW / 2, y + 6.5, { align: 'center' })
    y += 18
  }

  // ── Section helper ─────────────────────────────────────────
  function addSection(title, body) {
    // Check page break
    if (y + 30 > pageH - 20) {
      doc.addPage()
      y = 20
    }

    doc.setFillColor(...BRAND_BLUE)
    doc.rect(margin, y, 3, 7, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(...SLATE_800)
    doc.text(title, margin + 6, y + 5.5)
    y += 12

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...SLATE_600)

    const lines = doc.splitTextToSize(body, contentW)
    lines.forEach((line) => {
      if (y + 6 > pageH - 20) {
        doc.addPage()
        y = 20
      }
      doc.text(line, margin, y)
      y += 5.5
    })
    y += 6
  }

  // ── Technique ─────────────────────────────────────────────
  addSection('TECHNIQUE', report.technique || 'Single PA view of the chest obtained in the upright position.')

  // ── Findings ──────────────────────────────────────────────
  addSection('FINDINGS', report.findings || '—')

  // ── Impression ────────────────────────────────────────────
  addSection('IMPRESSION', report.impression || '—')

  // ── Recommendations ───────────────────────────────────────
  if (report.recommendations) {
    addSection('RECOMMENDATIONS', report.recommendations)
  }

  // ── Findings Table ────────────────────────────────────────
  if (analysis?.findings?.length > 0) {
    if (y + 40 > pageH - 20) { doc.addPage(); y = 20 }

    doc.setFillColor(...BRAND_BLUE)
    doc.rect(margin, y, 3, 7, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(...SLATE_800)
    doc.text('STRUCTURED FINDINGS', margin + 6, y + 5.5)
    y += 12

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [['Region', 'Description', 'Severity', 'Confidence']],
      body: analysis.findings.map((f) => [
        f.region,
        f.description,
        (f.severity || 'normal').toUpperCase(),
        formatConfidence(f.confidence),
      ]),
      styles: {
        font: 'helvetica',
        fontSize: 8,
        cellPadding: 3,
        textColor: [...SLATE_800],
      },
      headStyles: {
        fillColor: [...BRAND_BLUE],
        textColor: [...WHITE],
        fontStyle: 'bold',
        fontSize: 8.5,
      },
      alternateRowStyles: { fillColor: [...SLATE_100] },
      columnStyles: {
        0: { cellWidth: 36, fontStyle: 'bold' },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 22, halign: 'center' },
        3: { cellWidth: 24, halign: 'center' },
      },
    })
    y = doc.lastAutoTable.finalY + 10
  }

  // ── Differential Diagnoses ────────────────────────────────
  if (analysis?.differentialDiagnoses?.length > 0) {
    addSection(
      'DIFFERENTIAL DIAGNOSES',
      analysis.differentialDiagnoses.map((d, i) => `${i + 1}. ${d}`).join('\n')
    )
  }

  // ── Disclaimer ────────────────────────────────────────────
  if (y + 30 > pageH - 30) { doc.addPage(); y = 20 }

  doc.setFillColor(254, 243, 199) // amber-100
  doc.roundedRect(margin, y, contentW, 18, 2, 2, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(180, 83, 9) // amber-700
  doc.text('DISCLAIMER', margin + 4, y + 6)
  doc.setFont('helvetica', 'normal')
  const disclaimer = 'This report is generated by an AI-assisted diagnostic system and is intended for use by qualified healthcare professionals only. It does not replace clinical judgment, physical examination, or consultation with a specialist radiologist. All findings should be correlated with clinical context. Not for standalone clinical decision-making.'
  const dlines = doc.splitTextToSize(disclaimer, contentW - 8)
  dlines.forEach((line, i) => doc.text(line, margin + 4, y + 11 + i * 4))
  y += 24

  // ── Footer on each page ───────────────────────────────────
  const totalPages = doc.internal.getNumberOfPages()
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p)
    doc.setFillColor(...SLATE_100)
    doc.rect(0, pageH - 12, pageW, 12, 'F')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(...SLATE_400)
    doc.text(`MedVision AI  |  Report ${reportNumber}  |  Generated ${reportDate}`, margin, pageH - 5)
    doc.text(`Page ${p} of ${totalPages}`, pageW - margin, pageH - 5, { align: 'right' })
  }

  // ── Save ──────────────────────────────────────────────────
  const filename = `radiology-report-${reportNumber.replace(/[^a-zA-Z0-9-]/g, '-')}.pdf`
  doc.save(filename)
  return filename
}
