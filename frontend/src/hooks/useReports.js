import { useEffect, useCallback, useState } from 'react'
import { analysisApi } from '../api/analysisApi'
import useAppStore from '../store/appStore'

export function useReports(params = {}) {
  const {
    analyses,
    analysesPagination,
    isLoadingHistory,
    setAnalyses,
    setAnalysesPagination,
    setIsLoadingHistory,
    removeAnalysis,
  } = useAppStore()

  const [searchQuery, setSearchQuery] = useState(params.search || '')
  const [modality, setModality] = useState(params.modality || undefined)
  const [urgencyLevel, setUrgencyLevel] = useState(params.urgencyLevel || undefined)
  const [currentPage, setCurrentPage] = useState(1)

  const load = useCallback(async (overrides = {}) => {
    setIsLoadingHistory(true)
    try {
      const result = await analysisApi.list({
        page: currentPage,
        limit: 10,
        search: searchQuery || undefined,
        modality: modality || undefined,
        urgencyLevel: urgencyLevel || undefined,
        ...overrides,
      })
      setAnalyses(result.data)
      setAnalysesPagination(result.pagination)
    } catch {
      // handled by interceptor
    } finally {
      setIsLoadingHistory(false)
    }
  }, [currentPage, searchQuery, modality, urgencyLevel, setAnalyses, setAnalysesPagination, setIsLoadingHistory])

  useEffect(() => {
    load()
  }, [currentPage, searchQuery, modality, urgencyLevel])

  const search = useCallback((query) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }, [])

  const resetAll = useCallback(() => {
    setSearchQuery('')
    setModality(undefined)
    setUrgencyLevel(undefined)
    setCurrentPage(1)
  }, [])

  const goToPage = useCallback((page) => {
    setCurrentPage(page)
  }, [])

  const deleteItem = useCallback(async (id) => {
    try {
      await analysisApi.delete(id)
      removeAnalysis(id)
      return true
    } catch {
      return false
    }
  }, [removeAnalysis])

  return {
    analyses,
    pagination: analysesPagination,
    isLoading: isLoadingHistory,
    searchQuery,
    search,
    modality,
    setModality,
    urgencyLevel,
    setUrgencyLevel,
    resetAll,
    currentPage,
    goToPage,
    reload: load,
    deleteItem,
  }
}
