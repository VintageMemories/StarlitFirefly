import { create } from 'zustand'

export type PlayMode = 'sequence' | 'loop' | 'single' | 'random'

export interface SongInfo {
  id: string
  title: string
  artist: string
  album: string
  duration: number
  filePath: string
  coverPath?: string
  isLocal: boolean
}

interface PlayerState {
  // Current song
  currentSong: SongInfo | null
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isMuted: boolean
  playMode: PlayMode

  // Queue
  playQueue: SongInfo[]
  queueIndex: number

  // UI State
  isPlayerExpanded: boolean

  // Actions
  setCurrentSong: (song: SongInfo | null) => void
  setIsPlaying: (playing: boolean) => void
  setCurrentTime: (time: number) => void
  setDuration: (duration: number) => void
  setVolume: (volume: number) => void
  toggleMute: () => void
  setPlayMode: (mode: PlayMode) => void
  cyclePlayMode: () => void
  setPlayQueue: (songs: SongInfo[], startIndex?: number) => void
  playNext: () => void
  playPrev: () => void
  setIsPlayerExpanded: (expanded: boolean) => void
  togglePlayerExpanded: () => void
  addToQueue: (song: SongInfo) => void
  removeFromQueue: (index: number) => void
  clearQueue: () => void
  playSongFromQueue: (index: number) => void
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentSong: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 80,
  isMuted: false,
  playMode: 'sequence',
  playQueue: [],
  queueIndex: -1,
  isPlayerExpanded: false,

  setCurrentSong: (song) => set({ currentSong: song }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),
  setVolume: (volume) => set({ volume, isMuted: volume === 0 }),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  setPlayMode: (mode) => set({ playMode: mode }),
  cyclePlayMode: () => {
    const modes: PlayMode[] = ['sequence', 'loop', 'single', 'random']
    const current = get().playMode
    const nextIndex = (modes.indexOf(current) + 1) % modes.length
    set({ playMode: modes[nextIndex] })
  },
  setPlayQueue: (songs, startIndex = 0) => set({ playQueue: songs, queueIndex: startIndex }),
  playNext: () => {
    const { playQueue, queueIndex, playMode } = get()
    if (playQueue.length === 0) return
    
    let nextIndex: number
    if (playMode === 'random') {
      nextIndex = Math.floor(Math.random() * playQueue.length)
    } else if (playMode === 'single') {
      nextIndex = queueIndex
    } else {
      nextIndex = (queueIndex + 1) % playQueue.length
    }
    
    set({ 
      queueIndex: nextIndex, 
      currentSong: playQueue[nextIndex],
      isPlaying: true,
      currentTime: 0
    })
  },
  playPrev: () => {
    const { playQueue, queueIndex, playMode } = get()
    if (playQueue.length === 0) return
    
    let prevIndex: number
    if (playMode === 'random') {
      prevIndex = Math.floor(Math.random() * playQueue.length)
    } else {
      prevIndex = queueIndex <= 0 ? playQueue.length - 1 : queueIndex - 1
    }
    
    set({ 
      queueIndex: prevIndex, 
      currentSong: playQueue[prevIndex],
      isPlaying: true,
      currentTime: 0
    })
  },
  setIsPlayerExpanded: (expanded) => set({ isPlayerExpanded: expanded }),
  togglePlayerExpanded: () => set((state) => ({ isPlayerExpanded: !state.isPlayerExpanded })),
  addToQueue: (song) => set((state) => ({ playQueue: [...state.playQueue, song] })),
  removeFromQueue: (index) => set((state) => {
    const newQueue = state.playQueue.filter((_, i) => i !== index)
    let newIndex = state.queueIndex
    if (index < state.queueIndex) newIndex--
    else if (index === state.queueIndex) newIndex = Math.min(newIndex, newQueue.length - 1)
    return { playQueue: newQueue, queueIndex: newIndex }
  }),
  clearQueue: () => set({ playQueue: [], queueIndex: -1, currentSong: null, isPlaying: false }),
  playSongFromQueue: (index) => {
    const { playQueue } = get()
    if (index >= 0 && index < playQueue.length) {
      set({
        queueIndex: index,
        currentSong: playQueue[index],
        isPlaying: true,
        currentTime: 0
      })
    }
  }
}))
