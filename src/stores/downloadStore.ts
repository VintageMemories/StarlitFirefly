import { create } from 'zustand'

export interface DownloadTask {
  id: string
  title: string
  artist: string
  album: string
  progress: number // 0-100
  status: 'downloading' | 'completed' | 'failed' | 'paused'
  fileSize: string
  addedAt: Date
}

interface DownloadState {
  tasks: DownloadTask[]
  downloadPath: string
  addTask: (task: Omit<DownloadTask, 'id' | 'progress' | 'status' | 'addedAt'>) => void
  removeTask: (id: string) => void
  clearCompleted: () => void
  pauseTask: (id: string) => void
  resumeTask: (id: string) => void
  setDownloadPath: (path: string) => void
}

// Store timers for each download task so we can pause/resume/clear them
const taskTimers = new Map<string, ReturnType<typeof setInterval>>()

function startProgressTimer(id: string, set: (fn: (state: DownloadState) => Partial<DownloadState>) => void, get: () => DownloadState) {
  // Clear existing timer if any
  const existing = taskTimers.get(id)
  if (existing) clearInterval(existing)

  const timer = setInterval(() => {
    const state = get()
    const task = state.tasks.find((t) => t.id === id)
    if (!task || task.status !== 'downloading') {
      clearInterval(timer)
      taskTimers.delete(id)
      return
    }

    // Increment by a random amount (3-15) for realistic feel
    const increment = Math.floor(Math.random() * 13) + 3
    const newProgress = Math.min(task.progress + increment, 100)
    const isCompleted = newProgress >= 100

    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === id
          ? { ...t, progress: newProgress, status: isCompleted ? 'completed' : t.status }
          : t
      ),
    }))

    if (isCompleted) {
      clearInterval(timer)
      taskTimers.delete(id)
    }
  }, 500)

  taskTimers.set(id, timer)
}

function generateId(): string {
  return `dl_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

export const useDownloadStore = create<DownloadState>((set, get) => ({
  tasks: [],
  downloadPath: '~/Music/星荧音乐',

  addTask: (task) => {
    const id = generateId()
    const newTask: DownloadTask = {
      ...task,
      id,
      progress: 0,
      status: 'downloading',
      addedAt: new Date(),
    }

    set((state) => ({
      tasks: [newTask, ...state.tasks],
    }))

    // Start simulating download progress
    startProgressTimer(id, set, get)
  },

  removeTask: (id) => {
    // Clean up timer
    const timer = taskTimers.get(id)
    if (timer) {
      clearInterval(timer)
      taskTimers.delete(id)
    }

    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    }))
  },

  clearCompleted: () => {
    // Clean up timers for completed tasks (shouldn't be any, but just in case)
    const state = get()
    for (const task of state.tasks) {
      if (task.status === 'completed') {
        const timer = taskTimers.get(task.id)
        if (timer) {
          clearInterval(timer)
          taskTimers.delete(task.id)
        }
      }
    }

    set((state) => ({
      tasks: state.tasks.filter((t) => t.status !== 'completed'),
    }))
  },

  pauseTask: (id) => {
    // Stop the timer
    const timer = taskTimers.get(id)
    if (timer) {
      clearInterval(timer)
      taskTimers.delete(id)
    }

    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id && t.status === 'downloading'
          ? { ...t, status: 'paused' }
          : t
      ),
    }))
  },

  resumeTask: (id) => {
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id && t.status === 'paused'
          ? { ...t, status: 'downloading' }
          : t
      ),
    }))

    // Restart the progress timer
    const state = get()
    const task = state.tasks.find((t) => t.id === id)
    if (task && task.status === 'downloading') {
      startProgressTimer(id, set, get)
    }
  },

  setDownloadPath: (path) => {
    set({ downloadPath: path })
  },
}))
