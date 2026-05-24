'use client'

import { useRef, useEffect, useCallback, useState } from 'react'
import Image from 'next/image'
import {
  SkipBack,
  Play,
  Pause,
  SkipForward,
  Repeat,
  Repeat1,
  Shuffle,
  Volume2,
  Volume1,
  VolumeX,
  FileText,
  ListMusic,
  ChevronUp,
  ChevronDown,
} from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import { usePlayerStore, type SongInfo } from '@/stores/playerStore'
import { useAudioStore, AUDIO_EFFECT_PRESETS } from '@/stores/audioStore'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

/** Format seconds into m:ss */
function formatTime(seconds: number): string {
  if (!seconds || !isFinite(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

/** Play mode icon map */
const playModeIcons: Record<string, React.ElementType> = {
  sequence: Repeat,
  loop: Repeat,
  single: Repeat1,
  random: Shuffle,
}

const playModeLabels: Record<string, string> = {
  sequence: '顺序播放',
  loop: '列表循环',
  single: '单曲循环',
  random: '随机播放',
}

export default function PlayerBar() {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    playMode,
    setCurrentTime,
    setIsPlaying,
    setDuration,
    setVolume,
    toggleMute,
    cyclePlayMode,
    playNext,
    playPrev,
    togglePlayerExpanded,
  } = usePlayerStore()

  const { activePreset, toggleEq } = useAudioStore()

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isCoverHovered, setIsCoverHovered] = useState(false)
  const [isSeeking, setIsSeeking] = useState(false)
  const [isVolumeHovered, setIsVolumeHovered] = useState(false)
  const volumeHoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ─── Audio element lifecycle ───────────────────────────
  useEffect(() => {
    const audio = new Audio()
    audio.volume = volume / 100
    audioRef.current = audio

    const onTimeUpdate = () => {
      if (!isSeeking) {
        setCurrentTime(audio.currentTime)
      }
    }
    const onLoadedMetadata = () => {
      setDuration(audio.duration)
    }
    const onEnded = () => {
      if (playMode === 'single') {
        audio.currentTime = 0
        audio.play()
      } else {
        playNext()
      }
    }

    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('loadedmetadata', onLoadedMetadata)
    audio.addEventListener('ended', onEnded)

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('loadedmetadata', onLoadedMetadata)
      audio.removeEventListener('ended', onEnded)
      audio.pause()
      audio.src = ''
    }
  }, [])

  // ─── Sync play/pause state ─────────────────────────────
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      if (!audio.src || audio.src === window.location.href) {
        return
      }
      audio.play().catch(() => {})
    } else {
      audio.pause()
    }
  }, [isPlaying])

  // ─── Sync volume ───────────────────────────────────────
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = isMuted ? 0 : volume / 100
  }, [volume, isMuted])

  // ─── Song change ───────────────────────────────────────
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentSong) return

    setCurrentTime(0)
    setDuration(currentSong.duration || 0)
    setIsPlaying(true)
  }, [currentSong, setCurrentTime, setDuration, setIsPlaying])

  // ─── Simulate playback progress when no real audio ─────
  useEffect(() => {
    if (!isPlaying || !currentSong) return
    const audio = audioRef.current
    if (audio && audio.src && audio.src !== window.location.href && audio.duration > 0) {
      return
    }

    const interval = setInterval(() => {
      if (!isSeeking) {
        const state = usePlayerStore.getState()
        const newTime = state.currentTime + 0.25
        if (newTime >= state.duration) {
          usePlayerStore.getState().playNext()
        } else {
          setCurrentTime(newTime)
        }
      }
    }, 250)

    return () => clearInterval(interval)
  }, [isPlaying, currentSong, isSeeking, setCurrentTime])

  // ─── Handlers ──────────────────────────────────────────
  const handlePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying)
  }, [isPlaying, setIsPlaying])

  const handleProgressChange = useCallback(
    (value: number[]) => {
      setIsSeeking(true)
      const newTime = value[0]
      setCurrentTime(newTime)
    },
    [setCurrentTime]
  )

  const handleProgressCommit = useCallback(
    (value: number[]) => {
      const newTime = value[0]
      setCurrentTime(newTime)
      if (audioRef.current) {
        audioRef.current.currentTime = newTime
      }
      setIsSeeking(false)
    },
    [setCurrentTime]
  )

  const handleVolumeChange = useCallback(
    (value: number[]) => {
      setVolume(value[0])
    },
    [setVolume]
  )

  // ─── Volume hover handling ────────────────────────────
  const handleVolumeEnter = useCallback(() => {
    if (volumeHoverTimeout.current) {
      clearTimeout(volumeHoverTimeout.current)
      volumeHoverTimeout.current = null
    }
    setIsVolumeHovered(true)
  }, [])

  const handleVolumeLeave = useCallback(() => {
    volumeHoverTimeout.current = setTimeout(() => {
      setIsVolumeHovered(false)
    }, 300)
  }, [])

  // ─── Play mode icon ───────────────────────────────────
  const PlayModeIcon = playModeIcons[playMode] || Repeat

  // ─── Effective volume display ─────────────────────────
  const displayVolume = isMuted ? 0 : volume

  // ─── Volume icon based on level ───────────────────────
  const VolumeIcon = isMuted || displayVolume === 0 ? VolumeX : displayVolume < 50 ? Volume1 : Volume2

  return (
    <TooltipProvider delayDuration={500}>
      <footer
        className="
          fixed bottom-0 left-0 right-0 z-50 h-[72px]
          glass border-t border-white/[0.08]
          flex items-center px-4 gap-3
          select-none
        "
      >
        {/* ═══ Left Section: Song Info ═══ */}
        <div className="flex items-center gap-3 w-[280px] min-w-[220px] shrink-0">
          {/* Album Cover with hover arrows */}
          <div
            className="relative w-12 h-12 shrink-0 rounded-lg overflow-hidden border border-white/10 cursor-pointer group"
            onMouseEnter={() => setIsCoverHovered(true)}
            onMouseLeave={() => setIsCoverHovered(false)}
            onClick={togglePlayerExpanded}
            role="button"
            aria-label="展开/收起播放器"
          >
            <Image
              src={currentSong?.coverPath || '/default-cover.png'}
              alt={currentSong?.title || '星荧音乐'}
              width={48}
              height={48}
              className="w-full h-full object-cover"
              priority
            />
            {/* Hover overlay with up/down toggle arrows */}
            <div
              className={`
                absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-0.5
                transition-opacity duration-200
                ${isCoverHovered ? 'opacity-100' : 'opacity-0'}
              `}
            >
              <ChevronUp className="w-3.5 h-3.5 text-white/90" />
              <ChevronDown className="w-3.5 h-3.5 text-white/90" />
            </div>
          </div>

          {/* Title & Artist */}
          <div className="flex flex-col justify-center min-w-0">
            {currentSong ? (
              <>
                <span className="text-sm text-white/90 truncate leading-tight font-medium">
                  {currentSong.title}
                </span>
                <span className="text-xs text-white/40 truncate leading-tight mt-0.5">
                  {currentSong.artist}
                </span>
              </>
            ) : (
              <span className="text-sm text-white/40 truncate leading-tight">
                星荧音乐 - 开始播放
              </span>
            )}
          </div>
        </div>

        {/* ═══ Center Section: Controls + Progress ═══ */}
        <div className="flex-1 flex flex-col items-center justify-center gap-1.5 max-w-[640px] mx-auto">
          {/* Playback Buttons */}
          <div className="flex items-center gap-6">
            {/* Previous */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={playPrev}
                  className="w-8 h-8 flex items-center justify-center text-white/50 hover:text-white transition-colors cursor-pointer"
                  aria-label="上一首"
                >
                  <SkipBack className="w-4.5 h-4.5" fill="currentColor" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-[#0C1018] border-white/10 text-white/80 text-xs">
                上一首
              </TooltipContent>
            </Tooltip>

            {/* Play/Pause */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handlePlayPause}
                  className={`
                    w-10 h-10 flex items-center justify-center rounded-full
                    bg-[#4FD1C5] text-[#06080E] transition-all duration-300 cursor-pointer
                    hover:scale-105 active:scale-95
                    ${isPlaying ? 'shadow-[0_0_16px_rgba(79,209,197,0.5)]' : ''}
                  `}
                  aria-label={isPlaying ? '暂停' : '播放'}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5" fill="currentColor" />
                  ) : (
                    <Play className="w-5 h-5 ml-0.5" fill="currentColor" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-[#0C1018] border-white/10 text-white/80 text-xs">
                {isPlaying ? '暂停' : '播放'}
              </TooltipContent>
            </Tooltip>

            {/* Next */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={playNext}
                  className="w-8 h-8 flex items-center justify-center text-white/50 hover:text-white transition-colors cursor-pointer"
                  aria-label="下一首"
                >
                  <SkipForward className="w-4.5 h-4.5" fill="currentColor" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-[#0C1018] border-white/10 text-white/80 text-xs">
                下一首
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-2.5 w-full">
            <span className="text-[11px] text-white/35 tabular-nums w-9 text-right shrink-0 leading-none">
              {formatTime(currentTime)}
            </span>
            <Slider
              min={0}
              max={duration || 100}
              value={[currentTime]}
              onValueChange={handleProgressChange}
              onValueCommit={handleProgressCommit}
              className="flex-1 [&_[data-slot=slider-track]]:h-1 [&_[data-slot=slider-track]]:bg-white/10 [&_[data-slot=slider-track]]:rounded-full [&_[data-slot=slider-range]]:bg-[#4FD1C5] [&_[data-slot=slider-range]]:rounded-full [&_[data-slot=slider-thumb]]:w-3 [&_[data-slot=slider-thumb]]:h-3 [&_[data-slot=slider-thumb]]:border-[#4FD1C5] [&_[data-slot=slider-thumb]]:bg-white [&_[data-slot=slider-thumb]]:shadow-[0_0_6px_rgba(79,209,197,0.4)] [&_[data-slot=slider-thumb]]:hover:shadow-[0_0_10px_rgba(79,209,197,0.6)] [&_[data-slot=slider-thumb]]:transition-shadow"
            />
            <span className="text-[11px] text-white/35 tabular-nums w-9 shrink-0 leading-none">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* ═══ Right Section: Additional Controls ═══ */}
        <div className="flex items-center gap-1 w-[280px] min-w-[220px] shrink-0 justify-end">
          {/* Play Mode */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={cyclePlayMode}
                className={`
                  w-8 h-8 flex items-center justify-center transition-colors cursor-pointer
                  ${playMode === 'sequence' ? 'text-white/35 hover:text-white/60' : 'text-[#4FD1C5]/70 hover:text-[#4FD1C5]'}
                `}
                aria-label={playModeLabels[playMode]}
              >
                <PlayModeIcon className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-[#0C1018] border-white/10 text-white/80 text-xs">
              {playModeLabels[playMode]}
            </TooltipContent>
          </Tooltip>

          {/* Volume with hover popup - vertical slider */}
          <div
            className="relative ml-1"
            onMouseEnter={handleVolumeEnter}
            onMouseLeave={handleVolumeLeave}
          >
            <button
              onClick={toggleMute}
              className="w-8 h-8 flex items-center justify-center text-white/35 hover:text-white/70 transition-colors cursor-pointer"
              aria-label={isMuted ? '取消静音' : '静音'}
            >
              <VolumeIcon className="w-4 h-4" />
            </button>
            {/* Vertical volume slider popup */}
            <div
              className={`
                absolute bottom-full left-1/2 -translate-x-1/2 mb-2
                transition-all duration-200
                bg-[#0C1018]/95 backdrop-blur-xl border border-white/[0.1] rounded-xl p-3 pt-2
                flex flex-col items-center gap-2
                ${isVolumeHovered ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-1'}
              `}
            >
              <Slider
                orientation="vertical"
                min={0}
                max={100}
                value={[displayVolume]}
                onValueChange={handleVolumeChange}
                className="
                  h-28 w-auto
                  [&_[data-slot=slider-track]]:w-1.5 [&_[data-slot=slider-track]]:h-full [&_[data-slot=slider-track]]:bg-white/10 [&_[data-slot=slider-track]]:rounded-full
                  [&_[data-slot=slider-range]]:bg-[#4FD1C5] [&_[data-slot=slider-range]]:rounded-full
                  [&_[data-slot=slider-thumb]]:w-3 [&_[data-slot=slider-thumb]]:h-3 [&_[data-slot=slider-thumb]]:border-[#4FD1C5] [&_[data-slot=slider-thumb]]:bg-white [&_[data-slot=slider-thumb]]:shadow-[0_0_6px_rgba(79,209,197,0.3)] [&_[data-slot=slider-thumb]]:transition-shadow
                "
              />
              <span className="text-[10px] text-white/40 tabular-nums">{displayVolume}</span>
            </div>
          </div>

          {/* Quality Badge */}
          <div className="h-5 px-1.5 rounded text-[9px] font-medium border border-[#4FD1C5]/30 text-[#4FD1C5]/80 bg-[#4FD1C5]/8 flex items-center justify-center">
            高品
          </div>

          {/* Effect Badge - hover shows effect name, click opens equalizer */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={toggleEq}
                className="h-5 px-1.5 rounded text-[9px] font-medium border border-[#B794F6]/30 text-[#B794F6]/80 bg-[#B794F6]/8 flex items-center justify-center cursor-pointer hover:bg-[#B794F6]/15 hover:border-[#B794F6]/50 transition-all"
                aria-label="打开均衡器"
              >
                {AUDIO_EFFECT_PRESETS[activePreset].label}
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-[#0C1018] border-white/10 text-white/80 text-xs">
              音效：{AUDIO_EFFECT_PRESETS[activePreset].label}
            </TooltipContent>
          </Tooltip>

          {/* Divider */}
          <div className="w-px h-5 bg-white/10 mx-1.5" />

          {/* Lyrics */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={togglePlayerExpanded}
                className="w-8 h-8 flex items-center justify-center text-white/35 hover:text-[#4FD1C5] transition-colors cursor-pointer"
                aria-label="歌词"
              >
                <FileText className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-[#0C1018] border-white/10 text-white/80 text-xs">
              歌词
            </TooltipContent>
          </Tooltip>

          {/* Playlist */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={togglePlayerExpanded}
                className="w-8 h-8 flex items-center justify-center text-white/35 hover:text-[#4FD1C5] transition-colors cursor-pointer"
                aria-label="播放列表"
              >
                <ListMusic className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-[#0C1018] border-white/10 text-white/80 text-xs">
              播放列表
            </TooltipContent>
          </Tooltip>
        </div>
      </footer>
    </TooltipProvider>
  )
}
