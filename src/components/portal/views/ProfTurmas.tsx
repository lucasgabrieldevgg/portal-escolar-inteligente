'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge as BadgeUI } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Users, ChevronRight, Sparkles, BookOpen, ClipboardCheck } from 'lucide-react'
import { toast } from 'sonner'

interface Turma {
  id: string
  nome: string
  ano: string
  turno: string
  _count: { alunos: number }
}

export function ProfTurmas() {
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [loading, setLoading] = useState(true)
  const [turmaSel, setTurmaSel] = useState<Turma | null>(null)
  const [alunos, setAlunos] = useState<any[]>([])

  useEffect(() => {
    api<{ turmas: Turma[] }>('/api/turmas').then((d) => {
      setTurmas(d.turmas)
      setLoading(false)
    })
  }, [])

  async function verAlunos(t: Turma) {
    setTurmaSel(t)
    try {
      const d = await api<{ alunos: any[] }>(`/api/alunos?turmaId=${t.id}`)
      setAlunos(d.alunos)
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  if (loading) {
    return <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 shimmer rounded-xl" />)}</div>
  }

  if (turmaSel) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setTurmaSel(null)}>
            ← Voltar
          </Button>
          <h2 className="text-xl font-bold">
            Turma {turmaSel.nome} · {turmaSel.ano}
          </h2>
          <BadgeUI variant="outline" className="ml-auto">
            {turmaSel.turno === 'MANHA' ? 'Manhã' : 'Tarde'} · {alunos.length} alunos
          </BadgeUI>
        </div>

        <Card>
          <ScrollArea className="h-[60vh]">
            <div className="divide-y">
              {alunos.map((a, i) => (
                <div key={a.id} className="p-3 flex items-center gap-3">
                  <div className="w-7 text-center text-sm text-muted-foreground">{i + 1}º</div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-amber-400 flex items-center justify-center font-bold text-sm">
                    {a.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{a.name}</p>
                    <p className="text-xs text-muted-foreground">{a.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-amber-700">{a.xp} XP</p>
                    <p className="text-[10px] text-muted-foreground">{a._count?.userBadges || 0} badges</p>
                  </div>
                </div>
              ))}
              {alunos.length === 0 && (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  Nenhum aluno nesta turma.
                </div>
              )}
            </div>
          </ScrollArea>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center gap-2">
        <Users className="w-5 h-5 text-emerald-600" />
        <h2 className="text-xl font-bold">Minhas turmas</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {turmas.map((t) => (
          <Card key={t.id} className="hover:shadow-md transition-shadow cursor-pointer group" onClick={() => verAlunos(t)}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <BadgeUI variant="outline" className="text-[10px]">
                  {t.turno === 'MANHA' ? 'Manhã' : 'Tarde'}
                </BadgeUI>
              </div>
              <p className="font-bold text-lg">{t.nome}</p>
              <p className="text-xs text-muted-foreground">{t.ano} · {t._count.alunos} alunos</p>
              <Button size="sm" variant="ghost" className="w-full mt-3 group-hover:bg-emerald-50">
                Ver alunos <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
