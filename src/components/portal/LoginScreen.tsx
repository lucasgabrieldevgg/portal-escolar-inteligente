'use client'

import { useEffect, useMemo, useState } from 'react'
import { useApp, api } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge as BadgeUI } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { ThemeToggle } from './ThemeToggle'
import { SobreEscolaButton } from './SobreEscolaButton'
import { toast } from 'sonner'
import { GraduationCap, Search, Users, BookOpen, Trophy, Bot, ChevronRight } from 'lucide-react'

interface DemoUser {
  id: string; email: string; name: string; role: string
  turno?: string | null; turma?: { nome: string; ano: string } | null
}

const ROLE_LABEL: Record<string, { label: string; color: string }> = {
  ALUNO: { label: 'Aluno', color: 'bg-emerald-100 text-emerald-800' },
  PROFESSOR: { label: 'Professor', color: 'bg-amber-100 text-amber-800' },
  BIBLIOTECARIO: { label: 'Bibliotecário', color: 'bg-purple-100 text-purple-800' },
  COORDENACAO: { label: 'Coordenação', color: 'bg-rose-100 text-rose-800' },
  ADMIN: { label: 'Admin', color: 'bg-slate-200 text-slate-800' },
}

export function LoginScreen() {
  const { setUser } = useApp()
  const [users, setUsers] = useState<DemoUser[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [entrando, setEntrando] = useState<string | null>(null)

  useEffect(() => {
    api<{ users: DemoUser[] }>('/api/auth/login')
      .then((d) => { setUsers(d.users); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtrados = useMemo(() => {
    if (!busca.trim()) return users
    const q = busca.toLowerCase()
    return users.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
  }, [users, busca])

  async function entrar(u: DemoUser) {
    setEntrando(u.id)
    try {
      const data = await api<{ user: any }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: u.email }),
      })
      setUser(data.user)
      toast.success(`Bem-vindo, ${data.user.name.split(' ')[0]}!`)
    } catch (e: any) {
      toast.error(e.message || 'Erro ao entrar')
    } finally {
      setEntrando(null)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-emerald-50 via-background to-amber-50 dark:from-emerald-950/30 dark:via-background dark:to-amber-950/30">
      <header className="border-b bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-md">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">Portal Escolar Inteligente</h1>
              <p className="text-xs text-muted-foreground">Escola Est. Profª Eunice Souza dos Santos · Rondonópolis-MT</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <SobreEscolaButton />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-4xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
              Uma plataforma escolar que{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-amber-600 bg-clip-text text-transparent">
                gamifica o aprendizado
              </span>
            </h2>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              Avisos, assistente de IA, XP com rankings semanais, badges, loja de avatares,
              biblioteca com resumos e caça aos bugs.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
              <span className="inline-flex items-center gap-1.5 text-xs bg-card border rounded-full px-3 py-1.5">
                <Users className="w-3.5 h-3.5" /> Alunos e equipe
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs bg-card border rounded-full px-3 py-1.5">
                <Trophy className="w-3.5 h-3.5" /> Rankings por turno e turma
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs bg-card border rounded-full px-3 py-1.5">
                <Bot className="w-3.5 h-3.5" /> IA com limite diário
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs bg-card border rounded-full px-3 py-1.5">
                <BookOpen className="w-3.5 h-3.5" /> Badges e contribuições
              </span>
            </div>
          </div>

          {/* Seleção de perfil */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Escolha um perfil para entrar</CardTitle>
              <CardDescription>
                Demonstração — clique em qualquer perfil para acessar o portal. Sem senha necessária.
              </CardDescription>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-9"
                />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
                </div>
              ) : (
                <ScrollArea className="h-[50vh] pr-4">
                  <div className="space-y-1">
                    {filtrados.map((u) => {
                      const r = ROLE_LABEL[u.role] || ROLE_LABEL.ALUNO
                      return (
                        <button
                          key={u.id}
                          onClick={() => entrar(u)}
                          disabled={!!entrando}
                          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors text-left disabled:opacity-50 group"
                        >
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-amber-400 flex items-center justify-center font-semibold text-sm flex-shrink-0">
                            {u.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-sm truncate">{u.name}</span>
                              <BadgeUI variant="outline" className={`text-[10px] py-0 px-1.5 ${r.color}`}>{r.label}</BadgeUI>
                              {u.turno && <span className="text-[10px] text-muted-foreground">{u.turno === 'MANHA' ? 'Manhã' : 'Tarde'}</span>}
                            </div>
                            <span className="text-xs text-muted-foreground truncate block">
                              {u.turma ? `${u.turma.ano} · ${u.turma.nome}` : 'Equipe escolar'}
                            </span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                        </button>
                      )
                    })}
                    {filtrados.length === 0 && (
                      <div className="text-center py-12 text-sm text-muted-foreground">Nenhum perfil encontrado.</div>
                    )}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="border-t bg-card py-4 mt-auto">
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
          Demonstração do Portal Escolar Inteligente · MVP
        </div>
      </footer>
    </div>
  )
}
