import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { LoginPage } from '@/pages/LoginPage'
import type { ReactNode } from 'react'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, isLoading, bootstrap } = useAuthStore()

  useEffect(() => {
    bootstrap()
  }, [bootstrap])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="text-muted-foreground text-sm">Loading…</span>
      </div>
    )
  }

  if (!user) return <LoginPage />

  return <>{children}</>
}
