'use client'

import { useEffect, useState } from 'react'
import { useApp, api } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge as BadgeUI } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Award, Sparkles } from 'lucide-react'

interface Badge {
  id: string
  nome: string
  descricao: string
  icone: string
  raridade: string
  tipo: string
  daXP: boolean
}

const RARIDADE_STYLE: Record<string, string> = {
  COMUM: 'from-slate-100 to-slate-200 text-slate-800 border-slate-300',
  RARA: 'from-sky-100 to-sky-200 text-sky-900 border-sky-300',
  EPICA: 'from-purple-100 to-purple-200 text-purple-900 border-purple-300',
  LENDARIA: 'from-amber-100 to-amber-300 text-amber-950 border-amber-400',
  ESPECIAL: 'from-emerald-100 to-emerald-300 text-emerald-950 border-emerald-400',
}

const RARIDADE_LABEL: Record<string, string> = {
  COMUM: 'Comum',
  RARA: 'Rara',
  EPICA: 'Épica',
  LENDARIA: 'Lendária',
  ESPECIAL: 'Especial',
}

const TIPO_LABEL: Record<string, string> = {
  ACADEMICA: 'Acadêmica',
  CONTRIBUICAO: 'Contribuição',
  ESPECIAL: 'Especial',
}

export function BadgesView() {
  const { user } = useApp()
  const [badges, setBadges] = useState<Badge[]>([])
  const [minhas, setMinhas] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api<{ badges: Badge[] }>('/api/badges'),
      api<{ badges: Badge[] }>('/api/me'),
    ]).then(([b, m]) => {
      setBadges(b.badges)
      setMinhas((m.badges || []).map((bg) => bg.id))
      setLoading(false)
    })
  }, [])

  const tem = (id: string) => minhas.includes(id)

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="flex items-center gap-2">
        <Award className="w-5 h-5 text-purple-500" />
        <h2 className="text-xl font-bold">Galeria de Badges</h2>
        <BadgeUI variant="outline" className="ml-auto">
          {minhas.length} / {badges.length} desbloqueadas
        </BadgeUI>
      </div>

      <Card className="bg-emerald-50/50 border-emerald-200">
        <CardContent className="p-3 text-xs text-emerald-900">
          <p className="font-semibold flex items-center gap-1 mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Como funcionam as badges
          </p>
          <p className="text-emerald-800">
            Badges <strong>Acadêmicas</strong> e de <strong>Contribuição</strong> dão XP e contam no perfil.
            Badges <strong>Especiais</strong> (como Fundador do Portal) são reconhecimento puro — não dão XP nem entram no ranking, pois representam contribuição, não desempenho.
          </p>
        </CardContent>
      </Card>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-32 rounded-xl shimmer" />
          ))}
        </div>
      ) : (
        <Tabs defaultValue="ACADEMICA">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ACADEMICA">Acadêmicas</TabsTrigger>
            <TabsTrigger value="CONTRIBUICAO">Contribuição</TabsTrigger>
            <TabsTrigger value="ESPECIAL">Especiais</TabsTrigger>
          </TabsList>

          {['ACADEMICA', 'CONTRIBUICAO', 'ESPECIAL'].map((tipo) => (
            <TabsContent key={tipo} value={tipo} className="mt-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {badges
                  .filter((b) => b.tipo === tipo)
                  .map((b) => {
                    const desbloqueada = tem(b.id)
                    const r = RARIDADE_STYLE[b.raridade] || RARIDADE_STYLE.COMUM
                    return (
                      <Card
                        key={b.id}
                        className={`bg-gradient-to-br ${r} border-2 ${desbloqueada ? '' : 'opacity-40 grayscale'}`}
                      >
                        <CardContent className="p-4 text-center">
                          <div className="text-4xl mb-2">{b.icone}</div>
                          <p className="font-semibold text-sm leading-tight">{b.nome}</p>
                          <p className="text-[10px] opacity-80 mt-1">{RARIDADE_LABEL[b.raridade]}</p>
                          {!b.daXP && (
                            <p className="text-[10px] mt-1 italic opacity-70">Não dá XP</p>
                          )}
                          {desbloqueada && (
                            <BadgeUI className="mt-2 bg-white/40 text-foreground hover:bg-white/40 text-[10px]">
                              Desbloqueada
                            </BadgeUI>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  )
}
