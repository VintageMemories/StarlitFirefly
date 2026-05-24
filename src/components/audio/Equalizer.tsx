'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useAudioStore, AUDIO_EFFECT_PRESETS, EQ_FREQUENCIES, type AudioEffectPreset } from '@/stores/audioStore'
import { Switch } from '@/components/ui/switch'
import {
  Zap,
  X,
  Headphones,
  Layers,
  Puzzle,
  Waves,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface EqualizerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/* ------------------------------------------------------------------ */
/*  Category definitions                                               */
/* ------------------------------------------------------------------ */
type CategoryId = 'python' | 'headphone' | 'multitrack' | 'plugin'

const CATEGORIES: { id: CategoryId; label: string; icon: React.ElementType; presets: AudioEffectPreset[] }[] = [
  {
    id: 'python',
    label: '蟒蛇音效',
    icon: Waves,
    presets: ['python'],
  },
  {
    id: 'headphone',
    label: '耳机音效',
    icon: Headphones,
    presets: ['vinyl', 'hifi', 'clear-vocal', 'pure-vocal', 'pleasant-vocal'],
  },
  {
    id: 'multitrack',
    label: '多音轨',
    icon: Layers,
    presets: ['dolby', 'surround3d', '3d-crystal', 'panorama', 'surround-hd'],
  },
  {
    id: 'plugin',
    label: '音效插件',
    icon: Puzzle,
    presets: ['car', 'bass-boost', 'powerful-speaker'],
  },
]

/* ------------------------------------------------------------------ */
/*  Catmull-Rom → Cubic Bézier helper for smooth curve drawing        */
/* ------------------------------------------------------------------ */
function catmullRomToBezier(points: { x: number; y: number }[]): string {
  if (points.length < 2) return ''
  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`
  }

  const tension = 0.4
  let d = `M ${points[0].x} ${points[0].y}`

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(i - 1, 0)]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[Math.min(i + 2, points.length - 1)]

    const cp1x = p1.x + (p2.x - p0.x) * tension
    const cp1y = p1.y + (p2.y - p0.y) * tension
    const cp2x = p2.x - (p3.x - p1.x) * tension
    const cp2y = p2.y - (p3.y - p1.y) * tension

    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`
  }

  return d
}

/* ------------------------------------------------------------------ */
/*  Vertical EQ Slider – pointer-driven, no hacky rotation            */
/* ------------------------------------------------------------------ */
function EqSlider({
  value,
  onChange,
  disabled,
}: {
  value: number
  onChange: (v: number) => void
  disabled: boolean
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const calcValue = useCallback((clientY: number) => {
    const track = trackRef.current
    if (!track) return value
    const rect = track.getBoundingClientRect()
    const ratio = 1 - (clientY - rect.top) / rect.height
    const clamped = Math.max(0, Math.min(1, ratio))
    return Math.round(clamped * 24 - 12) // -12 … +12
  }, [value])

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (disabled) return
    e.preventDefault()
    dragging.current = true
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    onChange(calcValue(e.clientY))
  }, [calcValue, onChange, disabled])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current || disabled) return
    onChange(calcValue(e.clientY))
  }, [calcValue, onChange, disabled])

  const onPointerUp = useCallback(() => {
    dragging.current = false
  }, [])

  const thumbPos = ((value + 12) / 24) * 100 // 0-100% from bottom
  const fillHeight = Math.abs(value) / 12 * 50

  return (
    <div
      ref={trackRef}
      className={cn(
        'relative w-6 select-none touch-none',
        disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
      )}
      style={{ height: '140px' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {/* Track background */}
      <div className="absolute inset-x-0 top-0 bottom-0 mx-auto w-[3px] rounded-full bg-white/10" />

      {/* Center line (0 dB) */}
      <div className="absolute inset-x-0 mx-auto w-2 h-px bg-white/20" style={{ bottom: '50%' }} />

      {/* Tick marks */}
      {[0, 25, 50, 75, 100].map((pct) => (
        <div
          key={pct}
          className="absolute inset-x-0 mx-auto w-1.5 h-px bg-white/[0.06]"
          style={{ bottom: `${pct}%` }}
        />
      ))}

      {/* Fill bar */}
      <div
        className={cn(
          'absolute inset-x-0 mx-auto w-[3px] rounded-full transition-colors duration-150',
          value >= 0 ? 'bg-[#4FD1C5]/60' : 'bg-[#B794F6]/60'
        )}
        style={
          value >= 0
            ? { height: `${fillHeight}%`, bottom: '50%' }
            : { height: `${fillHeight}%`, bottom: `${50 - fillHeight}%` }
        }
      />

      {/* Thumb */}
      <div
        className={cn(
          'absolute inset-x-0 mx-auto w-3.5 h-3.5 rounded-full shadow-lg transition-[box-shadow,transform] duration-150',
          value >= 0
            ? 'bg-[#4FD1C5] shadow-[0_0_12px_rgba(79,209,197,0.5)]'
            : 'bg-[#B794F6] shadow-[0_0_12px_rgba(183,148,246,0.5)]',
          !disabled && 'hover:scale-125 hover:shadow-[0_0_20px_rgba(79,209,197,0.7)]'
        )}
        style={{ bottom: `calc(${thumbPos}% - 7px)` }}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Equalizer Component – Draggable Floating Window               */
/* ------------------------------------------------------------------ */
export function Equalizer({ open, onOpenChange }: EqualizerProps) {
  const { eqGains, activePreset, setEqBand, setActivePreset, resetEq } = useAudioStore()
  const [eqEnabled, setEqEnabled] = useState(true)
  const [activeCategory, setActiveCategory] = useState<CategoryId>('headphone')
  const [recentPresets, setRecentPresets] = useState<AudioEffectPreset[]>([])

  /* ---- Window position & drag ---- */
  const [pos, setPos] = useState(() => {
    if (typeof window !== 'undefined') {
      return { x: window.innerWidth / 2 - 280, y: window.innerHeight / 2 - 260 }
    }
    return { x: 0, y: 0 }
  })
  const dragging = useRef(false)
  const dragOffset = useRef({ x: 0, y: 0 })

  // Add global mouse listeners for drag
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return
      e.preventDefault()
      setPos({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      })
    }
    const onMouseUp = () => {
      dragging.current = false
    }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [])

  const onMouseDown = (e: React.MouseEvent) => {
    dragging.current = true
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y }
  }

  /* ---- Effective gains ---- */
  const effectiveGains = eqEnabled ? eqGains : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

  /* ---- Preset selection with recently-used tracking ---- */
  const handlePresetSelect = useCallback((preset: AudioEffectPreset) => {
    setActivePreset(preset)
    setRecentPresets((prev) => {
      const filtered = prev.filter((p) => p !== preset)
      return [preset, ...filtered].slice(0, 3)
    })
  }, [setActivePreset])

  /* ---- Get presets for active category ---- */
  const categoryPresets = CATEGORIES.find((c) => c.id === activeCategory)?.presets ?? []

  /* ---- Frequency response curve data ---- */
  const curveWidth = 360
  const curveHeight = 80
  const curvePoints = effectiveGains.map((gain, i) => ({
    x: (i / (effectiveGains.length - 1)) * curveWidth,
    y: curveHeight / 2 - (gain / 12) * (curveHeight / 2 - 6),
  }))
  const curveD = catmullRomToBezier(curvePoints)

  // Fill path – close the curve down to the bottom
  const fillD = curveD + ` L ${curveWidth} ${curveHeight} L 0 ${curveWidth} Z`

  if (!open) return null

  return (
    <div
      className="fixed z-[9999]"
      style={{
        left: pos.x,
        top: pos.y,
        width: 560,
        height: 520,
      }}
    >
      {/* Window frame */}
      <div
        className="w-full h-full rounded-xl overflow-hidden border border-white/[0.08] shadow-2xl shadow-black/60 flex flex-col"
        style={{
          background: 'linear-gradient(180deg, rgba(12,16,28,0.97) 0%, rgba(6,8,14,0.98) 100%)',
          backdropFilter: 'blur(24px)',
        }}
      >
        {/* ======== TOP BAR (drag handle) ======== */}
        <div
          className="flex items-center h-10 px-3 gap-2 border-b border-white/[0.06] cursor-move select-none shrink-0"
          onMouseDown={onMouseDown}
        >
          {/* Zap icon */}
          <Zap className="w-4 h-4 text-[#4FD1C5] shrink-0" />

          {/* Label */}
          <span className="text-sm font-semibold text-white/90 shrink-0">音效</span>

          {/* Active preset badge + toggle */}
          {activePreset !== 'none' && (
            <div className="flex items-center gap-1.5 ml-1 shrink-0">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#4FD1C5]/15 text-[#4FD1C5] border border-[#4FD1C5]/20 font-medium">
                {AUDIO_EFFECT_PRESETS[activePreset].label}
              </span>
              <Switch
                checked={eqEnabled}
                onCheckedChange={setEqEnabled}
                className={cn(
                  'scale-75 origin-left',
                  'data-[state=checked]:bg-[#4FD1C5]',
                  'data-[state=unchecked]:bg-white/20'
                )}
              />
            </div>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Recently used chips */}
          {recentPresets.length > 0 && (
            <div className="flex items-center gap-1 mr-1">
              <span className="text-[9px] text-white/25 mr-0.5">最近</span>
              {recentPresets.map((p) => (
                <button
                  key={p}
                  onClick={(e) => {
                    e.stopPropagation()
                    handlePresetSelect(p)
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  className={cn(
                    'text-[10px] px-1.5 py-0.5 rounded border transition-colors',
                    activePreset === p
                      ? 'bg-[#4FD1C5]/15 text-[#4FD1C5] border-[#4FD1C5]/20'
                      : 'text-white/40 bg-white/[0.03] border-white/[0.06] hover:text-white/60 hover:bg-white/[0.06]'
                  )}
                >
                  {AUDIO_EFFECT_PRESETS[p].label}
                </button>
              ))}
            </div>
          )}

          {/* Close button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onOpenChange(false)
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className="w-6 h-6 flex items-center justify-center rounded-md text-white/30 hover:text-white hover:bg-white/10 transition-colors shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ======== BODY: Sidebar + Main Content ======== */}
        <div className="flex flex-1 min-h-0">
          {/* ======== LEFT SIDEBAR ======== */}
          <div className="w-[140px] shrink-0 border-r border-white/[0.06] flex flex-col py-2 px-2 gap-1">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon
              const isActive = activeCategory === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all duration-200 group',
                    isActive
                      ? 'bg-[#4FD1C5]/10 text-[#4FD1C5] border border-[#4FD1C5]/15'
                      : 'text-white/45 hover:text-white/70 hover:bg-white/[0.04] border border-transparent'
                  )}
                >
                  <Icon
                    className={cn(
                      'w-4 h-4 shrink-0 transition-colors',
                      isActive ? 'text-[#4FD1C5]' : 'text-white/30 group-hover:text-white/50'
                    )}
                  />
                  <span className="text-xs font-medium truncate">{cat.label}</span>
                </button>
              )
            })}

            {/* Reset button at bottom */}
            <div className="mt-auto">
              <button
                onClick={resetEq}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-white/25 hover:text-white/50 hover:bg-white/[0.04] transition-colors w-full"
              >
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
                <span className="text-[11px]">重置均衡器</span>
              </button>
            </div>
          </div>

          {/* ======== MAIN CONTENT ======== */}
          <div className="flex-1 flex flex-col min-h-0 py-3 px-4 gap-3">
            {/* Preset chips – vertical scroll */}
            <div className="max-h-[140px] overflow-y-auto pr-1">
              <p className="text-[10px] text-white/30 mb-2 font-medium tracking-wide uppercase">
                {CATEGORIES.find((c) => c.id === activeCategory)?.label ?? ''}
              </p>
              <div className="flex flex-col gap-1.5">
                {categoryPresets.map((key) => {
                  const { label } = AUDIO_EFFECT_PRESETS[key]
                  const isActive = activePreset === key
                  return (
                    <button
                      key={key}
                      onClick={() => handlePresetSelect(key)}
                      className={cn(
                        'px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 text-left border',
                        isActive
                          ? 'bg-[#4FD1C5] text-black border-[#4FD1C5] shadow-[0_0_16px_rgba(79,209,197,0.25)]'
                          : 'text-white/55 bg-white/[0.03] border-white/[0.05] hover:text-white hover:bg-white/[0.07] hover:border-white/10'
                      )}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* EQ Slider panel */}
            <div
              className={cn(
                'rounded-xl p-3 border transition-opacity duration-300',
                'bg-gradient-to-b from-white/[0.03] to-white/[0.01] border-white/[0.06]',
                !eqEnabled && 'opacity-40'
              )}
            >
              <div className="flex items-stretch">
                {/* dB scale labels */}
                <div className="flex flex-col justify-between pr-2 py-0.5 w-6 text-right shrink-0" style={{ height: '140px' }}>
                  <span className="text-[9px] text-white/25 font-mono leading-none">+12</span>
                  <span className="text-[9px] text-white/40 font-mono leading-none">0</span>
                  <span className="text-[9px] text-white/25 font-mono leading-none">-12</span>
                </div>

                {/* Sliders */}
                <div className="flex items-end justify-between gap-0.5 flex-1">
                  {EQ_FREQUENCIES.map((freq, i) => (
                    <div key={freq} className="flex flex-col items-center gap-1 flex-1">
                      {/* Value label */}
                      <span
                        className={cn(
                          'text-[9px] font-mono w-6 text-center leading-none',
                          effectiveGains[i] > 0 ? 'text-[#4FD1C5]' : effectiveGains[i] < 0 ? 'text-[#B794F6]' : 'text-white/25'
                        )}
                      >
                        {effectiveGains[i] > 0 ? '+' : ''}{effectiveGains[i]}
                      </span>

                      {/* Vertical slider */}
                      <EqSlider
                        value={effectiveGains[i]}
                        onChange={(v) => setEqBand(i, v)}
                        disabled={!eqEnabled}
                      />

                      {/* Frequency label */}
                      <span className="text-[8px] text-white/30 mt-0.5 font-mono">{freq}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Frequency response curve */}
            <div
              className={cn(
                'rounded-xl p-3 border transition-opacity duration-300',
                'bg-gradient-to-b from-white/[0.02] to-transparent border-white/[0.05]',
                !eqEnabled && 'opacity-30'
              )}
            >
              <p className="text-[9px] text-white/20 mb-1.5 font-medium tracking-wide uppercase">
                频响曲线
              </p>
              <div className="h-20 relative">
                <svg
                  className="w-full h-full"
                  viewBox={`0 0 ${curveWidth} ${curveHeight}`}
                  preserveAspectRatio="none"
                >
                  <defs>
                    {/* Gradient for area fill */}
                    <linearGradient id="eqAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4FD1C5" stopOpacity="0.35" />
                      <stop offset="60%" stopColor="#B794F6" stopOpacity="0.08" />
                      <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                    </linearGradient>

                    {/* Glow filter */}
                    <filter id="eqGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>

                    {/* Stronger glow for double-pass */}
                    <filter id="eqGlowStrong" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>

                    {/* Line gradient */}
                    <linearGradient id="eqLineGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#B794F6" />
                      <stop offset="50%" stopColor="#4FD1C5" />
                      <stop offset="100%" stopColor="#B794F6" />
                    </linearGradient>
                  </defs>

                  {/* Grid lines */}
                  <line x1="0" y1={curveHeight / 2} x2={curveWidth} y2={curveHeight / 2} stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
                  <line x1="0" y1={curveHeight / 4} x2={curveWidth} y2={curveHeight / 4} stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
                  <line x1="0" y1={curveHeight * 3 / 4} x2={curveWidth} y2={curveHeight * 3 / 4} stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />

                  {/* Vertical grid lines at each frequency */}
                  {effectiveGains.map((_, i) => {
                    const x = (i / (effectiveGains.length - 1)) * curveWidth
                    return <line key={i} x1={x} y1="0" x2={x} y2={curveHeight} stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                  })}

                  {/* Area fill under curve */}
                  <path d={fillD} fill="url(#eqAreaGrad)" opacity="0.8" />

                  {/* Glow layer (wider, blurred) */}
                  <path
                    d={curveD}
                    fill="none"
                    stroke="#4FD1C5"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.25"
                    filter="url(#eqGlow)"
                  />

                  {/* Main curve line */}
                  <path
                    d={curveD}
                    fill="none"
                    stroke="url(#eqLineGrad)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#eqGlowStrong)"
                  />

                  {/* Dot markers at each band */}
                  {curvePoints.map((pt, i) => (
                    <circle
                      key={i}
                      cx={pt.x}
                      cy={pt.y}
                      r="2"
                      fill={effectiveGains[i] >= 0 ? '#4FD1C5' : '#B794F6'}
                      opacity="0.8"
                    />
                  ))}
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
