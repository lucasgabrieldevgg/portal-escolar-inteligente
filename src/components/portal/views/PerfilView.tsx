'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge as BadgeUI } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar } from '../Avatar'
import { AvatarEditor } from '../AvatarEditor'
import { Award, Flame, Trophy, Calendar, Sparkles, Coins } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Perfil {
  id: string
  name: string
  role: string
  turno: string | null
  turma: { nome: string; ano: string } | null
  avatarConfig?: string | null
  xp: number
  xpTotal: number
  moedinhas?: number
  sequenciaDias: number
  createdAt: string
  userBadges: { badge: Badge }[]
}

interface Badge {
  id: string
  nome: string
  descricao: string
  icone: string
  raridade: string
  tipo: string
  daXP: boolean
  xpRecompensa?: number
  apenasAdmin?: boolean
  automatica?: boolean
}

const RARIDADE_STYLE: Record<string, string> = {
  COMUM: 'from-slate-200 to-slate-300 text-slate-800',
  RARA: 'from-sky-200 to-sky-300 text-sky-900',
  EPICA: 'from-purple-200 to-purple-300 text-purple-900',
  LENDARIA: 'from-amber-300 to-amber-500 text-amber-950',
  ESPECIAL: 'from-emerald-300 to-emerald-500 text-emerald-950',
}

const RARIDADE_LABEL: Record<string, string> = {
  COMUM: 'Comum',
  RARA: 'Rara',
  EPICA: 'Épica',
  LENDARIA: 'Lendária',
  ESPECIAL: 'Especial',
}

export function PerfilView({ userId, editAvatar }: { userId: string; editAvatar?: boolean }) {
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [loading, setLoading] = useState(true)
  const [editandoExtra, setEditandoExtra] = useState(false)
  // modoEdicao é derivado: começa em edição se editAvatar=true, ou se o usuário clicou em "editar"
  const modoEdicao = editAvatar || editandoExtra

  const reload = () => {
    api<{ user: Perfil }>(`/api/perfil/${userId}`).then((d) => {
      setPerfil(d.user)
      setLoading(false)
    })
  }

  useEffect(() => {
    reload()
  }, [userId])

  if (loading || !perfil) {
    return <div className="h-64 shimmer rounded-xl" />
  }

  const nivel = Math.floor(perfil.xp / 100) + 1
  const xpNivelAtual = Math.floor(perfil.xp / 100) * 100
  const progresso = ((perfil.xp - xpNivelAtual) / 100) * 100

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Card de identidade */}
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-emerald-600 to-emerald-800 text-white">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Avatar config={perfil.avatarConfig} name={perfil.name} size="xl" className="ring-4 ring-white/30" />
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{perfil.name}</h2>
              <p className="text-emerald-100 text-sm">
                {perfil.turma?.ano} · Turma {perfil.turma?.nome}
                {perfil.turno && ` · ${perfil.turno === 'MANHA' ? 'Manhã' : 'Tarde'}`}
              </p>
              <p className="text-emerald-200/80 text-xs mt-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> No portal desde {format(new Date(perfil.createdAt), "MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
            <div className="bg-white/15 backdrop-blur rounded-xl p-3 text-center min-w-[120px]">
              <p className="text-[10px] text-emerald-100 uppercase tracking-wide">Nível</p>
              <p className="text-3xl font-bold">{nivel}</p>
              <Progress value={progresso} className="bg-white/20 h-1.5 mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <Sparkles className="w-5 h-5 text-amber-500 mx-auto mb-1" />
            <p className="text-xl font-bold">{perfil.xp}</p>
            <p className="text-[10px] text-muted-foreground">XP da temporada</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Trophy className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
            <p className="text-xl font-bold">{perfil.xpTotal}</p>
            <p className="text-[10px] text-muted-foreground">XP total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
            <p className="text-xl font-bold">{perfil.sequenciaDias}</p>
            <p className="text-[10px] text-muted-foreground">Dias seguidos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Award className="w-5 h-5 text-purple-500 mx-auto mb-1" />
            <p className="text-xl font-bold">{perfil.userBadges.length}</p>
            <p className="text-[10px] text-muted-foreground">Badges</p>
          </CardContent>
        </Card>
      </div>

      {perfil.role === 'ALUNO' && (
        <Card>
          <CardContent className="p-3 flex items-center gap-3">
            <Coins className="w-5 h-5 text-emerald-600" />
            <div className="flex-1">
              <p className="text-sm font-semibold">{perfil.moedinhas || 0} moedinhas</p>
              <p className="text-xs text-muted-foreground">Use na loja para personalizar seu avatar.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Editor de avatar (somente para o próprio usuário) */}
      {modoEdicao && (
        <AvatarEditor
          avatarConfig={perfil.avatarConfig}
          onSaved={reload}
        />
      )}

      {/* Conquistas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Award className="w-4 h-4 text-purple-500" /> Conquistas
          </CardTitle>
          <CardDescription>Badges que este aluno já desbloqueou</CardDescription>
        </CardHeader>
        <CardContent>
          {perfil.userBadges.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Ainda sem badges. Participe de tarefas, leia livros e contribua para o portal!
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {perfil.userBadges.map((ub) => {
                const b = ub.badge
                const r = RARIDADE_STYLE[b.raridade] || RARIDADE_STYLE.COMUM
                return (
                  <div
                    key={b.id}
                    className={`bg-gradient-to-br ${r} rounded-xl p-3 flex flex-col items-center text-center`}
                  >
                    <span className="text-3xl mb-1">{b.icone}</span>
                    <p className="font-semibold text-xs">{b.nome}</p>
                    <p className="text-[10px] opacity-80 mt-0.5">{RARIDADE_LABEL[b.raridade]}</p>
                    {b.apenasAdmin && (
                      <span className="text-[9px] mt-1 px-1.5 py-0.5 rounded-full bg-black/10">concedida pela coordenação</span>
                    )}
                    {b.automatica && !b.apenasAdmin && (
                      <span className="text-[9px] mt-1 px-1.5 py-0.5 rounded-full bg-black/10">automática</span>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
