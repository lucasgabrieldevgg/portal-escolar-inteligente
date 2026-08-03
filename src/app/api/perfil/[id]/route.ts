import { NextRequest, NextResponse } from 'next/server'
import { db, garantirBanco } from '@/lib/db'
import { requireUser } from '@/lib/auth'

// GET /api/perfil/[id] -> perfil público de qualquer usuário
export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  await garantirBanco()
  const eu = await requireUser()
  const { id } = await ctx.params
  const user = await db.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      role: true,
      turno: true,
      turma: { select: { nome: true, ano: true } },
      avatarConfig: true,
      xp: true,
      xpTotal: true,
      moedinhas: id === eu.id, // só vejo minhas moedinhas
      sequenciaDias: true,
      createdAt: true,
      userBadges: { include: { badge: true } },
    },
  })
  if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
  return NextResponse.json({ user })
}
