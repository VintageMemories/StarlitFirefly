import { create } from 'zustand'

export type AudioEffectPreset = 
  | 'none'
  | 'python'        // 蟒蛇音效
  | 'vinyl'         // 黑胶唱片
  | 'dolby'         // 杜比全景
  | 'surround3d'    // 3D环绕
  | 'car'           // 汽车音效
  | 'hifi'          // HiFi现场
  | 'clear-vocal'   // 清澈人声
  | 'bass-boost'    // 超重低音
  | 'pure-vocal'    // 纯净人声
  | '3d-crystal'    // 3D丽音
  | 'panorama'      // 全景声模式
  | 'pleasant-vocal' // 悦耳人声
  | 'surround-hd'   // 臻享环绕
  | 'powerful-speaker' // 澎湃外放

export const AUDIO_EFFECT_PRESETS: Record<AudioEffectPreset, { label: string; gains: number[] }> = {
  'none': { label: '无', gains: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  'python': { label: '蟒蛇音效', gains: [8, 6, 4, 2, 0, -2, 0, 2, 4, 6] },
  'vinyl': { label: '黑胶唱片', gains: [2, 4, 3, 1, -1, -1, 0, 2, 3, 2] },
  'dolby': { label: '杜比全景', gains: [3, 5, 4, 3, 2, 2, 3, 4, 5, 4] },
  'surround3d': { label: '3D环绕', gains: [4, 3, 1, -1, -2, -1, 1, 3, 5, 4] },
  'car': { label: '汽车音效', gains: [6, 4, 2, 0, -2, -1, 1, 3, 4, 3] },
  'hifi': { label: 'HiFi现场', gains: [5, 4, 3, 1, 0, 1, 2, 4, 5, 4] },
  'clear-vocal': { label: '清澈人声', gains: [-2, -1, 0, 2, 5, 5, 4, 2, 0, -1] },
  'bass-boost': { label: '超重低音', gains: [10, 8, 6, 4, 1, -1, -2, -1, 0, 0] },
  'pure-vocal': { label: '纯净人声', gains: [-3, -1, 1, 3, 6, 6, 3, 1, -1, -2] },
  '3d-crystal': { label: '3D丽音', gains: [3, 2, 0, -1, 1, 3, 4, 5, 4, 3] },
  'panorama': { label: '全景声模式', gains: [4, 3, 2, 1, 2, 3, 3, 4, 5, 4] },
  'pleasant-vocal': { label: '悦耳人声', gains: [-1, 0, 1, 3, 5, 5, 3, 1, 0, -1] },
  'surround-hd': { label: '臻享环绕', gains: [4, 3, 1, 0, 2, 3, 4, 5, 4, 3] },
  'powerful-speaker': { label: '澎湃外放', gains: [7, 5, 3, 2, 0, -1, 1, 3, 5, 4] },
}

export const EQ_FREQUENCIES = ['60', '170', '310', '600', '1k', '3k', '6k', '12k', '14k', '16k']

interface AudioState {
  // Equalizer
  eqGains: number[]
  activePreset: AudioEffectPreset
  eqOpen: boolean
  
  // Actions
  setEqGains: (gains: number[]) => void
  setEqBand: (index: number, gain: number) => void
  setActivePreset: (preset: AudioEffectPreset) => void
  resetEq: () => void
  setEqOpen: (open: boolean) => void
  toggleEq: () => void
}

export const useAudioStore = create<AudioState>((set) => ({
  eqGains: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  activePreset: 'none',
  eqOpen: false,

  setEqGains: (gains) => set({ eqGains: gains }),
  setEqBand: (index, gain) => set((state) => {
    const newGains = [...state.eqGains]
    newGains[index] = gain
    return { eqGains: newGains, activePreset: 'none' }
  }),
  setActivePreset: (preset) => set({ 
    activePreset: preset, 
    eqGains: [...AUDIO_EFFECT_PRESETS[preset].gains] 
  }),
  resetEq: () => set({ eqGains: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], activePreset: 'none' }),
  setEqOpen: (open) => set({ eqOpen: open }),
  toggleEq: () => set((state) => ({ eqOpen: !state.eqOpen })),
}))
