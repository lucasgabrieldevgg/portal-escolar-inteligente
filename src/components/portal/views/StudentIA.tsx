'use client'

import { useEffect, useRef, useState } from 'react'
import { useApp, api } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge as BadgeUI } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Bot, Send, Sparkles, AlertTriangle, Lightbulb, BookOpen, ListChecks, Trash2, Zap } from 'lucide-react'
import { toast } from 'sonner'

interface Msg {
  role: 'user' | 'assistant'
  content: string
}

const SUGESTOES = [
  { icon: Lightbulb, label: 'Explique equações do 2º grau', pergunta: 'Pode me explicar como resolver equações do 2º grau de um jeito simples?' },
  { icon: BookOpen, label: 'Resuma a Revolução Francesa', pergunta: 'Faça um resumo em tópicos dos principais acontecimentos da Revolução Francesa.' },
  { icon: ListChecks, label: 'Técnicas de estudo', pergunta: 'Quais técnicas de estudo são mais eficazes para provas de matemática?' },
  { icon: Sparkles, label: 'Análise de poema', pergunta: 'Como faço para analisar um poema? Quais elementos devo observar?' },
]

export function StudentIA() {
  const { user } = useApp()
  const [mensagens, setMensagens] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [usosRestantes, setUsosRestantes] = useState<number | null>(null)
  const [limiteDiario, setLimiteDiario] = useState<number>(15)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (user) {
      setUsosRestantes(user.iaLimiteDiario - user.iaUsadasHoje)
      setLimiteDiario(user.iaLimiteDiario)
    }
  }, [user])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [mensagens])

  async function enviar(pergunta?: string) {
    const perguntaFinal = (pergunta ?? input).trim()
    if (!perguntaFinal || enviando) return

    if (usosRestantes !== null && usosRestantes <= 0) {
      toast.error('Você atingiu o limite diário de perguntas à IA. Volte amanhã!')
      return
    }

    const novasMsgs: Msg[] = [...mensagens, { role: 'user', content: perguntaFinal }]
    setMensagens(novasMsgs)
    setInput('')
    setEnviando(true)

    try {
      const data = await api<{ resposta: string; usosRestantes: number; limiteDiario: number }>('/api/ia', {
        method: 'POST',
        body: JSON.stringify({
          pergunta: perguntaFinal,
          historico: mensagens.slice(-6),
        }),
      })
      setMensagens([...novasMsgs, { role: 'assistant', content: data.resposta }])
      setUsosRestantes(data.usosRestantes)
      setLimiteDiario(data.limiteDiario)
    } catch (e: any) {
      const msg = e.message || 'Erro ao falar com a IA'
      if (msg.includes('limite')) {
        toast.error(msg)
        setUsosRestantes(0)
      } else {
        toast.error(msg)
      }
      // Remove a mensagem do usuário que não foi respondida
      setMensagens(mensagens)
    } finally {
      setEnviando(false)
    }
  }

  if (!user) return null

  const pct = limiteDiario > 0 ? ((usosRestantes ?? 0) / limiteDiario) * 100 : 0

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Assistente de IA</h2>
            <p className="text-xs text-muted-foreground">Para tirar dúvidas e estudar</p>
          </div>
        </div>
        <Card className="px-3 py-2">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <div>
              <p className="text-xs text-muted-foreground">Usos restantes hoje</p>
              <p className="text-sm font-bold">{usosRestantes ?? '...'} / {limiteDiario}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Regras */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-900">
        <p className="font-semibold flex items-center gap-1 mb-1">
          <Sparkles className="w-3.5 h-3.5" /> Como usar bem a IA
        </p>
        <ul className="space-y-0.5 list-disc pl-4 text-emerald-800">
          <li>A IA ajuda a <strong>entender</strong>, não faz a tarefa por você.</li>
          <li>Pergunte sobre conteúdos das aulas, peça resumos e explicações.</li>
          <li>O limite diário existe para controlar custos — use com propósito.</li>
        </ul>
      </div>

      {/* Chat */}
      <Card className="flex flex-col h-[60vh] min-h-[400px]">
        <ScrollArea className="flex-1 p-4" ref={scrollRef as any}>
          <div className="space-y-4">
            {mensagens.length === 0 && (
              <div className="text-center py-8">
                <Bot className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
                <p className="font-medium mb-1">Olá, {user.name.split(' ')[0]}!</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Sou seu assistente de estudos. O que você quer aprender hoje?
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-2xl mx-auto">
                  {SUGESTOES.map((s, i) => {
                    const Icon = s.icon
                    return (
                      <button
                        key={i}
                        onClick={() => enviar(s.pergunta)}
                        className="text-left p-3 rounded-lg border hover:border-emerald-400 hover:bg-emerald-50/50 transition-colors text-sm"
                      >
                        <Icon className="w-4 h-4 text-emerald-600 mb-1.5" />
                        <p className="font-medium">{s.label}</p>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
            {mensagens.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
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
            <Button
              onClick={() => enviar()}
              disabled={enviando || !input.trim()}
              size="icon"
              className="h-11 w-11 flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground">
            <span>Enter para enviar · Shift+Enter para nova linha</span>
            {mensagens.length > 0 && (
              <button
                onClick={() => setMensagens([])}
                className="hover:text-foreground inline-flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Limpar
              </button>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
