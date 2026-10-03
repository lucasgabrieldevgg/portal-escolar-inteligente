'use client'

import { useEffect, useState } from 'react'
import { useApp, api } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge as BadgeUI } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Bell, BookOpen, Bot, Trophy, Flame, Award, ChevronRight,
  Megaphone, Calendar, ArrowRight,
} from 'lucide-react'
import { toast } from 'sonner'

interface Aviso {
  id: string
  titulo: string
  conteudo: string
  categoria: string
  destaque: boolean
  createdAt: string
  autor: { name: string; role: string }
}

interface Tarefa {
  id: string
  titulo: string
  descricao: string
  xpRecompensa: number
  prazo: string | null
  turma: { nome: string }
  _count: { entregas: number }
}

const CATEGORIA_STYLE: Record<string, string> = {
  GERAL: 'bg-emerald-100 text-emerald-800',
  URGENTE: 'bg-red-100 text-red-800',
  EVENTO: 'bg-amber-100 text-amber-800',
  ACADEMICO: 'bg-sky-100 text-sky-800',
}

export function StudentHome() {
  const { user, setView } = useApp()
  const [avisos, setAvisos] = useState<Aviso[]>([])
  const [tarefas, setTarefas] = useState<Tarefa[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api<{ avisos: Aviso[] }>('/api/avisos'),
      api<{ tarefas: Tarefa[] }>('/api/tarefas'),
    ]).then(([a, t]) => {
      setAvisos(a.avisos)
      setTarefas(t.tarefas)
      setLoading(false)
    })
  }, [])

  if (!user) return null

  const xpParaProximoNivel = Math.ceil((user.xp / 100) + 1) * 100
  const xpNivelAtual = Math.floor(user.xp / 100) * 100
  const progresso = ((user.xp - xpNivelAtual) / 100) * 100
  const nivel = Math.floor(user.xp / 100) + 1

  const avisosImportantes = avisos.filter((a) => a.destaque).slice(0, 2)
  const proximaTarefa = tarefas[0]

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Saudação + XP */}
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-emerald-600 to-emerald-800 text-white">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-emerald-100 text-sm">Olá,</p>
              <h2 className="text-2xl font-bold">{user.name.split(' ')[0]}! 👋</h2>
              <p className="text-emerald-100 text-sm mt-1">
                {user.turma?.ano} · Turma {user.turma?.nome} · {user.turno === 'MANHA' ? 'Manhã' : 'Tarde'}
              </p>
            </div>
            <div className="bg-white/15 backdrop-blur rounded-xl p-4 min-w-[220px]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-emerald-100">Nível {nivel}</span>
                <span className="text-xs font-bold flex items-center gap-1">
                  <Flame className="w-3 h-3" /> {user.sequenciaDias} dias · {user.moedinhas || 0} moedinhas
                </span>
              </div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-2xl font-bold">{user.xp}</span>
                <span className="text-emerald-100 text-sm">/ {xpParaProximoNivel} XP</span>
              </div>
              <Progress value={progresso} className="bg-white/20 h-2" />
              <p className="text-[10px] text-emerald-100 mt-1">
                {xpParaProximoNivel - user.xp} XP para o nível {nivel + 1}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Atalhos */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { id: 'ia', label: 'Assistente IA', icon: Bot, color: 'from-emerald-500 to-emerald-600' },
          { id: 'tarefas', label: 'Minhas Tarefas', icon: BookOpen, color: 'from-amber-500 to-amber-600' },
          { id: 'ranking', label: 'Ranking', icon: Trophy, color: 'from-rose-500 to-rose-600' },
          { id: 'badges', label: 'Badges', icon: Award, color: 'from-sky-500 to-sky-600' },
        ].map((s) => {
          const Icon = s.icon
          return (
            <button
              key={s.id}
              onClick={() => setView(s.id as any)}
              className="group relative overflow-hidden rounded-xl border bg-card p-4 hover:shadow-md transition-shadow text-left"
            >
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center mb-2`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="font-semibold text-sm">{s.label}</p>
              <ChevronRight className="w-4 h-4 absolute top-4 right-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avisos */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <Megaphone className="w-4 h-4" /> Avisos oficiais
            </h3>
            <Button variant="ghost" size="sm" onClick={() => setView('avisos')}>
              Ver todos <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-24 rounded-xl shimmer" />
              ))}
            </div>
          ) : (
            avisos.slice(0, 4).map((a) => (
              <Card key={a.id} className={a.destaque ? 'border-amber-300 bg-amber-50/30' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-semibold text-sm">{a.titulo}</h4>
                    <BadgeUI variant="outline" className={`text-[10px] py-0 px-1.5 ${CATEGORIA_STYLE[a.categoria] || ''}`}>
                      {a.categoria}
                    </BadgeUI>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{a.conteudo}</p>
                  <p className="text-[10px] text-muted-foreground mt-2">
                    {a.autor.name} · {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true, locale: ptBR })}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Próxima tarefa + ranking rápido */}
        <div className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Próxima tarefa
          </h3>
          {proximaTarefa ? (
            <Card className="border-amber-200 bg-amber-50/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <BadgeUI className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                    +{proximaTarefa.xpRecompensa} XP
                  </BadgeUI>
                  {proximaTarefa.prazo && (
                    <span className="text-[10px] text-muted-foreground">
                      {formatDistanceToNow(new Date(proximaTarefa.prazo), { addSuffix: true, locale: ptBR })}
                    </span>
                  )}
                </div>
                <h4 className="font-semibold text-sm mb-1">{proximaTarefa.titulo}</h4>
                <p className="text-xs text-muted-foreground line-clamp-3 mb-3">{proximaTarefa.descricao}</p>
                <Button size="sm" variant="outline" className="w-full" onClick={() => setView('tarefas')}>
                  Abrir tarefa
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-4 text-center text-sm text-muted-foreground">
                Nenhuma tarefa no momento.
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" /> Sua posição
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PosicaoRanking userId={user.id} turno={user.turno} turmaId={user.turmaId} />
              <Button size="sm" variant="ghost" className="w-full mt-2" onClick={() => setView('ranking')}>
                Ver ranking completo
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function PosicaoRanking({ userId, turno, turmaId }: { userId: string; turno?: string | null; turmaId?: string | null }) {
  const [info, setInfo] = useState<{ posicao: number; total: number } | null>(null)

  useEffect(() => {
    if (!turno) return
    api<{ ranking: any[]; total: number }>(`/api/ranking?tipo=turno&turno=${turno}&limite=200`).then((d) => {
      const pos = d.ranking.findIndex((r) => r.id === userId)
      if (pos >= 0) setInfo({ posicao: pos + 1, total: d.total })
    })
  }, [userId, turno, turmaId])

  if (!info) return <div className="text-sm text-muted-foreground">Carregando...</div>

  return (
    <div className="text-center">
      <p className="text-3xl font-bold text-amber-600">#{info.posicao}</p>
      <p className="text-xs text-muted-foreground">de {info.total} alunos no turno</p>
    </div>
  )
}
