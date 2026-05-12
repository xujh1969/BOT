import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  isAuthenticated: false,
  isLoading: false,
  login: () => set({ isAuthenticated: true }),
  logout: () => set({ isAuthenticated: false }),
  checkAuth: async () => {
    try {
      const response = await fetch('/api/check-auth', { credentials: 'include' })
      if (response.ok) {
        set({ isAuthenticated: true })
        return true
      } else {
        set({ isAuthenticated: false })
        return false
      }
    } catch {
      set({ isAuthenticated: false })
      return false
    }
  },
}))
