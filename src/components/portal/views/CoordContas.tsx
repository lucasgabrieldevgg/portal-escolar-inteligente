'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge as BadgeUI } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Users, Plus, Search, KeyRound, Power } from 'lucide-react'
import { toast } from 'sonner'

interface Conta {
  id: string
  email: string
  name: string
  role: string
  turno?: string | null
  ativo: boolean
  materias?: string | null
  turma?: { nome: string; ano: string } | null
  xp: number
  moedinhas: number
  createdAt: string
}

interface Turma { id: string; nome: string; ano: string; turno: string }

const ROLE_LABEL: Record<string, { label: string; color: string }> = {
  ALUNO: { label: 'Aluno', color: 'bg-emerald-100 text-emerald-800' },
  PROFESSOR: { label: 'Professor', color: 'bg-amber-100 text-amber-800' },
  BIBLIOTECARIO: { label: 'Bibliotecário', color: 'bg-purple-100 text-purple-800' },
  COORDENACAO: { label: 'Coordenação', color: 'bg-rose-100 text-rose-800' },
  ADMIN: { label: 'Admin', color: 'bg-slate-200 text-slate-800' },
}

export function CoordContas() {
  const [users, setUsers] = useState<Conta[]>([])
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [filtro, setFiltro] = useState('TODOS')
  const [criarOpen, setCriarOpen] = useState(false)
  const [editar, setEditar] = useState<Conta | null>(null)

  const reload = () => {
    api<{ users: Conta[] }>('/api/contas').then((d) => {
      setUsers(d.users)
      setLoading(false)
    })
  }

  useEffect(() => {
    reload()
    api<{ turmas: Turma[] }>('/api/turmas').then((d) => setTurmas(d.turmas))
  }, [])

  const filtrados = users
    .filter((u) => filtro === 'TODOS' || u.role === filtro)
    .filter((u) => !busca || u.name.toLowerCase().includes(busca.toLowerCase()) || u.email.toLowerCase().includes(busca.toLowerCase()))

  const stats = {
    total: users.length,
    alunos: users.filter((u) => u.role === 'ALUNO').length,
    professores: users.filter((u) => u.role === 'PROFESSOR').length,
    ativos: users.filter((u) => u.ativo).length,
    inativos: users.filter((u) => !u.ativo).length,
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="flex items-center gap-2">
        <Users className="w-5 h-5 text-rose-600" />
        <h2 className="text-xl font-bold">Contas</h2>
        <Button size="sm" className="ml-auto" onClick={() => setCriarOpen(true)}>
          <Plus className="w-4 h-4 mr-1" /> Nova conta
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold">{stats.total}</p><p className="text-[10px] text-muted-foreground">Total</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-emerald-600">{stats.alunos}</p><p className="text-[10px] text-muted-foreground">Alunos</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-amber-600">{stats.professores}</p><p className="text-[10px] text-muted-foreground">Professores</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-emerald-600">{stats.ativos}</p><p className="text-[10px] text-muted-foreground">Ativos</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-red-600">{stats.inativos}</p><p className="text-[10px] text-muted-foreground">Inativos</p></CardContent></Card>
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
                <SelectItem value="BIBLIOTECARIO">Bibliotecários</SelectItem>
                <SelectItem value="COORDENACAO">Coordenação</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
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
                    <div className={`w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-amber-400 flex items-center justify-center font-bold text-sm ${u.ativo ? '' : 'opacity-50'}`}>
                      {u.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-sm truncate">{u.name}</p>
                        <BadgeUI variant="outline" className={`text-[10px] py-0 px-1.5 ${r.color}`}>{r.label}</BadgeUI>
                        {!u.ativo && <BadgeUI variant="outline" className="text-[10px] py-0 px-1.5 bg-red-100 text-red-800">Inativo</BadgeUI>}
                        {u.turno && <span className="text-[10px] text-muted-foreground">{u.turno === 'MANHA' ? 'Manhã' : 'Tarde'}</span>}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {u.email}{u.turma ? ` · ${u.turma.ano} · ${u.turma.nome}` : ''}
                        {u.role === 'ALUNO' ? ` · ${u.xp} XP · ${u.moedinhas} moedinhas` : ''}
                      </p>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => setEditar(u)}>Editar</Button>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {criarOpen && (
        <CriarContaDialog
          turmas={turmas}
          onClose={() => setCriarOpen(false)}
          onCriado={() => { setCriarOpen(false); reload() }}
        />
      )}

      {editar && (
        <EditarContaDialog
          conta={editar}
          turmas={turmas}
          onClose={() => setEditar(null)}
          onSalvo={() => { setEditar(null); reload() }}
        />
      )}
    </div>
  )
}

function CriarContaDialog({ turmas, onClose, onCriado }: { turmas: Turma[]; onClose: () => void; onCriado: () => void }) {
  const [form, setForm] = useState({ name: '', email: '', role: 'ALUNO', turmaId: '', senha: '', materias: '' })
  const [enviando, setEnviando] = useState(false)

  async function criar() {
    if (!form.name || !form.email || !form.role) {
      toast.error('Nome, email e role são obrigatórios.')
      return
    }
    if (form.role === 'ALUNO' && !form.turmaId) {
      toast.error('Aluno precisa de turma.')
      return
    }
    setEnviando(true)
    try {
      const body: any = {
        name: form.name,
        email: form.email,
        role: form.role,
        turmaId: form.turmaId || undefined,
        senha: form.senha || undefined,
      }
      if (form.role === 'PROFESSOR' && form.materias) {
        body.materias = form.materias.split(',').map((s) => s.trim()).filter(Boolean)
      }
      const d = await api<{ senhaGerada: string | null }>('/api/contas', {
        method: 'POST',
        body: JSON.stringify(body),
      })
      if (d.senhaGerada) {
        toast.success(`Conta criada! Senha inicial: ${d.senhaGerada}`)
      } else {
        toast.success('Conta criada!')
      }
      onCriado()
    } catch (e: any) {
      toast.error(e.message || 'Erro ao criar')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nova conta</DialogTitle>
          <DialogDescription>Crie uma conta para aluno, professor, bibliotecário ou coordenação.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
          <div>
            <Label className="text-xs">Nome *</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs">Email *</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs">Papel *</Label>
            <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v, turmaId: '' })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALUNO">Aluno</SelectItem>
                <SelectItem value="PROFESSOR">Professor</SelectItem>
                <SelectItem value="BIBLIOTECARIO">Bibliotecário</SelectItem>
                <SelectItem value="COORDENACAO">Coordenação</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {form.role === 'ALUNO' && (
            <div>
              <Label className="text-xs">Turma *</Label>
              <Select value={form.turmaId} onValueChange={(v) => setForm({ ...form, turmaId: v })}>
                <SelectTrigger><SelectValue placeholder="Escolha" /></SelectTrigger>
                <SelectContent>
                  {turmas.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.nome} · {t.ano} ({t.turno === 'MANHA' ? 'Manhã' : 'Tarde'})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {form.role === 'PROFESSOR' && (
            <div>
              <Label className="text-xs">Matérias (separadas por vírgula)</Label>
              <Input value={form.materias} onChange={(e) => setForm({ ...form, materias: e.target.value })} placeholder="Matemática, Ciências" />
            </div>
          )}
          <div>
            <Label className="text-xs">Senha (deixe vazio para gerar automaticamente)</Label>
            <Input value={form.senha} onChange={(e) => setForm({ ...form, senha: e.target.value })} placeholder="Senha inicial" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button onClick={criar} disabled={enviando}>{enviando ? 'Criando...' : 'Criar conta'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function EditarContaDialog({ conta, turmas, onClose, onSalvo }: { conta: Conta; turmas: Turma[]; onClose: () => void; onSalvo: () => void }) {
  const [name, setName] = useState(conta.name)
  const [role, setRole] = useState(conta.role)
  const [turmaId, setTurmaId] = useState(conta.turma?.nome ? '' : '')
  const [ativo, setAtivo] = useState(conta.ativo)
  const [enviando, setEnviando] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)
  const [novaSenha, setNovaSenha] = useState('')

  // Buscar turmaId real
  useEffect(() => {
    if (conta.turma) {
      const t = turmas.find((t) => t.nome === conta.turma?.nome)
      if (t) setTurmaId(t.id)
    }
  }, [conta, turmas])

  async function salvar() {
    setEnviando(true)
    try {
      const body: any = { name, role, ativo }
      if (role === 'ALUNO') body.turmaId = turmaId
      await api(`/api/contas/${conta.id}`, { method: 'PATCH', body: JSON.stringify(body) })
      toast.success('Conta atualizada!')
      onSalvo()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setEnviando(false)
    }
  }

  async function resetSenha() {
    setEnviando(true)
    try {
      const body = novaSenha ? { senha: novaSenha } : {}
      const d = await api<{ senhaGerada: string | null }>(`/api/contas/${conta.id}`, { method: 'POST', body: JSON.stringify(body) })
      if (d.senhaGerada) {
        toast.success(`Nova senha: ${d.senhaGerada}`)
      } else {
        toast.success('Senha redefinida!')
      }
      setResetOpen(false)
      setNovaSenha('')
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setEnviando(false)
    }
  }

  async function desativar() {
    if (!confirm(`Desativar a conta de ${conta.name}? Ela não poderá mais entrar.`)) return
    try {
      await api(`/api/contas/${conta.id}`, { method: 'DELETE' })
      toast.success('Conta desativada.')
      onSalvo()
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar conta</DialogTitle>
          <DialogDescription>{conta.email}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Nome</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Papel</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALUNO">Aluno</SelectItem>
                <SelectItem value="PROFESSOR">Professor</SelectItem>
                <SelectItem value="BIBLIOTECARIO">Bibliotecário</SelectItem>
                <SelectItem value="COORDENACAO">Coordenação</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {role === 'ALUNO' && (
            <div>
              <Label className="text-xs">Turma</Label>
              <Select value={turmaId} onValueChange={setTurmaId}>
                <SelectTrigger><SelectValue placeholder="Escolha" /></SelectTrigger>
                <SelectContent>
                  {turmas.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.nome} · {t.ano}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={ativo} onChange={(e) => setAtivo(e.target.checked)} className="w-4 h-4" />
            <Label className="text-xs">Conta ativa</Label>
          </div>

          <div className="border-t pt-3 space-y-2">
            {resetOpen ? (
              <div className="space-y-2 p-2 rounded-lg bg-muted/50">
                <Label className="text-xs">Nova senha (deixe vazio para gerar)</Label>
                <Input value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} placeholder="Nova senha" />
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => setResetOpen(false)}>Cancelar</Button>
                  <Button size="sm" className="flex-1" onClick={resetSenha} disabled={enviando}>Resetar</Button>
                </div>
              </div>
            ) : (
              <Button size="sm" variant="outline" className="w-full" onClick={() => setResetOpen(true)}>
                <KeyRound className="w-3.5 h-3.5 mr-1" /> Resetar senha
              </Button>
            )}
            {conta.ativo && (
              <Button size="sm" variant="outline" className="w-full text-red-700 hover:text-red-800" onClick={desativar}>
                <Power className="w-3.5 h-3.5 mr-1" /> Desativar conta
              </Button>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button onClick={salvar} disabled={enviando}>{enviando ? 'Salvando...' : 'Salvar'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
