'use client'

import { useState, useCallback } from 'react'
import { Music, Heart, Clock, HardDrive, Plus, ListMusic, Shirt } from 'lucide-react'
import { useNavStore, type NavItem } from '@/stores/navStore'

interface NavEntry {
  key: NavItem
  label: string
  icon: React.ElementType
}

const navItems: NavEntry[] = [
  { key: 'music', label: '音乐', icon: Music },
  { key: 'collection', label: '我的收藏', icon: Heart },
  { key: 'recent', label: '最近播放', icon: Clock },
  { key: 'local', label: '本地与下载', icon: HardDrive },
  { key: 'skin', label: '皮肤设置', icon: Shirt },
]

interface PlaylistEntry {
  id: string
  name: string
}

export default function Sidebar() {
  const { activeNav, setActiveNav } = useNavStore()
  const [playlists, setPlaylists] = useState<PlaylistEntry[]>([
    { id: '1', name: '我喜欢' },
    { id: '2', name: '默认收藏' },
  ])
  const [isCreating, setIsCreating] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState('')

  const handleCreatePlaylist = useCallback(() => {
    const trimmed = newPlaylistName.trim()
    if (!trimmed) return
    const id = Date.now().toString()
    setPlaylists((prev) => [...prev, { id, name: trimmed }])
    setNewPlaylistName('')
    setIsCreating(false)
  }, [newPlaylistName])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleCreatePlaylist()
      } else if (e.key === 'Escape') {
        setIsCreating(false)
        setNewPlaylistName('')
      }
    },
    [handleCreatePlaylist]
  )

  return (
    <aside className="flex flex-col w-[200px] min-w-[200px] h-full bg-[#06080E]/70 backdrop-blur-md border-r border-white/[0.03] select-none">
      {/* Scrollable content area */}
      <nav className="flex flex-col gap-1 px-3 pt-5 overflow-y-auto flex-1">
        {/* Main Navigation Items */}
        {navItems.map(({ key, label, icon: Icon }) => {
          const isActive = activeNav === key
          return (
            <button
              key={key}
              onClick={() => setActiveNav(key)}
              className={`
                group relative flex items-center gap-3 h-10 px-3 rounded-lg text-sm font-medium
                transition-all duration-200 cursor-pointer
                ${
                  isActive
                    ? 'bg-[#4FD1C5]/10 text-[#4FD1C5] shadow-[inset_0_0_0_1px_rgba(79,209,197,0.12)]'
                    : 'text-white/45 hover:text-white/80 hover:bg-white/[0.04]'
                }
              `}
            >
              {/* Starlight glow accent on left edge when active */}
              {isActive && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 rounded-full bg-[#4FD1C5] shadow-[0_0_6px_2px_rgba(79,209,197,0.5),0_0_12px_4px_rgba(79,209,197,0.2)]"
                  aria-hidden="true"
                />
              )}
              <Icon
                className={`w-[17px] h-[17px] shrink-0 transition-colors duration-200 ${
                  isActive ? 'text-[#4FD1C5]' : 'text-white/30 group-hover:text-white/60'
                }`}
              />
              <span>{label}</span>
              {isActive && (
                <div className="ml-auto w-1 h-1 rounded-full bg-[#4FD1C5] opacity-70" />
              )}
            </button>
          )
        })}

        {/* Divider between nav and playlists */}
        <div className="h-px bg-white/[0.05] mx-1 my-4" />

        {/* Created Playlists Section */}
        <div>
          {/* Section Header */}
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-[11px] font-semibold text-white/35 uppercase tracking-wider">
              创建歌单
            </span>
            <button
              onClick={() => {
                setIsCreating(true)
                setNewPlaylistName('')
              }}
              className="w-5 h-5 flex items-center justify-center rounded text-white/35 hover:text-[#4FD1C5] hover:bg-[#4FD1C5]/10 transition-colors cursor-pointer"
              aria-label="新建歌单"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Create playlist inline input */}
          {isCreating && (
            <div className="px-2 mb-2">
              <input
                type="text"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={() => {
                  if (!newPlaylistName.trim()) {
                    setIsCreating(false)
                  }
                }}
                placeholder="输入歌单名称"
                autoFocus
                className="w-full h-8 px-2.5 rounded-md text-xs text-white/80 bg-white/[0.06] border border-[#4FD1C5]/20 placeholder:text-white/25 outline-none focus:border-[#4FD1C5]/40 transition-colors"
              />
              <div className="flex gap-1.5 mt-1.5">
                <button
                  onClick={handleCreatePlaylist}
                  disabled={!newPlaylistName.trim()}
                  className="flex-1 h-6 rounded text-[10px] font-medium bg-[#4FD1C5]/15 text-[#4FD1C5] border border-[#4FD1C5]/20 hover:bg-[#4FD1C5]/25 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  创建
                </button>
                <button
                  onClick={() => {
                    setIsCreating(false)
                    setNewPlaylistName('')
                  }}
                  className="flex-1 h-6 rounded text-[10px] font-medium bg-white/[0.04] text-white/40 border border-white/[0.06] hover:bg-white/[0.08] transition-colors cursor-pointer"
                >
                  取消
                </button>
              </div>
            </div>
          )}

          {/* Playlist Items */}
          <div className="flex flex-col gap-0.5">
            {playlists.map((playlist) => (
              <button
                key={playlist.id}
                className="flex items-center gap-2.5 h-8 px-2 rounded-md text-sm text-white/45 hover:bg-white/[0.04] hover:text-white/75 transition-colors cursor-pointer group"
              >
                <ListMusic className="w-4 h-4 shrink-0 text-white/25 group-hover:text-white/40" />
                <span className="truncate">{playlist.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Bottom spacer to prevent content from being stuck to bottom */}
        <div className="h-6 shrink-0" />
      </nav>
    </aside>
  )
}
