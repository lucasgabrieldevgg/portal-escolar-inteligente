import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUser, hojeISO } from '@/lib/auth'
import ZAI from 'z-ai-web-dev-sdk'

const SYSTEM_PROMPT = `Você é o assistente de IA do Portal Escolar Inteligente, uma plataforma escolar brasileira.

Seu papel:
- Ajudar alunos a estudar conteúdos escolares (matemática, história, português, ciências, etc.)
- Resumir materiais que os professores passaram (slides, textos, PDFs)
- Explicar conceitos de forma didática e simples, adequada para alunos do 6º ano ao 3º ano do Ensino Médio
- Sugerir exercícios e técnicas de estudo
- Nunca dar a resposta direta a uma pergunta de exercício sem antes ajudar o aluno a pensar

Regras importantes:
- Você NÃO faz tarefas por completo pelo aluno
- Você NÃO gera textos para o aluno copiar em trabalhos (anti-fraude)
- Você NÃO responde a conteúdo inadequado, ofensivo ou sem propósito educacional
- Use português brasileiro
- Seja amigável, breve e direto. Use exemplos do cotidiano quando ajudar.
- Se a pergunta não tiver relação com educação escolar, educadamente recuse e explique seu propósito.

Quando resumir um material, organize em tópicos com títulos curtos e bullets.`

export async function POST(req: NextRequest) {
  const user = await requireUser()
  const { pergunta, historico } = await req.json()

  if (!pergunta || typeof pergunta !== 'string' || pergunta.trim().length === 0) {
    return NextResponse.json({ error: 'Pergunta obrigatória' }, { status: 400 })
  }
  if (pergunta.length > 2000) {
    return NextResponse.json({ error: 'Pergunta muito longa (máx. 2000 caracteres)' }, { status: 400 })
  }

  // Limite diário: reseta a cada dia
  const hoje = hojeISO()
  if (user.iaDataUltima !== hoje) {
    await db.user.update({
      where: { id: user.id },
      data: { iaUsadasHoje: 0, iaDataUltima: hoje },
    })
    user.iaUsadasHoje = 0
    user.iaDataUltima = hoje
  }

  if (user.iaUsadasHoje >= user.iaLimiteDiario) {
    return NextResponse.json({
      error: `Você atingiu seu limite diário de ${user.iaLimiteDiario} perguntas à IA. Volte amanhã!`,
      limiteAtingido: true,
    }, { status: 429 })
  }

  // Marca 1 uso antes de chamar (evita abuso em chamadas concorrentes)
  await db.user.update({
    where: { id: user.id },
    data: { iaUsadasHoje: { increment: 1 } },
  })

  const mensagens: any[] = [
    { role: 'system', content: SYSTEM_PROMPT },
  ]
  if (Array.isArray(historico)) {
    for (const m of historico.slice(-10)) {
      if (m.role === 'user' || m.role === 'assistant') {
        mensagens.push({ role: m.role, content: String(m.content).slice(0, 2000) })
      }
    }
  }
  mensagens.push({ role: 'user', content: pergunta })

  try {
    const zai = await ZAI.create()
    const completion = await zai.chat.completions.create({
      messages: mensagens,
      thinking: { type: 'disabled' },
      temperature: 0.5,
      max_tokens: 1200,
    })

    const resposta = completion.choices[0]?.message?.content || 'Não consegui gerar uma resposta. Tente reformular sua pergunta.'

    return NextResponse.json({
      resposta,
      usosRestantes: Math.max(0, user.iaLimiteDiario - user.iaUsadasHoje - 1),
      limiteDiario: user.iaLimiteDiario,
    })
  } catch (err: any) {
    // Em caso de erro da IA, devolve o uso para o aluno
    await db.user.update({
      where: { id: user.id },
      data: { iaUsadasHoje: { decrement: 1 } },
    })
    console.error('Erro IA:', err?.message || err)
    return NextResponse.json({
      error: 'Não foi possível falar com a IA agora. Tente novamente em alguns segundos.',
      detalhe: process.env.NODE_ENV === 'development' ? String(err?.message || err) : undefined,
    }, { status: 502 })
  }
}
