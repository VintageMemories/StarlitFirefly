'use client'

import { useMemo } from 'react'
import { useSkinStore } from '@/stores/skinStore'

/* ─── Static star field for the default background ─── */
interface StarData {
  id: number
  top: string
  left: string
  size: number
  opacity: number
  color: string
  duration: number
  delay: number
}

function generateStars(count: number): StarData[] {
  const stars: StarData[] = []
  const colors = ['#81E6D9', '#B794F6', '#4FD1C5', '#9F7AEA', '#68D391', '#F6AD55', '#FDE047']
  for (let i = 0; i < count; i++) {
    const size = 0.8 + Math.random() * 3
    const isBright = Math.random() > 0.75 // 25% bright stars
    stars.push({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: isBright ? size * 1.8 : size,
      opacity: isBright ? 0.6 + Math.random() * 0.4 : 0.2 + Math.random() * 0.35,
      color: colors[Math.floor(Math.random() * colors.length)],
      duration: 2 + Math.random() * 7,
      delay: Math.random() * 5,
    })
  }
  return stars
}

export function BackgroundLayer() {
  const { backgroundType, backgroundPath } = useSkinStore()

  // Generate stars once
  const stars = useMemo(() => generateStars(120), [])

  if (backgroundType === 'none' || !backgroundPath) {
    return (
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* ─── Base gradient: deep space with vivid color ─── */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 120% 80% at 15% 15%, rgba(79,209,197,0.18) 0%, transparent 50%),
              radial-gradient(ellipse 100% 60% at 80% 25%, rgba(183,148,246,0.14) 0%, transparent 50%),
              radial-gradient(ellipse 80% 100% at 50% 85%, rgba(79,209,197,0.10) 0%, transparent 50%),
              radial-gradient(ellipse 60% 40% at 70% 60%, rgba(246,173,85,0.07) 0%, transparent 50%),
              linear-gradient(180deg, #0A0F1E 0%, #06080E 40%, #080C18 100%)
            `,
          }}
        />

        {/* ─── Nebula glow patches - brighter ─── */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(circle 600px at 15% 25%, rgba(79,209,197,0.12) 0%, transparent 70%),
              radial-gradient(circle 500px at 75% 15%, rgba(183,148,246,0.10) 0%, transparent 70%),
              radial-gradient(circle 550px at 50% 80%, rgba(79,209,197,0.08) 0%, transparent 70%),
              radial-gradient(circle 400px at 85% 65%, rgba(246,173,85,0.06) 0%, transparent 70%),
              radial-gradient(circle 350px at 30% 60%, rgba(129,230,217,0.06) 0%, transparent 70%)
            `,
          }}
        />

        {/* ─── Animated twinkling stars ─── */}
        <style>{`
          @keyframes bgStarTwinkle {
            0%, 100% { opacity: 0.15; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.3); }
          }
          @keyframes bgStarTwinkleBright {
            0%, 100% { opacity: 0.4; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.5); }
          }
        `}</style>

        {stars.map((star) => {
          const isBright = star.opacity > 0.5
          return (
            <div
              key={star.id}
              className="absolute rounded-full"
              style={{
                top: star.top,
                left: star.left,
                width: `${star.size}px`,
                height: `${star.size}px`,
                backgroundColor: star.color,
                boxShadow: isBright
                  ? `0 0 ${star.size * 4}px ${star.color}, 0 0 ${star.size * 8}px ${star.color}50`
                  : `0 0 ${star.size * 2}px ${star.color}`,
                animation: `${isBright ? 'bgStarTwinkleBright' : 'bgStarTwinkle'} ${star.duration}s ease-in-out ${star.delay}s infinite`,
              }}
            />
          )
        })}

        {/* ─── Slow-moving aurora band - more visible ─── */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(
                135deg,
                transparent 0%,
                rgba(79,209,197,0.05) 20%,
                rgba(183,148,246,0.06) 40%,
                rgba(79,209,197,0.04) 60%,
                transparent 80%
              )
            `,
            animation: 'bgAuroraShift 20s ease-in-out infinite',
          }}
        />
        <style>{`
          @keyframes bgAuroraShift {
            0%, 100% { transform: translateX(0) translateY(0) scale(1); }
            33% { transform: translateX(3%) translateY(-2%) scale(1.02); }
            66% { transform: translateX(-2%) translateY(1%) scale(0.98); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      {backgroundType === 'image' && (
        <img
          src={backgroundPath}
          alt="背景"
          className="w-full h-full object-cover"
          style={{ filter: 'brightness(0.3) blur(8px)' }}
        />
      )}
      {backgroundType === 'video' && (
        <video
          src={backgroundPath}
          muted
          autoPlay
          loop
          playsInline
          className="w-full h-full object-cover"
          style={{ filter: 'brightness(0.3) blur(4px)' }}
        />
      )}
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/50" />
    </div>
  )
}
