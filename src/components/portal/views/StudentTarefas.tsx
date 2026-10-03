'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge as BadgeUI } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { BookOpen, Clock, Award, Send, CheckCircle2, AlertCircle, X } from 'lucide-react'
import { toast } from 'sonner'

interface Tarefa {
  id: string
  titulo: string
  descricao: string
  xpRecompensa: number
  prazo: string | null
  turma: { nome: string }
  professor: { name: string }
  _count: { entregas: number }
}

export function StudentTarefas() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api<{ tarefas: Tarefa[] }>('/api/tarefas').then((d) => {
      setTarefas(d.tarefas)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 rounded-xl shimmer" />
        ))}
      </div>
    )
  }

  if (tarefas.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground">Nenhuma tarefa disponível para sua turma.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-emerald-600" />
        <h2 className="text-xl font-bold">Minhas tarefas</h2>
        <BadgeUI variant="outline" className="ml-auto">{tarefas.length} no total</BadgeUI>
      </div>

      <div className="space-y-3">
        {tarefas.map((t) => (
          <TarefaCard key={t.id} tarefa={t} onEntregue={() => {
            api<{ tarefas: Tarefa[] }>('/api/tarefas').then((d) => setTarefas(d.tarefas))
          }} />
        ))}
      </div>
    </div>
  )
}

function TarefaCard({ tarefa, onEntregue }: { tarefa: Tarefa; onEntregue: () => void }) {
  const [open, setOpen] = useState(false)
  const [conteudo, setConteudo] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function entregar() {
    if (conteudo.trim().length < 10) {
      toast.error('Escreva pelo menos 10 caracteres na sua entrega.')
      return
    }
    setEnviando(true)
    try {
      await api(`/api/tarefas/${tarefa.id}/entregar`, {
        method: 'POST',
        body: JSON.stringify({ conteudo }),
      })
      toast.success('Tarefa entregue! Aguarde correção do professor.')
      setOpen(false)
      setConteudo('')
      onEntregue()
    } catch (e: any) {
      toast.error(e.message || 'Erro ao entregar')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-base">{tarefa.titulo}</CardTitle>
            <CardDescription className="text-xs mt-1">
              Por {tarefa.professor.name} · Turma {tarefa.turma.nome}
            </CardDescription>
          </div>
          <BadgeUI className="bg-amber-100 text-amber-800 hover:bg-amber-100">
            <Award className="w-3 h-3 mr-1" /> {tarefa.xpRecompensa} XP
          </BadgeUI>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-3 whitespace-pre-line">{tarefa.descricao}</p>
        <div className="flex items-center justify-between text-xs">
          {tarefa.prazo ? (
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <Clock className="w-3 h-3" />
              Prazo: {formatDistanceToNow(new Date(tarefa.prazo), { addSuffix: true, locale: ptBR })}
            </span>
          ) : (
            <span />
          )}
          <span className="text-muted-foreground">{tarefa._count.entregas} entrega(s)</span>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full mt-3" size="sm">
              <Send className="w-4 h-4 mr-2" /> Entregar tarefa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{tarefa.titulo}</DialogTitle>
              <CardDescription>
                {tarefa.descricao}
              </CardDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold mb-1">Lembrete anti-fraude</p>
                  <p>Escreva com suas próprias palavras. O uso de IA para gerar a resposta inteira pode ser detectado e invalida o XP. Use o assistente de IA para <strong>entender</strong>, não para <strong>copiar</strong>.</p>
                </div>
              </div>
              <Textarea
                placeholder="Escreva sua entrega aqui..."
                value={conteudo}
                onChange={(e) => setConteudo(e.target.value)}
                rows={8}
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">{conteudo.length} caracteres</span>
                <Button onClick={entregar} disabled={enviando}>
                  {enviando ? 'Enviando...' : 'Entregar'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
