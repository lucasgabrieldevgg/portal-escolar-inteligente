import { NextResponse } from 'next/server'
import { db, garantirBanco } from '@/lib/db'
import { requireUser } from '@/lib/auth'

// GET /api/loja/skins -> lista skins + indica quais o usuário comprou
export async function GET() {
  await garantirBanco()
  const user = await requireUser()
  const [skins, minhas] = await Promise.all([
    db.skin.findMany({
      where: { ativa: true },
      orderBy: [{ raridade: 'asc' }, { preco: 'asc' }],
    }),
    db.userSkin.findMany({
      where: { userId: user.id },
      select: { skinId: true },
    }),
  ])
  const setMinhas = new Set(minhas.map((m) => m.skinId))
  return NextResponse.json({
    skins: skins.map((s) => ({ ...s, comprado: setMinhas.has(s.id) })),
    moedinhas: user.moedinhas,
  })
}
