'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Coins, Search, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

interface Conta {
  id: string
  email: string
  name: string
  role: string
  moedinhas: number
  turma?: { nome: string; ano: string } | null
}

export function CoordMoedinhas() {
  const [users, setUsers] = useState<Conta[]>([])
  const [busca, setBusca] = useState('')
  const [alvo, setAlvo] = useState<Conta | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api<{ users: any[] }>('/api/contas').then((d) => {
      setUsers(d.users.map((u: any) => ({ ...u })) as Conta[])
      setLoading(false)
    })
  }, [])

  const filtrados = users.filter(
    (u) => !busca || u.name.toLowerCase().includes(busca.toLowerCase()) || u.email.toLowerCase().includes(busca.toLowerCase())
  )

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center gap-2">
        <Coins className="w-5 h-5 text-amber-500" />
        <h2 className="text-xl font-bold">Conceder Moedinhas</h2>
      </div>

      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Buscar usuário..." value={busca} onChange={(e) => setBusca(e.target.value)} className="pl-9" />
          </div>
          <ScrollArea className="h-[60vh]">
            <div className="divide-y">
              {loading ? (
                <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 shimmer rounded" />)}</div>
              ) : filtrados.map((u) => (
                <div key={u.id} className="py-2.5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-amber-400 flex items-center justify-center font-bold text-sm">
                    {u.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{u.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 text-xs px-2 py-0.5 rounded-full">
                    {u.moedinhas || 0}
                  </Badge>
                  <Button size="sm" variant="outline" onClick={() => setAlvo(u)}>
                    <Coins className="w-3.5 h-3.5 mr-1" /> Conceder
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {alvo && (
        <ConcederMoedinhasDialog
          conta={alvo}
          onClose={() => setAlvo(null)}
          onConcedido={() => {
            setAlvo(null)
            // Atualiza localmente
            api<{ users: any[] }>('/api/contas').then((d) => setUsers(d.users as Conta[]))
          }}
        />
      )}
    </div>
  )
}

function Badge({ className, children }: { className?: string; children: React.ReactNode }) {
  return <span className={className}>{children}</span>
}

function ConcederMoedinhasDialog({ conta, onClose, onConcedido }: { conta: Conta; onClose: () => void; onConcedido: () => void }) {
  const [quantidade, setQuantidade] = useState(10)
  const [motivo, setMotivo] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function conceder() {
    if (!motivo) {
      toast.error('Escreva um motivo.')
      return
    }
    setEnviando(true)
    try {
      await api('/api/moedinhas/conceder', {
        method: 'POST',
        body: JSON.stringify({ userId: conta.id, quantidade, motivo }),
      })
      toast.success(`+${quantidade} moedinhas para ${conta.name.split(' ')[0]}!`)
      onConcedido()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <Card className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold text-sm">Conceder moedinhas a {conta.name}</h3>
          <p className="text-xs text-muted-foreground">Saldo atual: {conta.moedinhas || 0}</p>
          <div>
            <Label className="text-xs">Quantidade</Label>
            <Input type="number" min={1} max={1000} value={quantidade} onChange={(e) => setQuantidade(Number(e.target.value))} />
            <div className="flex gap-1 mt-1">
              {[5, 10, 25, 50, 100].map((v) => (
                <button key={v} onClick={() => setQuantidade(v)} className="text-[10px] px-2 py-0.5 rounded-full bg-muted hover:bg-accent">
                  +{v}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-xs">Motivo</Label>
            <Textarea value={motivo} onChange={(e) => setMotivo(e.target.value)} rows={2} placeholder="Ex: Ajuda na organização do evento" />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button onClick={conceder} disabled={enviando}>
              <Sparkles className="w-3.5 h-3.5 mr-1" /> {enviando ? 'Concedendo...' : `Conceder +${quantidade}`}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
