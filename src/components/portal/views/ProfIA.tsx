'use client'

import { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge as BadgeUI } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Bot, Send, Sparkles, Loader2, Lightbulb } from 'lucide-react'
import { toast } from 'sonner'

interface Msg {
  role: 'user' | 'assistant'
  content: string
}

const SUGESTOES = [
  'Crie uma tarefa de matemática sobre frações para o 7º ano.',
  'Sugira uma rubrica para avaliar um resumo de livro.',
  'Como explicar o conceito de fotossíntese de forma divertida?',
  'Monte um plano de aula de 50 minutos sobre a Independência do Brasil.',
]

export function ProfIA() {
  const [mensagens, setMensagens] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [enviando, setEnviando] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [mensagens])

  async function enviar(pergunta?: string) {
    const perguntaFinal = (pergunta ?? input).trim()
    if (!perguntaFinal || enviando) return
    const novasMsgs: Msg[] = [...mensagens, { role: 'user', content: perguntaFinal }]
    setMensagens(novasMsgs)
    setInput('')
    setEnviando(true)

    try {
      const data = await api<{ resposta: string }>('/api/ia-professor', {
        method: 'POST',
        body: JSON.stringify({ pergunta: perguntaFinal }),
      })
      setMensagens([...novasMsgs, { role: 'assistant', content: data.resposta }])
    } catch (e: any) {
      toast.error(e.message || 'Erro ao falar com a IA')
      setMensagens(mensagens)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Assistente de IA (Professor)</h2>
          <p className="text-xs text-muted-foreground">Para criar tarefas, rubricas, planos de aula e mais.</p>
        </div>
      </div>

      <Card className="flex flex-col h-[65vh] min-h-[420px]">
        <ScrollArea className="flex-1 p-4" ref={scrollRef as any}>
          <div className="space-y-4">
            {mensagens.length === 0 && (
              <div className="text-center py-8">
                <Bot className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
                <p className="font-medium mb-1">Olá!</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Posso te ajudar a planejar aulas, criar tarefas e muito mais.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-2xl mx-auto">
                  {SUGESTOES.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => enviar(s)}
                      className="text-left p-3 rounded-lg border hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-colors text-sm"
                    >
                      <Lightbulb className="w-4 h-4 text-emerald-600 mb-1.5" />
                      <p className="text-xs">{s}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {mensagens.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-line ${
                    m.role === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-sm'
                      : 'bg-muted text-foreground rounded-bl-sm'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {enviando && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
                  <span className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="border-t p-3">
          <div className="flex gap-2">
            <Textarea
              placeholder="Digite sua pergunta..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={1}
              className="resize-none min-h-[44px] max-h-32"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  enviar()
                }
              }}
            />
            <Button onClick={() => enviar()} disabled={enviando || !input.trim()} size="icon" className="h-11 w-11 flex-shrink-0">
              {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

import { api } from '@/lib/store'
