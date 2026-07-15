import { motion } from 'framer-motion'
import { ZoomIn, Maximize2 } from 'lucide-react'
import { useState } from 'react'

export default function ImagePreview({ previewUrl, fileName }) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  if (!previewUrl) return null

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 group"
      >
        <img
          src={previewUrl}
          alt={fileName || 'X-ray preview'}
          className="w-full object-contain max-h-72 block"
          style={{ background: '#0F172A' }}
        />
        {/* Overlay controls */}
        <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/20 transition-colors duration-200 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
          <button
            onClick={() => setIsFullscreen(true)}
            className="w-10 h-10 rounded-xl bg-white/90 flex items-center justify-center text-slate-700 hover:bg-white shadow-lg transition-all"
            title="Fullscreen"
          >
            <Maximize2 size={16} />
          </button>
        </div>
        {/* Image label */}
        <div className="absolute bottom-0 left-0 right-0 px-4 py-3 bg-gradient-to-t from-slate-900/80 to-transparent">
          <p className="text-white text-xs font-medium truncate">{fileName}</p>
          <p className="text-slate-400 text-2xs">Chest X-ray Preview</p>
        </div>
      </motion.div>

      {/* Fullscreen overlay */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/95 flex items-center justify-center p-4"
          onClick={() => setIsFullscreen(false)}
        >
          <img
            src={previewUrl}
            alt={fileName}
            className="max-w-full max-h-full object-contain rounded-xl"
          />
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
            onClick={() => setIsFullscreen(false)}
          >
            ✕
          </button>
        </div>
      )}
    </>
  )
}
