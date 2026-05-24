import { create } from 'zustand'

export type EffectType = 'none' | 'snow' | 'rain' | 'petals' | 'bubbles' | 'meteor' | 'butterfly' | 'firefly'
export type BackgroundType = 'none' | 'image' | 'video'
export type MeteorDirection = 'left-to-right' | 'right-to-left'

interface SkinState {
  backgroundType: BackgroundType
  backgroundPath: string | null
  effectsEnabled: boolean
  effectType: EffectType
  meteorDirection: MeteorDirection
  
  // Actions
  setBackgroundType: (type: BackgroundType) => void
  setBackgroundPath: (path: string | null) => void
  setEffectsEnabled: (enabled: boolean) => void
  setEffectType: (type: EffectType) => void
  setMeteorDirection: (direction: MeteorDirection) => void
}

export const useSkinStore = create<SkinState>((set) => ({
  backgroundType: 'none',
  backgroundPath: null,
  effectsEnabled: false,
  effectType: 'none',
  meteorDirection: 'left-to-right',

  setBackgroundType: (type) => set({ backgroundType: type }),
  setBackgroundPath: (path) => set({ backgroundPath: path }),
  setEffectsEnabled: (enabled) => set({ effectsEnabled: enabled }),
  setEffectType: (type) => set({ effectType: type }),
  setMeteorDirection: (direction) => set({ meteorDirection: direction }),
}))
