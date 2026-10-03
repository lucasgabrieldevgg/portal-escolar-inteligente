'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sparkles, Search } from 'lucide-react'
import { toast } from 'sonner'

interface Turma { id: string; nome: string; ano: string; turno: string }
interface Aluno {
  id: string
  name: string
  email: string
  xp: number
  turma: { nome: string; ano: string } | null
}

export function ProfXP({ onXpGained }: { onXpGained?: () => void }) {
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [turmaId, setTurmaId] = useState('')
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [busca, setBusca] = useState('')
  const [alvo, setAlvo] = useState<Aluno | null>(null)

  useEffect(() => {
    api<{ turmas: Turma[] }>('/api/turmas').then((d) => setTurmas(d.turmas))
  }, [])

  useEffect(() => {
    if (!turmaId) return
    api<{ alunos: Aluno[] }>(`/api/alunos?turmaId=${turmaId}`).then((d) => setAlunos(d.alunos))
  }, [turmaId])

  const filtrados = alunos.filter(
    (a) => !busca || a.name.toLowerCase().includes(busca.toLowerCase())
  )

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-amber-500" />
        <h2 className="text-xl font-bold">Conceder XP</h2>
      </div>

      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Selecione a turma</Label>
              <Select value={turmaId} onValueChange={setTurmaId}>
                <SelectTrigger><SelectValue placeholder="Escolha uma turma" /></SelectTrigger>
                <SelectContent>
                  {turmas.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.nome} · {t.ano} ({t.turno === 'MANHA' ? 'Manhã' : 'Tarde'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Buscar aluno</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Nome..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-9"
                  disabled={!turmaId}
                />
              </div>
            </div>
          </div>

          {!turmaId ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              Selecione uma turma para ver os alunos.
            </p>
          ) : filtrados.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">Nenhum aluno encontrado.</p>
          ) : (
            <ScrollArea className="h-[50vh]">
              <div className="divide-y">
                {filtrados.map((a) => (
                  <div key={a.id} className="py-2.5 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-amber-400 flex items-center justify-center font-bold text-sm">
                      {a.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{a.name}</p>
                      <p className="text-xs text-muted-foreground">XP atual: {a.xp}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setAlvo(a)}>
                      <Sparkles className="w-3.5 h-3.5 mr-1" /> Dar XP
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {alvo && (
        <ConcederXPDialog
          aluno={alvo}
          onClose={() => setAlvo(null)}
          onConcedido={() => {
            setAlvo(null)
            if (turmaId) api<{ alunos: Aluno[] }>(`/api/alunos?turmaId=${turmaId}`).then((d) => setAlunos(d.alunos))
            onXpGained?.()
          }}
        />
      )}
    </div>
  )
}

function ConcederXPDialog({ aluno, onClose, onConcedido }: { aluno: Aluno; onClose: () => void; onConcedido: () => void }) {
  const [quantidade, setQuantidade] = useState(50)
  const [motivo, setMotivo] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function conceder() {
    if (!motivo || motivo.length < 3) {
      toast.error('Escreva um motivo.')
      return
    }
    if (quantidade <= 0 || quantidade > 1000) {
      toast.error('Quantidade deve ser entre 1 e 1000.')
      return
    }
    setEnviando(true)
    try {
      await api('/api/xp', {
        method: 'POST',
        body: JSON.stringify({ userId: aluno.id, quantidade, motivo }),
      })
      toast.success(`+${quantidade} XP para ${aluno.name.split(' ')[0]}!`)
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
        <CardHeader>
          <CardTitle className="text-base">Conceder XP para {aluno.name}</CardTitle>
          <CardDescription>XP atual: {aluno.xp}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-xs">Quantidade de XP</Label>
            <Input
              type="number"
              min={1}
              max={1000}
              value={quantidade}
              onChange={(e) => setQuantidade(Number(e.target.value))}
            />
            <div className="flex gap-1 mt-1">
              {[10, 25, 50, 100, 200].map((v) => (
                <button
                  key={v}
                  onClick={() => setQuantidade(v)}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-muted hover:bg-accent"
                >
                  +{v}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-xs">Motivo *</Label>
            <Textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              rows={2}
              placeholder="Ex: Participação em aula, ajuda ao colega, lição extra..."
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button onClick={conceder} disabled={enviando}>
              {enviando ? 'Concedendo...' : `Conceder +${quantidade} XP`}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
