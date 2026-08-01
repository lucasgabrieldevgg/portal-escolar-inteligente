'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
import { Badge as BadgeUI } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ClipboardList, Award, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Tarefa {
  id: string
  titulo: string
  descricao: string
  xpRecompensa: number
  prazo: string | null
  createdAt: string
  turma: { nome: string; ano: string }
  professor: { name: string }
  _count: { entregas: number }
}

export function CoordTarefas() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api<{ tarefas: Tarefa[] }>('/api/tarefas').then((d) => {
      setTarefas(d.tarefas)
      setLoading(false)
    })
  }, [])

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center gap-2">
        <ClipboardList className="w-5 h-5 text-rose-600" />
        <h2 className="text-xl font-bold">Todas as tarefas</h2>
        <BadgeUI variant="outline" className="ml-auto">{tarefas.length} tarefas</BadgeUI>
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 shimmer rounded-xl" />)}</div>
      ) : (
        <ScrollArea className="h-[70vh]">
          <div className="space-y-2">
            {tarefas.map((t) => (
              <Card key={t.id}>
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <p className="font-semibold text-sm">{t.titulo}</p>
                      <p className="text-xs text-muted-foreground">
                        {t.professor.name} · Turma {t.turma.nome} · {formatDistanceToNow(new Date(t.createdAt), { addSuffix: true, locale: ptBR })}
                      </p>
                    </div>
                    <BadgeUI className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                      <Award className="w-3 h-3 mr-1" /> {t.xpRecompensa} XP
                    </BadgeUI>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{t.descricao}</p>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                    <span>{t._count.entregas} entrega(s)</span>
                    {t.prazo && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {formatDistanceToNow(new Date(t.prazo), { addSuffix: true, locale: ptBR })}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {tarefas.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center text-sm text-muted-foreground">
                  Nenhuma tarefa criada ainda.
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}
