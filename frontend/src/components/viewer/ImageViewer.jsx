import { useState, useRef, useEffect } from 'react'
import {
  ZoomIn, ZoomOut, RotateCcw, Sun, Contrast,
  Maximize2, Minimize2, Move, RefreshCw, Eye
} from 'lucide-react'

export default function ImageViewer({ imageUrl, findings = [] }) {
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [isInverted, setIsInverted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showBoxes, setShowBoxes] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  
  const containerRef = useRef(null)
  const imageRef = useRef(null)
  const dragStart = useRef({ x: 0, y: 0 })

  // Reset adjustments
  const handleReset = () => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
    setBrightness(100)
    setContrast(100)
    setIsInverted(false)
  }

  // Zoom controls
  const handleZoomIn = () => setScale((s) => Math.min(s + 0.25, 4))
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.25, 0.5))

  // Dragging / Panning implementation
  const handleMouseDown = (e) => {
    e.preventDefault()
    setIsDragging(true)
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y }
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return
    setPosition({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y
    })
  }

  const handleMouseUp = () => setIsDragging(false)

  // Double click reset
  const handleDoubleClick = () => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }

  // Handle Fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return
    
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch((err) => console.error(err))
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  useEffect(() => {
    const handleFSChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFSChange)
    return () => document.removeEventListener('fullscreenchange', handleFSChange)
  }, [])

  return (
    <div 
      ref={containerRef}
      className={`relative flex flex-col bg-slate-950 rounded-2xl overflow-hidden select-none border border-slate-800 transition-all ${
        isFullscreen ? 'h-screen w-screen rounded-none' : 'h-[500px] w-full'
      }`}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* ── Viewport ─────────────────────────────────────────── */}
      <div 
        className="flex-1 relative overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
      >
        <div
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            filter: `brightness(${brightness}%) contrast(${contrast}%) ${isInverted ? 'invert(1)' : ''}`,
            transition: isDragging ? 'none' : 'transform 0.15s ease-out',
          }}
          className="relative max-w-full max-h-full flex items-center justify-center"
        >
          <img
            ref={imageRef}
            src={imageUrl}
            alt="Medical Scan"
            className="pointer-events-none object-contain max-h-[400px] select-none"
            draggable={false}
          />

          {/* Bounding Box Overlays */}
          {showBoxes && findings.map((finding, idx) => {
            if (!finding.localization) return null
            const { x, y, width, height } = finding.localization
            return (
              <div
                key={idx}
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  width: `${width}%`,
                  height: `${height}%`,
                }}
                className="absolute border-2 border-rose-500 bg-rose-500/10 rounded flex flex-col justify-start items-start p-1 pointer-events-auto group"
              >
                <span className="bg-rose-600 text-white text-3xs font-bold px-1 py-0.5 rounded leading-none">
                  {finding.abnormality} ({finding.confidence}%)
                </span>
              </div>
            )
          })}
        </div>

        {/* Loading / Empty Overlay */}
        {!imageUrl && (
          <div className="text-slate-500 flex flex-col items-center gap-2">
            <RefreshCw className="animate-spin text-medical-500" size={24} />
            <span className="text-sm">Loading medical scan viewer...</span>
          </div>
        )}
      </div>

      {/* ── Toolbar ───────────────────────────────────────────── */}
      <div className="bg-slate-900 border-t border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-slate-300">
        <div className="flex items-center gap-1.5">
          <button 
            onClick={handleZoomIn} 
            className="p-2 hover:bg-slate-800 rounded-xl transition-colors"
            title="Zoom In"
          >
            <ZoomIn size={18} />
          </button>
          <button 
            onClick={handleZoomOut} 
            className="p-2 hover:bg-slate-800 rounded-xl transition-colors"
            title="Zoom Out"
          >
            <ZoomOut size={18} />
          </button>
          <button 
            onClick={handleReset} 
            className="p-2 hover:bg-slate-800 rounded-xl transition-colors"
            title="Reset All Adjustments"
          >
            <RotateCcw size={18} />
          </button>
        </div>

        {/* Sliders */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <Sun size={15} className="text-slate-400" />
            <span className="w-16">Bright: {brightness}%</span>
            <input 
              type="range" 
              min="50" 
              max="200" 
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              className="w-20 accent-medical-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <div className="flex items-center gap-2">
            <Contrast size={15} className="text-slate-400" />
            <span className="w-16">Contr: {contrast}%</span>
            <input 
              type="range" 
              min="50" 
              max="200" 
              value={contrast}
              onChange={(e) => setContrast(Number(e.target.value))}
              className="w-20 accent-medical-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* View adjustments */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsInverted((v) => !v)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
              isInverted 
                ? 'bg-white text-slate-900 border-white font-bold' 
                : 'border-slate-800 hover:bg-slate-800'
            }`}
          >
            Invert
          </button>
          
          {findings.some(f => f.localization) && (
            <button
              onClick={() => setShowBoxes((v) => !v)}
              className={`p-2 rounded-xl border transition-all ${
                showBoxes 
                  ? 'bg-rose-500 text-white border-rose-500' 
                  : 'border-slate-800 hover:bg-slate-800 text-slate-400'
              }`}
              title="Toggle Bounding Boxes"
            >
              <Eye size={18} />
            </button>
          )}

          <button 
            onClick={toggleFullscreen} 
            className="p-2 hover:bg-slate-800 rounded-xl transition-colors ml-2"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
      </div>
    </div>
  )
}
