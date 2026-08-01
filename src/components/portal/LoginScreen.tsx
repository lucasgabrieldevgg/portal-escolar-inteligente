'use client'

import { useEffect, useMemo, useState } from 'react'
import { useApp, api } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge as BadgeUI } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { GraduationCap, Search, Users, BookOpen, Trophy, Bot } from 'lucide-react'

interface DemoUser {
  id: string
  email: string
  name: string
  role: string
  turno?: string | null
  turma?: { nome: string; ano: string } | null
}

const ROLE_LABEL: Record<string, { label: string; color: string }> = {
  ALUNO: { label: 'Aluno', color: 'bg-emerald-100 text-emerald-800' },
  PROFESSOR: { label: 'Professor', color: 'bg-amber-100 text-amber-800' },
  COORDENACAO: { label: 'Coordenação', color: 'bg-rose-100 text-rose-800' },
  ADMIN: { label: 'Admin', color: 'bg-slate-200 text-slate-800' },
}

export function LoginScreen() {
  const { setUser } = useApp()
  const [users, setUsers] = useState<DemoUser[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [entrando, setEntrando] = useState<string | null>(null)
  const [filtro, setFiltro] = useState<string>('TODOS')

  useEffect(() => {
    api<{ users: DemoUser[] }>('/api/auth/login').then((d) => {
      setUsers(d.users)
      setLoading(false)
    })
  }, [])

  const filtrados = useMemo(() => {
    let arr = users
    if (filtro !== 'TODOS') arr = arr.filter((u) => u.role === filtro)
    if (busca.trim()) {
      const q = busca.toLowerCase()
      arr = arr.filter(
        (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      )
    }
    return arr
  }, [users, busca, filtro])

  // Destaque para os perfis principais de demonstração
  const destaques = useMemo(
    () =>
      users.filter((u) =>
        ['luke.silva@aluno.escola.edu.br', 'ana@escola.edu.br', 'bruno@escola.edu.br', 'coordenacao@escola.edu.br', 'admin@escola.edu.br'].includes(u.email)
      ),
    [users]
  )

  async function entrar(email: string) {
    setEntrando(email)
    try {
      const data = await api<{ user: any }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email }),
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-emerald-50 via-background to-amber-50">
      <header className="border-b bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-md">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">Portal Escolar Inteligente</h1>
              <p className="text-xs text-muted-foreground">Demonstração do projeto</p>
            </div>
          </div>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            v0.1 (MVP)
          </a>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-6xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
              Uma plataforma escolar que{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-amber-600 bg-clip-text text-transparent">
                gamifica o aprendizado
              </span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Avisos oficiais, assistente de IA, sistema de XP com rankings, badges,
              programa de caça aos bugs e equipe de colaboradores estudantis.
              Tudo em um só lugar.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
              <span className="inline-flex items-center gap-1.5 text-xs bg-card border rounded-full px-3 py-1.5">
                <Users className="w-3.5 h-3.5" /> 100+ alunos
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

          {/* Perfis em destaque */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
              Entrar como perfil de demonstração
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {destaques.map((u) => {
                const r = ROLE_LABEL[u.role]
                return (
                  <Card
                    key={u.id}
                    className="hover:shadow-md transition-shadow cursor-pointer group"
                    onClick={() => entrar(u.email)}
                  >
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-100 to-amber-100 flex items-center justify-center font-bold text-emerald-700 group-hover:scale-105 transition-transform">
                        {u.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm truncate">{u.name}</p>
                          <BadgeUI variant="outline" className={`text-[10px] py-0 px-1.5 ${r.color}`}>
                            {r.label}
                          </BadgeUI>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {u.turma ? `${u.turma.ano} · ${u.turma.nome}` : u.role === 'ALUNO' ? '—' : 'Equipe escolar'}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={entrando === u.email}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {entrando === u.email ? '...' : 'Entrar'}
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Lista completa */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Ou escolha qualquer perfil</CardTitle>
              <CardDescription>
                A escola cria as contas — o aluno não se cadastra sozinho.
                Aqui você pode simular o login de qualquer usuário da base de demonstração.
              </CardDescription>
              <div className="flex flex-col sm:flex-row gap-2 mt-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome ou email..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="flex gap-1">
                  {['TODOS', 'ALUNO', 'PROFESSOR', 'COORDENACAO'].map((f) => (
                    <Button
                      key={f}
                      size="sm"
                      variant={filtro === f ? 'default' : 'outline'}
                      onClick={() => setFiltro(f)}
                    >
                      {f === 'TODOS' ? 'Todos' : ROLE_LABEL[f]?.label || f}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <ScrollArea className="h-[360px] pr-4">
                  <div className="space-y-1">
                    {filtrados.map((u) => {
                      const r = ROLE_LABEL[u.role]
                      return (
                        <button
                          key={u.id}
                          onClick={() => entrar(u.email)}
                          disabled={entrando === u.email}
                          className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-accent/50 transition-colors text-left disabled:opacity-50"
                        >
                          <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center font-semibold text-sm">
                            {u.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm truncate">{u.name}</span>
                              <BadgeUI variant="outline" className={`text-[10px] py-0 px-1.5 ${r.color}`}>
                                {r.label}
                              </BadgeUI>
                              {u.turno && (
                                <span className="text-[10px] text-muted-foreground">
                                  {u.turno === 'MANHA' ? 'Manhã' : 'Tarde'}
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground truncate block">
                              {u.email}
                              {u.turma ? ` · ${u.turma.nome}` : ''}
                            </span>
                          </div>
                        </button>
                      )
                    })}
                    {filtrados.length === 0 && (
                      <div className="text-center py-12 text-sm text-muted-foreground">
                        Nenhum usuário encontrado.
                      </div>
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
          Demonstração do Portal Escolar Inteligente · MVP para apresentação à escola
        </div>
      </footer>
    </div>
  )
}
