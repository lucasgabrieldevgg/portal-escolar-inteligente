import { NextRequest, NextResponse } from 'next/server'
import { db, garantirBanco } from '@/lib/db'
import { requireUser } from '@/lib/auth'

// GET /api/entregas?tarefaId=xxx -> lista entregas de uma tarefa (professor)
export async function GET(req: NextRequest) {
  await garantirBanco()
  const user = await requireUser()
  if (user.role !== 'PROFESSOR' && user.role !== 'COORDENACAO' && user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }
  const { searchParams } = new URL(req.url)
  const tarefaId = searchParams.get('tarefaId')
  const where: any = {}
  if (tarefaId) where.tarefaId = tarefaId

  const entregas = await db.entrega.findMany({
    where,
    include: {
      aluno: { select: { id: true, name: true, turma: { select: { nome: true } } } },
      tarefa: { select: { titulo: true, xpRecompensa: true } },
      corretor: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ entregas })
}
