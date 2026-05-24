import { create } from 'zustand'

interface UserState {
  isLoggedIn: boolean
  userName: string
  avatarPath: string | null
  
  // Actions
  login: (name: string) => void
  logout: () => void
  setAvatar: (path: string) => void
}

export const useUserStore = create<UserState>((set) => ({
  isLoggedIn: false,
  userName: '未登录',
  avatarPath: null,

  login: (name) => set({ isLoggedIn: true, userName: name }),
  logout: () => set({ isLoggedIn: false, userName: '未登录', avatarPath: null }),
  setAvatar: (path) => set({ avatarPath: path }),
}))
