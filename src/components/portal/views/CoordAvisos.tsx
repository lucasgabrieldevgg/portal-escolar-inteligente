'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
import { Badge as BadgeUI } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Megaphone, Plus, Pin, Trash2, AlertTriangle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'
import { ReformularTextArea } from '../ReformularTextArea'

interface Aviso {
  id: string
  titulo: string
  conteudo: string
  categoria: string
  destaque: boolean
  createdAt: string
  autor: { name: string; role: string }
}

const CATEGORIAS = [
  { value: 'GERAL', label: 'Geral' },
  { value: 'URGENTE', label: 'Urgente' },
  { value: 'EVENTO', label: 'Evento' },
  { value: 'ACADEMICO', label: 'Acadêmico' },
]

export function CoordAvisos() {
  const [avisos, setAvisos] = useState<Aviso[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ titulo: '', conteudo: '', categoria: 'GERAL', destaque: false })
  const [enviando, setEnviando] = useState(false)

  const reload = () => {
    api<{ avisos: Aviso[] }>('/api/avisos').then((d) => {
      setAvisos(d.avisos)
      setLoading(false)
    })
  }

  useEffect(() => { reload() }, [])

  async function publicar() {
    if (!form.titulo || !form.conteudo) {
      toast.error('Título e conteúdo obrigatórios.')
      return
    }
    setEnviando(true)
    try {
      await api('/api/avisos', {
        method: 'POST',
        body: JSON.stringify(form),
      })
      toast.success('Aviso publicado!')
      setForm({ titulo: '', conteudo: '', categoria: 'GERAL', destaque: false })
      reload()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setEnviando(false)
    }
  }

  async function excluir(id: string) {
    if (!confirm('Excluir este aviso?')) return
    try {
      await api(`/api/avisos?id=${id}`, { method: 'DELETE' })
      toast.success('Aviso excluído.')
      reload()
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const CAT_STYLE: Record<string, string> = {
    GERAL: 'bg-emerald-100 text-emerald-800',
    URGENTE: 'bg-red-100 text-red-800',
    EVENTO: 'bg-amber-100 text-amber-800',
    ACADEMICO: 'bg-sky-100 text-sky-800',
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="flex items-center gap-2">
        <Megaphone className="w-5 h-5 text-rose-600" />
        <h2 className="text-xl font-bold">Avisos oficiais</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Form */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Plus className="w-4 h-4" /> Publicar novo aviso
            </h3>
            <div>
              <Label className="text-xs">Título</Label>
              <Input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Conteúdo</Label>
              <ReformularTextArea
                value={form.conteudo}
                onChange={(v) => setForm({ ...form, conteudo: v })}
                rows={5}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Categoria</Label>
                <Select value={form.categoria} onValueChange={(v) => setForm({ ...form, categoria: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIAS.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.destaque}
                    onChange={(e) => setForm({ ...form, destaque: e.target.checked })}
                    className="w-4 h-4 rounded border-input"
                  />
                  <Pin className="w-3 h-3" /> Destacar no topo
                </label>
              </div>
            </div>
            {form.categoria === 'URGENTE' && (
              <div className="bg-red-50 border border-red-200 rounded p-2 text-xs text-red-900 flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5" /> Avisos urgentes aparecem fixados no topo de todos os alunos.
              </div>
            )}
            <Button onClick={publicar} disabled={enviando} className="w-full">
              {enviando ? 'Publicando...' : 'Publicar aviso'}
            </Button>
          </CardContent>
        </Card>

        {/* Lista */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm mb-3">Avisos publicados ({avisos.length})</h3>
            <ScrollArea className="h-[60vh]">
              <div className="space-y-2">
                {loading ? (
                  <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 shimmer rounded" />)}</div>
                ) : (
                  avisos.map((a) => (
                    <div key={a.id} className={`border rounded-lg p-3 ${a.destaque ? 'border-amber-300 bg-amber-50/30' : ''}`}>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-semibold text-sm flex items-center gap-1">
                          {a.destaque && <Pin className="w-3 h-3 text-amber-600" />}
                          {a.titulo}
                        </h4>
                        <BadgeUI variant="outline" className={`text-[10px] py-0 px-1.5 ${CAT_STYLE[a.categoria]}`}>
                          {a.categoria}
                        </BadgeUI>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{a.conteudo}</p>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>{formatDistanceToNow(new Date(a.createdAt), { addSuffix: true, locale: ptBR })}</span>
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
