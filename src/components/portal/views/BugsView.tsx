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
import { ScrollArea } from '@/components/ui/scroll-area'
import { Bug, Plus, AlertTriangle, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'

interface Bug {
  id: string
  local: string
  acao: string
  ocorreu: string
  esperado: string
  categoria: string
  status: string
  recompensaXP: number | null
  createdAt: string
  user?: { name: string; turma?: { nome: string } | null }
}

const CATEGORIA_INFO: Record<string, { label: string; xp: number; color: string }> = {
  CRITICO: { label: 'Crítico', xp: 150, color: 'bg-red-100 text-red-800' },
  NORMAL: { label: 'Normal', xp: 80, color: 'bg-amber-100 text-amber-800' },
  SUGESTAO: { label: 'Sugestão', xp: 30, color: 'bg-sky-100 text-sky-800' },
  INVALIDO: { label: 'Inválido', xp: 0, color: 'bg-slate-100 text-slate-600' },
}

const STATUS_INFO: Record<string, { label: string; icon: any; color: string }> = {
  ABERTO: { label: 'Aberto', icon: Clock, color: 'bg-slate-100 text-slate-700' },
  EM_ANALISE: { label: 'Em análise', icon: AlertTriangle, color: 'bg-amber-100 text-amber-800' },
  ACEITO: { label: 'Aceito', icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-800' },
  RECUSADO: { label: 'Recusado', icon: XCircle, color: 'bg-red-100 text-red-800' },
}

export function BugsView({ onXpGained }: { onXpGained?: () => void }) {
  const [bugs, setBugs] = useState<Bug[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)

  const reload = () => {
    api<{ bugs: Bug[] }>('/api/bugs').then((d) => {
      setBugs(d.bugs)
      setLoading(false)
    })
  }

  useEffect(() => { reload() }, [])

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center gap-2">
        <Bug className="w-5 h-5 text-rose-500" />
        <h2 className="text-xl font-bold">Programa Caça aos Bugs</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="ml-auto">
              <Plus className="w-4 h-4 mr-1" /> Reportar
            </Button>
          </DialogTrigger>
          <ReportarBug
            onReportado={() => {
              setOpen(false)
              reload()
              onXpGained?.()
            }}
          />
        </Dialog>
      </div>

      <Card className="bg-rose-50/50 border-rose-200">
        <CardContent className="p-3 text-xs text-rose-900">
          <p className="font-semibold mb-1">Como ganhar XP reportando bugs</p>
          <ul className="space-y-0.5 list-disc pl-4 text-rose-800">
            <li><strong>Crítico</strong>: algo que impede o uso · <strong>+150 XP</strong></li>
            <li><strong>Normal</strong>: erro que atrapalha mas tem volta · <strong>+80 XP</strong></li>
            <li><strong>Sugestão</strong>: ideia de melhoria · <strong>+30 XP</strong></li>
            <li>Relatos inválidos não dão XP (para evitar abuso do sistema)</li>
          </ul>
          <p className="mt-2 text-rose-700">A coordenação avalia cada relato. Ao aceitar, você ganha XP e a badge 🐞 Caçador de Bugs.</p>
        </CardContent>
      </Card>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl shimmer" />
          ))}
        </div>
      ) : bugs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bug className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground">Você ainda não reportou nenhum bug.</p>
            <p className="text-xs text-muted-foreground mt-1">Encontrou algo estranho? Reporte e ganhe XP!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {bugs.map((b) => {
            const cat = CATEGORIA_INFO[b.categoria] || CATEGORIA_INFO.SUGESTAO
            const st = STATUS_INFO[b.status] || STATUS_INFO.ABERTO
            const StIcon = st.icon
            return (
              <Card key={b.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{b.local}</p>
                      <p className="text-xs text-muted-foreground">
                        {b.user ? `${b.user.name}${b.user.turma ? ` · ${b.user.turma.nome}` : ''}` : ''} ·{' '}
                        {formatDistanceToNow(new Date(b.createdAt), { addSuffix: true, locale: ptBR })}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <BadgeUI variant="outline" className={`text-[10px] py-0 px-1.5 ${cat.color}`}>
                        {cat.label}
                      </BadgeUI>
                      <BadgeUI variant="outline" className={`text-[10px] py-0 px-1.5 ${st.color}`}>
                        <StIcon className="w-3 h-3 mr-0.5" /> {st.label}
                      </BadgeUI>
                    </div>
                  </div>
                  <div className="text-xs space-y-1 mt-2">
                    <p><span className="text-muted-foreground">O que fiz:</span> {b.acao}</p>
                    <p><span className="text-muted-foreground">O que aconteceu:</span> {b.ocorreu}</p>
                    <p><span className="text-muted-foreground">O que esperava:</span> {b.esperado}</p>
                  </div>
                  {b.recompensaXP !== null && b.recompensaXP > 0 && (
                    <div className="mt-2 text-xs font-semibold text-emerald-700">
                      +{b.recompensaXP} XP concedido
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ReportarBug({ onReportado }: { onReportado: () => void }) {
  const [form, setForm] = useState({
    local: '', acao: '', ocorreu: '', esperado: '', categoria: 'SUGESTAO',
  })
  const [enviando, setEnviando] = useState(false)

  async function enviar() {
    if (!form.local || !form.acao || !form.ocorreu || !form.esperado) {
      toast.error('Preencha todos os campos.')
      return
    }
    setEnviando(true)
    try {
      await api('/api/bugs', {
        method: 'POST',
        body: JSON.stringify(form),
      })
      toast.success('Bug reportado! A coordenação vai avaliar.')
      onReportado()
      setForm({ local: '', acao: '', ocorreu: '', esperado: '', categoria: 'SUGESTAO' })
    } catch (e: any) {
      toast.error(e.message || 'Erro ao reportar')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <DialogContent className="max-w-xl">
      <DialogHeader>
        <DialogTitle>Reportar um problema</DialogTitle>
        <CardDescription>
          Quanto mais detalhes você der, mais fácil é resolver e maior a chance de receber XP.
        </CardDescription>
      </DialogHeader>
      <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
        <div>
          <Label htmlFor="local" className="text-xs">Onde você encontrou o erro? *</Label>
          <Input
            id="local"
            placeholder="Ex: Tela de ranking, ao clicar em 'Ver perfil'"
            value={form.local}
            onChange={(e) => setForm({ ...form, local: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="acao" className="text-xs">O que você estava fazendo? *</Label>
          <Textarea
            id="acao"
            placeholder="Ex: Cliquei no botão de entregar tarefa"
            value={form.acao}
            onChange={(e) => setForm({ ...form, acao: e.target.value })}
            rows={2}
          />
        </div>
        <div>
          <Label htmlFor="ocorreu" className="text-xs">O que aconteceu? *</Label>
          <Textarea
            id="ocorreu"
            placeholder="Ex: O botão ficou carregando e nunca terminou"
            value={form.ocorreu}
            onChange={(e) => setForm({ ...form, ocorreu: e.target.value })}
            rows={3}
          />
        </div>
        <div>
          <Label htmlFor="esperado" className="text-xs">O que deveria ter acontecido? *</Label>
          <Textarea
            id="esperado"
            placeholder="Ex: Deveria mostrar uma mensagem de sucesso e fechar"
            value={form.esperado}
            onChange={(e) => setForm({ ...form, esperado: e.target.value })}
            rows={2}
          />
        </div>
        <div>
          <Label className="text-xs">Categoria</Label>
          <Select value={form.categoria} onValueChange={(v) => setForm({ ...form, categoria: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CRITICO">Crítico (impede o uso) · +150 XP</SelectItem>
              <SelectItem value="NORMAL">Normal (atrapalha mas tem volta) · +80 XP</SelectItem>
              <SelectItem value="SUGESTAO">Sugestão de melhoria · +30 XP</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button onClick={enviar} disabled={enviando}>
            {enviando ? 'Enviando...' : 'Enviar relato'}
          </Button>
        </div>
      </div>
    </DialogContent>
  )
}
