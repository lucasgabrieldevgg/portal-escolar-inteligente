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
import { Rocket, Sparkles, Code, Palette, Bug as BugIcon, Lightbulb, ClipboardList, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'

interface Inscricao {
  id: string
  area: string
  experiencia: string | null
  motivo: string
  analiseIA: string | null
  scoreIA: number | null
  status: string
  createdAt: string
  decididoEm: string | null
  user?: { name: string }
}

const AREA_INFO: Record<string, { label: string; icon: any; color: string }> = {
  PROGRAMACAO: { label: 'Programação', icon: Code, color: 'bg-emerald-100 text-emerald-800' },
  DESIGN: { label: 'Design', icon: Palette, color: 'bg-pink-100 text-pink-800' },
  TESTES: { label: 'Testes', icon: BugIcon, color: 'bg-amber-100 text-amber-800' },
  IDEIAS: { label: 'Ideias', icon: Lightbulb, color: 'bg-sky-100 text-sky-800' },
  ORGANIZACAO: { label: 'Organização', icon: ClipboardList, color: 'bg-purple-100 text-purple-800' },
}

const STATUS_INFO: Record<string, { label: string; icon: any; color: string }> = {
  PENDENTE: { label: 'Pendente', icon: Clock, color: 'bg-slate-100 text-slate-700' },
  EM_ANALISE: { label: 'Em análise', icon: Sparkles, color: 'bg-sky-100 text-sky-800' },
  ACEITO: { label: 'Aceito', icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-800' },
  RECUSADO: { label: 'Recusado', icon: XCircle, color: 'bg-red-100 text-red-800' },
  PERIODO_TESTE: { label: 'Período de teste', icon: Sparkles, color: 'bg-amber-100 text-amber-800' },
}

export function InscricaoDevView() {
  const [inscricoes, setInscricoes] = useState<Inscricao[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ area: 'PROGRAMACAO', experiencia: '', motivo: '' })
  const [enviando, setEnviando] = useState(false)
  const [mostrarForm, setMostrarForm] = useState(false)

  const reload = () => {
    api<{ inscricoes: Inscricao[] }>('/api/inscricoes').then((d) => {
      setInscricoes(d.inscricoes)
      setLoading(false)
    })
  }

  useEffect(() => { reload() }, [])

  const temAtiva = inscricoes.some((i) => ['PENDENTE', 'EM_ANALISE', 'PERIODO_TESTE'].includes(i.status))

  async function enviar() {
    if (!form.motivo || form.motivo.length < 20) {
      toast.error('Escreva um motivo com pelo menos 20 caracteres.')
      return
    }
    setEnviando(true)
    try {
      await api('/api/inscricoes', {
        method: 'POST',
        body: JSON.stringify(form),
      })
      toast.success('Inscrição enviada! A IA fez uma análise inicial e a coordenação vai revisar.')
      setForm({ area: 'PROGRAMACAO', experiencia: '', motivo: '' })
      setMostrarForm(false)
      reload()
    } catch (e: any) {
      toast.error(e.message || 'Erro ao enviar')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center gap-2">
        <Rocket className="w-5 h-5 text-emerald-600" />
        <h2 className="text-xl font-bold">Quero colaborar com o desenvolvimento</h2>
      </div>

      <Card className="bg-emerald-50/50 border-emerald-200">
        <CardContent className="p-4 text-sm text-emerald-900">
          <p className="font-semibold mb-2">Como funciona o programa de colaboradores</p>
          <ol className="space-y-1 list-decimal pl-5 text-emerald-800 text-xs">
            <li>Você se inscreve escolhendo uma área de interesse.</li>
            <li>A IA faz uma análise inicial: resume sua inscrição e dá um score.</li>
            <li>A coordenação revisa (a IA não decide sozinha).</li>
            <li>Se aceito, você entra em período de teste e recebe a badge 🔧 Colaborador Técnico.</li>
          </ol>
          <p className="mt-2 text-xs text-emerald-700">
            Importante: a badge de colaborador <strong>não dá XP nem entra no ranking</strong> — ela é reconhecimento de contribuição, não de desempenho acadêmico.
          </p>
        </CardContent>
      </Card>

      {!temAtiva && !mostrarForm && (
        <Card>
          <CardContent className="py-8 text-center">
            <Rocket className="w-12 h-12 mx-auto text-emerald-500 mb-3" />
            <p className="font-semibold mb-1">Pronto para participar?</p>
            <p className="text-sm text-muted-foreground mb-4">
              Você pode ajudar com programação, design, testes, ideias ou organização.
            </p>
            <Button onClick={() => setMostrarForm(true)}>
              <Rocket className="w-4 h-4 mr-2" /> Quero participar
            </Button>
          </CardContent>
        </Card>
      )}

      {mostrarForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Formulário de inscrição</CardTitle>
            <CardDescription>Preencha com atenção. A IA usa essas respostas para análise inicial.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs">Área de interesse *</Label>
              <Select value={form.area} onValueChange={(v) => setForm({ ...form, area: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(AREA_INFO).map(([k, v]) => {
                    const Icon = v.icon
                    return (
                      <SelectItem key={k} value={k}>
                        <span className="flex items-center gap-2">
                          <Icon className="w-4 h-4" /> {v.label}
                        </span>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Experiência prévia (opcional)</Label>
              <Textarea
                placeholder="Já programou em alguma linguagem? Fez design no Canva? Testou algum app? Tudo conta."
                value={form.experiencia}
                onChange={(e) => setForm({ ...form, experiencia: e.target.value })}
                rows={2}
              />
            </div>
            <div>
              <Label className="text-xs">Por que quer participar? *</Label>
              <Textarea
                placeholder="Conte sua motivação. O que te chamou atenção no projeto? O que você quer aprender?"
                value={form.motivo}
                onChange={(e) => setForm({ ...form, motivo: e.target.value })}
                rows={4}
              />
              <p className="text-[10px] text-muted-foreground mt-1">{form.motivo.length} caracteres</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setMostrarForm(false)}>Cancelar</Button>
              <Button onClick={enviar} disabled={enviando}>
                {enviando ? 'Enviando...' : 'Enviar inscrição'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="h-32 rounded-xl shimmer" />
      ) : inscricoes.length > 0 ? (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Minhas inscrições
          </h3>
          {inscricoes.map((i) => {
            const area = AREA_INFO[i.area] || AREA_INFO.PROGRAMACAO
            const st = STATUS_INFO[i.status] || STATUS_INFO.PENDENTE
            const StIcon = st.icon
            const AreaIcon = area.icon
            return (
              <Card key={i.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <BadgeUI variant="outline" className={`text-[10px] py-0 px-1.5 ${area.color}`}>
                        <AreaIcon className="w-3 h-3 mr-0.5" /> {area.label}
                      </BadgeUI>
                      <BadgeUI variant="outline" className={`text-[10px] py-0 px-1.5 ${st.color}`}>
                        <StIcon className="w-3 h-3 mr-0.5" /> {st.label}
                      </BadgeUI>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {formatDistanceToNow(new Date(i.createdAt), { addSuffix: true, locale: ptBR })}
                    </span>
                  </div>
                  {i.experiencia && (
                    <p className="text-xs mb-1"><span className="text-muted-foreground">Experiência:</span> {i.experiencia}</p>
                  )}
                  <p className="text-xs mb-2"><span className="text-muted-foreground">Motivo:</span> {i.motivo}</p>
                  {i.analiseIA && (
                    <div className="bg-sky-50 border border-sky-200 rounded-lg p-2 mt-2">
                      <p className="text-[10px] font-semibold text-sky-900 flex items-center gap-1 mb-1">
                        <Sparkles className="w-3 h-3" /> Análise inicial da IA
                        {i.scoreIA !== null && (
                          <span className="ml-auto bg-sky-200 text-sky-900 rounded-full px-1.5 py-0.5">Score: {i.scoreIA}/100</span>
                        )}
                      </p>
                      <p className="text-xs text-sky-800">{i.analiseIA}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
