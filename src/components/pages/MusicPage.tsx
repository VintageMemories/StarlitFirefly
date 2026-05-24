'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import { Play, Headphones } from 'lucide-react'
import type { CarouselApi } from '@/components/ui/carousel'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel'
import { usePlayerStore, type SongInfo } from '@/stores/playerStore'
import Autoplay from 'embla-carousel-autoplay'

// ─── Demo Data ──────────────────────────────────────────────

const demoPlaylists = [
  { id: '1', name: '今日星荧推荐', cover: '/default-cover.png', playCount: '12.5万' },
  { id: '2', name: '深夜星辰', cover: '/default-cover.png', playCount: '8.3万' },
  { id: '3', name: '清晨的第一缕光', cover: '/default-cover.png', playCount: '6.1万' },
  { id: '4', name: '星空下的旋律', cover: '/default-cover.png', playCount: '5.7万' },
  { id: '5', name: '电子星云', cover: '/default-cover.png', playCount: '4.2万' },
  { id: '6', name: '治愈星火', cover: '/default-cover.png', playCount: '3.9万' },
  { id: '7', name: '流行星光', cover: '/default-cover.png', playCount: '3.5万' },
  { id: '8', name: '经典星河', cover: '/default-cover.png', playCount: '2.8万' },
]

const demoSongs = [
  { id: '1', title: '星荧之歌', artist: '星辰乐队', album: '星荧专辑', duration: 245 },
  { id: '2', title: '夜空漫步', artist: '月影', album: '月光集', duration: 198 },
  { id: '3', title: '光影交错', artist: '晨曦', album: '光年之外', duration: 267 },
  { id: '4', title: '星际旅行', artist: '宇宙乐团', album: '太空漫游', duration: 312 },
  { id: '5', title: '梦中星海', artist: '梦旅人', album: '梦境', duration: 223 },
  { id: '6', title: '荧光之舞', artist: '光影', album: '舞动星荧', duration: 189 },
  { id: '7', title: '午夜流星', artist: '夜行者', album: '深夜电台', duration: 256 },
  { id: '8', title: '星尘往事', artist: '回忆录', album: '时光机', duration: 234 },
  { id: '9', title: '银河列车', artist: '旅人', album: '星际之旅', duration: 278 },
  { id: '10', title: '星辰变奏曲', artist: '交响乐团', album: '宇宙交响', duration: 345 },
]

const carouselImages = [
  { src: '/carousel1.png', alt: '轮播图1' },
  { src: '/carousel2.png', alt: '轮播图2' },
  { src: '/carousel3.png', alt: '轮播图3' },
]

// ─── Helpers ────────────────────────────────────────────────

function formatDuration(seconds: number): string {
  const min = Math.floor(seconds / 60)
  const sec = seconds % 60
  return `${min}:${sec.toString().padStart(2, '0')}`
}

/** Convert a demo song entry into a SongInfo object for the player store */
function toSongInfo(song: (typeof demoSongs)[number]): SongInfo {
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

export default function MusicPage() {
  const { setPlayQueue, setCurrentSong, setIsPlaying } = usePlayerStore()
  const [hoveredSongIndex, setHoveredSongIndex] = useState<number | null>(null)
  const [hoveredPlaylistId, setHoveredPlaylistId] = useState<string | null>(null)

  // Carousel API & active dot
  const [api, setApi] = useState<CarouselApi>()
  const [activeDot, setActiveDot] = useState(0)

  useEffect(() => {
    if (!api) return

    const onSelect = () => {
      setActiveDot(api.selectedScrollSnap())
    }

    api.on('select', onSelect)
    onSelect()

    return () => {
      api.off('select', onSelect)
    }
  }, [api])

  /** Play a specific song from the demo list */
  const handlePlaySong = useCallback(
    (index: number) => {
      const songs = demoSongs.map(toSongInfo)
      setPlayQueue(songs, index)
      setCurrentSong(songs[index])
      setIsPlaying(true)
    },
    [setPlayQueue, setCurrentSong, setIsPlaying]
  )

  /** Play all songs starting from the first */
  const handlePlayAll = useCallback(() => {
    handlePlaySong(0)
  }, [handlePlaySong])

  return (
    <div className="h-full overflow-y-auto px-4 sm:px-6 pb-8 pt-4 space-y-10">
      {/* ═══════════════════════════════════════════════════════
          Section 1: Carousel / Banner
          ═══════════════════════════════════════════════════════ */}
      <section aria-label="推荐轮播">
        <Carousel
          opts={{ loop: true }}
          plugins={[
            Autoplay({
              delay: 5000,
              stopOnInteraction: false,
              stopOnMouseEnter: true,
            }),
          ]}
          setApi={setApi}
          className="w-full"
        >
          <CarouselContent className="-ml-0">
            {carouselImages.map((img, idx) => (
              <CarouselItem key={idx} className="pl-0">
                <div className="relative w-full h-[200px] rounded-2xl overflow-hidden">
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    className="object-cover"
                    priority={idx === 0}
                    sizes="100vw"
                  />
                  {/* Subtle gradient overlay for depth */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#06080E]/40 to-transparent" />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Dots Indicator */}
        <div className="flex items-center justify-center gap-1.5 mt-3">
          {carouselImages.map((_, i) => (
            <button
              key={i}
              className={`
                h-1.5 rounded-full transition-all duration-300 cursor-pointer
                ${i === activeDot
                  ? 'w-6 bg-[#4FD1C5] shadow-[0_0_8px_rgba(79,209,197,0.4)]'
                  : 'w-1.5 bg-white/20 hover:bg-white/40'
                }
              `}
              onClick={() => api?.scrollTo(i)}
              aria-label={`跳转到轮播图 ${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          Section 2: Recommended Playlists Grid
          (No section header — content flows directly)
          ═══════════════════════════════════════════════════════ */}
      <section aria-label="推荐歌单">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {demoPlaylists.map((playlist) => (
            <div
              key={playlist.id}
              className="group cursor-pointer"
              onMouseEnter={() => setHoveredPlaylistId(playlist.id)}
              onMouseLeave={() => setHoveredPlaylistId(null)}
            >
              {/* Cover Image */}
              <div className="relative aspect-square rounded-xl overflow-hidden mb-2 shadow-lg shadow-black/30">
                <Image
                  src={playlist.cover}
                  alt={playlist.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                />

                {/* Glassmorphism overlay on hover */}
                <div
                  className={`
                    absolute inset-0
                    bg-black/30 backdrop-blur-[2px]
                    flex items-center justify-center
                    transition-opacity duration-200
                    ${hoveredPlaylistId === playlist.id ? 'opacity-100' : 'opacity-0'}
                  `}
                >
                  <div className="w-12 h-12 rounded-full bg-[#4FD1C5]/90 flex items-center justify-center shadow-lg shadow-[#4FD1C5]/30 transition-transform duration-200 group-hover:scale-110">
                    <Play className="w-5 h-5 text-[#06080E] ml-0.5" fill="currentColor" />
                  </div>
                </div>

                {/* Play count badge */}
                <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-sm text-[10px] text-white/80">
                  <Headphones className="w-3 h-3" />
                  <span>{playlist.playCount}</span>
                </div>
              </div>

              {/* Playlist Name */}
              <p className="text-sm text-white/70 group-hover:text-white/95 transition-colors line-clamp-2 leading-snug">
                {playlist.name}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          Section 3: Hot Songs List
          (No section header — "播放全部" as a floating action)
          ═══════════════════════════════════════════════════════ */}
      <section aria-label="热门歌曲">
        {/* Floating "Play All" action */}
        <div className="flex justify-end mb-3">
          <button
            onClick={handlePlayAll}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium
              bg-[#4FD1C5]/15 text-[#4FD1C5] border border-[#4FD1C5]/30
              hover:bg-[#4FD1C5]/25 hover:border-[#4FD1C5]/50
              transition-all duration-200 cursor-pointer"
            aria-label="播放全部歌曲"
          >
            <Play className="w-3 h-3" fill="currentColor" />
            播放全部
          </button>
        </div>

        {/* Song List */}
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
          {demoSongs.map((song, index) => (
            <div
              key={song.id}
              className="
                song-row grid grid-cols-[40px_1fr_60px] sm:grid-cols-[40px_1.5fr_1fr_1fr_60px]
                gap-2 px-4 py-2.5 items-center cursor-pointer
                border-b border-white/[0.04] last:border-b-0
                transition-colors duration-150
              "
              onClick={() => handlePlaySong(index)}
              onMouseEnter={() => setHoveredSongIndex(index)}
              onMouseLeave={() => setHoveredSongIndex(null)}
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
                {hoveredSongIndex === index ? (
                  <Play className="w-4 h-4 text-[#4FD1C5]" fill="currentColor" />
                ) : (
                  <span className="text-sm text-white/30 tabular-nums">
                    {index + 1}
                  </span>
                )}
              </div>

              {/* Song Title */}
              <span className="text-sm text-white/80 truncate">{song.title}</span>

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
          ))}
        </div>
      </section>
    </div>
  )
}
