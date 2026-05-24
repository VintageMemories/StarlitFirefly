'use client'

import { useState, useCallback } from 'react'
import {
  Play,
  Search,
  FolderOpen,
  Plus,
  ArrowUpDown,
  CheckSquare,
  Download,
  Music,
  FolderSearch,
  Pause,
  Trash2,
  CheckCircle2,
  XCircle,
  FileMusic,
  Settings2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu'
import { usePlayerStore, type SongInfo } from '@/stores/playerStore'
import { useDownloadStore, type DownloadTask } from '@/stores/downloadStore'
import DownloadDialog from '@/components/download/DownloadDialog'

// ─── Demo Data ──────────────────────────────────────────────

const localSongs = [
  { id: '1', title: '星荧之歌', artist: '星辰乐队', album: '星荧专辑', duration: 245, size: '8.2MB', addedAt: '2024-01-15' },
  { id: '2', title: '夜空漫步', artist: '月影', album: '月光集', duration: 198, size: '6.5MB', addedAt: '2024-01-14' },
  { id: '3', title: '光影交错', artist: '晨曦', album: '光年之外', duration: 267, size: '9.1MB', addedAt: '2024-01-13' },
  { id: '4', title: '星际旅行', artist: '宇宙乐团', album: '太空漫游', duration: 312, size: '10.4MB', addedAt: '2024-01-12' },
  { id: '5', title: '梦中星海', artist: '梦旅人', album: '梦境', duration: 223, size: '7.3MB', addedAt: '2024-01-11' },
  { id: '6', title: '荧光之舞', artist: '光影', album: '舞动星荧', duration: 189, size: '6.1MB', addedAt: '2024-01-10' },
  { id: '7', title: '午夜流星', artist: '夜行者', album: '深夜电台', duration: 256, size: '8.5MB', addedAt: '2024-01-09' },
  { id: '8', title: '星尘往事', artist: '回忆录', album: '时光机', duration: 234, size: '7.8MB', addedAt: '2024-01-08' },
]

const downloadedSongs = [
  { id: '1', title: '银河列车', artist: '旅人', album: '星际之旅', duration: 278, size: '9.2MB', addedAt: '2024-01-16' },
  { id: '2', title: '星辰变奏曲', artist: '交响乐团', album: '宇宙交响', duration: 345, size: '11.5MB', addedAt: '2024-01-15' },
  { id: '3', title: '星荧之歌', artist: '星辰乐队', album: '星荧专辑', duration: 245, size: '8.2MB', addedAt: '2024-01-14' },
]

// ─── Demo download data for "新建下载" ──────────────────────

const demoDownloadItems = [
  { title: '银河列车', artist: '旅人', album: '星际之旅', fileSize: '9.2MB' },
  { title: '星辰变奏曲', artist: '交响乐团', album: '宇宙交响', fileSize: '11.5MB' },
  { title: '星际旅行', artist: '宇宙乐团', album: '太空漫游', fileSize: '10.4MB' },
  { title: '夜空漫步', artist: '月影', album: '月光集', fileSize: '6.5MB' },
  { title: '光影交错', artist: '晨曦', album: '光年之外', fileSize: '9.1MB' },
  { title: '梦中星海', artist: '梦旅人', album: '梦境', fileSize: '7.3MB' },
]

// ─── Types ──────────────────────────────────────────────────

type TabKey = 'local' | 'downloaded' | 'downloading'

interface TabItem {
  key: TabKey
  label: string
}

const tabs: TabItem[] = [
  { key: 'local', label: '本地歌曲' },
  { key: 'downloaded', label: '下载歌曲' },
  { key: 'downloading', label: '正在下载' },
]

type SortKey = 'default' | 'addedAt' | 'title' | 'artist' | 'album' | 'duration' | 'playCount' | 'random'

const sortOptions: { value: SortKey; label: string }[] = [
  { value: 'default', label: '默认排序' },
  { value: 'addedAt', label: '添加时间' },
  { value: 'title', label: '歌曲名' },
  { value: 'artist', label: '歌手' },
  { value: 'album', label: '专辑' },
  { value: 'duration', label: '时长' },
  { value: 'playCount', label: '播放次数' },
  { value: 'random', label: '随机排序' },
]

// ─── Helpers ────────────────────────────────────────────────

function formatDuration(seconds: number): string {
  const min = Math.floor(seconds / 60)
  const sec = seconds % 60
  return `${min}:${sec.toString().padStart(2, '0')}`
}

function toSongInfo(song: { id: string; title: string; artist: string; album: string; duration: number }): SongInfo {
  return {
    id: song.id,
    title: song.title,
    artist: song.artist,
    album: song.album,
    duration: song.duration,
    filePath: '',
    coverPath: '/default-cover.png',
    isLocal: true,
  }
}

function DownloadStatusIcon({ status }: { status: DownloadTask['status'] }) {
  switch (status) {
    case 'downloading':
      return <Download className="w-3.5 h-3.5 text-[#4FD1C5] animate-pulse" />
    case 'paused':
      return <Pause className="w-3.5 h-3.5 text-amber-400" />
    case 'completed':
      return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
    case 'failed':
      return <XCircle className="w-3.5 h-3.5 text-red-400" />
  }
}

// ─── Component ──────────────────────────────────────────────

export default function LocalPage() {
  const { setPlayQueue, setCurrentSong, setIsPlaying, currentSong, isPlaying } = usePlayerStore()
  const { tasks, addTask, pauseTask, resumeTask, removeTask, clearCompleted } = useDownloadStore()
  const [activeTab, setActiveTab] = useState<TabKey>('local')
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('default')
  const [isBatchMode, setIsBatchMode] = useState(false)
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false)

  const handlePlaySong = useCallback(
    (songsList: typeof localSongs, index: number) => {
      const songs = songsList.map(toSongInfo)
      setPlayQueue(songs, index)
      setCurrentSong(songs[index])
      setIsPlaying(true)
    },
    [setPlayQueue, setCurrentSong, setIsPlaying]
  )

  const handleAddDemoDownload = useCallback(() => {
    const item = demoDownloadItems[Math.floor(Math.random() * demoDownloadItems.length)]
    addTask(item)
  }, [addTask])

  /** Filter songs by search query */
  const filterSongs = useCallback(
    (songs: typeof localSongs) => {
      if (!searchQuery.trim()) return songs
      const q = searchQuery.toLowerCase()
      return songs.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.artist.toLowerCase().includes(q) ||
          s.album.toLowerCase().includes(q)
      )
    },
    [searchQuery]
  )

  /** Sort songs by selected sort key */
  const sortSongs = useCallback(
    (songs: typeof localSongs): typeof localSongs => {
      const sorted = [...songs]
      switch (sortKey) {
        case 'title':
          sorted.sort((a, b) => a.title.localeCompare(b.title, 'zh'))
          break
        case 'artist':
          sorted.sort((a, b) => a.artist.localeCompare(b.artist, 'zh'))
          break
        case 'album':
          sorted.sort((a, b) => a.album.localeCompare(b.album, 'zh'))
          break
        case 'duration':
          sorted.sort((a, b) => a.duration - b.duration)
          break
        case 'addedAt':
          sorted.sort((a, b) => b.addedAt.localeCompare(a.addedAt))
          break
        case 'random':
          sorted.sort(() => Math.random() - 0.5)
          break
        default:
          break
      }
      return sorted
    },
    [sortKey]
  )

  /** Render a song list table for local/downloaded songs */
  const renderSongTable = (songs: typeof localSongs) => {
    const filtered = filterSongs(songs)
    const sorted = sortSongs(filtered)

    if (sorted.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-white/30">
          <FolderSearch className="w-12 h-12 mb-3 opacity-50" />
          <p className="text-sm">暂无匹配的歌曲</p>
        </div>
      )
    }

    return (
      <div className="glass-light rounded-xl overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-[40px_1fr_70px] sm:grid-cols-[40px_1.5fr_1fr_1fr_70px_70px] gap-2 px-4 py-2.5 text-xs text-white/30 uppercase tracking-wider border-b border-white/[0.06]">
          <span className="text-center">#</span>
          <span>歌曲名</span>
          <span className="hidden sm:block">歌手</span>
          <span className="hidden sm:block">专辑</span>
          <span className="hidden sm:block text-right">时长</span>
          <span className="text-right">大小</span>
        </div>

        {/* Song Rows */}
        {sorted.map((song, index) => {
          const isCurrentSong = currentSong?.id === song.id

          return (
            <div
              key={song.id}
              className={`
                song-row grid grid-cols-[40px_1fr_70px] sm:grid-cols-[40px_1.5fr_1fr_1fr_70px_70px]
                gap-2 px-4 py-2.5 items-center cursor-pointer
                border-b border-white/[0.04] last:border-b-0
                transition-colors duration-150
                ${isCurrentSong ? 'playing' : ''}
                ${isBatchMode ? 'hover:bg-[#4FD1C5]/12' : ''}
              `}
              onClick={() => {
                if (!isBatchMode) {
                  handlePlaySong(sorted, index)
                }
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              role="button"
              tabIndex={0}
              aria-label={`播放 ${song.title}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  if (!isBatchMode) {
                    handlePlaySong(sorted, index)
                  }
                }
              }}
            >
              {/* Index / Play Icon / Checkbox */}
              <div className="flex items-center justify-center">
                {isBatchMode ? (
                  <CheckSquare
                    className={`w-4 h-4 cursor-pointer transition-colors ${
                      false ? 'text-[#4FD1C5]' : 'text-white/30 hover:text-white/60'
                    }`}
                  />
                ) : hoveredIndex === index ? (
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
              <span className="text-sm text-white/40 text-right tabular-nums hidden sm:block">
                {formatDuration(song.duration)}
              </span>

              {/* Size */}
              <span className="text-sm text-white/30 text-right tabular-nums">
                {song.size}
              </span>
            </div>
          )
        })}
      </div>
    )
  }

  /** Render the "正在下载" tab with actual download tasks */
  const renderDownloadingTab = () => {
    const activeTasks = tasks.filter((t) => t.status === 'downloading' || t.status === 'paused' || t.status === 'failed')
    const completedTasks = tasks.filter((t) => t.status === 'completed')

    if (tasks.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-white/30">
          <div className="w-20 h-20 rounded-full bg-[#4FD1C5]/[0.08] flex items-center justify-center mb-5 ring-1 ring-[#4FD1C5]/20">
            <Download className="w-9 h-9 text-[#4FD1C5]/50" />
          </div>
          <p className="text-sm text-white/50 font-medium">暂无下载任务</p>
          <p className="text-xs text-white/25 mt-1.5">下载的歌曲将在这里显示进度</p>
          <Button
            className="mt-5 gap-2 bg-[#4FD1C5]/15 text-[#4FD1C5] hover:bg-[#4FD1C5]/25 border border-[#4FD1C5]/20"
            onClick={handleAddDemoDownload}
          >
            <Plus className="w-4 h-4" />
            新建下载
          </Button>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        {/* Action Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              className="gap-2 bg-[#4FD1C5]/15 text-[#4FD1C5] hover:bg-[#4FD1C5]/25 border border-[#4FD1C5]/20 h-8 text-xs"
              onClick={handleAddDemoDownload}
            >
              <Plus className="w-3.5 h-3.5" />
              新建下载
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 h-8 text-xs text-white/40 hover:text-white/70 hover:bg-white/[0.06]"
              onClick={() => setDownloadDialogOpen(true)}
            >
              <Settings2 className="w-3.5 h-3.5" />
              下载管理
            </Button>
          </div>
          {completedTasks.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 h-8 text-xs text-white/30 hover:text-red-400 hover:bg-red-400/10"
              onClick={clearCompleted}
            >
              <Trash2 className="w-3.5 h-3.5" />
              清除已完成
            </Button>
          )}
        </div>

        {/* Active Downloads */}
        {activeTasks.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider">
              进行中 ({activeTasks.length})
            </h3>
            <div className="space-y-2">
              {activeTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-3 hover:bg-white/[0.04] transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-[#4FD1C5]/[0.08] flex items-center justify-center flex-shrink-0">
                        <FileMusic className="w-4.5 h-4.5 text-[#4FD1C5]/60" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-white/80 font-medium truncate">{task.title}</p>
                        <p className="text-xs text-white/30 truncate mt-0.5">
                          {task.artist} · {task.album} · {task.fileSize}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <DownloadStatusIcon status={task.status} />
                    </div>
                  </div>
                  {(task.status === 'downloading' || task.status === 'paused') && (
                    <div className="space-y-1.5">
                      <Progress
                        value={task.progress}
                        className="h-1.5 bg-white/[0.06]"
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-white/30 tabular-nums">{task.progress}%</span>
                        {task.status === 'paused' && (
                          <span className="text-[11px] text-amber-400/60">已暂停</span>
                        )}
                      </div>
                    </div>
                  )}
                  {task.status === 'failed' && (
                    <p className="text-xs text-red-400/60">下载失败，请重试</p>
                  )}
                  <div className="flex items-center gap-1 justify-end">
                    {task.status === 'downloading' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2.5 text-xs text-white/40 hover:text-amber-400 hover:bg-amber-400/10"
                        onClick={() => pauseTask(task.id)}
                      >
                        <Pause className="w-3 h-3 mr-1" />
                        暂停
                      </Button>
                    )}
                    {task.status === 'paused' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2.5 text-xs text-white/40 hover:text-[#4FD1C5] hover:bg-[#4FD1C5]/10"
                        onClick={() => resumeTask(task.id)}
                      >
                        <Play className="w-3 h-3 mr-1" />
                        继续
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2.5 text-xs text-white/40 hover:text-red-400 hover:bg-red-400/10"
                      onClick={() => removeTask(task.id)}
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      删除
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed Downloads */}
        {completedTasks.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider">
              已完成 ({completedTasks.length})
            </h3>
            <div className="glass-light rounded-xl overflow-hidden">
              {completedTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-white/[0.04] last:border-b-0 hover:bg-white/[0.03] transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400/60 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm text-white/70 truncate">{task.title}</p>
                      <p className="text-xs text-white/30 truncate">{task.artist} · {task.fileSize}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-7 h-7 opacity-0 group-hover:opacity-100 text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-opacity flex-shrink-0"
                    onClick={() => removeTask(task.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  /** Render content based on active tab */
  const renderContent = () => {
    switch (activeTab) {
      case 'local':
        return renderSongTable(localSongs)
      case 'downloaded':
        return renderSongTable(downloadedSongs)
      case 'downloading':
        return renderDownloadingTab()
    }
  }

  return (
    <div className="h-full overflow-y-auto px-4 sm:px-6 pb-8 pt-4 space-y-6">
      {/* Title */}
      <h1 className="text-[28px] font-bold text-white/90">本地与下载</h1>

      {/* Tab Bar + Toolbar — single row with shared bottom border */}
      <div className="flex items-end justify-between gap-4 border-b border-white/[0.08]">
        {/* Left: Tabs (underline style matching CollectionPage) */}
        <nav className="flex gap-6 flex-shrink-0" aria-label="本地分类">
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
              {/* Active indicator — underline matching CollectionPage */}
              {activeTab === tab.key && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#4FD1C5] rounded-full shadow-[0_0_8px_rgba(79,209,197,0.4)]"
                />
              )}
            </button>
          ))}
        </nav>

        {/* Right: Action buttons (from left to right: search, folder, plus, sort, batch) */}
        <div className="flex items-center gap-1.5 pb-2 flex-shrink-0">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
            <Input
              placeholder="搜索歌曲"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 w-[120px] sm:w-[160px] pl-8 text-xs rounded-md bg-white/[0.06] border-white/[0.1] text-white/80 placeholder:text-white/25 focus-visible:border-[#4FD1C5]/50 focus-visible:ring-[#4FD1C5]/20"
            />
          </div>

          {/* Open Folder Button */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-xs text-white/50 hover:text-white/80 hover:bg-white/[0.06]"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">打开文件夹</span>
          </Button>

          {/* Add Menu Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white/50 hover:text-white/80 hover:bg-white/[0.06]"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-[#0C1018] border-white/[0.1] text-white/80"
            >
              <DropdownMenuItem className="focus:bg-white/[0.08] focus:text-white cursor-pointer">
                <Music className="w-4 h-4 mr-2 text-white/40" />
                手动添加音乐
              </DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-white/[0.08] focus:text-white cursor-pointer">
                <FolderOpen className="w-4 h-4 mr-2 text-white/40" />
                自动添加音乐
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/[0.08]" />
              <DropdownMenuItem className="focus:bg-white/[0.08] focus:text-white cursor-pointer">
                <Search className="w-4 h-4 mr-2 text-white/40" />
                立即扫描音乐
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white/50 hover:text-white/80 hover:bg-white/[0.06]"
              >
                <ArrowUpDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-[#0C1018] border-white/[0.1] text-white/80"
            >
              <DropdownMenuRadioGroup
                value={sortKey}
                onValueChange={(val) => setSortKey(val as SortKey)}
              >
                {sortOptions.map((opt) => (
                  <DropdownMenuRadioItem
                    key={opt.value}
                    value={opt.value}
                    className="focus:bg-white/[0.08] focus:text-white cursor-pointer"
                  >
                    {opt.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Batch Select Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 transition-colors ${
              isBatchMode
                ? 'text-[#4FD1C5] bg-[#4FD1C5]/15 hover:bg-[#4FD1C5]/25'
                : 'text-white/50 hover:text-white/80 hover:bg-white/[0.06]'
            }`}
            onClick={() => setIsBatchMode(!isBatchMode)}
          >
            <CheckSquare className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Tab Content */}
      <section
        id={`panel-${activeTab}`}
        role="tabpanel"
        className="animate-in fade-in duration-200"
      >
        {renderContent()}
      </section>

      {/* Download Dialog */}
      <DownloadDialog open={downloadDialogOpen} onOpenChange={setDownloadDialogOpen} />
    </div>
  )
}
