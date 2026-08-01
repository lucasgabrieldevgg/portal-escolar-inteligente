import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth'

// POST /api/entregas/[id]/corrigir -> professor corrige e dá XP
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireUser()
  if (user.role !== 'PROFESSOR' && user.role !== 'COORDENACAO' && user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }
  const { id } = await ctx.params
  const { status, feedback, xpConcedido } = await req.json()

  if (!['CORRIGIDA', 'RECUSADA'].includes(status)) {
    return NextResponse.json({ error: 'Status inválido' }, { status: 400 })
  }

  const entrega = await db.entrega.findUnique({
    where: { id },
    include: { tarefa: true, aluno: true },
  })
  if (!entrega) return NextResponse.json({ error: 'Entrega não encontrada' }, { status: 404 })
  if (entrega.status === 'CORRIGIDA') {
    return NextResponse.json({ error: 'Entrega já foi corrigida' }, { status: 400 })
  }

  const xp = status === 'CORRIGIDA' ? (xpConcedido ?? entrega.tarefa.xpRecompensa) : 0

  await db.$transaction([
    db.entrega.update({
      where: { id },
      data: {
        status,
        feedback,
        xpConcedido: xp,
        corretorId: user.id,
        corrigidoEm: new Date(),
      },
    }),
    ...(xp > 0 ? [
      db.user.update({
        where: { id: entrega.alunoId },
        data: { xp: { increment: xp }, xpTotal: { increment: xp } },
      }),
      db.xPLog.create({
        data: {
          userId: entrega.alunoId,
          quantidade: xp,
          motivo: `Tarefa: ${entrega.tarefa.titulo}`,
          origem: 'TAREFA',
        },
      }),
    ] : []),
  ])

  return NextResponse.json({ ok: true, xpConcedido: xp })
}
