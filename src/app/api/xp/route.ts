import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/auth'

// POST /api/xp/conceder -> professor ou coordenação dá XP manualmente
// body: { userId, quantidade, motivo }
export async function POST(req: NextRequest) {
  const user = await requireRole(['PROFESSOR', 'COORDENACAO', 'ADMIN'])
  const { userId, quantidade, motivo } = await req.json()
  if (!userId || !quantidade || !motivo) {
    return NextResponse.json({ error: 'userId, quantidade e motivo são obrigatórios' }, { status: 400 })
  }
  if (quantidade <= 0 || quantidade > 1000) {
    return NextResponse.json({ error: 'Quantidade inválida (1-1000)' }, { status: 400 })
  }

  const alvo = await db.user.findUnique({ where: { id: userId } })
  if (!alvo) return NextResponse.json({ error: 'Aluno não encontrado' }, { status: 404 })
  if (alvo.role !== 'ALUNO') {
    return NextResponse.json({ error: 'Só é possível dar XP para alunos' }, { status: 400 })
  }

  const [updated] = await db.$transaction([
    db.user.update({
      where: { id: userId },
      data: { xp: { increment: quantidade }, xpTotal: { increment: quantidade } },
    }),
    db.xPLog.create({
      data: {
        userId,
        quantidade,
        motivo,
        origem: 'MANUAL',
      },
    }),
  ])

  return NextResponse.json({ user: updated })
}
