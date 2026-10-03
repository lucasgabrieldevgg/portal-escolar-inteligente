'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge as BadgeUI } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ClipboardCheck, CheckCircle2, XCircle, Award, Clock, AlertCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'

interface Entrega {
  id: string
  conteudo: string
  status: string
  xpConcedido: number | null
  feedback: string | null
  createdAt: string
  corrigidoEm: string | null
  aluno: { id: string; name: string; turma: { nome: string } | null }
  tarefa: { titulo: string; xpRecompensa: number }
  corretor: { name: string } | null
}

export function ProfCorrigir({ onXpGained }: { onXpGained?: () => void }) {
  const [entregas, setEntregas] = useState<Entrega[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('PENDENTE')

  const reload = () => {
    api<{ entregas: Entrega[] }>('/api/entregas').then((d) => {
      setEntregas(d.entregas)
      setLoading(false)
    })
  }

  useEffect(() => { reload() }, [])

  const filtradas = entregas.filter((e) => filtro === 'TODAS' || e.status === filtro)

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center gap-2">
        <ClipboardCheck className="w-5 h-5 text-emerald-600" />
        <h2 className="text-xl font-bold">Corrigir entregas</h2>
      </div>

      <div className="flex gap-1 overflow-x-auto">
        {[
          { id: 'PENDENTE', label: 'Pendentes', icon: Clock },
          { id: 'CORRIGIDA', label: 'Corrigidas', icon: CheckCircle2 },
          { id: 'RECUSADA', label: 'Recusadas', icon: XCircle },
          { id: 'TODAS', label: 'Todas', icon: ClipboardCheck },
        ].map((f) => {
          const Icon = f.icon
          const count = f.id === 'TODAS' ? entregas.length : entregas.filter((e) => e.status === f.id).length
          return (
            <Button
              key={f.id}
              size="sm"
              variant={filtro === f.id ? 'default' : 'outline'}
              onClick={() => setFiltro(f.id)}
              className="flex-shrink-0"
            >
              <Icon className="w-3.5 h-3.5 mr-1" /> {f.label} ({count})
            </Button>
          )
        })}
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 shimmer rounded-xl" />)}</div>
      ) : filtradas.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ClipboardCheck className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground">Nenhuma entrega neste filtro.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtradas.map((e) => (
            <Card key={e.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="font-semibold text-sm">{e.tarefa.titulo}</p>
                    <p className="text-xs text-muted-foreground">
                      {e.aluno.name} · Turma {e.aluno.turma?.nome || '—'} ·{' '}
                      {formatDistanceToNow(new Date(e.createdAt), { addSuffix: true, locale: ptBR })}
                    </p>
                  </div>
                  <BadgeUI
                    variant="outline"
                    className={
                      e.status === 'CORRIGIDA' ? 'bg-emerald-100 text-emerald-800' :
                      e.status === 'RECUSADA' ? 'bg-red-100 text-red-800' :
                      'bg-amber-100 text-amber-800'
                    }
                  >
                    {e.status === 'CORRIGIDA' ? 'Corrigida' : e.status === 'RECUSADA' ? 'Recusada' : 'Pendente'}
                  </BadgeUI>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-sm mb-3 max-h-32 overflow-y-auto">
                  {e.conteudo}
                </div>
                {e.feedback && (
                  <p className="text-xs text-muted-foreground mb-2">
                    <strong>Seu feedback:</strong> {e.feedback}
                  </p>
                )}
                {e.xpConcedido !== null && e.xpConcedido > 0 && (
                  <p className="text-xs font-semibold text-emerald-700 mb-2">
                    +{e.xpConcedido} XP concedido a {e.aluno.name.split(' ')[0]}
                  </p>
                )}
                {e.status === 'PENDENTE' && (
                  <CorrigirForm entrega={e} onCorrigido={() => { reload(); onXpGained?.() }} />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function CorrigirForm({ entrega, onCorrigido }: { entrega: Entrega; onCorrigido: () => void }) {
  const [feedback, setFeedback] = useState('')
  const [xp, setXp] = useState(entrega.tarefa.xpRecompensa)
  const [enviando, setEnviando] = useState(false)

  async function corrigir(status: 'CORRIGIDA' | 'RECUSADA') {
    setEnviando(true)
    try {
      await api(`/api/entregas/${entrega.id}/corrigir`, {
        method: 'POST',
        body: JSON.stringify({
          status,
          feedback: feedback || null,
          xpConcedido: status === 'CORRIGIDA' ? Number(xp) : 0,
        }),
      })
      toast.success(status === 'CORRIGIDA' ? `Entrega aceita! +${xp} XP para ${entrega.aluno.name.split(' ')[0]}` : 'Entrega recusada.')
      onCorrigido()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="border-t pt-3 mt-2 space-y-2">
      <div>
        <Label className="text-xs">Feedback para o aluno (opcional)</Label>
        <Textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={2}
          placeholder="Ex: Bom trabalho! Melhore a conclusão."
        />
      </div>
      <div className="flex items-end gap-2">
        <div>
          <Label className="text-xs">XP a conceder</Label>
          <input
            type="number"
            value={xp}
            onChange={(e) => setXp(Number(e.target.value))}
            min={0}
            max={500}
            className="w-24 h-9 px-2 rounded-md border bg-background text-sm"
          />
        </div>
        <div className="flex-1" />
        <Button variant="outline" size="sm" onClick={() => corrigir('RECUSADA')} disabled={enviando}>
          <XCircle className="w-4 h-4 mr-1" /> Recusar
        </Button>
        <Button size="sm" onClick={() => corrigir('CORRIGIDA')} disabled={enviando}>
          <CheckCircle2 className="w-4 h-4 mr-1" /> Aceitar e dar XP
        </Button>
      </div>
    </div>
  )
}
