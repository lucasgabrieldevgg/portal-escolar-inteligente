import { NextRequest, NextResponse } from 'next/server'
import { db, garantirBanco } from '@/lib/db'
import { requireRole } from '@/lib/auth'

// POST /api/badges/conceder -> coordenação/admin concede badge a um usuário
export async function POST(req: NextRequest) {
  await garantirBanco()
  const user = await requireRole(['COORDENACAO', 'ADMIN'])
  const { userId, badgeId } = await req.json()
  if (!userId || !badgeId) {
    return NextResponse.json({ error: 'userId e badgeId são obrigatórios' }, { status: 400 })
  }
  const badge = await db.badge.findUnique({ where: { id: badgeId } })
  if (!badge) return NextResponse.json({ error: 'Badge não encontrado' }, { status: 404 })
  const alvo = await db.user.findUnique({ where: { id: userId } })
  if (!alvo) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

  // Tenta criar; se já existe, retorna ok mesmo assim
  const existente = await db.userBadge.findUnique({
    where: { userId_badgeId: { userId, badgeId } },
  }).catch(() => null)
  if (!existente) {
    await db.userBadge.create({
      data: { userId, badgeId, concedidoPor: user.id },
    }).catch(() => null)
  }

  // Se a badge dá XP, concede
  if (badge.daXP && badge.xpRecompensa > 0 && !existente) {
    await db.$transaction([
      db.user.update({
        where: { id: userId },
        data: { xp: { increment: badge.xpRecompensa }, xpTotal: { increment: badge.xpRecompensa } },
      }),
      db.xPLog.create({
        data: {
          userId,
          quantidade: badge.xpRecompensa,
          motivo: `Badge: ${badge.nome}`,
          origem: 'BADGE',
        },
      }),
    ])
  }

  return NextResponse.json({ ok: true, jaTem: !!existente })
}
