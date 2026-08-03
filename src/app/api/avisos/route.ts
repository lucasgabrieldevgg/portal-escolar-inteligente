import { NextRequest, NextResponse } from 'next/server'
import { db, garantirBanco } from '@/lib/db'
import { requireRole } from '@/lib/auth'

export async function GET() {
  await garantirBanco()
  const avisos = await db.aviso.findMany({
    include: { autor: { select: { name: true, role: true } } },
    orderBy: [{ destaque: 'desc' }, { createdAt: 'desc' }],
  })
  return NextResponse.json({ avisos })
}

export async function POST(req: NextRequest) {
  await garantirBanco()
  const user = await requireRole(['COORDENACAO', 'ADMIN'])
  const { titulo, conteudo, categoria, destaque } = await req.json()
  if (!titulo || !conteudo) {
    return NextResponse.json({ error: 'Título e conteúdo obrigatórios' }, { status: 400 })
  }
  const aviso = await db.aviso.create({
    data: {
      titulo,
      conteudo,
      categoria: categoria || 'GERAL',
      destaque: !!destaque,
      autorId: user.id,
    },
    include: { autor: { select: { name: true, role: true } } },
  })
  return NextResponse.json({ aviso })
}

export async function DELETE(req: NextRequest) {
  await garantirBanco()
  await requireRole(['COORDENACAO', 'ADMIN'])
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 })
  await db.aviso.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
