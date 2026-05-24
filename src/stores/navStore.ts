import { create } from 'zustand'

export type NavItem = 'music' | 'collection' | 'recent' | 'local' | 'skin'

interface NavState {
  activeNav: NavItem
  setActiveNav: (nav: NavItem) => void
}

export const useNavStore = create<NavState>((set) => ({
  activeNav: 'music',
  setActiveNav: (nav) => set({ activeNav: nav }),
}))
