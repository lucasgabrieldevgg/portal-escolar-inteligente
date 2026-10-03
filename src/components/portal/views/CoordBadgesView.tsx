'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge as BadgeUI } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { BadgeCheck, Plus, Search, Award, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

interface Badge {
  id: string
  nome: string
  descricao: string
  icone: string
  raridade: string
  tipo: string
  daXP: boolean
  xpRecompensa: number
  apenasAdmin: boolean
  automatica: boolean
}

interface Conta {
  id: string
  email: string
  name: string
  role: string
  turma?: { nome: string; ano: string } | null
}

const EMOJIS_SUGERIDOS = ['🎓', '📚', '📖', '🏆', '🔥', '🐞', '🔧', '🛡️', '🎨', '💻', '🚀', '⭐', '👑', '🎯', '💡', '🌟', '📝', '🧠', '💪', '🌈']

const RARIDADES = [
  { value: 'COMUM', label: 'Comum' },
  { value: 'RARA', label: 'Rara' },
  { value: 'EPICA', label: 'Épica' },
  { value: 'LENDARIA', label: 'Lendária' },
  { value: 'ESPECIAL', label: 'Especial' },
]

const TIPOS = [
  { value: 'ACADEMICA', label: 'Acadêmica' },
  { value: 'CONTRIBUICAO', label: 'Contribuição' },
  { value: 'ESPECIAL', label: 'Especial' },
]

export function CoordBadgesView() {
  return (
    <Tabs defaultValue="conceder">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="conceder">Conceder Badge</TabsTrigger>
        <TabsTrigger value="criar">Criar Nova Badge</TabsTrigger>
      </TabsList>
      <TabsContent value="conceder" className="mt-4">
        <ConcederBadge />
      </TabsContent>
      <TabsContent value="criar" className="mt-4">
        <CriarBadge />
      </TabsContent>
    </Tabs>
  )
}

function ConcederBadge() {
  const [badges, setBadges] = useState<Badge[]>([])
  const [users, setUsers] = useState<Conta[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [badgeSel, setBadgeSel] = useState<string>('')
  const [concedendo, setConcedendo] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      api<{ badges: Badge[] }>('/api/badges'),
      api<{ users: Conta[] }>('/api/contas'),
    ]).then(([b, u]) => {
      setBadges(b.badges)
      setUsers(u.users)
      setLoading(false)
    })
  }, [])

  const filtrados = users.filter(
    (u) => !busca || u.name.toLowerCase().includes(busca.toLowerCase()) || u.email.toLowerCase().includes(busca.toLowerCase())
  )

  async function conceder(u: Conta) {
    if (!badgeSel) {
      toast.error('Escolha uma badge primeiro.')
      return
    }
    setConcedendo(u.id)
    try {
      const r = await api<{ ok: boolean; jaTem: boolean }>('/api/badges/conceder', {
        method: 'POST',
        body: JSON.stringify({ userId: u.id, badgeId: badgeSel }),
      })
      toast.success(r.jaTem ? `${u.name.split(' ')[0]} já tinha essa badge.` : `Badge concedida a ${u.name.split(' ')[0]}!`)
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setConcedendo(null)
    }
  }

  if (loading) return <div className="h-40 shimmer rounded-xl" />

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <BadgeCheck className="w-5 h-5 text-emerald-600" />
        <h3 className="text-lg font-bold">Conceder badge</h3>
      </div>

      <Card>
        <CardContent className="p-4 space-y-3">
          <div>
            <Label className="text-xs">Escolha a badge</Label>
            <Select value={badgeSel} onValueChange={setBadgeSel}>
              <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>
                {badges.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.icone} {b.nome} ({b.tipo})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Buscar usuário</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Nome ou email..." className="pl-9" />
            </div>
          </div>
          <ScrollArea className="h-[50vh]">
            <div className="divide-y">
              {filtrados.map((u) => (
                <div key={u.id} className="py-2.5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-amber-400 flex items-center justify-center font-bold text-sm">
                    {u.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{u.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{u.email} · {u.role}</p>
                  </div>
                  <Button size="sm" variant="outline" disabled={!badgeSel || concedendo === u.id} onClick={() => conceder(u)}>
                    <Award className="w-3.5 h-3.5 mr-1" /> Conceder
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}

function CriarBadge() {
  const [form, setForm] = useState({
    nome: '', descricao: '', icone: '🎓', raridade: 'COMUM', tipo: 'ESPECIAL',
    daXP: false, xpRecompensa: 0, apenasAdmin: true, automatica: false,
  })
  const [enviando, setEnviando] = useState(false)

  async function criar() {
    if (!form.nome || !form.descricao) {
      toast.error('Preencha nome e descrição.')
      return
    }
    setEnviando(true)
    try {
      await api('/api/badges/criar', { method: 'POST', body: JSON.stringify(form) })
      toast.success('Badge criada!')
      setForm({ nome: '', descricao: '', icone: '🎓', raridade: 'COMUM', tipo: 'ESPECIAL', daXP: false, xpRecompensa: 0, apenasAdmin: true, automatica: false })
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Plus className="w-5 h-5 text-emerald-600" />
        <h3 className="text-lg font-bold">Criar nova badge</h3>
      </div>

      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-100 to-amber-100 dark:from-emerald-950 dark:to-amber-950 flex items-center justify-center text-4xl">
              {form.icone}
            </div>
            <div className="flex-1">
              <Label className="text-xs">Ícone (emoji)</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {EMOJIS_SUGERIDOS.map((e) => (
                  <button
                    key={e}
                    onClick={() => setForm({ ...form, icone: e })}
                    className={`w-8 h-8 rounded-md text-lg flex items-center justify-center border ${form.icone === e ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950' : 'border-transparent hover:bg-muted'}`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <Label className="text-xs">Nome *</Label>
            <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Ex: Mestre da Leitura" />
          </div>
          <div>
            <Label className="text-xs">Descrição *</Label>
            <Textarea value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} rows={2} placeholder="Como o aluno ganha essa badge?" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Raridade</Label>
              <Select value={form.raridade} onValueChange={(v) => setForm({ ...form, raridade: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {RARIDADES.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Tipo</Label>
              <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TIPOS.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={form.daXP} onChange={(e) => setForm({ ...form, daXP: e.target.checked })} className="w-4 h-4" />
              <Label className="text-xs">Dá XP</Label>
            </div>
            <div>
              <Label className="text-xs">XP de recompensa</Label>
              <Input type="number" min={0} max={1000} value={form.xpRecompensa} onChange={(e) => setForm({ ...form, xpRecompensa: Number(e.target.value) })} disabled={!form.daXP} />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <input type="checkbox" checked={form.apenasAdmin} onChange={(e) => setForm({ ...form, apenasAdmin: e.target.checked })} className="w-4 h-4" />
              Apenas admin concede
            </label>
            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <input type="checkbox" checked={form.automatica} onChange={(e) => setForm({ ...form, automatica: e.target.checked })} className="w-4 h-4" />
              Automática (sistema concede)
            </label>
          </div>
          <Button onClick={criar} disabled={enviando} className="w-full">
            <Sparkles className="w-4 h-4 mr-1" /> {enviando ? 'Criando...' : 'Criar badge'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
