'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  Search,
  Shirt,
  Settings,
  Minus,
  Square,
  X,
  User,
  LogIn,
  LogOut,
  SlidersHorizontal,
  Menu,
} from 'lucide-react'
import { useUserStore } from '@/stores/userStore'
import { useNavStore } from '@/stores/navStore'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface TopBarProps {
  onEqClick?: () => void
}

export function TopBar({ onEqClick }: TopBarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const { isLoggedIn, userName, avatarPath, login, logout } = useUserStore()
  const { setActiveNav } = useNavStore()

  const userInitial = userName ? userName.charAt(0).toUpperCase() : '?'

  return (
    <header className="relative flex items-center h-12 px-4 bg-[#06080E]/70 backdrop-blur-md select-none shrink-0 overflow-hidden">
      {/* Subtle starfield effect */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {/* Static tiny star dots */}
        <div
          className="absolute w-[2px] h-[2px] rounded-full bg-[#81E6D9] opacity-0"
          style={{
            top: '6px',
            left: '12%',
            animation: 'starTwinkle 4s ease-in-out infinite',
          }}
        />
        <div
          className="absolute w-[1.5px] h-[1.5px] rounded-full bg-[#81E6D9] opacity-0"
          style={{
            top: '28px',
            left: '28%',
            animation: 'starTwinkle 5s ease-in-out 1.2s infinite',
          }}
        />
        <div
          className="absolute w-[2px] h-[2px] rounded-full bg-[#B794F6] opacity-0"
          style={{
            top: '10px',
            left: '45%',
            animation: 'starTwinkle 6s ease-in-out 0.5s infinite',
          }}
        />
        <div
          className="absolute w-[1px] h-[1px] rounded-full bg-[#81E6D9] opacity-0"
          style={{
            top: '32px',
            left: '62%',
            animation: 'starTwinkle 4.5s ease-in-out 2s infinite',
          }}
        />
        <div
          className="absolute w-[1.5px] h-[1.5px] rounded-full bg-[#B794F6] opacity-0"
          style={{
            top: '8px',
            left: '78%',
            animation: 'starTwinkle 5.5s ease-in-out 0.8s infinite',
          }}
        />
        <div
          className="absolute w-[1px] h-[1px] rounded-full bg-[#81E6D9] opacity-0"
          style={{
            top: '34px',
            left: '88%',
            animation: 'starTwinkle 4.8s ease-in-out 1.6s infinite',
          }}
        />
        <div
          className="absolute w-[2px] h-[2px] rounded-full bg-[#81E6D9] opacity-0"
          style={{
            top: '18px',
            left: '35%',
            animation: 'starTwinkle 7s ease-in-out 3s infinite',
          }}
        />
        <div
          className="absolute w-[1px] h-[1px] rounded-full bg-[#B794F6] opacity-0"
          style={{
            top: '22px',
            left: '55%',
            animation: 'starTwinkle 5.2s ease-in-out 2.5s infinite',
          }}
        />
      </div>

      {/* Starfield twinkle keyframes */}
      <style>{`
        @keyframes starTwinkle {
          0%, 100% { opacity: 0; }
          50% { opacity: 0.5; }
        }
      `}</style>

      {/* Subtle bottom border glow using cyan starlight */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(79,209,197,0.15) 20%, rgba(79,209,197,0.3) 50%, rgba(79,209,197,0.15) 80%, transparent 100%)',
        }}
      />
      {/* Very faint glow diffusion below the line */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-3"
        style={{
          background:
            'linear-gradient(180deg, rgba(79,209,197,0.06) 0%, transparent 100%)',
        }}
      />

      {/* Left: Logo */}
      <div className="flex items-center gap-2.5 shrink-0 min-w-[140px] relative z-10">
        <Image
          src="/logo.png"
          alt="星荧音乐"
          width={26}
          height={26}
          className="shrink-0 drop-shadow-[0_0_6px_rgba(79,209,197,0.4)]"
          priority
        />
        <span className="starfire-gradient-text text-sm font-bold tracking-wider whitespace-nowrap">
          星荧音乐
        </span>
      </div>

      {/* Center: Search */}
      <div className="flex-1 flex justify-center px-4 relative z-10">
        <div className="relative w-[360px] max-w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索音乐、歌手、专辑"
            className="w-full h-8 pl-10 pr-4 rounded-full text-sm text-white/90 placeholder:text-white/25 outline-none transition-all duration-200 border border-white/[0.06] focus:border-[rgba(79,209,197,0.25)] focus:shadow-[0_0_0_1px_rgba(79,209,197,0.15),0_0_12px_rgba(79,209,197,0.08)]"
            style={{
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          />
        </div>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-0.5 shrink-0 min-w-[140px] justify-end relative z-10">
        {/* User Avatar Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center justify-center p-1 rounded-full hover:bg-white/[0.06] transition-colors cursor-pointer group">
              <Avatar
                className={`w-[30px] h-[30px] transition-all duration-200 ${
                  isLoggedIn
                    ? 'ring-1.5 ring-[rgba(79,209,197,0.35)] group-hover:ring-[rgba(79,209,197,0.55)]'
                    : ''
                }`}
              >
                {isLoggedIn && avatarPath && (
                  <AvatarImage src={avatarPath} alt={userName} />
                )}
                <AvatarFallback
                  className={`text-xs font-medium transition-colors ${
                    isLoggedIn
                      ? 'bg-gradient-to-br from-[#4FD1C5]/20 to-[#B794F6]/20 text-white/80'
                      : 'bg-white/[0.08] text-white/50'
                  }`}
                >
                  {isLoggedIn ? userInitial : <User className="w-3.5 h-3.5" />}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-36 bg-[#0C1018] border-white/10"
          >
            {isLoggedIn ? (
              <>
                <DropdownMenuItem
                  className="text-white/70 focus:text-white focus:bg-white/[0.06] cursor-pointer"
                  onClick={() => logout()}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  退出
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem
                className="text-white/70 focus:text-white focus:bg-white/[0.06] cursor-pointer"
                onClick={() => login('用户')}
              >
                <LogIn className="w-4 h-4 mr-2" />
                登录
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Skin/Theme Icon */}
        <button
          className="flex items-center justify-center w-8 h-8 rounded-md text-white/35 hover:text-[#4FD1C5]/70 hover:bg-white/[0.05] transition-colors cursor-pointer"
          aria-label="皮肤设置"
          onClick={() => setActiveNav('skin')}
        >
          <Shirt className="w-[15px] h-[15px]" />
        </button>

        {/* Hamburger Menu Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center justify-center w-8 h-8 rounded-md text-white/35 hover:text-white/65 hover:bg-white/[0.05] transition-colors cursor-pointer"
              aria-label="菜单"
            >
              <Menu className="w-[15px] h-[15px]" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-36 bg-[#0C1018] border-white/10"
          >
            <DropdownMenuItem className="text-white/70 focus:text-white focus:bg-white/[0.06] cursor-pointer">
              <Settings className="w-4 h-4 mr-2" />
              设置
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-white/70 focus:text-white focus:bg-white/[0.06] cursor-pointer"
              onClick={onEqClick}
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              均衡器
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/[0.06]" />
            <DropdownMenuItem
              className="text-white/70 focus:text-white focus:bg-white/[0.06] cursor-pointer"
              onClick={() => logout()}
            >
              <LogOut className="w-4 h-4 mr-2" />
              退出
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Divider before window controls */}
        <div className="w-px h-4 bg-white/[0.08] mx-1" />

        {/* Window Controls Group */}
        <div className="flex items-center">
          {/* Minimize */}
          <button
            className="flex items-center justify-center w-9 h-8 text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-colors cursor-pointer rounded-sm"
            aria-label="最小化"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          {/* Maximize */}
          <button
            className="flex items-center justify-center w-9 h-8 text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-colors cursor-pointer rounded-sm"
            aria-label="最大化"
          >
            <Square className="w-3 h-3" />
          </button>
          {/* Close */}
          <button
            className="flex items-center justify-center w-9 h-8 text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer rounded-sm"
            aria-label="关闭"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  )
}
