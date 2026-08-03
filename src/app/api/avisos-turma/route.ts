import { NextRequest, NextResponse } from 'next/server'
import { db, garantirBanco } from '@/lib/db'
import { requireUser } from '@/lib/auth'

// GET /api/avisos-turma -> retorna avisos de turma do aluno (ou do professor: ?turmaId=xxx)
export async function GET(req: NextRequest) {
  await garantirBanco()
  const user = await requireUser()
  const { searchParams } = new URL(req.url)
  let turmaId: string | undefined
  if (user.role === 'ALUNO' && user.turmaId) {
    turmaId = user.turmaId
  } else if (user.role === 'PROFESSOR') {
    turmaId = searchParams.get('turmaId') || undefined
  } else if (user.role === 'COORDENACAO' || user.role === 'ADMIN') {
    turmaId = searchParams.get('turmaId') || undefined
  }
  const where: any = turmaId ? { turmaId } : {}
  const avisos = await db.avisoTurma.findMany({
    where,
    include: {
      turma: { select: { nome: true, ano: true } },
      professor: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ avisos })
}

// POST /api/avisos-turma -> professor publica aviso para sua turma
export async function POST(req: NextRequest) {
  await garantirBanco()
  const user = await requireUser()
  if (user.role !== 'PROFESSOR' && user.role !== 'COORDENACAO' && user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }
  const { titulo, conteudo, turmaId } = await req.json()
  if (!titulo || !conteudo || !turmaId) {
    return NextResponse.json({ error: 'titulo, conteudo e turmaId obrigatórios' }, { status: 400 })
  }
  const turma = await db.turma.findUnique({ where: { id: turmaId } })
  if (!turma) return NextResponse.json({ error: 'Turma inválida' }, { status: 400 })

  const aviso = await db.avisoTurma.create({
    data: { titulo, conteudo, turmaId, professorId: user.id },
    include: {
      turma: { select: { nome: true, ano: true } },
      professor: { select: { name: true } },
    },
  })
  return NextResponse.json({ aviso })
}
