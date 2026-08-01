import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession, hojeISO } from '@/lib/auth'

export async function GET() {
  const sessao = await getSession()
  if (!sessao) return NextResponse.json({ user: null })

  const hoje = hojeISO()
  if (sessao.user.iaDataUltima !== hoje) {
    await db.user.update({
      where: { id: sessao.user.id },
      data: { iaUsadasHoje: 0, iaDataUltima: hoje },
    })
    sessao.user.iaUsadasHoje = 0
  }

  const user = await db.user.findUnique({
    where: { id: sessao.user.id },
    include: {
      turma: true,
      userBadges: { include: { badge: true } },
    },
  })
  if (!user) return NextResponse.json({ user: null })

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      turno: user.turno,
      turmaId: user.turmaId,
      turma: user.turma,
      xp: user.xp,
      xpTotal: user.xpTotal,
      iaUsadasHoje: user.iaUsadasHoje,
      iaLimiteDiario: user.iaLimiteDiario,
      sequenciaDias: user.sequenciaDias,
    },
    badges: user.userBadges.map((ub) => ub.badge),
  })
}
