import { create } from 'zustand'

const useAppStore = create((set, get) => ({
  // Current analysis state
  currentAnalysis: null,
  currentReport: null,
  isAnalyzing: false,
  uploadProgress: 0,

  // History
  analyses: [],
  analysesPagination: { page: 1, total: 0, totalPages: 1, limit: 10 },
  isLoadingHistory: false,

  // UI State
  sidebarOpen: true,

  // Actions
  setCurrentAnalysis: (analysis) => set({ currentAnalysis: analysis }),
  setCurrentReport: (report) => set({ currentReport: report }),
  setIsAnalyzing: (val) => set({ isAnalyzing: val }),
  setUploadProgress: (val) => set({ uploadProgress: val }),

  setAnalyses: (analyses) => set({ analyses }),
  setAnalysesPagination: (pagination) => set({ analysesPagination: pagination }),
  setIsLoadingHistory: (val) => set({ isLoadingHistory: val }),

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (val) => set({ sidebarOpen: val }),

  // Add new analysis to history
  prependAnalysis: (analysis) =>
    set((state) => ({ analyses: [analysis, ...state.analyses] })),

  // Remove analysis from history
  removeAnalysis: (id) =>
    set((state) => ({
      analyses: state.analyses.filter(
        (a) => a._id !== id && a.id !== id
      ),
    })),

  reset: () =>
    set({
      currentAnalysis: null,
      currentReport: null,
      isAnalyzing: false,
      uploadProgress: 0,
    }),
}))

export default useAppStore
