'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
import { Badge as BadgeUI } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ShieldAlert, CheckCircle2, XCircle, Sparkles } from 'lucide-react'
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
  user: { name: string; turma?: { nome: string } | null }
}

const CAT_INFO: Record<string, { label: string; xp: number; color: string }> = {
  CRITICO: { label: 'Crítico', xp: 150, color: 'bg-red-100 text-red-800' },
  NORMAL: { label: 'Normal', xp: 80, color: 'bg-amber-100 text-amber-800' },
  SUGESTAO: { label: 'Sugestão', xp: 30, color: 'bg-sky-100 text-sky-800' },
  INVALIDO: { label: 'Inválido', xp: 0, color: 'bg-slate-100 text-slate-600' },
}

export function CoordBugs({ onAvaliado }: { onAvaliado?: () => void }) {
  const [bugs, setBugs] = useState<Bug[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('ABERTO')

  const reload = () => {
    api<{ bugs: Bug[] }>('/api/bugs').then((d) => {
      setBugs(d.bugs)
      setLoading(false)
    })
  }

  useEffect(() => { reload() }, [])

  const filtrados = bugs.filter((b) => filtro === 'TODOS' || b.status === filtro || (filtro === 'ABERTO' && b.status === 'EM_ANALISE'))

  async function avaliar(bug: Bug, categoria: string, status: string) {
    try {
      await api(`/api/bugs/${bug.id}/avaliar`, {
        method: 'POST',
        body: JSON.stringify({ categoria, status }),
      })
      const cat = CAT_INFO[categoria]
      if (status === 'ACEITO' && cat.xp > 0) {
        toast.success(`Bug aceito! ${bug.user.name.split(' ')[0]} ganhou +${cat.xp} XP.`)
      } else {
        toast.success(`Bug marcado como ${status.toLowerCase()}.`)
      }
      reload()
      onAvaliado?.()
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const counts = {
    abertos: bugs.filter((b) => b.status === 'ABERTO' || b.status === 'EM_ANALISE').length,
    aceitos: bugs.filter((b) => b.status === 'ACEITO').length,
    recusados: bugs.filter((b) => b.status === 'RECUSADO').length,
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center gap-2">
        <ShieldAlert className="w-5 h-5 text-rose-600" />
        <h2 className="text-xl font-bold">Bugs reportados pelos alunos</h2>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-amber-600">{counts.abertos}</p><p className="text-[10px] text-muted-foreground">Aguardando</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-emerald-600">{counts.aceitos}</p><p className="text-[10px] text-muted-foreground">Aceitos</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold text-red-600">{counts.recusados}</p><p className="text-[10px] text-muted-foreground">Recusados</p></CardContent></Card>
      </div>

      <div className="flex gap-1 overflow-x-auto">
        {['ABERTO', 'ACEITO', 'RECUSADO', 'TODOS'].map((f) => (
          <Button key={f} size="sm" variant={filtro === f ? 'default' : 'outline'} onClick={() => setFiltro(f)} className="flex-shrink-0">
            {f === 'ABERTO' ? 'Aguardando' : f === 'ACEITO' ? 'Aceitos' : f === 'RECUSADO' ? 'Recusados' : 'Todos'}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-32 shimmer rounded-xl" />)}</div>
      ) : filtrados.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ShieldAlert className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground">Nenhum bug neste filtro.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtrados.map((b) => {
            const cat = CAT_INFO[b.categoria] || CAT_INFO.SUGESTAO
            const jaAvaliado = b.status === 'ACEITO' || b.status === 'RECUSADO'
            return (
              <Card key={b.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="font-semibold text-sm">{b.local}</p>
                      <p className="text-xs text-muted-foreground">
                        {b.user.name} · {b.user.turma?.nome || 'Sem turma'} ·{' '}
                        {formatDistanceToNow(new Date(b.createdAt), { addSuffix: true, locale: ptBR })}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <BadgeUI variant="outline" className={`text-[10px] py-0 px-1.5 ${cat.color}`}>{cat.label}</BadgeUI>
                      <BadgeUI variant="outline" className={`text-[10px] py-0 px-1.5 ${b.status === 'ACEITO' ? 'bg-emerald-100 text-emerald-800' : b.status === 'RECUSADO' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                        {b.status === 'ACEITO' ? 'Aceito' : b.status === 'RECUSADO' ? 'Recusado' : 'Aguardando'}
                      </BadgeUI>
                    </div>
                  </div>
                  <div className="text-xs space-y-1 mb-2">
                    <p><span className="text-muted-foreground">O que fez:</span> {b.acao}</p>
                    <p><span className="text-muted-foreground">O que ocorreu:</span> {b.ocorreu}</p>
                    <p><span className="text-muted-foreground">O que esperava:</span> {b.esperado}</p>
                  </div>
                  {b.recompensaXP !== null && b.recompensaXP > 0 && (
                    <p className="text-xs font-semibold text-emerald-700 mb-2">+{b.recompensaXP} XP concedido</p>
                  )}
                  {!jaAvaliado && (
                    <div className="border-t pt-3 mt-2 space-y-2">
                      <p className="text-xs font-semibold">Avaliar este relato:</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <Button size="sm" variant="outline" onClick={() => avaliar(b, 'CRITICO', 'ACEITO')}>
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Crítico +150
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => avaliar(b, 'NORMAL', 'ACEITO')}>
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Normal +80
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => avaliar(b, 'SUGESTAO', 'ACEITO')}>
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Sugestão +30
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => avaliar(b, 'INVALIDO', 'RECUSADO')}>
                          <XCircle className="w-3.5 h-3.5 mr-1" /> Recusar
                        </Button>
                      </div>
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
