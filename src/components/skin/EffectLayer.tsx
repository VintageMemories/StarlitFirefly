'use client'

import { useMemo } from 'react'
import { useSkinStore, type EffectType } from '@/stores/skinStore'

interface ParticleConfig {
  animationName: string
  count: number
  minSize: number
  maxSize: number
  minDuration: number
  maxDuration: number
  maxDelay: number
  shape: 'circle' | 'line' | 'petal' | 'butterfly' | 'streak-ltr' | 'streak-rtl'
  colorFn: (index: number) => string
}

const EFFECT_CONFIGS: Record<Exclude<EffectType, 'none'>, ParticleConfig> = {
  snow: {
    animationName: 'fall',
    count: 35,
    minSize: 4,
    maxSize: 8,
    minDuration: 6,
    maxDuration: 10,
    maxDelay: 5,
    shape: 'circle',
    colorFn: () => 'rgba(255, 255, 255, 0.85)',
  },
  rain: {
    animationName: 'fall',
    count: 40,
    minSize: 2,
    maxSize: 3,
    minDuration: 2,
    maxDuration: 4,
    maxDelay: 3,
    shape: 'line',
    colorFn: () => 'rgba(150, 200, 255, 0.5)',
  },
  petals: {
    animationName: 'fall',
    count: 25,
    minSize: 8,
    maxSize: 14,
    minDuration: 5,
    maxDuration: 9,
    maxDelay: 5,
    shape: 'petal',
    colorFn: (i) => {
      const colors = [
        'rgba(255, 150, 180, 0.8)',
        'rgba(255, 130, 200, 0.75)',
        'rgba(220, 140, 255, 0.7)',
        'rgba(255, 170, 200, 0.8)',
        'rgba(240, 160, 220, 0.75)',
      ]
      return colors[i % colors.length]
    },
  },
  bubbles: {
    animationName: 'rise',
    count: 25,
    minSize: 6,
    maxSize: 16,
    minDuration: 5,
    maxDuration: 10,
    maxDelay: 5,
    shape: 'circle',
    colorFn: () => 'rgba(180, 220, 255, 0.2)',
  },
  meteor: {
    // This is a placeholder; actual shape depends on meteorDirection in the store
    animationName: 'meteor-ltr',
    count: 20,
    minSize: 3,
    maxSize: 5,
    minDuration: 3,
    maxDuration: 6,
    maxDelay: 5,
    shape: 'streak-ltr',
    colorFn: () => 'rgba(255, 255, 255, 0.9)',
  },
  butterfly: {
    animationName: 'butterfly',
    count: 20,
    minSize: 10,
    maxSize: 16,
    minDuration: 6,
    maxDuration: 10,
    maxDelay: 5,
    shape: 'butterfly',
    colorFn: (i) => {
      const colors = [
        'rgba(255, 200, 50, 0.8)',
        'rgba(255, 150, 80, 0.75)',
        'rgba(200, 100, 255, 0.7)',
        'rgba(100, 200, 255, 0.75)',
        'rgba(255, 120, 180, 0.8)',
      ]
      return colors[i % colors.length]
    },
  },
  firefly: {
    animationName: 'firefly',
    count: 30,
    minSize: 3,
    maxSize: 6,
    minDuration: 4,
    maxDuration: 8,
    maxDelay: 5,
    shape: 'circle',
    colorFn: () => 'rgba(129, 230, 217, 0.9)',
  },
}

function randInRange(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

function generateParticles(config: ParticleConfig) {
  const particles: React.ReactNode[] = []

  for (let i = 0; i < config.count; i++) {
    const size = randInRange(config.minSize, config.maxSize)
    const left = Math.random() * 100
    const top = Math.random() * 100
    const delay = randInRange(0, config.maxDelay)
    const duration = randInRange(config.minDuration, config.maxDuration)
    const color = config.colorFn(i)

    const style: React.CSSProperties = {
      left: `${left}%`,
      top: `${top}%`,
      width: `${size}px`,
      animationDelay: `${delay}s`,
      animationDuration: `${duration}s`,
      animationTimingFunction: 'linear',
      animationIterationCount: 'infinite',
    }

    let particleElement: React.ReactNode

    switch (config.shape) {
      case 'circle':
        particleElement = (
          <div
            key={i}
            className="effect-particle"
            style={{
              ...style,
              height: `${size}px`,
              borderRadius: '50%',
              backgroundColor: color,
              boxShadow: config.animationName === 'firefly'
                ? `0 0 ${size * 2}px ${color}, 0 0 ${size * 4}px ${color}`
                : config.animationName === 'rise'
                  ? `0 0 ${size}px rgba(180, 220, 255, 0.15), inset 0 0 ${size * 0.5}px rgba(255, 255, 255, 0.2)`
                  : 'none',
              animationName: config.animationName,
            }}
          />
        )
        break

      case 'line':
        particleElement = (
          <div
            key={i}
            className="effect-particle"
            style={{
              ...style,
              height: `${size * 6}px`,
              width: `${size * 0.6}px`,
              borderRadius: '2px',
              backgroundColor: color,
              animationName: config.animationName,
            }}
          />
        )
        break

      case 'petal':
        particleElement = (
          <div
            key={i}
            className="effect-particle"
            style={{
              ...style,
              height: `${size * 0.7}px`,
              borderRadius: '50% 0 50% 50%',
              backgroundColor: color,
              animationName: config.animationName,
              opacity: 0.8,
            }}
          />
        )
        break

      case 'streak-ltr':
      case 'streak-rtl': {
        const streakLength = randInRange(40, 80)
        const streakWidth = randInRange(1.5, 3)
        particleElement = (
          <div
            key={i}
            className="effect-particle"
            style={{
              ...style,
              height: `${streakLength}px`,
              width: `${streakWidth}px`,
              borderRadius: '2px',
              background: `linear-gradient(to bottom, transparent, ${color})`,
              animationName: config.animationName,
              transformOrigin: 'center top',
            }}
          />
        )
        break
      }

      case 'butterfly':
        particleElement = (
          <div
            key={i}
            className="effect-particle"
            style={{
              ...style,
              height: `${size}px`,
              animationName: config.animationName,
              perspective: '200px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '1px',
              }}
            >
              <div
                style={{
                  width: `${size * 0.45}px`,
                  height: `${size * 0.6}px`,
                  borderRadius: '50% 0 50% 50%',
                  backgroundColor: color,
                  transform: 'rotateY(0deg)',
                }}
              />
              <div
                style={{
                  width: `${size * 0.45}px`,
                  height: `${size * 0.6}px`,
                  borderRadius: '0 50% 50% 50%',
                  backgroundColor: color,
                  opacity: 0.85,
                }}
              />
            </div>
          </div>
        )
        break

      default:
        particleElement = null
    }

    if (particleElement) {
      particles.push(particleElement)
    }
  }

  return particles
}

export default function EffectLayer() {
  const effectsEnabled = useSkinStore((s) => s.effectsEnabled)
  const effectType = useSkinStore((s) => s.effectType)
  const meteorDirection = useSkinStore((s) => s.meteorDirection)

  const particles = useMemo(() => {
    if (!effectsEnabled || effectType === 'none') return null

    let config = EFFECT_CONFIGS[effectType]
    if (!config) return null

    // For meteor, adjust direction based on store setting
    if (effectType === 'meteor') {
      config = {
        ...config,
        animationName: meteorDirection === 'left-to-right' ? 'meteor-ltr' : 'meteor-rtl',
        shape: meteorDirection === 'left-to-right' ? 'streak-ltr' : 'streak-rtl',
      }
    }

    return generateParticles(config)
  }, [effectsEnabled, effectType, meteorDirection])

  if (!effectsEnabled || effectType === 'none') {
    return null
  }

  return (
    <div className="fixed inset-0 z-10 pointer-events-none overflow-hidden">
      {particles}
    </div>
  )
}
