import { NextResponse } from 'next/server'
import { db, garantirBanco } from '@/lib/db'

export async function GET() {
  await garantirBanco()
  const turmas = await db.turma.findMany({
    include: { _count: { select: { alunos: true } } },
    orderBy: [{ turno: 'asc' }, { nome: 'asc' }],
  })
  return NextResponse.json({ turmas })
}
