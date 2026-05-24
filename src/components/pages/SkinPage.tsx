'use client'

import { useState, useRef, useCallback } from 'react'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { useSkinStore, type EffectType, type BackgroundType, type MeteorDirection } from '@/stores/skinStore'
import {
  Shirt,
  Image as ImageIcon,
  Film,
  Snowflake,
  CloudRain,
  Flower2,
  Circle,
  Bug,
  Lightbulb,
  X,
  Upload,
  MonitorSmartphone,
  Sparkles,
  Trash2,
  Cpu,
  Check,
  MoveRight,
  MoveLeft,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'

/* ------------------------------------------------------------------ */
/*  Types & Constants                                                  */
/* ------------------------------------------------------------------ */

interface EffectOption {
  type: EffectType
  label: string
  description: string
  icon: React.ReactNode
  accentColor: string
}

const EFFECT_OPTIONS: EffectOption[] = [
  {
    type: 'snow',
    label: '下雪',
    description: '飘落的雪花',
    icon: <Snowflake className="w-5 h-5" />,
    accentColor: '#e0f2fe',
  },
  {
    type: 'rain',
    label: '下雨',
    description: '淅沥的雨滴',
    icon: <CloudRain className="w-5 h-5" />,
    accentColor: '#93c5fd',
  },
  {
    type: 'petals',
    label: '花瓣',
    description: '浪漫的落花',
    icon: <Flower2 className="w-5 h-5" />,
    accentColor: '#f9a8d4',
  },
  {
    type: 'bubbles',
    label: '气泡',
    description: '梦幻的气泡',
    icon: <Circle className="w-5 h-5" />,
    accentColor: '#a5f3fc',
  },
  {
    type: 'meteor',
    label: '流星',
    description: '划过天际的流星',
    icon: <Zap className="w-5 h-5" />,
    accentColor: '#fcd34d',
  },
  {
    type: 'butterfly',
    label: '蝴蝶',
    description: '翩翩起舞',
    icon: <Bug className="w-5 h-5" />,
    accentColor: '#c4b5fd',
  },
  {
    type: 'firefly',
    label: '萤火虫',
    description: '闪烁的微光',
    icon: <Lightbulb className="w-5 h-5" />,
    accentColor: '#fde047',
  },
]

/* ------------------------------------------------------------------ */
/*  Mini Animated Preview Components                                   */
/* ------------------------------------------------------------------ */

function SnowPreview() {
  return (
    <div className="relative w-full h-full overflow-hidden">
      {[...Array(8)].map((_, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            width: `${3 + (i % 3)}px`,
            height: `${3 + (i % 3)}px`,
            left: `${10 + i * 11}%`,
            animation: `skinSnowFall ${1.2 + i * 0.3}s linear infinite`,
            animationDelay: `${i * 0.2}s`,
            opacity: 0.6 + (i % 3) * 0.15,
          }}
        />
      ))}
    </div>
  )
}

function RainPreview() {
  return (
    <div className="relative w-full h-full overflow-hidden">
      {[...Array(6)].map((_, i) => (
        <span
          key={i}
          className="absolute bg-blue-300"
          style={{
            width: '1px',
            height: '10px',
            left: `${8 + i * 15}%`,
            animation: `skinRainFall ${0.5 + i * 0.15}s linear infinite`,
            animationDelay: `${i * 0.1}s`,
            opacity: 0.5 + (i % 2) * 0.3,
            borderRadius: '1px',
          }}
        />
      ))}
    </div>
  )
}

function PetalsPreview() {
  return (
    <div className="relative w-full h-full overflow-hidden">
      {[...Array(5)].map((_, i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={{
            width: '5px',
            height: '5px',
            left: `${10 + i * 18}%`,
            animation: `skinPetalFall ${2 + i * 0.4}s ease-in-out infinite`,
            animationDelay: `${i * 0.35}s`,
            opacity: 0.6 + (i % 2) * 0.2,
            background: i % 2 === 0 ? '#f9a8d4' : '#fbcfe8',
            borderRadius: '50% 0 50% 0',
          }}
        />
      ))}
    </div>
  )
}

function BubblesPreview() {
  return (
    <div className="relative w-full h-full overflow-hidden">
      {[...Array(5)].map((_, i) => (
        <span
          key={i}
          className="absolute rounded-full border"
          style={{
            width: `${5 + i * 2}px`,
            height: `${5 + i * 2}px`,
            left: `${12 + i * 16}%`,
            bottom: '0',
            animation: `skinBubbleRise ${1.5 + i * 0.3}s ease-out infinite`,
            animationDelay: `${i * 0.25}s`,
            opacity: 0.5 + (i % 2) * 0.2,
            borderColor: 'rgba(165,243,252,0.6)',
            background: 'rgba(165,243,252,0.1)',
          }}
        />
      ))}
    </div>
  )
}

function MeteorPreview() {
  return (
    <div className="relative w-full h-full overflow-hidden">
      {[...Array(3)].map((_, i) => (
        <span
          key={i}
          className="absolute"
          style={{
            width: '20px',
            height: '2px',
            top: `${20 + i * 25}%`,
            animation: `skinMeteorLeft ${1 + i * 0.3}s linear infinite`,
            animationDelay: `${i * 0.5}s`,
            background: `linear-gradient(to right, transparent, rgba(252,211,77,0.8))`,
            borderRadius: '1px',
          }}
        />
      ))}
    </div>
  )
}

function ButterflyPreview() {
  return (
    <div className="relative w-full h-full overflow-hidden">
      {[...Array(3)].map((_, i) => (
        <span
          key={i}
          className="absolute"
          style={{
            width: '6px',
            height: '4px',
            top: `${25 + i * 20}%`,
            animation: `skinButterfly ${3 + i * 0.5}s ease-in-out infinite`,
            animationDelay: `${i * 0.6}s`,
            opacity: 0.7,
          }}
        >
          <span
            className="block w-3 h-2 rounded-full absolute -left-1"
            style={{
              background: i % 2 === 0 ? '#c4b5fd' : '#a78bfa',
              animation: `skinWing 0.3s ease-in-out infinite alternate`,
            }}
          />
          <span
            className="block w-3 h-2 rounded-full absolute left-1"
            style={{
              background: i % 2 === 0 ? '#a78bfa' : '#c4b5fd',
              animation: `skinWing 0.3s ease-in-out infinite alternate-reverse`,
            }}
          />
        </span>
      ))}
    </div>
  )
}

function FireflyPreview() {
  return (
    <div className="relative w-full h-full overflow-hidden">
      {[...Array(6)].map((_, i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={{
            width: '3px',
            height: '3px',
            left: `${10 + i * 15}%`,
            top: `${15 + (i % 3) * 25}%`,
            animation: `skinFirefly ${2.5 + i * 0.4}s ease-in-out infinite`,
            animationDelay: `${i * 0.3}s`,
            background: '#fde047',
            boxShadow: '0 0 4px 1px rgba(253,224,71,0.6)',
          }}
        />
      ))}
    </div>
  )
}

const EFFECT_PREVIEW_MAP: Record<EffectType, React.ReactNode | null> = {
  none: null,
  snow: <SnowPreview />,
  rain: <RainPreview />,
  petals: <PetalsPreview />,
  bubbles: <BubblesPreview />,
  meteor: <MeteorPreview />,
  butterfly: <ButterflyPreview />,
  firefly: <FireflyPreview />,
}

/* ------------------------------------------------------------------ */
/*  CSS Keyframes (injected once)                                      */
/* ------------------------------------------------------------------ */

const KEYFRAMES_STYLE = `
@keyframes skinSnowFall {
  0%   { transform: translateY(-10px); opacity: 0; }
  10%  { opacity: 1; }
  100% { transform: translateY(70px); opacity: 0; }
}
@keyframes skinRainFall {
  0%   { transform: translateY(-10px) rotate(15deg); opacity: 0; }
  10%  { opacity: 1; }
  100% { transform: translateY(70px) rotate(15deg); opacity: 0; }
}
@keyframes skinPetalFall {
  0%   { transform: translateY(-10px) rotate(0deg); opacity: 0; }
  10%  { opacity: 1; }
  50% { transform: translateY(30px) rotate(180deg) translateX(10px); opacity: 0.8; }
  100% { transform: translateY(70px) rotate(360deg) translateX(-5px); opacity: 0; }
}
@keyframes skinBubbleRise {
  0%   { transform: translateY(10px); opacity: 0; }
  20%  { opacity: 1; }
  100% { transform: translateY(-60px); opacity: 0; }
}
@keyframes skinMeteorLeft {
  0%   { transform: translateX(-30px); opacity: 0; }
  10%  { opacity: 1; }
  100% { transform: translateX(100px); opacity: 0; }
}
@keyframes skinMeteorRight {
  0%   { transform: translateX(100px); opacity: 0; }
  10%  { opacity: 1; }
  100% { transform: translateX(-30px); opacity: 0; }
}
@keyframes skinButterfly {
  0%   { transform: translate(0, 0); }
  25%  { transform: translate(15px, -10px); }
  50%  { transform: translate(25px, 5px); }
  75%  { transform: translate(10px, -5px); }
  100% { transform: translate(0, 0); }
}
@keyframes skinWing {
  0%   { transform: scaleX(1); }
  100% { transform: scaleX(0.3); }
}
@keyframes skinFirefly {
  0%   { transform: translate(0, 0); opacity: 0; }
  20%  { opacity: 1; }
  50% { transform: translate(10px, -8px); opacity: 0.4; }
  70%  { opacity: 1; }
  100% { transform: translate(-5px, 5px); opacity: 0; }
}
@keyframes skinDragPulse {
  0%, 100% { border-color: rgba(79,209,197,0.3); }
  50%      { border-color: rgba(79,209,197,0.6); }
}
`

/* ------------------------------------------------------------------ */
/*  Background Status Badge                                            */
/* ------------------------------------------------------------------ */

function BackgroundStatusBadge({ type, path }: { type: BackgroundType; path: string | null }) {
  if (type === 'none') {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06]">
        <MonitorSmartphone className="w-3.5 h-3.5 text-white/30" />
        <span className="text-xs text-white/40">默认背景</span>
      </div>
    )
  }
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#4FD1C5]/10 border border-[#4FD1C5]/20">
      {type === 'image' ? (
        <ImageIcon className="w-3.5 h-3.5 text-[#4FD1C5]" />
      ) : (
        <Film className="w-3.5 h-3.5 text-[#4FD1C5]" />
      )}
      <span className="text-xs text-[#4FD1C5]">
        {type === 'image' ? '静态壁纸' : '动态视频背景'}
      </span>
      {path && (
        <span className="text-[10px] text-white/30 max-w-[120px] truncate">
          已加载
        </span>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Upload Drop Zone                                                   */
/* ------------------------------------------------------------------ */

interface DropZoneProps {
  icon: React.ReactNode
  title: string
  subtitle: string
  accept: string
  isActive: boolean
  onFileSelect: (file: File) => void
  onRemove: (() => void) | null
  accentClass: string
}

function DropZone({ icon, title, subtitle, accept, isActive, onFileSelect, onRemove, accentClass }: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) onFileSelect(file)
    },
    [onFileSelect]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false)
  }, [])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) onFileSelect(file)
    },
    [onFileSelect]
  )

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={cn(
        'relative group rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer',
        isActive
          ? 'border-[#4FD1C5]/30 bg-[#4FD1C5]/5'
          : isDragOver
            ? 'border-[#4FD1C5]/50 bg-[#4FD1C5]/10'
            : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]',
        isDragOver && 'animate-[skinDragPulse_1s_ease-in-out_infinite]'
      )}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleInputChange}
      />
      <div className="flex flex-col items-center justify-center gap-2 p-5">
        <div
          className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center transition-colors',
            isActive ? 'bg-[#4FD1C5]/15 text-[#4FD1C5]' : 'bg-white/[0.06] text-white/30 group-hover:text-white/50'
          )}
        >
          {icon}
        </div>
        <div className="text-center">
          <p className={cn('text-sm font-medium', isActive ? 'text-[#4FD1C5]' : 'text-white/60')}>
            {title}
          </p>
          <p className="text-[11px] text-white/30 mt-0.5">{subtitle}</p>
          <p className="text-[10px] text-white/20 mt-1 flex items-center justify-center gap-1">
            <Upload className="w-3 h-3" />
            拖拽文件至此或点击选择
          </p>
        </div>
      </div>
      {isActive && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/30"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Effect Grid Card (2-column 四宫格 style)                           */
/* ------------------------------------------------------------------ */

interface EffectGridCardProps {
  option: EffectOption
  isSelected: boolean
  isLayerEnabled: boolean
  meteorDirection?: MeteorDirection
  onDirectionChange?: (dir: MeteorDirection) => void
  onClick: () => void
}

function EffectGridCard({ option, isSelected, isLayerEnabled, meteorDirection, onDirectionChange, onClick }: EffectGridCardProps) {
  const preview = EFFECT_PREVIEW_MAP[option.type]

  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative rounded-xl border transition-all duration-200 overflow-hidden cursor-pointer',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4FD1C5]/50',
        isSelected
          ? 'border-[#4FD1C5]/50 bg-[#4FD1C5]/10 shadow-[0_0_20px_rgba(79,209,197,0.15)]'
          : !isLayerEnabled
            ? 'border-white/[0.06] bg-white/[0.02] opacity-60 hover:opacity-80 hover:border-white/10'
            : 'border-white/[0.06] bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.05]',
      )}
    >
      {/* Animated preview area - square */}
      <div
        className={cn(
          'w-full aspect-square relative overflow-hidden transition-colors',
          isSelected ? 'bg-black/30' : 'bg-black/20'
        )}
      >
        {preview ? (
          <div className="absolute inset-0">{preview}</div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <X className="w-4 h-4 text-white/20" />
          </div>
        )}
        {/* Selected indicator */}
        {isSelected && (
          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#4FD1C5] flex items-center justify-center shadow-[0_0_8px_rgba(79,209,197,0.4)]">
            <Check className="w-3 h-3 text-black" />
          </div>
        )}
        {/* Accent color overlay glow when selected */}
        {isSelected && (
          <div
            className="absolute inset-0 opacity-10"
            style={{
              background: `radial-gradient(circle at center, ${option.accentColor}, transparent 70%)`,
            }}
          />
        )}
      </div>

      {/* Info below preview */}
      <div className="p-2.5">
        <div className="flex items-center gap-1.5">
          <span
            className="transition-colors"
            style={{ color: isSelected ? option.accentColor : undefined }}
          >
            {option.icon}
          </span>
          <span
            className={cn(
              'text-xs font-medium truncate',
              isSelected ? 'text-white' : 'text-white/60 group-hover:text-white/80'
            )}
          >
            {option.label}
          </span>
        </div>
        <p className="text-[10px] text-white/25 mt-0.5 truncate">{option.description}</p>

        {/* Meteor direction selector inside the card */}
        {option.type === 'meteor' && isSelected && (
          <div className="mt-2 flex gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDirectionChange?.('left-to-right')
              }}
              className={cn(
                'flex-1 flex items-center justify-center gap-1 h-6 rounded-md text-[10px] font-medium transition-all',
                meteorDirection === 'left-to-right'
                  ? 'bg-[#4FD1C5]/15 text-[#4FD1C5] border border-[#4FD1C5]/30'
                  : 'bg-white/[0.04] text-white/35 border border-white/[0.06] hover:text-white/50'
              )}
            >
              <MoveRight className="w-3 h-3" />
              左上→右下
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDirectionChange?.('right-to-left')
              }}
              className={cn(
                'flex-1 flex items-center justify-center gap-1 h-6 rounded-md text-[10px] font-medium transition-all',
                meteorDirection === 'right-to-left'
                  ? 'bg-[#4FD1C5]/15 text-[#4FD1C5] border border-[#4FD1C5]/30'
                  : 'bg-white/[0.04] text-white/35 border border-white/[0.06] hover:text-white/50'
              )}
            >
              <MoveLeft className="w-3 h-3" />
              右上→左下
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main SkinPage Component                                            */
/* ------------------------------------------------------------------ */

export default function SkinPage() {
  const {
    backgroundType,
    backgroundPath,
    effectsEnabled,
    effectType,
    meteorDirection,
    setBackgroundType,
    setBackgroundPath,
    setEffectsEnabled,
    setEffectType,
    setMeteorDirection,
  } = useSkinStore()

  const [previewPath, setPreviewPath] = useState<string | null>(backgroundPath)

  const handleImageFile = useCallback(
    (file: File) => {
      const url = URL.createObjectURL(file)
      setPreviewPath(url)
      setBackgroundPath(url)
      setBackgroundType('image')
    },
    [setBackgroundPath, setBackgroundType]
  )

  const handleVideoFile = useCallback(
    (file: File) => {
      const url = URL.createObjectURL(file)
      setPreviewPath(url)
      setBackgroundPath(url)
      setBackgroundType('video')
    },
    [setBackgroundPath, setBackgroundType]
  )

  const handleRemoveBackground = useCallback(() => {
    setPreviewPath(null)
    setBackgroundPath(null)
    setBackgroundType('none')
  }, [setBackgroundPath, setBackgroundType])

  const handleEffectSelect = useCallback(
    (type: EffectType) => {
      setEffectType(type)
      // Auto-enable the effect layer when selecting a real effect
      if (type !== 'none' && !effectsEnabled) {
        setEffectsEnabled(true)
      }
    },
    [setEffectType, setEffectsEnabled, effectsEnabled]
  )

  const handleToggleEffects = useCallback(
    (enabled: boolean) => {
      setEffectsEnabled(enabled)
      // If turning off, reset effect to none
      if (!enabled) {
        setEffectType('none')
      }
    },
    [setEffectsEnabled, setEffectType]
  )

  const currentEffectOption = EFFECT_OPTIONS.find((o) => o.type === effectType)

  return (
    <>
      {/* Inject keyframes once */}
      <style dangerouslySetInnerHTML={{ __html: KEYFRAMES_STYLE }} />

      <div className="space-y-6">
        {/* Page title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#4FD1C5]/10 flex items-center justify-center">
            <Shirt className="w-4.5 h-4.5 text-[#4FD1C5]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">皮肤设置</h1>
            <p className="text-white/30 text-xs mt-0.5">自定义播放器背景与特效图层，打造专属视觉体验</p>
          </div>
        </div>

        {/* ========== Section 1: Background ========== */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white/70 flex items-center gap-2">
              <ImageIcon className="w-3.5 h-3.5 text-[#4FD1C5]/70" />
              背景设置
            </h3>
            <BackgroundStatusBadge type={backgroundType} path={previewPath} />
          </div>

          {/* Upload zones */}
          <div className="grid grid-cols-2 gap-3">
            <DropZone
              icon={<ImageIcon className="w-5 h-5" />}
              title="静态壁纸"
              subtitle="JPG / PNG / WebP"
              accept="image/*"
              isActive={backgroundType === 'image'}
              onFileSelect={handleImageFile}
              onRemove={backgroundType === 'image' ? handleRemoveBackground : null}
              accentClass="text-[#4FD1C5]"
            />
            <DropZone
              icon={<Film className="w-5 h-5" />}
              title="动态背景"
              subtitle="MP4 / WebM / MOV"
              accept="video/*"
              isActive={backgroundType === 'video'}
              onFileSelect={handleVideoFile}
              onRemove={backgroundType === 'video' ? handleRemoveBackground : null}
              accentClass="text-[#B794F6]"
            />
          </div>

          {/* Video hardware acceleration note */}
          {backgroundType === 'video' && (
            <div className="flex items-center gap-1.5 mt-2 px-1">
              <Cpu className="w-3 h-3 text-[#B794F6]/60" />
              <span className="text-[10px] text-white/25">视频背景已启用硬件加速渲染</span>
            </div>
          )}

          {/* Preview */}
          {previewPath && (
            <div className="mt-3 rounded-xl overflow-hidden border border-white/10 h-36 relative group">
              {backgroundType === 'image' ? (
                <img
                  src={previewPath}
                  alt="背景预览"
                  className="w-full h-full object-cover"
                />
              ) : (
                <video
                  src={previewPath}
                  muted
                  autoPlay
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-2.5 left-3 flex items-center gap-2">
                <span className="text-[10px] bg-black/50 backdrop-blur-sm text-white/70 px-2 py-0.5 rounded-md">
                  预览
                </span>
                <span className="text-[10px] text-white/40">
                  {backgroundType === 'image' ? '静态壁纸' : '动态视频'}
                </span>
              </div>
              <button
                onClick={handleRemoveBackground}
                className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/30"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </section>

        <Separator className="bg-white/[0.06]" />

        {/* ========== Section 2: Effects - 2-column grid ========== */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white/70 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#4FD1C5]/70" />
              特效图层
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-white/30">
                {effectsEnabled && effectType !== 'none' ? currentEffectOption?.label ?? '' : '已关闭'}
              </span>
              <Switch
                checked={effectsEnabled}
                onCheckedChange={handleToggleEffects}
                className="data-[state=checked]:bg-[#4FD1C5]"
              />
            </div>
          </div>

          {/* Effect grid - 2 columns, always visible, vertical scroll */}
          <div className="max-h-[480px] overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-3">
              {EFFECT_OPTIONS.map((option) => {
                const isSelected = effectType === option.type

                return (
                  <EffectGridCard
                    key={option.type}
                    option={option}
                    isSelected={isSelected}
                    isLayerEnabled={effectsEnabled}
                    meteorDirection={option.type === 'meteor' ? meteorDirection : undefined}
                    onDirectionChange={option.type === 'meteor' ? setMeteorDirection : undefined}
                    onClick={() => handleEffectSelect(option.type)}
                  />
                )
              })}
            </div>
          </div>

          {/* Active effect summary */}
          {effectsEnabled && effectType !== 'none' && currentEffectOption && (
            <div className="mt-3 flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
              <span style={{ color: currentEffectOption.accentColor }}>
                {currentEffectOption.icon}
              </span>
              <span className="text-xs text-white/50">
                当前特效：
                <span className="text-white/70 font-medium">{currentEffectOption.label}</span>
                <span className="text-white/25 ml-1">— {currentEffectOption.description}</span>
                {effectType === 'meteor' && (
                  <span className="text-white/25 ml-1">
                    ({meteorDirection === 'left-to-right' ? '左上→右下' : '右上→左下'})
                  </span>
                )}
              </span>
            </div>
          )}
        </section>
      </div>
    </>
  )
}
