import { NextRequest, NextResponse } from 'next/server'
import { db, garantirBanco } from '@/lib/db'
import { requireUser, requireRole } from '@/lib/auth'
import ZAI from 'z-ai-web-dev-sdk'

// GET /api/inscricoes -> lista inscrições (coordenação) ou a minha (aluno)
export async function GET() {
  await garantirBanco()
  const user = await requireUser()
  const where = user.role === 'ALUNO' ? { userId: user.id } : {}
  const inscricoes = await db.inscricaoDev.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, turma: { select: { nome: true, ano: true } }, turno: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ inscricoes })
}

// POST /api/inscricoes -> aluno se inscreve
export async function POST(req: NextRequest) {
  await garantirBanco()
  const user = await requireUser()
  if (user.role !== 'ALUNO') {
    return NextResponse.json({ error: 'Apenas alunos podem se inscrever' }, { status: 403 })
  }
  const { area, experiencia, motivo } = await req.json()
  if (!area || !motivo) {
    return NextResponse.json({ error: 'Área e motivo são obrigatórios' }, { status: 400 })
  }

  const existente = await db.inscricaoDev.findFirst({
    where: { userId: user.id, status: { in: ['PENDENTE', 'EM_ANALISE', 'PERIODO_TESTE'] } },
  })
  if (existente) {
    return NextResponse.json({ error: 'Você já tem uma inscrição em andamento' }, { status: 400 })
  }

  // Análise inicial por IA: resume e dá um score 0-100
  let analiseIA: string | undefined
  let scoreIA: number | undefined
  try {
    const zai = await ZAI.create()
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'Você é um avaliador de inscrições para equipe de desenvolvimento de um portal escolar. Analise a inscrição do aluno e retorne APENAS um JSON válido no formato: {"resumo": "string com 2-3 frases", "score": número 0-100, "pontosFortes": ["string"], "pontosAtencao": ["string"]}. Considere: clareza do motivo, experiência prévela (mesmo que seja só curiosidade), e alinhamento da área com o perfil.',
        },
        {
          role: 'user',
          content: `Nome: ${user.name}\nÁrea: ${area}\nExperiência: ${experiencia || 'não informada'}\nMotivo: ${motivo}`,
        },
      ],
      thinking: { type: 'disabled' },
      temperature: 0.3,
      max_tokens: 600,
    })
    const texto = completion.choices[0]?.message?.content || ''
    const match = texto.match(/\{[\s\S]*\}/)
    if (match) {
      const parsed = JSON.parse(match[0])
      analiseIA = parsed.resumo
      scoreIA = typeof parsed.score === 'number' ? Math.max(0, Math.min(100, Math.round(parsed.score))) : undefined
    }
  } catch (err) {
    console.error('Erro análise IA inscrição:', err)
  }

  const inscricao = await db.inscricaoDev.create({
    data: {
      userId: user.id,
      area,
      experiencia: experiencia || null,
      motivo,
      analiseIA,
      scoreIA,
      status: 'PENDENTE',
    },
  })
  return NextResponse.json({ inscricao })
}
