'use client'

import { useEffect, useState } from 'react'
import { useApp, api } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
import { Badge as BadgeUI } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Trophy, Medal, Crown, TrendingUp, User as UserIcon } from 'lucide-react'
import { Avatar } from '../Avatar'

interface RankItem {
  posicao: number
  id: string
  name: string
  xp: number
  xpTotal: number
  turno: string | null
  turma: { nome: string; ano: string } | null
  avatarConfig?: string | null
  isMe: boolean
}

export function RankingView() {
  const { user, setView } = useApp()
  const [tipo, setTipo] = useState('global')
  const [ranking, setRanking] = useState<RankItem[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    if (!user) return
    const params = new URLSearchParams({ tipo, limite: '100' })
    if (tipo === 'turno' && user.turno) params.set('turno', user.turno)
    if (tipo === 'turma' && user.turmaId) params.set('turmaId', user.turmaId)
    let cancelado = false
    api<{ ranking: RankItem[]; total: number }>(`/api/ranking?${params}`).then((d) => {
      if (cancelado) return
      setRanking(d.ranking)
      setTotal(d.total)
      setLoading(false)
    }).catch(() => setLoading(false))
    return () => { cancelado = true }
  }, [tipo, user])

  const medalha = (pos: number) => {
    if (pos === 1) return <Crown className="w-4 h-4 text-amber-500" />
    if (pos === 2) return <Medal className="w-4 h-4 text-slate-400" />
    if (pos === 3) return <Medal className="w-4 h-4 text-amber-700" />
    return <span className="text-xs text-muted-foreground w-4 text-center">{pos}</span>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center gap-2">
        <Trophy className="w-5 h-5 text-amber-500" />
        <h2 className="text-xl font-bold">Ranking</h2>
        <BadgeUI variant="outline" className="ml-auto">{total} alunos</BadgeUI>
      </div>

      <Card className="bg-amber-50/50 border-amber-200 dark:bg-amber-950/20">
        <CardContent className="p-3 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
          <TrendingUp className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Temporada semanal</p>
            <p>O ranking reseta toda segunda-feira. Seu XP total (histórico) fica registrado no seu perfil e nunca é perdido.</p>
          </div>
        </CardContent>
      </Card>

      <Tabs value={tipo} onValueChange={setTipo}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="global">Global</TabsTrigger>
          <TabsTrigger value="manha">Manhã</TabsTrigger>
          <TabsTrigger value="tarde">Tarde</TabsTrigger>
          <TabsTrigger value="turma">Minha turma</TabsTrigger>
        </TabsList>

        <TabsContent value={tipo} className="mt-4">
          <Card>
            <ScrollArea className="h-[60vh]">
              <div className="divide-y">
                {loading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="p-3 flex items-center gap-3">
                      <div className="w-8 h-8 bg-muted rounded shimmer" />
                      <div className="w-10 h-10 bg-muted rounded-full shimmer" />
                      <div className="flex-1 space-y-1">
                        <div className="h-3 bg-muted rounded w-1/3 shimmer" />
                        <div className="h-2 bg-muted rounded w-1/4 shimmer" />
                      </div>
                      <div className="h-4 bg-muted rounded w-12 shimmer" />
                    </div>
                  ))
                ) : ranking.length === 0 ? (
                  <div className="py-12 text-center text-sm text-muted-foreground">
                    Nenhum aluno neste ranking.
                  </div>
                ) : (
                  ranking.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setView('perfil')}
                      className={`w-full p-3 flex items-center gap-3 hover:bg-accent/50 transition-colors text-left ${r.isMe ? 'bg-emerald-50 dark:bg-emerald-950/20' : ''}`}
                    >
                      <div className="w-8 flex justify-center">{medalha(r.posicao)}</div>
                      <Avatar config={r.avatarConfig} name={r.name} size="md" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm truncate">
                            {r.name}
                          </p>
                          {r.isMe && (
                            <BadgeUI variant="outline" className="text-[10px] py-0 px-1.5 bg-emerald-100 text-emerald-800">
                              <UserIcon className="w-2.5 h-2.5 mr-0.5" /> você
                            </BadgeUI>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {r.turma?.ano} · {r.turma?.nome}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm text-amber-700 dark:text-amber-500">{r.xp} XP</p>
                        <p className="text-[10px] text-muted-foreground">{r.xpTotal} total</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
