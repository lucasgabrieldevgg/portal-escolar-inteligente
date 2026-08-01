import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth'

// GET /api/alunos?turmaId=xxx -> lista alunos de uma turma (professor/coordenação)
export async function GET(req: NextRequest) {
  const user = await requireUser()
  if (user.role !== 'PROFESSOR' && user.role !== 'COORDENACAO' && user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }
  const { searchParams } = new URL(req.url)
  const turmaId = searchParams.get('turmaId')
  if (!turmaId) return NextResponse.json({ error: 'turmaId obrigatório' }, { status: 400 })

  const alunos = await db.user.findMany({
    where: { role: 'ALUNO', turmaId },
    select: {
      id: true,
      name: true,
      email: true,
      xp: true,
      xpTotal: true,
      turno: true,
      turma: { select: { nome: true, ano: true } },
      _count: { select: { userBadges: true } },
    },
    orderBy: { xp: 'desc' },
  })
  return NextResponse.json({ alunos })
}
