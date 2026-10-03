'use client'

import { useEffect, useState } from 'react'
import { useApp, api } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge as BadgeUI } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Avatar } from '../Avatar'
import { Store, Coins, Check, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

interface Skin {
  id: string
  nome: string
  descricao: string
  tipo: string
  raridade: string
  preco: number
  config: string
  icone: string
  comprado: boolean
}

const RARIDADE_LABEL: Record<string, string> = {
  COMUM: 'Comum',
  RARA: 'Rara',
  EPICA: 'Épica',
  LENDARIA: 'Lendária',
}

const RARIDADE_RING: Record<string, string> = {
  COMUM: 'border-slate-300',
  RARA: 'border-sky-300',
  EPICA: 'border-purple-300',
  LENDARIA: 'border-amber-400',
}

const TIPO_LABEL: Record<string, string> = {
  COR: 'Cor',
  GRADIENTE: 'Gradiente',
  FRAME: 'Moldura',
  EMOJI: 'Emoji',
}

export function LojaView({ onComprou }: { onComprou?: () => void }) {
  const { user } = useApp()
  const [skins, setSkins] = useState<Skin[]>([])
  const [moedinhas, setMoedinhas] = useState(0)
  const [loading, setLoading] = useState(true)
  const [comprando, setComprando] = useState<string | null>(null)

  const reload = () => {
    api<{ skins: Skin[]; moedinhas: number }>('/api/loja/skins').then((d) => {
      setSkins(d.skins)
      setMoedinhas(d.moedinhas)
      setLoading(false)
    })
  }

  useEffect(() => { reload() }, [])

  async function comprar(s: Skin) {
    setComprando(s.id)
    try {
      const d = await api<{ moedinhas: number }>('/api/loja/comprar', {
        method: 'POST',
        body: JSON.stringify({ skinId: s.id }),
      })
      toast.success(`Skin "${s.nome}" comprada!`)
      setMoedinhas(d.moedinhas)
      reload()
      onComprou?.()
    } catch (e: any) {
      toast.error(e.message || 'Erro ao comprar')
    } finally {
      setComprando(null)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="flex items-center gap-2">
        <Store className="w-5 h-5 text-emerald-600" />
        <h2 className="text-xl font-bold">Loja de Avatares</h2>
        <BadgeUI className="ml-auto bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
          <Coins className="w-3 h-3 mr-1" /> {moedinhas}
        </BadgeUI>
      </div>

      <Card className="bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/20">
        <CardContent className="p-3 text-xs text-emerald-900 dark:text-emerald-200">
          <p className="font-semibold flex items-center gap-1 mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Como conseguir moedinhas
          </p>
          <p>
            Resumindo livros na biblioteca, ganhando XP em tarefas, reportando bugs válidos
            ou ganhando badges. Use as moedinhas para personalizar seu avatar no perfil.
          </p>
        </CardContent>
      </Card>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-40 rounded-xl shimmer" />
          ))}
        </div>
      ) : (
        <Tabs defaultValue="COR">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="COR">Cores</TabsTrigger>
            <TabsTrigger value="GRADIENTE">Gradientes</TabsTrigger>
            <TabsTrigger value="FRAME">Frames</TabsTrigger>
            <TabsTrigger value="EMOJI">Emojis</TabsTrigger>
          </TabsList>
          {['COR', 'GRADIENTE', 'FRAME', 'EMOJI'].map((tipo) => (
            <TabsContent key={tipo} value={tipo} className="mt-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {skins
                  .filter((s) => s.tipo === tipo)
                  .map((s) => (
                    <Card key={s.id} className={`border-2 ${RARIDADE_RING[s.raridade] || ''} ${s.comprado ? 'bg-emerald-50/30 dark:bg-emerald-950/10' : ''}`}>
                      <CardContent className="p-4 flex flex-col items-center text-center">
                        <Avatar config={s.config} name="A" size="lg" className="mb-2" />
                        <p className="font-semibold text-sm leading-tight">{s.nome}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{RARIDADE_LABEL[s.raridade]} · {TIPO_LABEL[s.tipo]}</p>
                        <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2 h-8">{s.descricao}</p>
                        {s.comprado ? (
                          <BadgeUI className="mt-2 bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                            <Check className="w-3 h-3 mr-1" /> Comprada
                          </BadgeUI>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-2 w-full"
                            onClick={() => comprar(s)}
                            disabled={comprando === s.id || moedinhas < s.preco}
                          >
                            <Coins className="w-3 h-3 mr-1 text-amber-500" />
                            {comprando === s.id ? '...' : s.preco === 0 ? 'Grátis' : s.preco}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  )
}
