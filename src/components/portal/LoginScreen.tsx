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
import { ThemeToggle } from './ThemeToggle'
import { SobreEscolaButton } from './SobreEscolaButton'
import { toast } from 'sonner'
import { GraduationCap, Search, Users, BookOpen, Trophy, Bot, Copy, Lock } from 'lucide-react'

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
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erroLogin, setErroLogin] = useState('')

  useEffect(() => {
    api<{ users: DemoUser[] }>('/api/auth/login')
      .then((d) => {
        setUsers(d.users)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filtrados = useMemo(() => {
    if (!busca.trim()) return users
    const q = busca.toLowerCase()
    return users.filter(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    )
  }, [users, busca])

  async function entrar(emailArg?: string, senhaArg?: string) {
    const emailFinal = (emailArg ?? email).toLowerCase().trim()
    const senhaFinal = senhaArg ?? senha
    if (!emailFinal || !senhaFinal) {
      setErroLogin('Informe email e senha.')
      return
    }
    setEntrando(emailFinal)
    setErroLogin('')
    try {
      const data = await api<{ user: any }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: emailFinal, senha: senhaFinal }),
      })
      setUser(data.user)
      toast.success(`Bem-vindo, ${data.user.name.split(' ')[0]}!`)
    } catch (e: any) {
      setErroLogin(e.message || 'Erro ao entrar')
      toast.error(e.message || 'Erro ao entrar')
    } finally {
      setEntrando(null)
    }
  }

  async function entrarDemo(u: DemoUser) {
    // Demo accounts têm senha "demo1234"
    setEmail(u.email)
    setSenha('demo1234')
    await entrar(u.email, 'demo1234')
  }

  function copiarCredenciais() {
    navigator.clipboard.writeText('Email: ' + (email || users[0]?.email || '') + '\nSenha: demo1234')
    toast.success('Credenciais copiadas!')
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
              Avisos oficiais, assistente de IA, sistema de XP com rankings semanais, badges,
              loja de avatares, biblioteca com resumos e programa de caça aos bugs.
              Tudo em um só lugar.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Login por senha */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Lock className="w-4 h-4" /> Entrar com email e senha
                </CardTitle>
                <CardDescription>
                  Use suas credenciais. Para contas de demonstração, a senha é <code className="bg-muted px-1 rounded">demo1234</code>.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label htmlFor="email" className="text-xs">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu.email@portal.escola.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') entrar() }}
                  />
                </div>
                <div>
                  <Label htmlFor="senha" className="text-xs">Senha</Label>
                  <Input
                    id="senha"
                    type="password"
                    placeholder="••••••••"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') entrar() }}
                  />
                </div>
                {erroLogin && (
                  <p className="text-xs text-red-600">{erroLogin}</p>
                )}
                <Button onClick={() => entrar()} disabled={!!entrando} className="w-full">
                  {entrando ? 'Entrando...' : 'Entrar'}
                </Button>
                <Button variant="ghost" size="sm" className="w-full text-xs" onClick={copiarCredenciais}>
                  <Copy className="w-3 h-3 mr-1" /> Copiar credenciais demo
                </Button>
              </CardContent>
            </Card>

            {/* Lista de perfis demo */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Perfis de demonstração</CardTitle>
                <CardDescription>Clique para entrar rapidamente (senha: demo1234).</CardDescription>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome ou email..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="pl-9"
                  />
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
                        const r = ROLE_LABEL[u.role] || ROLE_LABEL.ALUNO
                        return (
                          <button
                            key={u.id}
                            onClick={() => entrarDemo(u)}
                            disabled={!!entrando}
                            className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-accent/50 transition-colors text-left disabled:opacity-50"
                          >
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-amber-400 flex items-center justify-center font-semibold text-sm">
                              {u.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
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
