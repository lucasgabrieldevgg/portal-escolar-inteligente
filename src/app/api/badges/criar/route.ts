import { NextRequest, NextResponse } from 'next/server'
import { db, garantirBanco } from '@/lib/db'
import { requireRole } from '@/lib/auth'

// POST /api/badges/criar -> coordenação/admin cria nova badge
export async function POST(req: NextRequest) {
  await garantirBanco()
  await requireRole(['COORDENACAO', 'ADMIN'])
  const { nome, descricao, icone, raridade, tipo, daXP, xpRecompensa, apenasAdmin, automatica } = await req.json()
  if (!nome || !descricao || !icone) {
    return NextResponse.json({ error: 'nome, descricao e icone são obrigatórios' }, { status: 400 })
  }
  const existente = await db.badge.findUnique({ where: { nome } })
  if (existente) {
    return NextResponse.json({ error: 'Já existe badge com este nome' }, { status: 400 })
  }
  const badge = await db.badge.create({
    data: {
      nome,
      descricao,
      icone,
      raridade: raridade || 'COMUM',
      tipo: tipo || 'ESPECIAL',
      daXP: !!daXP,
      xpRecompensa: Number(xpRecompensa) || 0,
      apenasAdmin: !!apenasAdmin,
      automatica: !!automatica,
    },
  })
  return NextResponse.json({ badge })
}
