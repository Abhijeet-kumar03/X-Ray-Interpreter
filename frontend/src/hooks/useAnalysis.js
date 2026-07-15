import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { analysisApi } from '../api/analysisApi'
import useAppStore from '../store/appStore'

export function useAnalysis(id) {
  const navigate = useNavigate()
  const { currentAnalysis, currentReport, setCurrentAnalysis, setCurrentReport } = useAppStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return

    // If we already have this analysis in store, skip fetch
    const storeId = currentAnalysis?._id || currentAnalysis?.id
    if (storeId === id && currentAnalysis) {
      return
    }

    async function fetch() {
      setIsLoading(true)
      setError(null)
      try {
        const result = await analysisApi.getById(id)
        const analysis = result.data
        setCurrentAnalysis(analysis)
        if (analysis.reportId) {
          setCurrentReport(typeof analysis.reportId === 'object' ? analysis.reportId : null)
        }
      } catch (err) {
        setError(err.message)
        if (err.message.includes('not found')) navigate('/history')
      } finally {
        setIsLoading(false)
      }
    }

    fetch()
  }, [id])

  return { analysis: currentAnalysis, report: currentReport, isLoading, error }
}
