'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge as BadgeUI } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Library, BookOpen, CheckCircle2, XCircle, Clock, Plus, Coins, Sparkles } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'
import { useApp } from '@/lib/store'

interface Resumo {
  id: string
  livroTitulo: string
  livroAutor: string | null
  resumo: string
  status: string
  xpRecompensa: number
  moedinhasRecompensa: number
  feedback: string | null
  createdAt: string
  validadoEm: string | null
  aluno?: { id: string; name: string; turma: { nome: string; ano: string } | null }
  validadoPor?: { name: string } | null
}

const STATUS_INFO: Record<string, { label: string; icon: any; color: string }> = {
  PENDENTE: { label: 'Pendente', icon: Clock, color: 'bg-amber-100 text-amber-800' },
  VALIDADO: { label: 'Validado', icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-800' },
  RECUSADO: { label: 'Recusado', icon: XCircle, color: 'bg-red-100 text-red-800' },
}

export function BibliotecaView() {
  const { user } = useApp()
  const [resumos, setResumos] = useState<Resumo[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [alvoValidar, setAlvoValidar] = useState<Resumo | null>(null)

  const reload = () => {
    api<{ resumos: Resumo[] }>('/api/resumos-biblioteca').then((d) => {
      setResumos(d.resumos)
      setLoading(false)
    })
  }

  useEffect(() => { reload() }, [])

  const ehBibliotecaria = user?.role === 'BIBLIOTECARIO' || user?.role === 'COORDENACAO' || user?.role === 'ADMIN'

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center gap-2">
        <Library className="w-5 h-5 text-purple-500" />
        <h2 className="text-xl font-bold">Biblioteca Escolar</h2>
        {user?.role === 'ALUNO' && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="ml-auto">
                <Plus className="w-4 h-4 mr-1" /> Enviar resumo
              </Button>
            </DialogTrigger>
            <EnviarResumo onEnviado={() => { setOpen(false); reload() }} />
          </Dialog>
        )}
      </div>

      <Card className="bg-purple-50/50 border-purple-200 dark:bg-purple-950/20">
        <CardContent className="p-3 text-xs text-purple-900 dark:text-purple-200">
          <p className="font-semibold flex items-center gap-1 mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Como funciona
          </p>
          <p>
            Leia um livro da biblioteca, escreva um resumo com suas palavras e envie aqui.
            A bibliotecária valida e você ganha <strong>+30 XP</strong> e <strong>+15 moedinhas</strong> por resumo.
            A cada 5 resumos: badge 📚 Leitor Bronze. A cada 15: 📖 Leitor Prata. A cada 30: 🏆 Leitor Ouro.
          </p>
        </CardContent>
      </Card>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 shimmer rounded-xl" />)}
        </div>
      ) : resumos.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground">Nenhum resumo enviado ainda.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {resumos.map((r) => {
            const st = STATUS_INFO[r.status] || STATUS_INFO.PENDENTE
            const StIcon = st.icon
            return (
              <Card key={r.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="font-semibold text-sm">{r.livroTitulo}</p>
                      <p className="text-xs text-muted-foreground">
                        {r.livroAutor ? `${r.livroAutor} · ` : ''}
                        {r.aluno ? `${r.aluno.name}${r.aluno.turma ? ` · ${r.aluno.turma.nome}` : ''} · ` : ''}
                        {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true, locale: ptBR })}
                      </p>
                    </div>
                    <BadgeUI variant="outline" className={`text-[10px] py-0 px-1.5 ${st.color}`}>
                      <StIcon className="w-3 h-3 mr-0.5" /> {st.label}
                    </BadgeUI>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-2">{r.resumo}</p>
                  {r.feedback && (
                    <p className="text-xs text-muted-foreground mb-2">
                      <strong>Feedback da bibliotecária:</strong> {r.feedback}
                    </p>
                  )}
                  {r.status === 'VALIDADO' && (r.xpRecompensa > 0 || r.moedinhasRecompensa > 0) && (
                    <div className="flex gap-2">
                      {r.xpRecompensa > 0 && (
                        <BadgeUI className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                          <Sparkles className="w-3 h-3 mr-1" /> +{r.xpRecompensa} XP
                        </BadgeUI>
                      )}
                      {r.moedinhasRecompensa > 0 && (
                        <BadgeUI className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                          <Coins className="w-3 h-3 mr-1" /> +{r.moedinhasRecompensa}
                        </BadgeUI>
                      )}
                    </div>
                  )}
                  {ehBibliotecaria && r.status === 'PENDENTE' && (
                    <Button size="sm" variant="outline" className="mt-2" onClick={() => setAlvoValidar(r)}>
                      Validar resumo
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {alvoValidar && (
        <ValidarResumoDialog
          resumo={alvoValidar}
          onClose={() => setAlvoValidar(null)}
          onValidado={() => {
            setAlvoValidar(null)
            reload()
          }}
        />
      )}
    </div>
  )
}

function EnviarResumo({ onEnviado }: { onEnviado: () => void }) {
  const [form, setForm] = useState({ livroTitulo: '', livroAutor: '', resumo: '' })
  const [enviando, setEnviando] = useState(false)

  async function enviar() {
    if (!form.livroTitulo || form.resumo.trim().length < 50) {
      toast.error('Informe o título do livro e um resumo com pelo menos 50 caracteres.')
      return
    }
    setEnviando(true)
    try {
      await api('/api/resumos-biblioteca', {
        method: 'POST',
        body: JSON.stringify(form),
      })
      toast.success('Resumo enviado! A bibliotecária vai validar.')
      onEnviado()
      setForm({ livroTitulo: '', livroAutor: '', resumo: '' })
    } catch (e: any) {
      toast.error(e.message || 'Erro ao enviar')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Enviar resumo de livro</DialogTitle>
        <CardDescription>
          Escreva com suas próprias palavras. Resumos copiados da internet não geram recompensa.
        </CardDescription>
      </DialogHeader>
      <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
        <div>
          <Label className="text-xs">Título do livro *</Label>
          <Input value={form.livroTitulo} onChange={(e) => setForm({ ...form, livroTitulo: e.target.value })} />
        </div>
        <div>
          <Label className="text-xs">Autor (opcional)</Label>
          <Input value={form.livroAutor} onChange={(e) => setForm({ ...form, livroAutor: e.target.value })} />
        </div>
        <div>
          <Label className="text-xs">Resumo (mín. 50 caracteres) *</Label>
          <Textarea
            value={form.resumo}
            onChange={(e) => setForm({ ...form, resumo: e.target.value })}
            rows={6}
            placeholder="Conte a história, principais personagens, temas e o que você achou do livro."
          />
          <p className="text-[10px] text-muted-foreground mt-1">{form.resumo.length} caracteres</p>
        </div>
        <div className="flex justify-end pt-2">
          <Button onClick={enviar} disabled={enviando}>
            {enviando ? 'Enviando...' : 'Enviar resumo'}
          </Button>
        </div>
      </div>
    </DialogContent>
  )
}

function ValidarResumoDialog({ resumo, onClose, onValidado }: { resumo: Resumo; onClose: () => void; onValidado: () => void }) {
  const [status, setStatus] = useState<'VALIDADO' | 'RECUSADO'>('VALIDADO')
  const [xp, setXp] = useState(resumo.xpRecompensa || 30)
  const [moedinhas, setMoedinhas] = useState(resumo.moedinhasRecompensa || 15)
  const [feedback, setFeedback] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function validar() {
    setEnviando(true)
    try {
      await api(`/api/resumos-biblioteca/${resumo.id}/validar`, {
        method: 'POST',
        body: JSON.stringify({ status, xpRecompensa: xp, moedinhasRecompensa: moedinhas, feedback }),
      })
      toast.success(status === 'VALIDADO' ? `Resumo validado! +${xp} XP e +${moedinhas} moedinhas.` : 'Resumo recusado.')
      onValidado()
    } catch (e: any) {
      toast.error(e.message || 'Erro ao validar')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <Card className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <CardHeader>
          <CardTitle className="text-base">Validar resumo: {resumo.livroTitulo}</CardTitle>
          <CardDescription>Por {resumo.aluno?.name || '—'}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="bg-muted/50 rounded-lg p-3 text-sm max-h-40 overflow-y-auto">
            {resumo.resumo}
          </div>
          <div>
            <Label className="text-xs">Decisão</Label>
            <div className="flex gap-2">
              <Button size="sm" variant={status === 'VALIDADO' ? 'default' : 'outline'} onClick={() => setStatus('VALIDADO')}>
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Validar
              </Button>
              <Button size="sm" variant={status === 'RECUSADO' ? 'default' : 'outline'} onClick={() => setStatus('RECUSADO')}>
                <XCircle className="w-3.5 h-3.5 mr-1" /> Recusar
              </Button>
            </div>
          </div>
          {status === 'VALIDADO' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">XP</Label>
                <Input type="number" min={0} max={200} value={xp} onChange={(e) => setXp(Number(e.target.value))} />
              </div>
              <div>
                <Label className="text-xs">Moedinhas</Label>
                <Input type="number" min={0} max={100} value={moedinhas} onChange={(e) => setMoedinhas(Number(e.target.value))} />
              </div>
            </div>
          )}
          <div>
            <Label className="text-xs">Feedback (opcional)</Label>
            <Textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} rows={2} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button onClick={validar} disabled={enviando}>
              {enviando ? 'Salvando...' : 'Confirmar'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
