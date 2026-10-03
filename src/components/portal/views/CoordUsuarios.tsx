'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
import { Badge as BadgeUI } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Users, Search } from 'lucide-react'

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

export function CoordUsuarios() {
  const [users, setUsers] = useState<DemoUser[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [filtro, setFiltro] = useState('TODOS')

  useEffect(() => {
    api<{ users: DemoUser[] }>('/api/auth/login').then((d) => {
      setUsers(d.users)
      setLoading(false)
    })
  }, [])

  const filtrados = users
    .filter((u) => filtro === 'TODOS' || u.role === filtro)
    .filter((u) => !busca || u.name.toLowerCase().includes(busca.toLowerCase()) || u.email.toLowerCase().includes(busca.toLowerCase()))

  const stats = {
    total: users.length,
    alunos: users.filter((u) => u.role === 'ALUNO').length,
    professores: users.filter((u) => u.role === 'PROFESSOR').length,
    manha: users.filter((u) => u.role === 'ALUNO' && u.turno === 'MANHA').length,
    tarde: users.filter((u) => u.role === 'ALUNO' && u.turno === 'TARDE').length,
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="flex items-center gap-2">
        <Users className="w-5 h-5 text-rose-600" />
        <h2 className="text-xl font-bold">Usuários do sistema</h2>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold">{stats.total}</p><p className="text-[10px] text-muted-foreground">Total</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-emerald-600">{stats.alunos}</p><p className="text-[10px] text-muted-foreground">Alunos</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-amber-600">{stats.professores}</p><p className="text-[10px] text-muted-foreground">Professores</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-sky-600">{stats.manha}</p><p className="text-[10px] text-muted-foreground">Turno manhã</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-purple-600">{stats.tarde}</p><p className="text-[10px] text-muted-foreground">Turno tarde</p></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-2 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Buscar por nome ou email..." value={busca} onChange={(e) => setBusca(e.target.value)} className="pl-9" />
            </div>
            <Select value={filtro} onValueChange={setFiltro}>
              <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos</SelectItem>
                <SelectItem value="ALUNO">Alunos</SelectItem>
                <SelectItem value="PROFESSOR">Professores</SelectItem>
                <SelectItem value="COORDENACAO">Coordenação</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <ScrollArea className="h-[60vh]">
            <div className="divide-y">
              {loading ? (
                <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 shimmer rounded" />)}</div>
              ) : filtrados.map((u) => {
                const r = ROLE_LABEL[u.role] || ROLE_LABEL.ALUNO
                return (
                  <div key={u.id} className="py-2.5 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-amber-400 flex items-center justify-center font-bold text-sm">
                      {u.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-sm truncate">{u.name}</p>
                        <BadgeUI variant="outline" className={`text-[10px] py-0 px-1.5 ${r.color}`}>{r.label}</BadgeUI>
                        {u.turno && (
                          <span className="text-[10px] text-muted-foreground">{u.turno === 'MANHA' ? 'Manhã' : 'Tarde'}</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {u.email}{u.turma ? ` · ${u.turma.ano} · ${u.turma.nome}` : ''}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
