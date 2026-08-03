import { NextRequest, NextResponse } from 'next/server'
import { db, garantirBanco } from '@/lib/db'
import { requireUser } from '@/lib/auth'

// POST /api/loja/comprar -> compra uma skin com moedinhas
export async function POST(req: NextRequest) {
  await garantirBanco()
  const user = await requireUser()
  const { skinId } = await req.json()
  if (!skinId) return NextResponse.json({ error: 'skinId obrigatório' }, { status: 400 })

  const skin = await db.skin.findUnique({ where: { id: skinId } })
  if (!skin || !skin.ativa) {
    return NextResponse.json({ error: 'Skin indisponível' }, { status: 404 })
  }

  // Já comprou?
  const jaTem = await db.userSkin.findUnique({
    where: { userId_skinId: { userId: user.id, skinId: skin.id } },
  }).catch(() => null)
  if (jaTem) {
    return NextResponse.json({ error: 'Você já possui esta skin' }, { status: 400 })
  }

  if (user.moedinhas < skin.preco) {
    return NextResponse.json({ error: `Moedinhas insuficientes (precisa de ${skin.preco}, você tem ${user.moedinhas})` }, { status: 400 })
  }

  await db.$transaction([
    db.user.update({
      where: { id: user.id },
      data: { moedinhas: { decrement: skin.preco } },
    }),
    db.userSkin.create({
      data: { userId: user.id, skinId: skin.id },
    }),
  ])

  return NextResponse.json({ ok: true, moedinhas: user.moedinhas - skin.preco, skin })
}
