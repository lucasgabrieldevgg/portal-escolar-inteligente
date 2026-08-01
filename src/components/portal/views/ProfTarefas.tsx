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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { BookOpen, Plus, Award, Clock, ClipboardCheck } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'

interface Tarefa {
  id: string
  titulo: string
  descricao: string
  xpRecompensa: number
  prazo: string | null
  turma: { nome: string; ano: string }
  _count: { entregas: number }
}

interface Turma {
  id: string
  nome: string
  ano: string
  turno: string
}

export function ProfTarefas() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([])
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)

  const reload = () => {
    api<{ tarefas: Tarefa[] }>('/api/tarefas').then((d) => {
      setTarefas(d.tarefas)
      setLoading(false)
    })
  }

  useEffect(() => {
    reload()
    api<{ turmas: Turma[] }>('/api/turmas').then((d) => setTurmas(d.turmas))
  }, [])

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-emerald-600" />
        <h2 className="text-xl font-bold">Tarefas que você criou</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="ml-auto">
              <Plus className="w-4 h-4 mr-1" /> Nova tarefa
            </Button>
          </DialogTrigger>
          <NovaTatura turmas={turmas} onCriada={() => { setOpen(false); reload() }} />
        </Dialog>
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 shimmer rounded-xl" />)}</div>
      ) : tarefas.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground">Você ainda não criou tarefas.</p>
            <p className="text-xs text-muted-foreground mt-1">Crie uma tarefa para uma turma e os alunos poderão entregá-la aqui.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {tarefas.map((t) => (
            <Card key={t.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-semibold text-sm">{t.titulo}</h3>
                    <p className="text-xs text-muted-foreground">
                      Turma {t.turma.nome} · {t.turma.ano}
                    </p>
                  </div>
                  <BadgeUI className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                    <Award className="w-3 h-3 mr-1" /> {t.xpRecompensa} XP
                  </BadgeUI>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{t.descricao}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <ClipboardCheck className="w-3 h-3" /> {t._count.entregas} entrega(s)
                  </span>
                  {t.prazo && (
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(t.prazo), { addSuffix: true, locale: ptBR })}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function NovaTatura({ turmas, onCriada }: { turmas: Turma[]; onCriada: () => void }) {
  const [form, setForm] = useState({ titulo: '', descricao: '', turmaId: '', xpRecompensa: 50, prazo: '' })
  const [enviando, setEnviando] = useState(false)

  async function criar() {
    if (!form.titulo || !form.descricao || !form.turmaId) {
      toast.error('Preencha todos os campos.')
      return
    }
    setEnviando(true)
    try {
      await api('/api/tarefas', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          xpRecompensa: Number(form.xpRecompensa) || 50,
          prazo: form.prazo || null,
        }),
      })
      toast.success('Tarefa criada!')
      onCriada()
      setForm({ titulo: '', descricao: '', turmaId: '', xpRecompensa: 50, prazo: '' })
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <DialogContent className="max-w-xl">
      <DialogHeader>
        <DialogTitle>Nova tarefa</DialogTitle>
        <CardDescription>A tarefa aparecerá para todos os alunos da turma selecionada.</CardDescription>
      </DialogHeader>
      <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
        <div>
          <Label className="text-xs">Título *</Label>
          <Input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} placeholder="Ex: Lista de exercícios - capítulo 5" />
        </div>
        <div>
          <Label className="text-xs">Descrição *</Label>
          <Textarea value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} rows={4} placeholder="O que o aluno deve fazer?" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Turma *</Label>
            <Select value={form.turmaId} onValueChange={(v) => setForm({ ...form, turmaId: v })}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {turmas.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.nome} · {t.ano} ({t.turno === 'MANHA' ? 'Manhã' : 'Tarde'})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">XP de recompensa</Label>
            <Input type="number" min={10} max={500} value={form.xpRecompensa} onChange={(e) => setForm({ ...form, xpRecompensa: Number(e.target.value) })} />
          </div>
        </div>
        <div>
          <Label className="text-xs">Prazo (opcional)</Label>
          <Input type="date" value={form.prazo} onChange={(e) => setForm({ ...form, prazo: e.target.value })} />
        </div>
        <div className="flex justify-end pt-2">
          <Button onClick={criar} disabled={enviando}>
            {enviando ? 'Criando...' : 'Criar tarefa'}
          </Button>
        </div>
      </div>
    </DialogContent>
  )
}
