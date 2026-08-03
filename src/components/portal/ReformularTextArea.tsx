'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sparkles, Undo2, Redo2, Loader2, Wand2 } from 'lucide-react'
import { api } from '@/lib/store'
import { toast } from 'sonner'

interface ReformularTextAreaProps {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
  disabled?: boolean
}

const MODOS = [
  { value: 'simplificar', label: 'Simplificar' },
  { value: 'ampliar', label: 'Ampliar' },
  { value: 'formal', label: 'Mais formal' },
  { value: 'informal', label: 'Mais informal' },
  { value: 'corrigir', label: 'Corrigir gramática' },
]

export function ReformularTextArea({
  value,
  onChange,
  placeholder,
  rows = 4,
  disabled,
}: ReformularTextAreaProps) {
  const [modo, setModo] = useState('simplificar')
  const [carregando, setCarregando] = useState(false)
  // Histórico para undo/redo
  const [historico, setHistorico] = useState<string[]>([value])
  const [pos, setPos] = useState(0)
  const skipNext = useRef(true)

  // Sempre que o valor muda externamente, registraremos no histórico (a menos que skipNext)
  useEffect(() => {
    if (skipNext.current) {
      skipNext.current = false
      return
    }
    if (value === historico[pos]) return
    const novoHist = historico.slice(0, pos + 1)
    novoHist.push(value)
    // Limita o histórico a 50 estados
    if (novoHist.length > 50) novoHist.shift()
    setHistorico(novoHist)
    setPos(novoHist.length - 1)
  }, [value])

  function undo() {
    if (pos <= 0) return
    const novoPos = pos - 1
    skipNext.current = true
    setPos(novoPos)
    onChange(historico[novoPos])
  }
  function redo() {
    if (pos >= historico.length - 1) return
    const novoPos = pos + 1
    skipNext.current = true
    setPos(novoPos)
    onChange(historico[novoPos])
  }

  async function reformular() {
    if (!value || value.trim().length < 5) {
      toast.error('Escreva ao menos 5 caracteres para reformular.')
      return
    }
    setCarregando(true)
    try {
      const d = await api<{ texto: string }>('/api/ia/reformular', {
        method: 'POST',
        body: JSON.stringify({ texto: value, modo }),
      })
      skipNext.current = true
      onChange(d.texto)
      toast.success('Texto reformulado! Você pode desfazer se não gostar.')
    } catch (e: any) {
      toast.error(e.message || 'Não foi possível reformular agora.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="space-y-2">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled || carregando}
        className="resize-y"
      />
      <div className="flex flex-wrap items-center gap-2">
        <Select value={modo} onValueChange={setModo} disabled={carregando || disabled}>
          <SelectTrigger className="w-44 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MODOS.map((m) => (
              <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          size="sm"
          variant="outline"
          onClick={reformular}
          disabled={carregando || disabled || !value || value.length < 5}
          className="h-8"
        >
          {carregando ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Wand2 className="w-3.5 h-3.5 mr-1" />}
          Reformular com IA
        </Button>
        <div className="ml-auto flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={undo}
            disabled={pos <= 0 || carregando}
            className="h-8 w-8 p-0"
            title="Desfazer"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={redo}
            disabled={pos >= historico.length - 1 || carregando}
            className="h-8 w-8 p-0"
            title="Refazer"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
        <Sparkles className="w-3 h-3" />
        Dica: use a IA para melhorar seu texto, mas leia e ajuste antes de entregar. É sua autoria.
      </p>
    </div>
  )
}
