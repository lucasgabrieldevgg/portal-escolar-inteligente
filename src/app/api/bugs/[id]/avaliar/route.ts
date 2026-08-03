import { NextRequest, NextResponse } from 'next/server'
import { db, garantirBanco } from '@/lib/db'
import { requireRole } from '@/lib/auth'

// POST /api/bugs/[id]/avaliar -> coordenação avalia bug e concede XP
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  await garantirBanco()
  const user = await requireRole(['COORDENACAO', 'ADMIN'])
  const { id } = await ctx.params
  const { categoria, status } = await req.json()

  const bug = await db.bugReport.findUnique({ where: { id } })
  if (!bug) return NextResponse.json({ error: 'Bug não encontrado' }, { status: 404 })

  const RECOMPENSAS: Record<string, number> = {
    CRITICO: 150,
    NORMAL: 80,
    SUGESTAO: 30,
    INVALIDO: 0,
  }
  const xp = RECOMPENSAS[categoria] ?? 0

  await db.$transaction(async (tx) => {
    await tx.bugReport.update({
      where: { id },
      data: {
        categoria,
        status,
        recompensaXP: xp,
        resolvidoEm: new Date(),
      },
    })
    if (xp > 0 && status === 'ACEITO') {
      await tx.user.update({
        where: { id: bug.userId },
        data: { xp: { increment: xp }, xpTotal: { increment: xp } },
      })
      await tx.xPLog.create({
        data: {
          userId: bug.userId,
          quantidade: xp,
          motivo: `Bug reportado: ${bug.local}`,
          origem: 'BUG',
        },
      })
      // Concede badge "Caçador de Bugs" se ainda não tem
      const badge = await tx.badge.findUnique({ where: { nome: 'Caçador de Bugs' } })
      if (badge) {
        const jaTem = await tx.userBadge.findUnique({
          where: { userId_badgeId: { userId: bug.userId, badgeId: badge.id } },
        }).catch(() => null)
        if (!jaTem) {
          await tx.userBadge.create({
            data: { userId: bug.userId, badgeId: badge.id },
          }).catch(() => null)
        }
      }
    }
  })

  return NextResponse.json({ ok: true, xpConcedido: xp })
}
