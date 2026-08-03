import { NextRequest, NextResponse } from 'next/server'
import { db, garantirBanco } from '@/lib/db'
import { requireRole } from '@/lib/auth'

// POST /api/moedinhas/conceder -> coordenação/professor concede moedinhas a um aluno
export async function POST(req: NextRequest) {
  await garantirBanco()
  await requireRole(['PROFESSOR', 'COORDENACAO', 'ADMIN'])
  const { userId, quantidade, motivo } = await req.json()
  if (!userId || !quantidade || !motivo) {
    return NextResponse.json({ error: 'userId, quantidade e motivo são obrigatórios' }, { status: 400 })
  }
  if (quantidade <= 0 || quantidade > 1000) {
    return NextResponse.json({ error: 'Quantidade inválida (1-1000)' }, { status: 400 })
  }
  const alvo = await db.user.findUnique({ where: { id: userId } })
  if (!alvo) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

  const atualizado = await db.user.update({
    where: { id: userId },
    data: { moedinhas: { increment: quantidade } },
    select: { id: true, name: true, moedinhas: true },
  })
  return NextResponse.json({ user: atualizado })
}
