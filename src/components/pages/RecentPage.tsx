'use client'

import { useState, useCallback } from 'react'
import { Play, Clock } from 'lucide-react'
import { usePlayerStore, type SongInfo } from '@/stores/playerStore'

// ─── Demo Data ──────────────────────────────────────────────

const recentSongs = [
  { id: '1', title: '星荧之歌', artist: '星辰乐队', album: '星荧专辑', duration: 245, playedAt: '刚刚' },
  { id: '2', title: '夜空漫步', artist: '月影', album: '月光集', duration: 198, playedAt: '5分钟前' },
  { id: '3', title: '光影交错', artist: '晨曦', album: '光年之外', duration: 267, playedAt: '10分钟前' },
  { id: '4', title: '星际旅行', artist: '宇宙乐团', album: '太空漫游', duration: 312, playedAt: '30分钟前' },
  { id: '5', title: '梦中星海', artist: '梦旅人', album: '梦境', duration: 223, playedAt: '1小时前' },
  { id: '6', title: '荧光之舞', artist: '光影', album: '舞动星荧', duration: 189, playedAt: '2小时前' },
  { id: '7', title: '午夜流星', artist: '夜行者', album: '深夜电台', duration: 256, playedAt: '3小时前' },
  { id: '8', title: '星尘往事', artist: '回忆录', album: '时光机', duration: 234, playedAt: '昨天' },
  { id: '9', title: '银河列车', artist: '旅人', album: '星际之旅', duration: 278, playedAt: '昨天' },
  { id: '10', title: '星辰变奏曲', artist: '交响乐团', album: '宇宙交响', duration: 345, playedAt: '2天前' },
]

// ─── Helpers ────────────────────────────────────────────────

function formatDuration(seconds: number): string {
  const min = Math.floor(seconds / 60)
  const sec = seconds % 60
  return `${min}:${sec.toString().padStart(2, '0')}`
}

/** Convert a demo song entry into a SongInfo object for the player store */
function toSongInfo(song: (typeof recentSongs)[number]): SongInfo {
  return {
    id: song.id,
    title: song.title,
    artist: song.artist,
    album: song.album,
    duration: song.duration,
    filePath: '',
    coverPath: '/default-cover.png',
    isLocal: false,
  }
}

// ─── Component ──────────────────────────────────────────────

export default function RecentPage() {
  const { setPlayQueue, setCurrentSong, setIsPlaying, currentSong, isPlaying } = usePlayerStore()
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const handlePlaySong = useCallback(
    (index: number) => {
      const songs = recentSongs.map(toSongInfo)
      setPlayQueue(songs, index)
      setCurrentSong(songs[index])
      setIsPlaying(true)
    },
    [setPlayQueue, setCurrentSong, setIsPlaying]
  )

  return (
    <div className="h-full overflow-y-auto px-4 sm:px-6 pb-8 pt-4 space-y-6">
      {/* Title */}
      <div className="flex items-center gap-3">
        <Clock className="w-6 h-6 text-[#4FD1C5]" />
        <h1 className="text-[28px] font-bold text-white/90">最近播放</h1>
        <span className="text-sm text-white/30 ml-1">{recentSongs.length}首</span>
      </div>

      {/* Song List Table */}
      <div className="glass-light rounded-xl overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-[40px_1fr_70px] sm:grid-cols-[40px_1.5fr_1fr_1fr_80px_70px] gap-2 px-4 py-2.5 text-xs text-white/30 uppercase tracking-wider border-b border-white/[0.06]">
          <span className="text-center">#</span>
          <span>歌曲名</span>
          <span className="hidden sm:block">歌手</span>
          <span className="hidden sm:block">专辑</span>
          <span className="hidden sm:block text-right">播放时间</span>
          <span className="text-right">时长</span>
        </div>

        {/* Song Rows */}
        {recentSongs.map((song, index) => {
          const isCurrentSong = currentSong?.id === song.id

          return (
            <div
              key={song.id}
              className={`
                song-row grid grid-cols-[40px_1fr_70px] sm:grid-cols-[40px_1.5fr_1fr_1fr_80px_70px]
                gap-2 px-4 py-2.5 items-center cursor-pointer
                border-b border-white/[0.04] last:border-b-0
                transition-colors duration-150
                ${isCurrentSong ? 'playing' : ''}
              `}
              onClick={() => handlePlaySong(index)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              role="button"
              tabIndex={0}
              aria-label={`播放 ${song.title}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handlePlaySong(index)
                }
              }}
            >
              {/* Index / Play Icon */}
              <div className="flex items-center justify-center">
                {hoveredIndex === index ? (
                  <Play className="w-4 h-4 text-[#4FD1C5]" fill="currentColor" />
                ) : isCurrentSong && isPlaying ? (
                  <div className="flex items-end gap-[2px] h-4">
                    <span className="w-[3px] bg-[#4FD1C5] rounded-full animate-bounce" style={{ height: '60%', animationDelay: '0ms' }} />
                    <span className="w-[3px] bg-[#4FD1C5] rounded-full animate-bounce" style={{ height: '100%', animationDelay: '150ms' }} />
                    <span className="w-[3px] bg-[#4FD1C5] rounded-full animate-bounce" style={{ height: '40%', animationDelay: '300ms' }} />
                  </div>
                ) : (
                  <span className={`text-sm tabular-nums ${isCurrentSong ? 'text-[#4FD1C5]' : 'text-white/30'}`}>
                    {index + 1}
                  </span>
                )}
              </div>

              {/* Song Title */}
              <span className={`text-sm truncate ${isCurrentSong ? 'text-[#4FD1C5]' : 'text-white/80'}`}>
                {song.title}
              </span>

              {/* Artist */}
              <span className="text-sm text-white/40 truncate hidden sm:block">
                {song.artist}
              </span>

              {/* Album */}
              <span className="text-sm text-white/40 truncate hidden sm:block">
                {song.album}
              </span>

              {/* Played At */}
              <span className="text-sm text-white/30 text-right hidden sm:block">
                {song.playedAt}
              </span>

              {/* Duration */}
              <span className="text-sm text-white/40 text-right tabular-nums">
                {formatDuration(song.duration)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
