import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Image, AlertCircle, X } from 'lucide-react'
import clsx from 'clsx'

export default function UploadZone({ onFileSelect, selectedFile, isAnalyzing }) {
  const onDrop = useCallback((accepted, rejected) => {
    if (accepted.length > 0) {
      onFileSelect(accepted[0])
    }
  }, [onFileSelect])

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
    disabled: isAnalyzing,
  })

  return (
    <div
      {...getRootProps()}
      id="xray-upload-zone"
      className={clsx(
        'relative rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer select-none',
        'flex flex-col items-center justify-center min-h-[240px] p-8',
        isAnalyzing && 'pointer-events-none opacity-60',
        isDragReject
          ? 'border-rose-300 bg-rose-50'
          : isDragActive
          ? 'border-medical-400 bg-medical-50 scale-[1.01]'
          : selectedFile
          ? 'border-health-300 bg-health-50'
          : 'border-slate-200 bg-slate-50/50 hover:border-medical-300 hover:bg-medical-50/30'
      )}
    >
      <input {...getInputProps()} id="xray-file-input" />

      <AnimatePresence mode="wait">
        {isDragReject ? (
          <motion.div
            key="reject"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-3 text-rose-500"
          >
            <AlertCircle size={36} strokeWidth={1.5} />
            <p className="text-sm font-medium">File type not supported</p>
            <p className="text-xs text-rose-400">Please use JPEG, PNG, or WebP</p>
          </motion.div>
        ) : isDragActive ? (
          <motion.div
            key="drag"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-3 text-medical-600"
          >
            <motion.div
              animate={{ y: [-4, 4, -4] }}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              <Upload size={40} strokeWidth={1.5} />
            </motion.div>
            <p className="text-sm font-semibold">Release to upload</p>
          </motion.div>
        ) : selectedFile ? (
          <motion.div
            key="selected"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-3 text-health-700"
          >
            <div className="w-12 h-12 rounded-xl bg-health-100 flex items-center justify-center">
              <Image size={22} className="text-health-600" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-health-800 truncate max-w-[200px]">
                {selectedFile.name}
              </p>
              <p className="text-xs text-health-600 mt-0.5">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB · Ready to analyze
              </p>
            </div>
            <p className="text-xs text-slate-400">Click or drop a different file to replace</p>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4 text-slate-400"
          >
            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-card">
              <Upload size={24} strokeWidth={1.5} className="text-slate-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-600">
                Drop your X-ray image here
              </p>
              <p className="text-xs text-slate-400 mt-1">
                or <span className="text-medical-600 font-medium">click to browse</span>
              </p>
            </div>
            <div className="flex items-center gap-2 text-2xs text-slate-300">
              <span>JPEG · PNG · WebP</span>
              <span>·</span>
              <span>Max 10 MB</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
