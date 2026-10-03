'use client'

import { useEffect, useState } from 'react'
import { useApp, api } from '@/lib/store'
import { LoginScreen } from '@/components/portal/LoginScreen'
import { Dashboard } from '@/components/portal/Dashboard'
import { Skeleton } from '@/components/ui/skeleton'
import { GraduationCap, Wrench } from 'lucide-react'

export default function Home() {
  const { user, loadingUser, setUser, setLoadingUser } = useApp()
  const [manutencao, setManutencao] = useState(false)
  const [msgManut, setMsgManut] = useState('')

  useEffect(() => {
    (async () => {
      try {
        // Verifica modo manutenção primeiro
        const s = await api<{ manutencao: boolean; mensagem: string }>('/api/settings').catch(() => ({ manutencao: false, mensagem: '' }))
        setManutencao(s.manutencao)
        setMsgManut(s.mensagem)

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

  // Modo manutenção ativo: bloqueia acesso de alunos/professores
  if (manutencao && user && user.role !== 'COORDENACAO' && user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950 flex items-center justify-center mx-auto">
            <Wrench className="w-8 h-8 text-rose-600" />
          </div>
          <h1 className="text-2xl font-bold">Portal em manutenção</h1>
          <p className="text-sm text-muted-foreground">
            {msgManut || 'O Portal Escolar Inteligente está passando por uma manutenção. Volte em breve!'}
          </p>
          <button
            onClick={async () => {
              await api('/api/auth/logout', { method: 'POST' })
              window.location.reload()
            }}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Sair
          </button>
        </div>
      </div>
    )
  }

  if (!user) return <LoginScreen />
  return <Dashboard />
}
