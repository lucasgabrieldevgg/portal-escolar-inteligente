import { NextRequest, NextResponse } from 'next/server'
import { db, garantirBanco } from '@/lib/db'
import { requireRole } from '@/lib/auth'

// POST /api/inscricoes/[id]/decidir -> coordenação decide
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  await garantirBanco()
  await requireRole(['COORDENACAO', 'ADMIN'])
  const { id } = await ctx.params
  const { status } = await req.json()
  if (!['ACEITO', 'RECUSADO', 'PERIODO_TESTE'].includes(status)) {
    return NextResponse.json({ error: 'Status inválido' }, { status: 400 })
  }
  const inscricao = await db.inscricaoDev.update({
    where: { id },
    data: { status, decididoEm: new Date() },
  })
  return NextResponse.json({ inscricao })
}
