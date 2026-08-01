'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
import { Badge as BadgeUI } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Rocket, Sparkles, CheckCircle2, XCircle, Clock, Code, Palette, Bug as BugIcon, Lightbulb, ClipboardList } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'

interface Inscricao {
  id: string
  area: string
  experiencia: string | null
  motivo: string
  analiseIA: string | null
  scoreIA: number | null
  status: string
  createdAt: string
  user: { id: string; name: string; turma: { nome: string; ano: string } | null; turno: string | null }
}

const AREA_INFO: Record<string, { label: string; icon: any; color: string }> = {
  PROGRAMACAO: { label: 'Programação', icon: Code, color: 'bg-emerald-100 text-emerald-800' },
  DESIGN: { label: 'Design', icon: Palette, color: 'bg-pink-100 text-pink-800' },
  TESTES: { label: 'Testes', icon: BugIcon, color: 'bg-amber-100 text-amber-800' },
  IDEIAS: { label: 'Ideias', icon: Lightbulb, color: 'bg-sky-100 text-sky-800' },
  ORGANIZACAO: { label: 'Organização', icon: ClipboardList, color: 'bg-purple-100 text-purple-800' },
}

const STATUS_INFO: Record<string, { label: string; icon: any; color: string }> = {
  PENDENTE: { label: 'Pendente', icon: Clock, color: 'bg-slate-100 text-slate-700' },
  EM_ANALISE: { label: 'Em análise', icon: Sparkles, color: 'bg-sky-100 text-sky-800' },
  ACEITO: { label: 'Aceito', icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-800' },
  RECUSADO: { label: 'Recusado', icon: XCircle, color: 'bg-red-100 text-red-800' },
  PERIODO_TESTE: { label: 'Período de teste', icon: Sparkles, color: 'bg-amber-100 text-amber-800' },
}

export function CoordInscricoes() {
  const [inscricoes, setInscricoes] = useState<Inscricao[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('PENDENTE')

  const reload = () => {
    api<{ inscricoes: Inscricao[] }>('/api/inscricoes').then((d) => {
      setInscricoes(d.inscricoes)
      setLoading(false)
    })
  }

  useEffect(() => { reload() }, [])

  const filtradas = inscricoes.filter((i) => filtro === 'TODAS' || i.status === filtro)

  async function decidir(id: string, status: string) {
    try {
      await api(`/api/inscricoes/${id}/decidir`, {
        method: 'POST',
        body: JSON.stringify({ status }),
      })
      toast.success(status === 'ACEITO' ? 'Inscrição aceita! O aluno entra em período de teste.' : 'Inscrição recusada.')
      reload()
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const counts = {
    pendentes: inscricoes.filter((i) => i.status === 'PENDENTE').length,
    aceitas: inscricoes.filter((i) => i.status === 'ACEITO' || i.status === 'PERIODO_TESTE').length,
    recusadas: inscricoes.filter((i) => i.status === 'RECUSADO').length,
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center gap-2">
        <Rocket className="w-5 h-5 text-emerald-600" />
        <h2 className="text-xl font-bold">Inscrições para equipe de desenvolvimento</h2>
      </div>

      <Card className="bg-sky-50/50 border-sky-200">
        <CardContent className="p-3 text-xs text-sky-900">
          <p className="font-semibold flex items-center gap-1 mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Como funciona
          </p>
          <p className="text-sky-800">
            A IA fez uma análise inicial de cada inscrição (resumo + score de 0-100).
            Use isso como apoio, mas a decisão final é sua. A IA não decide sozinha.
            Considere também o histórico do aluno (bugs válidos reportados, badges, participação).
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-amber-600">{counts.pendentes}</p><p className="text-[10px] text-muted-foreground">Pendentes</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-emerald-600">{counts.aceitas}</p><p className="text-[10px] text-muted-foreground">Aceitas</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-red-600">{counts.recusadas}</p><p className="text-[10px] text-muted-foreground">Recusadas</p></CardContent></Card>
      </div>

      <div className="flex gap-1 overflow-x-auto">
        {['PENDENTE', 'PERIODO_TESTE', 'ACEITO', 'RECUSADO', 'TODAS'].map((f) => (
          <Button key={f} size="sm" variant={filtro === f ? 'default' : 'outline'} onClick={() => setFiltro(f)} className="flex-shrink-0">
            {STATUS_INFO[f]?.label || 'Todas'}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-40 shimmer rounded-xl" />)}</div>
      ) : filtradas.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Rocket className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground">Nenhuma inscrição neste filtro.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtradas.map((i) => {
            const area = AREA_INFO[i.area] || AREA_INFO.PROGRAMACAO
            const st = STATUS_INFO[i.status] || STATUS_INFO.PENDENTE
            const StIcon = st.icon
            const AreaIcon = area.icon
            const pendente = i.status === 'PENDENTE'
            return (
              <Card key={i.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-semibold text-sm">{i.user.name}</p>
                        <BadgeUI variant="outline" className={`text-[10px] py-0 px-1.5 ${area.color}`}>
                          <AreaIcon className="w-3 h-3 mr-0.5" /> {area.label}
                        </BadgeUI>
                        <BadgeUI variant="outline" className={`text-[10px] py-0 px-1.5 ${st.color}`}>
                          <StIcon className="w-3 h-3 mr-0.5" /> {st.label}
                        </BadgeUI>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {i.user.turma?.ano} · {i.user.turma?.nome} ·{' '}
                        {i.user.turno === 'MANHA' ? 'Manhã' : 'Tarde'} ·{' '}
                        {formatDistanceToNow(new Date(i.createdAt), { addSuffix: true, locale: ptBR })}
                      </p>
                    </div>
                    {i.scoreIA !== null && (
                      <div className="text-center bg-sky-50 border border-sky-200 rounded-lg px-3 py-1">
                        <p className="text-[10px] text-sky-700 font-semibold">Score IA</p>
                        <p className={`text-lg font-bold ${i.scoreIA >= 70 ? 'text-emerald-600' : i.scoreIA >= 40 ? 'text-amber-600' : 'text-red-600'}`}>
                          {i.scoreIA}
                        </p>
                      </div>
                    )}
                  </div>

                  {i.experiencia && (
                    <p className="text-xs mb-1"><span className="text-muted-foreground">Experiência:</span> {i.experiencia}</p>
                  )}
                  <p className="text-xs mb-2"><span className="text-muted-foreground">Motivo:</span> {i.motivo}</p>

                  {i.analiseIA && (
                    <div className="bg-sky-50 border border-sky-200 rounded-lg p-2 mb-2">
                      <p className="text-[10px] font-semibold text-sky-900 flex items-center gap-1 mb-1">
                        <Sparkles className="w-3 h-3" /> Análise inicial da IA
                      </p>
                      <p className="text-xs text-sky-800">{i.analiseIA}</p>
                    </div>
                  )}

                  {pendente && (
                    <div className="border-t pt-3 mt-2 flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => decidir(i.id, 'PERIODO_TESTE')}>
                        <Clock className="w-3.5 h-3.5 mr-1" /> Período de teste
                      </Button>
                      <Button size="sm" className="flex-1" onClick={() => decidir(i.id, 'ACEITO')}>
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Aceitar
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => decidir(i.id, 'RECUSADO')}>
                        <XCircle className="w-3.5 h-3.5 mr-1" /> Recusar
                      </Button>
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
