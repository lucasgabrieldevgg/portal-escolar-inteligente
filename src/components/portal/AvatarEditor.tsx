'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Avatar, parseAvatarConfig, type AvatarConfig } from './Avatar'
import { api } from '@/lib/store'
import { toast } from 'sonner'
import { Coins, Check } from 'lucide-react'

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
  LENDARIA: 'border-amber-300',
}

export function AvatarEditor({ avatarConfig, onSaved }: { avatarConfig?: string | null; onSaved?: () => void }) {
  const [skins, setSkins] = useState<Skin[]>([])
  const [moedinhas, setMoedinhas] = useState(0)
  const [loading, setLoading] = useState(true)
  const [config, setConfig] = useState<AvatarConfig>(parseAvatarConfig(avatarConfig))
  const [salvando, setSalvando] = useState(false)
  const [comprando, setComprando] = useState<string | null>(null)

  const reload = () => {
    api<{ skins: Skin[]; moedinhas: number }>('/api/loja/skins').then((d) => {
      setSkins(d.skins)
      setMoedinhas(d.moedinhas)
      setLoading(false)
    })
  }

  useEffect(() => {
    reload()
  }, [])

  useEffect(() => {
    setConfig(parseAvatarConfig(avatarConfig))
  }, [avatarConfig])

  function aplicarSkin(s: Skin) {
    const skinCfg = parseAvatarConfig(s.config)
    // Mescla conforme tipo
    if (s.tipo === 'COR') {
      setConfig({ ...config, cor: skinCfg.cor, gradiente: undefined })
    } else if (s.tipo === 'GRADIENTE') {
      setConfig({ ...config, gradiente: skinCfg.gradiente, cor: undefined })
    } else if (s.tipo === 'FRAME') {
      setConfig({ ...config, frame: skinCfg.frame })
    } else if (s.tipo === 'EMOJI') {
      setConfig({ ...config, emoji: skinCfg.emoji })
    }
  }

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
    } catch (e: any) {
      toast.error(e.message || 'Erro ao comprar')
    } finally {
      setComprando(null)
    }
  }

  async function salvar() {
    setSalvando(true)
    try {
      const configStr = JSON.stringify(config)
      await api('/api/avatar', { method: 'POST', body: JSON.stringify({ avatarConfig: configStr }) })
      toast.success('Avatar salvo!')
      onSaved?.()
    } catch (e: any) {
      toast.error(e.message || 'Erro ao salvar')
    } finally {
      setSalvando(false)
    }
  }

  function limparEmoji() {
    setConfig({ ...config, emoji: undefined })
  }

  const previewConfig = JSON.stringify(config)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Editor de Avatar</CardTitle>
        <CardDescription>Personalize seu avatar usando skins da loja.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Preview */}
        <div className="flex items-center gap-4">
          <Avatar config={previewConfig} name="?" size="xl" />
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Pré-visualização</p>
            <p className="text-xs text-muted-foreground mt-1">
              {config.emoji ? `Emoji: ${config.emoji}` : 'Sem emoji especial'}
              {config.frame ? ` · Frame: ${config.frame}` : ''}
            </p>
            {config.emoji && (
              <Button variant="ghost" size="sm" className="mt-1 h-7 text-xs" onClick={limparEmoji}>
                Remover emoji
              </Button>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
              <Coins className="w-3 h-3 text-amber-500" /> {moedinhas}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="h-40 shimmer rounded-xl" />
        ) : (
          <Tabs defaultValue="COR">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="COR">Cores</TabsTrigger>
              <TabsTrigger value="GRADIENTE">Gradientes</TabsTrigger>
              <TabsTrigger value="FRAME">Frames</TabsTrigger>
              <TabsTrigger value="EMOJI">Emojis</TabsTrigger>
            </TabsList>
            {['COR', 'GRADIENTE', 'FRAME', 'EMOJI'].map((tipo) => (
              <TabsContent key={tipo} value={tipo} className="mt-3">
                <ScrollArea className="h-64 pr-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {skins
                      .filter((s) => s.tipo === tipo)
                      .map((s) => {
                        const aplicado =
                          (tipo === 'COR' && config.cor === parseAvatarConfig(s.config).cor) ||
                          (tipo === 'GRADIENTE' && config.gradiente === parseAvatarConfig(s.config).gradiente) ||
                          (tipo === 'FRAME' && config.frame === parseAvatarConfig(s.config).frame) ||
                          (tipo === 'EMOJI' && config.emoji === parseAvatarConfig(s.config).emoji)
                        return (
                          <div
                            key={s.id}
                            className={`border rounded-lg p-3 flex flex-col items-center gap-1 ${RARIDADE_RING[s.raridade] || ''}`}
                          >
                            <div className="text-2xl">{s.icone}</div>
                            <p className="text-xs font-semibold text-center leading-tight">{s.nome}</p>
                            <p className="text-[10px] text-muted-foreground">{RARIDADE_LABEL[s.raridade]}</p>
                            {s.comprado ? (
                              <Button
                                size="sm"
                                variant={aplicado ? 'default' : 'outline'}
                                className="w-full h-7 text-xs"
                                onClick={() => aplicarSkin(s)}
                                disabled={aplicado}
                              >
                                {aplicado ? <><Check className="w-3 h-3 mr-1" /> Aplicada</> : 'Aplicar'}
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full h-7 text-xs"
                                onClick={() => comprar(s)}
                                disabled={comprando === s.id || moedinhas < s.preco}
                              >
                                <Coins className="w-3 h-3 mr-1 text-amber-500" />
                                {comprando === s.id ? '...' : s.preco === 0 ? 'Grátis' : s.preco}
                              </Button>
                            )}
                          </div>
                        )
                      })}
                  </div>
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        )}

        <Button onClick={salvar} disabled={salvando} className="w-full">
          {salvando ? 'Salvando...' : 'Salvar avatar'}
        </Button>
      </CardContent>
    </Card>
  )
}
