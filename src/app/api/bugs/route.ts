import { NextRequest, NextResponse } from 'next/server'
import { db, garantirBanco } from '@/lib/db'
import { requireUser } from '@/lib/auth'

// GET /api/bugs -> lista bugs reportados
export async function GET() {
  await garantirBanco()
  const user = await requireUser()
  const where = user.role === 'ALUNO' ? { userId: user.id } : {}
  const bugs = await db.bugReport.findMany({
    where,
    include: { user: { select: { id: true, name: true, turma: { select: { nome: true } } } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ bugs })
}

// POST /api/bugs -> aluno reporta bug
export async function POST(req: NextRequest) {
  await garantirBanco()
  const user = await requireUser()
  const { local, acao, ocorreu, esperado, categoria } = await req.json()
  if (!local || !acao || !ocorreu || !esperado) {
    return NextResponse.json({ error: 'Todos os campos são obrigatórios' }, { status: 400 })
  }
  const bug = await db.bugReport.create({
    data: {
      userId: user.id,
      local,
      acao,
      ocorreu,
      esperado,
      categoria: categoria || 'SUGESTAO',
    },
    include: { user: { select: { name: true, turma: { select: { nome: true } } } } },
  })
  return NextResponse.json({ bug })
}
