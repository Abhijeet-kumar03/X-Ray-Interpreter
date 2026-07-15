import { useState } from 'react'
import { motion } from 'framer-motion'
import { History, RefreshCw, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useReports } from '../hooks/useReports'
import ReportCard from '../components/history/ReportCard'
import HistoryFilters from '../components/history/HistoryFilters'
import EmptyState from '../components/ui/EmptyState'
import Button from '../components/ui/Button'
import { SkeletonCard } from '../components/ui/Skeleton'
import Modal from '../components/ui/Modal'
import { Link } from 'react-router-dom'

export default function HistoryPage() {
  const {
    analyses,
    pagination,
    isLoading,
    searchQuery,
    search,
    modality,
    setModality,
    urgencyLevel,
    setUrgencyLevel,
    resetAll,
    currentPage,
    goToPage,
    reload,
    deleteItem,
  } = useReports()

  const [deleteId, setDeleteId] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  async function confirmDelete() {
    if (!deleteId) return
    setIsDeleting(true)
    const success = await deleteItem(deleteId)
    if (success) toast.success('Analysis deleted.')
    else toast.error('Failed to delete.')
    setIsDeleting(false)
    setDeleteId(null)
  }

  const hasAnyFilterActive = !!(searchQuery || modality || urgencyLevel)

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between mb-6"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Analysis History</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            {pagination.total > 0
              ? `${pagination.total} total ${pagination.total === 1 ? 'analysis' : 'analyses'}`
              : 'No analyses yet'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            id="reload-history-button"
            onClick={() => reload()}
            variant="secondary"
            size="sm"
            leftIcon={<RefreshCw size={15} />}
          >
            Refresh
          </Button>
          <Link to="/dashboard">
            <Button id="new-analysis-button" variant="primary" size="sm">
              New Analysis
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.05 }}
        className="mb-6"
      >
        <HistoryFilters
          query={searchQuery}
          onSearch={search}
          modality={modality}
          onModalityChange={setModality}
          urgencyLevel={urgencyLevel}
          onUrgencyChange={setUrgencyLevel}
          onReset={resetAll}
        />
      </motion.div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : analyses.length === 0 ? (
        <EmptyState
          icon={History}
          title={hasAnyFilterActive ? 'No results found' : 'No analyses yet'}
          description={
            hasAnyFilterActive
              ? 'No analyses match your current search criteria or active filters.'
              : 'Upload your first scan from the dashboard to get started.'
          }
          action={
            !hasAnyFilterActive ? (
              <Link to="/dashboard">
                <Button id="empty-state-new-analysis" variant="primary" size="md">
                  Upload Scan
                </Button>
              </Link>
            ) : (
              <Button
                id="clear-search-button"
                variant="secondary"
                size="md"
                onClick={resetAll}
              >
                Clear Filters
              </Button>
            )
          }
        />
      ) : (
        <>
          <div className="space-y-3">
            {analyses.map((analysis, i) => (
              <ReportCard
                key={analysis._id || analysis.id}
                analysis={analysis}
                index={i}
                onDelete={(id) => setDeleteId(id)}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
              <p className="text-sm text-slate-400 dark:text-slate-500">
                Page {pagination.page} of {pagination.totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  id="prev-page-button"
                  variant="secondary"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => goToPage(pagination.page - 1)}
                  leftIcon={<ChevronLeft size={15} />}
                >
                  Prev
                </Button>
                <Button
                  id="next-page-button"
                  variant="secondary"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => goToPage(pagination.page + 1)}
                  rightIcon={<ChevronRight size={15} />}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete confirmation modal */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Analysis"
        footer={
          <>
            <Button
              id="cancel-delete-button"
              variant="secondary"
              size="sm"
              onClick={() => setDeleteId(null)}
            >
              Cancel
            </Button>
            <Button
              id="confirm-delete-button"
              variant="danger"
              size="sm"
              isLoading={isDeleting}
              onClick={confirmDelete}
              leftIcon={<Trash2 size={14} />}
            >
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Are you sure you want to delete this analysis and its associated report?
          This action cannot be undone.
        </p>
      </Modal>
    </div>
  )
}
