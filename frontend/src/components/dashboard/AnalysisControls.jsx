import { useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, Cpu, Zap, Film, Layers } from 'lucide-react'
import Button from '../ui/Button'
import clsx from 'clsx'

const IMAGING_MODALITIES = [
  { id: 'chest_xray', label: 'Chest X-Ray', recommended: true },
  { id: 'knee_xray',  label: 'Knee X-Ray (Beta)' },
  { id: 'spine_xray', label: 'Spine X-Ray (Beta)' },
  { id: 'mammography', label: 'Mammography (Beta)' },
  { id: 'ct',         label: 'CT Scan (Beta)' },
  { id: 'mri',        label: 'MRI (Beta)' },
]

const AI_MODELS = [
  { id: 'DenseNet121', label: 'DenseNet121', description: 'Best overall accuracy', recommended: true },
  { id: 'ResNet50',    label: 'ResNet50',    description: 'Fast & reliable' },
  { id: 'EfficientNet-B4', label: 'EfficientNet-B4', description: 'High precision' },
]

export default function AnalysisControls({ onAnalyze, isAnalyzing, uploadProgress, hasFile }) {
  const [modality, setModality] = useState('chest_xray')
  const [model, setModel] = useState('DenseNet121')
  const [patientId, setPatientId] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    onAnalyze({ model, modality, patientId: patientId || undefined })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Modality selection */}
      <div>
        <label htmlFor="modality-select" className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
          <Film size={14} className="text-slate-400 dark:text-slate-500" />
          Imaging Modality
        </label>
        <select
          id="modality-select"
          value={modality}
          onChange={(e) => setModality(e.target.value)}
          className="input dark:bg-slate-950 dark:border-slate-800 dark:text-white"
          disabled={isAnalyzing}
        >
          {IMAGING_MODALITIES.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      {/* Model selection */}
      <div>
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
          <Cpu size={14} className="text-slate-400 dark:text-slate-500" />
          AI Model
        </label>
        <div className="grid grid-cols-3 gap-2">
          {AI_MODELS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setModel(m.id)}
              className={clsx(
                'relative rounded-xl border px-3 py-2.5 text-left transition-all duration-150',
                model === m.id
                  ? 'border-medical-300 bg-medical-50 ring-2 ring-medical-200 dark:border-medical-500 dark:bg-medical-950/30 dark:ring-medical-900/50'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800/50'
              )}
            >
              {m.recommended && (
                <span className="absolute -top-2 -right-1 text-2xs bg-medical-600 text-white px-1.5 py-0.5 rounded-full font-medium">
                  Rec
                </span>
              )}
              <p className={clsx('text-xs font-semibold', model === m.id ? 'text-medical-700 dark:text-medical-400' : 'text-slate-700 dark:text-slate-300')}>
                {m.label}
              </p>
              <p className="text-2xs text-slate-400 dark:text-slate-500 mt-0.5">{m.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Patient ID (optional) */}
      <div>
        <label htmlFor="patient-id-input" className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
          Patient ID
          <span className="text-2xs text-slate-400 dark:text-slate-500 font-normal">(optional)</span>
        </label>
        <input
          id="patient-id-input"
          type="text"
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
          placeholder="e.g. PAT-2024-001"
          className="input dark:bg-slate-950 dark:border-slate-800 dark:text-white"
          disabled={isAnalyzing}
        />
      </div>

      {/* Upload progress */}
      {isAnalyzing && uploadProgress > 0 && uploadProgress < 100 && (
        <div>
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="confidence-track dark:bg-slate-800">
            <motion.div
              className="h-full bg-medical-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${uploadProgress}%` }}
              transition={{ ease: 'linear' }}
            />
          </div>
        </div>
      )}

      {/* Submit */}
      <Button
        id="analyze-button"
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        isLoading={isAnalyzing}
        disabled={!hasFile || isAnalyzing}
        leftIcon={!isAnalyzing && <Brain size={18} />}
      >
        {isAnalyzing ? 'Analyzing image...' : 'Run AI Analysis'}
      </Button>

      {!hasFile && (
        <p className="text-center text-xs text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1.5">
          <Zap size={12} className="text-slate-300 dark:text-slate-600" />
          Upload medical image above to begin
        </p>
      )}
    </form>
  )
}
