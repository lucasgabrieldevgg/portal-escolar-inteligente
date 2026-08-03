import { NextRequest, NextResponse } from 'next/server'
import { db, garantirBanco } from '@/lib/db'
import { requireUser } from '@/lib/auth'

// GET /api/tarefas?turmaId=xxx -> tarefas de uma turma (ou todas as do usuário)
export async function GET(req: NextRequest) {
  await garantirBanco()
  const user = await requireUser()
  const { searchParams } = new URL(req.url)
  const turmaId = searchParams.get('turmaId')

  let where: any = {}
  if (user.role === 'ALUNO' && user.turmaId) {
    where.turmaId = user.turmaId
  } else if (user.role === 'PROFESSOR') {
    where.professorId = user.id
    if (turmaId) where.turmaId = turmaId
  } else if (turmaId) {
    where.turmaId = turmaId
  }

  const tarefas = await db.tarefa.findMany({
    where,
    include: {
      turma: true,
      professor: { select: { name: true } },
      _count: { select: { entregas: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ tarefas })
}

// POST /api/tarefas -> professor cria tarefa
export async function POST(req: NextRequest) {
  await garantirBanco()
  const user = await requireUser()
  if (user.role !== 'PROFESSOR' && user.role !== 'COORDENACAO' && user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }
  const { titulo, descricao, turmaId, xpRecompensa, prazo } = await req.json()
  if (!titulo || !descricao || !turmaId) {
    return NextResponse.json({ error: 'titulo, descricao e turmaId são obrigatórios' }, { status: 400 })
  }
  const tarefa = await db.tarefa.create({
    data: {
      titulo,
      descricao,
      turmaId,
      professorId: user.id,
      xpRecompensa: xpRecompensa || 50,
      prazo: prazo ? new Date(prazo) : null,
    },
    include: { turma: true, professor: { select: { name: true } } },
  })
  return NextResponse.json({ tarefa })
}
