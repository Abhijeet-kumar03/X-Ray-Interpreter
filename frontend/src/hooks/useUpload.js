import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { analysisApi } from '../api/analysisApi'
import useAppStore from '../store/appStore'

export function useUpload() {
  const navigate = useNavigate()
  const { setIsAnalyzing, setUploadProgress, setCurrentAnalysis, setCurrentReport, prependAnalysis } = useAppStore()
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)

  const selectFile = useCallback((file) => {
    if (!file) return
    setSelectedFile(file)
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }, [])

  const clearFile = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setSelectedFile(null)
    setPreviewUrl(null)
  }, [previewUrl])

  const analyze = useCallback(async (options = {}) => {
    if (!selectedFile) {
      toast.error('Please select an X-ray image first.')
      return
    }

    setIsAnalyzing(true)
    setUploadProgress(0)

    const toastId = toast.loading('Uploading and analyzing X-ray...', { duration: Infinity })

    try {
      const result = await analysisApi.create(
        selectedFile,
        options,
        (pct) => setUploadProgress(pct)
      )

      const { analysis, report } = result.data
      setCurrentAnalysis(analysis)
      setCurrentReport(report)
      prependAnalysis(analysis)

      toast.dismiss(toastId)
      toast.success('Analysis complete!')
      navigate(`/analysis/${analysis._id || analysis.id}`)
    } catch (err) {
      toast.dismiss(toastId)
      // toast.error already called in httpClient interceptor
    } finally {
      setIsAnalyzing(false)
      setUploadProgress(0)
    }
  }, [selectedFile, navigate, setIsAnalyzing, setUploadProgress, setCurrentAnalysis, setCurrentReport, prependAnalysis])

  return { selectedFile, previewUrl, selectFile, clearFile, analyze }
}
