import { NextRequest, NextResponse } from 'next/server'
import { db, garantirBanco } from '@/lib/db'
import { requireUser } from '@/lib/auth'

// POST /api/avatar -> atualiza avatar do usuário logado
export async function POST(req: NextRequest) {
  await garantirBanco()
  const user = await requireUser()
  const { avatarConfig } = await req.json()
  if (!avatarConfig || typeof avatarConfig !== 'string') {
    return NextResponse.json({ error: 'avatarConfig obrigatório (string JSON)' }, { status: 400 })
  }
  // Valida se é JSON válido
  try {
    JSON.parse(avatarConfig)
  } catch {
    return NextResponse.json({ error: 'avatarConfig deve ser JSON válido' }, { status: 400 })
  }
  await db.user.update({
    where: { id: user.id },
    data: { avatarConfig },
  })
  return NextResponse.json({ ok: true })
}
