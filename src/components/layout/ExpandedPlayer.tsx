'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  Minus,
  Square,
  X,
  ChevronDown,
  Music,
  Search,
  Plus,
  Trash2,
  SkipBack,
  Play,
  Pause,
  SkipForward,
  Repeat,
  Repeat1,
  Shuffle,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { usePlayerStore } from '@/stores/playerStore'
import { Slider } from '@/components/ui/slider'

/** Format seconds into m:ss */
function formatTime(seconds: number): string {
  if (!seconds || !isFinite(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

type ActiveTab = 'lyrics' | 'queue'

export default function ExpandedPlayer() {
  const {
    currentSong,
    isPlaying,
    isPlayerExpanded,
    playQueue,
    queueIndex,
    togglePlayerExpanded,
    playSongFromQueue,
    clearQueue,
  } = usePlayerStore()

  const [activeTab, setActiveTab] = useState<ActiveTab>('lyrics')

  // When not expanded, render nothing
  if (!isPlayerExpanded) return null

  const hasSong = currentSong !== null
  const coverSrc = currentSong?.coverPath || '/default-cover.png'

  return (
    <div className="fixed inset-0 z-[60] expanded-player-enter flex flex-col">
      {/* ═══════════════════════════════════════════════════
          Full-screen overlay background
      ═══════════════════════════════════════════════════ */}
      <div className="absolute inset-0 bg-[#06080E]/95 backdrop-blur-2xl" />

      {/* Subtle background gradient accents */}
      {hasSong && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              background:
                'radial-gradient(ellipse at 30% 20%, rgba(79,209,197,0.15) 0%, transparent 70%)',
            }}
          />
          <div
            className="absolute inset-0 opacity-10"
            style={{
              background:
                'radial-gradient(ellipse at 70% 80%, rgba(183,148,246,0.12) 0%, transparent 60%)',
            }}
          />
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          Content layer
      ═══════════════════════════════════════════════════ */}
      <div className="relative z-10 flex flex-col h-full">
        {/* ─── Top Bar: Tabs + Window Controls ─── */}
        <header className="flex items-center justify-between px-6 h-12 shrink-0">
          {/* Left: Tab bar */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('lyrics')}
              className={`
                px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer relative
                ${activeTab === 'lyrics' ? 'text-[#4FD1C5]' : 'text-white/40 hover:text-white/70'}
              `}
            >
              歌词
              {activeTab === 'lyrics' && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#4FD1C5] rounded-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('queue')}
              className={`
                px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer relative
                ${activeTab === 'queue' ? 'text-[#4FD1C5]' : 'text-white/40 hover:text-white/70'}
              `}
            >
              播放队列
              {activeTab === 'queue' && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#4FD1C5] rounded-full" />
              )}
            </button>
          </div>

          {/* Right: Window controls + collapse */}
          <div className="flex items-center gap-1">
            <button
              className="w-8 h-8 flex items-center justify-center rounded-md text-white/40 hover:text-white/80 hover:bg-white/5 transition-colors cursor-pointer"
              aria-label="最小化"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              className="w-8 h-8 flex items-center justify-center rounded-md text-white/40 hover:text-white/80 hover:bg-white/5 transition-colors cursor-pointer"
              aria-label="最大化"
            >
              <Square className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={togglePlayerExpanded}
              className="w-8 h-8 flex items-center justify-center rounded-md text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-colors cursor-pointer"
              aria-label="关闭"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-white/10 mx-1" />
            <button
              onClick={togglePlayerExpanded}
              className="w-8 h-8 flex items-center justify-center rounded-md text-white/40 hover:text-[#4FD1C5] hover:bg-[#4FD1C5]/10 transition-colors cursor-pointer"
              aria-label="收起播放器"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* ─── Main Content Area ─── */}
        <div className="flex-1 min-h-0 flex flex-col">
          {activeTab === 'lyrics' ? (
            /* ═══════════════════════════════════════════
               歌词 Tab: Centered cover + song info + lyrics
            ═══════════════════════════════════════════ */
            <section className="flex-1 flex flex-col items-center overflow-y-auto px-6 py-6">
              {/* Album cover: round, spinning when playing */}
              <div className="relative group shrink-0">
                {/* Animated outer pulse rings when playing */}
                {isPlaying && (
                  <>
                    <div className="absolute -inset-5 rounded-full border border-[#4FD1C5]/15 animate-[pulse_3s_ease-in-out_infinite]" />
                    <div className="absolute -inset-3 rounded-full border border-[#B794F6]/10 animate-[pulse_3s_ease-in-out_0.75s_infinite]" />
                  </>
                )}

                {/* Glow backdrop */}
                <div
                  className={`
                    absolute -inset-2 rounded-full transition-opacity duration-700
                    ${isPlaying ? 'opacity-100' : 'opacity-50'}
                  `}
                  style={{
                    background:
                      'radial-gradient(circle, rgba(79,209,197,0.25) 0%, rgba(183,148,246,0.15) 50%, transparent 70%)',
                    filter: 'blur(16px)',
                  }}
                />

                {/* Spinning cover image */}
                <div
                  className={`
                    relative w-[280px] h-[280px] rounded-full overflow-hidden
                    border-2 border-[#4FD1C5]/30 starfire-glow
                    animate-spin-slow
                    ${!isPlaying ? 'paused' : ''}
                  `}
                >
                  <Image
                    src={coverSrc}
                    alt={hasSong ? currentSong!.title : '星荧音乐'}
                    fill
                    className="object-cover"
                    priority
                  />
                  {/* Center circle overlay for vinyl effect */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-16 h-16 rounded-full bg-[#06080E]/80 border border-white/10 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-[#4FD1C5]/30" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Song title */}
              <h2 className="mt-8 text-2xl font-semibold text-white/90 text-center truncate max-w-full">
                {hasSong ? currentSong!.title : '星荧音乐'}
              </h2>

              {/* Artist name */}
              <p className="mt-2 text-sm text-white/40 text-center truncate max-w-full">
                {hasSong ? currentSong!.artist : '等待播放...'}
              </p>

              {/* Lyrics placeholder area */}
              <div className="mt-8 flex-1 min-h-[120px] flex items-center justify-center w-full max-w-lg">
                <div className="flex flex-col items-center gap-3 text-white/20">
                  <Music className="w-12 h-12" />
                  <p className="text-base">还没有歌词哦</p>
                </div>
              </div>
            </section>
          ) : (
            /* ═══════════════════════════════════════════
               播放队列 Tab: Queue list with actions
            ═══════════════════════════════════════════ */
            <section className="flex-1 flex flex-col min-h-0 px-6 py-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-1 shrink-0">
                <h3 className="text-base font-semibold text-white/90">播放队列</h3>
              </div>

              {/* Sub-info */}
              <div className="flex items-center gap-2 text-xs text-white/30 mb-3 shrink-0">
                <span>共{playQueue.length}首</span>
                <span className="text-white/10">|</span>
                <span>来源：本地歌曲</span>
              </div>

              {/* Action bar */}
              <div className="flex items-center gap-1 mb-3 shrink-0">
                <button
                  className="w-8 h-8 flex items-center justify-center rounded-md text-white/30 hover:text-[#4FD1C5] hover:bg-white/5 transition-colors cursor-pointer"
                  aria-label="搜索"
                >
                  <Search className="w-4 h-4" />
                </button>
                <button
                  className="w-8 h-8 flex items-center justify-center rounded-md text-white/30 hover:text-[#4FD1C5] hover:bg-white/5 transition-colors cursor-pointer"
                  aria-label="添加"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={clearQueue}
                  className="w-8 h-8 flex items-center justify-center rounded-md text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-colors cursor-pointer"
                  aria-label="清空队列"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Song list */}
              <div className="flex-1 min-h-0 overflow-y-auto scroll-smooth pr-1 custom-queue-scroll">
                {playQueue.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-white/15 gap-2">
                    <Music className="w-8 h-8" />
                    <p className="text-sm">队列为空</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-0.5">
                    {playQueue.map((song, index) => {
                      const isCurrentSong = index === queueIndex
                      const isEvenRow = index % 2 === 0
                      return (
                        <button
                          key={`${song.id}-${index}`}
                          onClick={() => playSongFromQueue(index)}
                          className={`
                            flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 w-full text-left cursor-pointer
                            ${
                              isCurrentSong
                                ? 'bg-[#4FD1C5]/15 border border-[#4FD1C5]/20 shadow-[0_0_12px_rgba(79,209,197,0.1)]'
                                : isEvenRow
                                  ? 'bg-white/[0.03] hover:bg-white/[0.07]'
                                  : 'bg-transparent hover:bg-white/[0.07]'
                            }
                          `}
                        >
                          {/* Index / Playing indicator */}
                          <span
                            className={`
                              w-6 text-center text-xs tabular-nums shrink-0
                              ${isCurrentSong ? 'text-[#4FD1C5]' : 'text-white/25'}
                            `}
                          >
                            {isCurrentSong && isPlaying ? (
                              <span className="inline-flex items-center gap-[2px]">
                                <span className="w-[3px] h-3 bg-[#4FD1C5] rounded-full animate-[bounce_0.6s_ease-in-out_infinite]" />
                                <span className="w-[3px] h-4 bg-[#4FD1C5] rounded-full animate-[bounce_0.6s_ease-in-out_0.15s_infinite]" />
                                <span className="w-[3px] h-2 bg-[#4FD1C5] rounded-full animate-[bounce_0.6s_ease-in-out_0.3s_infinite]" />
                              </span>
                            ) : isCurrentSong ? (
                              <Music className="w-3 h-3 inline-block text-[#4FD1C5]" />
                            ) : (
                              index + 1
                            )}
                          </span>

                          {/* Song title */}
                          <span
                            className={`
                              flex-1 text-sm truncate
                              ${isCurrentSong ? 'text-[#4FD1C5] font-medium' : 'text-white/70'}
                            `}
                          >
                            {song.title}
                          </span>

                          {/* Duration */}
                          <span
                            className={`
                              text-xs tabular-nums shrink-0
                              ${isCurrentSong ? 'text-[#4FD1C5]/60' : 'text-white/25'}
                            `}
                          >
                            {formatTime(song.duration)}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </section>
          )}
        </div>

        {/* ─── Bottom: PlayerBar ─── */}
        <div className="shrink-0 border-t border-white/5">
          <ExpandedPlayerBar />
        </div>
      </div>
    </div>
  )
}

/**
 * A simplified version of the PlayerBar that appears at the bottom of
 * the expanded player. Uses lucide-react icons and the Slider component.
 * Layout: Left (song info) | Center (progress + controls) | Right (play mode + volume + collapse)
 */
function ExpandedPlayerBar() {
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
    setVolume,
    toggleMute,
    cyclePlayMode,
    playNext,
    playPrev,
    togglePlayerExpanded,
  } = usePlayerStore()

  const displayVolume = isMuted ? 0 : volume

  // Play mode icon mapping using lucide-react
  const playModeConfig: Record<string, { icon: React.ElementType; label: string }> = {
    sequence: { icon: Repeat, label: '顺序播放' },
    loop: { icon: Repeat, label: '列表循环' },
    single: { icon: Repeat1, label: '单曲循环' },
    random: { icon: Shuffle, label: '随机播放' },
  }

  const modeConfig = playModeConfig[playMode] || playModeConfig.sequence
  const PlayModeIcon = modeConfig.icon

  return (
    <footer className="flex items-center px-6 py-3 gap-4 select-none">
      {/* Left: Song info (cover thumbnail + title/artist) */}
      <div className="flex items-center gap-3 w-[220px] min-w-[160px] shrink-0">
        <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10 shrink-0">
          <Image
            src={currentSong?.coverPath || '/default-cover.png'}
            alt={currentSong?.title || '星荧音乐'}
            width={40}
            height={40}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex flex-col justify-center min-w-0">
          {currentSong ? (
            <>
              <span className="text-xs text-white/80 truncate leading-tight">
                {currentSong.title}
              </span>
              <span className="text-[10px] text-white/30 truncate leading-tight mt-0.5">
                {currentSong.artist}
              </span>
            </>
          ) : (
            <span className="text-xs text-white/30 truncate leading-tight">
              星荧音乐
            </span>
          )}
        </div>
      </div>

      {/* Center: Progress bar + Playback controls */}
      <div className="flex-1 flex flex-col items-center justify-center gap-1.5 max-w-[560px] mx-auto">
        {/* Playback Buttons */}
        <div className="flex items-center gap-3">
          {/* Previous */}
          <button
            onClick={playPrev}
            className="w-8 h-8 flex items-center justify-center text-white/50 hover:text-white transition-colors cursor-pointer"
            aria-label="上一首"
          >
            <SkipBack className="w-4 h-4" fill="currentColor" />
          </button>

          {/* Play/Pause */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`
              w-10 h-10 flex items-center justify-center rounded-full
              bg-[#4FD1C5] text-[#06080E] transition-all duration-300 cursor-pointer
              hover:scale-105 active:scale-95
              ${isPlaying ? 'animate-pulse-glow' : ''}
            `}
            aria-label={isPlaying ? '暂停' : '播放'}
          >
            {isPlaying ? (
              <Pause className="w-4.5 h-4.5" fill="currentColor" />
            ) : (
              <Play className="w-4.5 h-4.5 ml-0.5" fill="currentColor" />
            )}
          </button>

          {/* Next */}
          <button
            onClick={playNext}
            className="w-8 h-8 flex items-center justify-center text-white/50 hover:text-white transition-colors cursor-pointer"
            aria-label="下一首"
          >
            <SkipForward className="w-4 h-4" fill="currentColor" />
          </button>
        </div>

        {/* Progress Bar with time labels */}
        <div className="flex items-center gap-2 w-full">
          <span className="text-[10px] text-white/30 tabular-nums w-8 text-right shrink-0">
            {formatTime(currentTime)}
          </span>
          <Slider
            value={[currentTime]}
            min={0}
            max={duration || 100}
            step={0.1}
            onValueChange={(val) => setCurrentTime(val[0])}
            className="cursor-pointer"
          />
          <span className="text-[10px] text-white/30 tabular-nums w-8 shrink-0">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Right: Play mode + Volume + Collapse */}
      <div className="flex items-center gap-2 w-[220px] min-w-[160px] shrink-0 justify-end">
        {/* Play mode */}
        <button
          onClick={cyclePlayMode}
          className="w-7 h-7 flex items-center justify-center text-white/30 hover:text-[#4FD1C5] transition-colors cursor-pointer"
          aria-label={modeConfig.label}
        >
          <PlayModeIcon className="w-3.5 h-3.5" />
        </button>

        {/* Volume */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleMute}
            className="w-7 h-7 flex items-center justify-center text-white/30 hover:text-white transition-colors cursor-pointer"
            aria-label={isMuted ? '取消静音' : '静音'}
          >
            {isMuted || displayVolume === 0 ? (
              <VolumeX className="w-3.5 h-3.5" />
            ) : (
              <Volume2 className="w-3.5 h-3.5" />
            )}
          </button>
          <div className="w-16">
            <Slider
              value={[displayVolume]}
              min={0}
              max={100}
              step={1}
              onValueChange={(val) => setVolume(val[0])}
              className="cursor-pointer"
            />
          </div>
        </div>

        {/* Collapse button */}
        <button
          onClick={togglePlayerExpanded}
          className="w-7 h-7 flex items-center justify-center text-white/30 hover:text-[#4FD1C5] hover:bg-[#4FD1C5]/10 rounded-md transition-colors cursor-pointer"
          aria-label="收起播放器"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>
    </footer>
  )
}
