'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge as BadgeUI } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Megaphone, Plus, Trash2, Pin } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'
import { ReformularTextArea } from '../ReformularTextArea'

interface Turma { id: string; nome: string; ano: string; turno: string }
interface AvisoTurma {
  id: string
  titulo: string
  conteudo: string
  createdAt: string
  turma: { nome: string; ano: string }
  professor: { name: string }
}

export function ProfAvisos() {
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [avisos, setAvisos] = useState<AvisoTurma[]>([])
  const [loading, setLoading] = useState(true)
  const [turmaSel, setTurmaSel] = useState<string>('')
  const [form, setForm] = useState({ titulo: '', conteudo: '', turmaId: '' })
  const [enviando, setEnviando] = useState(false)

  const reload = () => {
    api<{ avisos: AvisoTurma[] }>(`/api/avisos-turma${turmaSel ? `?turmaId=${turmaSel}` : ''}`).then((d) => {
      setAvisos(d.avisos)
      setLoading(false)
    })
  }

  useEffect(() => {
    api<{ turmas: Turma[] }>('/api/turmas').then((d) => setTurmas(d.turmas))
  }, [])

  useEffect(() => { reload() }, [turmaSel])

  async function publicar() {
    if (!form.titulo || !form.conteudo || !form.turmaId) {
      toast.error('Preencha título, conteúdo e turma.')
      return
    }
    setEnviando(true)
    try {
      await api('/api/avisos-turma', {
        method: 'POST',
        body: JSON.stringify(form),
      })
      toast.success('Aviso de turma publicado!')
      setForm({ titulo: '', conteudo: '', turmaId: '' })
      reload()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setEnviando(false)
    }
  }

  async function excluir(id: string) {
    // Reutiliza DELETE de /api/avisos?id=... -- para aviso de turma, criamos rota separada se necessário
    // Por simplicidade, apenas atualizamos localmente (a rota de exclusão pode ser implementada depois)
    toast.info('Exclusão de aviso de turma em breve.')
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="flex items-center gap-2">
        <Megaphone className="w-5 h-5 text-emerald-600" />
        <h2 className="text-xl font-bold">Avisos de Turma</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Plus className="w-4 h-4" /> Publicar aviso para uma turma
            </h3>
            <div>
              <Label className="text-xs">Turma *</Label>
              <Select value={form.turmaId} onValueChange={(v) => setForm({ ...form, turmaId: v })}>
                <SelectTrigger><SelectValue placeholder="Escolha a turma" /></SelectTrigger>
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
              <Label className="text-xs">Título *</Label>
              <Input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Conteúdo *</Label>
              <ReformularTextArea
                value={form.conteudo}
                onChange={(v) => setForm({ ...form, conteudo: v })}
                placeholder="Conteúdo do aviso..."
                rows={5}
              />
            </div>
            <Button onClick={publicar} disabled={enviando} className="w-full">
              {enviando ? 'Publicando...' : 'Publicar aviso de turma'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">Avisos publicados ({avisos.length})</h3>
              <Select value={turmaSel} onValueChange={setTurmaSel}>
                <SelectTrigger className="w-44 h-8 text-xs">
                  <SelectValue placeholder="Todas as turmas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as turmas</SelectItem>
                  {turmas.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <ScrollArea className="h-[60vh]">
              <div className="space-y-2">
                {loading ? (
                  <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 shimmer rounded" />)}</div>
                ) : avisos.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-12">Nenhum aviso de turma publicado.</p>
                ) : (
                  avisos.map((a) => (
                    <div key={a.id} className="border rounded-lg p-3">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-semibold text-sm flex items-center gap-1">
                          <Pin className="w-3 h-3 text-emerald-600" />
                          {a.titulo}
                        </h4>
                        <BadgeUI variant="outline" className="text-[10px]">{a.turma.nome}</BadgeUI>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-3 mb-2">{a.conteudo}</p>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>{a.professor.name} · {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true, locale: ptBR })}</span>
                        <button onClick={() => excluir(a.id)} className="hover:text-red-600 inline-flex items-center gap-1">
                          <Trash2 className="w-3 h-3" /> Excluir
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
