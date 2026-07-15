import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useState } from 'react'

export default function HistoryFilters({
  query,
  onSearch,
  modality,
  onModalityChange,
  urgencyLevel,
  onUrgencyChange,
  onReset
}) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const hasActiveFilters = !!(modality || urgencyLevel)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        {/* Search bar */}
        <div className="relative flex-1 max-w-sm">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            id="history-search-input"
            type="text"
            value={query}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search by diagnosis, patient, study..."
            className="input pl-9 pr-9"
          />
          {query && (
            <button
              onClick={() => onSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Advanced Filters Button */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`btn-secondary btn-md flex items-center gap-2 transition-all ${
            showAdvanced || hasActiveFilters ? 'bg-medical-50 dark:bg-slate-800 border-medical-200 dark:border-slate-700 text-medical-700 dark:text-medical-400' : ''
          }`}
        >
          <SlidersHorizontal size={15} />
          Filters
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-medical-500 animate-pulse" />
          )}
        </button>

        {/* Reset Button */}
        {(query || hasActiveFilters) && (
          <button
            onClick={onReset}
            className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Advanced Filters Panel */}
      {showAdvanced && (
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl flex flex-wrap gap-4 shadow-sm transition-all duration-300">
          {/* Modality Filter */}
          <div className="space-y-1.5">
            <label className="block text-2xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">
              Modality
            </label>
            <select
              value={modality || ''}
              onChange={(e) => onModalityChange(e.target.value || undefined)}
              className="input py-2 h-10 w-44"
            >
              <option value="">All Modalities</option>
              <option value="chest_xray">Chest X-Ray</option>
              <option value="ct_scan">CT Scan</option>
              <option value="mri">MRI</option>
              <option value="ultrasound">Ultrasound</option>
              <option value="mammography">Mammography</option>
            </select>
          </div>

          {/* Urgency Filter */}
          <div className="space-y-1.5">
            <label className="block text-2xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">
              Urgency/Severity
            </label>
            <select
              value={urgencyLevel || ''}
              onChange={(e) => onUrgencyChange(e.target.value || undefined)}
              className="input py-2 h-10 w-44"
            >
              <option value="">All Levels</option>
              <option value="routine">Routine</option>
              <option value="non-urgent">Non-Urgent</option>
              <option value="semi-urgent">Semi-Urgent</option>
              <option value="urgent">Urgent</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>
      )}
    </div>
  )
}
