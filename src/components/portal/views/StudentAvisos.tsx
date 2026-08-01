'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
import { Badge as BadgeUI } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Megaphone, Pin } from 'lucide-react'

interface Aviso {
  id: string
  titulo: string
  conteudo: string
  categoria: string
  destaque: boolean
  createdAt: string
  autor: { name: string; role: string }
}

const CATEGORIA_STYLE: Record<string, { label: string; cls: string }> = {
  GERAL: { label: 'Geral', cls: 'bg-emerald-100 text-emerald-800' },
  URGENTE: { label: 'Urgente', cls: 'bg-red-100 text-red-800' },
  EVENTO: { label: 'Evento', cls: 'bg-amber-100 text-amber-800' },
  ACADEMICO: { label: 'Acadêmico', cls: 'bg-sky-100 text-sky-800' },
}

export function StudentAvisos() {
  const [avisos, setAvisos] = useState<Aviso[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api<{ avisos: Aviso[] }>('/api/avisos').then((d) => {
      setAvisos(d.avisos)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl shimmer" />
        ))}
      </div>
    )
  }

  const destacados = avisos.filter((a) => a.destaque)
  const normais = avisos.filter((a) => !a.destaque)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Megaphone className="w-5 h-5 text-emerald-600" />
        <h2 className="text-xl font-bold">Avisos oficiais da escola</h2>
      </div>

      {destacados.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide flex items-center gap-1">
            <Pin className="w-3 h-3" /> Em destaque
          </p>
          <div className="space-y-3">
            {destacados.map((a) => (
              <AvisoCard key={a.id} aviso={a} />
            ))}
          </div>
        </div>
      )}

      {normais.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
            Todos os avisos
          </p>
          <div className="space-y-3">
            {normais.map((a) => (
              <AvisoCard key={a.id} aviso={a} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function AvisoCard({ aviso }: { aviso: Aviso }) {
  const cat = CATEGORIA_STYLE[aviso.categoria] || CATEGORIA_STYLE.GERAL
  return (
    <Card className={aviso.destaque ? 'border-amber-300 bg-amber-50/30' : ''}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold">{aviso.titulo}</h3>
          <BadgeUI variant="outline" className={`text-[10px] py-0 px-1.5 flex-shrink-0 ${cat.cls}`}>
            {cat.label}
          </BadgeUI>
        </div>
        <p className="text-sm text-muted-foreground whitespace-pre-line">{aviso.conteudo}</p>
        <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
          <span>Por {aviso.autor.name}</span>
          <span>{formatDistanceToNow(new Date(aviso.createdAt), { addSuffix: true, locale: ptBR })}</span>
        </div>
      </CardContent>
    </Card>
  )
}
