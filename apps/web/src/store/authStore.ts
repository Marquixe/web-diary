import { create } from 'zustand'
import { setAccessToken } from '@/lib/api'

interface User {
  id: string
  username: string
}

interface AuthState {
  user: User | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  bootstrap: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,

  bootstrap: async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' })
      if (res.ok) {
        const { user } = await res.json()
        // Also get a fresh access token
        const r2 = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' })
        if (r2.ok) {
          const { accessToken } = await r2.json()
          setAccessToken(accessToken)
        }
        set({ user, isLoading: false })
      } else {
        set({ user: null, isLoading: false })
      }
    } catch {
      set({ user: null, isLoading: false })
    }
  },

  login: async (username, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password }),
    })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error ?? 'Login failed')
    }
    const { accessToken, user } = await res.json()
    setAccessToken(accessToken)
    set({ user })
  },

  logout: async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    setAccessToken(null)
    set({ user: null })
  },
}))
