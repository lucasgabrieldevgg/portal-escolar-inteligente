'use client'

import { useEffect } from 'react'
import { useApp, api } from '@/lib/store'
import { LoginScreen } from '@/components/portal/LoginScreen'
import { Dashboard } from '@/components/portal/Dashboard'
import { Skeleton } from '@/components/ui/skeleton'

export default function Home() {
  const { user, loadingUser, setUser, setLoadingUser } = useApp()

  useEffect(() => {
    (async () => {
      try {
        const data = await api<{ user: any; badges: any[] }>('/api/me')
        setUser(data.user)
      } catch {
        setUser(null)
      } finally {
        setLoadingUser(false)
      }
    })()
  }, [setUser, setLoadingUser])

  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-3xl">🎓</span>
          </div>
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    )
  }

  if (!user) return <LoginScreen />
  return <Dashboard />
}
