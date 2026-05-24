'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { Play, Headphones, Music2, Disc3, UserCircle } from 'lucide-react'
import { usePlayerStore, type SongInfo } from '@/stores/playerStore'

// ─── Demo Data ──────────────────────────────────────────────

const collectedSongs = [
  { id: '1', title: '星荧之歌', artist: '星辰乐队', album: '星荧专辑', duration: 245 },
  { id: '2', title: '夜空漫步', artist: '月影', album: '月光集', duration: 198 },
  { id: '3', title: '光影交错', artist: '晨曦', album: '光年之外', duration: 267 },
  { id: '4', title: '星际旅行', artist: '宇宙乐团', album: '太空漫游', duration: 312 },
  { id: '5', title: '梦中星海', artist: '梦旅人', album: '梦境', duration: 223 },
]

const collectedPlaylists = [
  { id: '1', name: '我的最爱', cover: '/default-cover.png', songCount: 28 },
  { id: '2', name: '工作BGM', cover: '/default-cover.png', songCount: 15 },
  { id: '3', name: '深夜听歌', cover: '/default-cover.png', songCount: 42 },
  { id: '4', name: '运动音乐', cover: '/default-cover.png', songCount: 20 },
]

const collectedAlbums = [
  { id: '1', name: '星荧专辑', artist: '星辰乐队', cover: '/default-cover.png' },
  { id: '2', name: '月光集', artist: '月影', cover: '/default-cover.png' },
  { id: '3', name: '光年之外', artist: '晨曦', cover: '/default-cover.png' },
  { id: '4', name: '太空漫游', artist: '宇宙乐团', cover: '/default-cover.png' },
]

const collectedArtists = [
  { id: '1', name: '星辰乐队', avatar: '/default-cover.png', songCount: 32 },
  { id: '2', name: '月影', avatar: '/default-cover.png', songCount: 18 },
  { id: '3', name: '晨曦', avatar: '/default-cover.png', songCount: 24 },
  { id: '4', name: '宇宙乐团', avatar: '/default-cover.png', songCount: 45 },
]

// ─── Types ──────────────────────────────────────────────────

type TabKey = 'singles' | 'playlists' | 'albums' | 'artists'

interface TabItem {
  key: TabKey
  label: string
}

const tabs: TabItem[] = [
  { key: 'singles', label: '单曲' },
  { key: 'playlists', label: '歌单' },
  { key: 'albums', label: '专辑' },
  { key: 'artists', label: '歌手' },
]

// ─── Helpers ────────────────────────────────────────────────

function formatDuration(seconds: number): string {
  const min = Math.floor(seconds / 60)
  const sec = seconds % 60
  return `${min}:${sec.toString().padStart(2, '0')}`
}

/** Convert a demo song entry into a SongInfo object for the player store */
function toSongInfo(song: (typeof collectedSongs)[number]): SongInfo {
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

// ─── Sub-Components ─────────────────────────────────────────

function SinglesTab() {
  const { setPlayQueue, setCurrentSong, setIsPlaying, currentSong, isPlaying } = usePlayerStore()
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const handlePlaySong = useCallback(
    (index: number) => {
      const songs = collectedSongs.map(toSongInfo)
      setPlayQueue(songs, index)
      setCurrentSong(songs[index])
      setIsPlaying(true)
    },
    [setPlayQueue, setCurrentSong, setIsPlaying]
  )

  return (
    <div className="glass-light rounded-xl overflow-hidden">
      {/* Table Header */}
      <div className="grid grid-cols-[40px_1fr_60px] sm:grid-cols-[40px_1.5fr_1fr_1fr_60px] gap-2 px-4 py-2.5 text-xs text-white/30 uppercase tracking-wider border-b border-white/[0.06]">
        <span className="text-center">#</span>
        <span>歌曲名</span>
        <span className="hidden sm:block">歌手</span>
        <span className="hidden sm:block">专辑</span>
        <span className="text-right">时长</span>
      </div>

      {/* Song Rows */}
      {collectedSongs.map((song, index) => {
        const isCurrentSong = currentSong?.id === song.id

        return (
          <div
            key={song.id}
            className={`
              song-row grid grid-cols-[40px_1fr_60px] sm:grid-cols-[40px_1.5fr_1fr_1fr_60px]
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

            {/* Duration */}
            <span className="text-sm text-white/40 text-right tabular-nums">
              {formatDuration(song.duration)}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function PlaylistsTab() {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {collectedPlaylists.map((playlist) => (
        <div
          key={playlist.id}
          className="group cursor-pointer"
          onMouseEnter={() => setHoveredId(playlist.id)}
          onMouseLeave={() => setHoveredId(null)}
        >
          {/* Cover Image */}
          <div className="relative aspect-square rounded-xl overflow-hidden mb-2 shadow-lg shadow-black/30">
            <Image
              src={playlist.cover}
              alt={playlist.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
            />

            {/* Glassmorphism overlay on hover */}
            <div
              className={`
                absolute inset-0
                bg-black/30 backdrop-blur-[2px]
                flex items-center justify-center
                transition-opacity duration-200
                ${hoveredId === playlist.id ? 'opacity-100' : 'opacity-0'}
              `}
            >
              <div className="w-12 h-12 rounded-full bg-[#4FD1C5]/90 flex items-center justify-center shadow-lg shadow-[#4FD1C5]/30 transition-transform duration-200 group-hover:scale-110">
                <Play className="w-5 h-5 text-[#06080E] ml-0.5" fill="currentColor" />
              </div>
            </div>

            {/* Song count badge */}
            <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-sm text-[10px] text-white/80">
              <Music2 className="w-3 h-3" />
              <span>{playlist.songCount}首</span>
            </div>
          </div>

          {/* Playlist Name */}
          <p className="text-sm text-white/70 group-hover:text-white/95 transition-colors line-clamp-2 leading-snug">
            {playlist.name}
          </p>
        </div>
      ))}
    </div>
  )
}

function AlbumsTab() {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {collectedAlbums.map((album) => (
        <div
          key={album.id}
          className="group cursor-pointer"
          onMouseEnter={() => setHoveredId(album.id)}
          onMouseLeave={() => setHoveredId(null)}
        >
          {/* Cover Image */}
          <div className="relative aspect-square rounded-xl overflow-hidden mb-2 shadow-lg shadow-black/30">
            <Image
              src={album.cover}
              alt={album.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
            />

            {/* Glassmorphism overlay on hover */}
            <div
              className={`
                absolute inset-0
                bg-black/30 backdrop-blur-[2px]
                flex items-center justify-center
                transition-opacity duration-200
                ${hoveredId === album.id ? 'opacity-100' : 'opacity-0'}
              `}
            >
              <div className="w-12 h-12 rounded-full bg-[#4FD1C5]/90 flex items-center justify-center shadow-lg shadow-[#4FD1C5]/30 transition-transform duration-200 group-hover:scale-110">
                <Disc3 className="w-5 h-5 text-[#06080E]" />
              </div>
            </div>
          </div>

          {/* Album Name */}
          <p className="text-sm text-white/80 group-hover:text-white/95 transition-colors line-clamp-1 leading-snug">
            {album.name}
          </p>

          {/* Artist Name */}
          <p className="text-xs text-white/40 group-hover:text-white/60 transition-colors mt-0.5">
            {album.artist}
          </p>
        </div>
      ))}
    </div>
  )
}

function ArtistsTab() {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {collectedArtists.map((artist) => (
        <div
          key={artist.id}
          className="group cursor-pointer flex flex-col items-center"
          onMouseEnter={() => setHoveredId(artist.id)}
          onMouseLeave={() => setHoveredId(null)}
        >
          {/* Avatar */}
          <div className="relative w-full aspect-square rounded-full overflow-hidden mb-3 shadow-lg shadow-black/30 border-2 border-white/10 group-hover:border-[#4FD1C5]/40 transition-colors duration-300">
            <Image
              src={artist.avatar}
              alt={artist.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
            />

            {/* Glassmorphism overlay on hover */}
            <div
              className={`
                absolute inset-0
                bg-black/30 backdrop-blur-[2px]
                flex items-center justify-center
                transition-opacity duration-200
                ${hoveredId === artist.id ? 'opacity-100' : 'opacity-0'}
              `}
            >
              <div className="w-12 h-12 rounded-full bg-[#4FD1C5]/90 flex items-center justify-center shadow-lg shadow-[#4FD1C5]/30 transition-transform duration-200 group-hover:scale-110">
                <UserCircle className="w-5 h-5 text-[#06080E]" />
              </div>
            </div>
          </div>

          {/* Artist Name */}
          <p className="text-sm text-white/80 group-hover:text-white/95 transition-colors text-center line-clamp-1">
            {artist.name}
          </p>

          {/* Song Count */}
          <p className="text-xs text-white/40 group-hover:text-white/60 transition-colors mt-0.5 flex items-center gap-1">
            <Headphones className="w-3 h-3" />
            <span>{artist.songCount}首</span>
          </p>
        </div>
      ))}
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────

export default function CollectionPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('singles')

  const renderContent = () => {
    switch (activeTab) {
      case 'singles':
        return <SinglesTab />
      case 'playlists':
        return <PlaylistsTab />
      case 'albums':
        return <AlbumsTab />
      case 'artists':
        return <ArtistsTab />
    }
  }

  return (
    <div className="h-full overflow-y-auto px-4 sm:px-6 pb-8 pt-4 space-y-6">
      {/* Title */}
      <h1 className="text-[28px] font-bold text-white/90">我的收藏</h1>

      {/* Tab Bar */}
      <nav className="flex gap-6 border-b border-white/[0.08]" aria-label="收藏分类">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`
              relative pb-3 text-sm font-medium transition-colors duration-200 cursor-pointer
              ${activeTab === tab.key
                ? 'text-[#4FD1C5]'
                : 'text-white/40 hover:text-white/70'
              }
            `}
            onClick={() => setActiveTab(tab.key)}
            role="tab"
            aria-selected={activeTab === tab.key}
            aria-controls={`panel-${tab.key}`}
          >
            {tab.label}
            {/* Active indicator */}
            {activeTab === tab.key && (
              <span
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#4FD1C5] rounded-full shadow-[0_0_8px_rgba(79,209,197,0.4)]"
              />
            )}
          </button>
        ))}
      </nav>

      {/* Tab Content */}
      <section
        id={`panel-${activeTab}`}
        role="tabpanel"
        className="animate-in fade-in duration-200"
      >
        {renderContent()}
      </section>
    </div>
  )
}
