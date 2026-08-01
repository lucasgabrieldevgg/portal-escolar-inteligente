import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth'

// GET /api/ranking?tipo=global|turno|turma&turno=MANHA&turmaId=xxx&limite=50
export async function GET(req: NextRequest) {
  const user = await requireUser()
  const { searchParams } = new URL(req.url)
  const tipo = searchParams.get('tipo') || 'global'
  const limite = Math.min(parseInt(searchParams.get('limite') || '50'), 200)

  const where: any = { role: 'ALUNO', ativo: true }
  if (tipo === 'turno') {
    where.turno = searchParams.get('turno') || user.turno
  } else if (tipo === 'turma') {
    where.turmaId = searchParams.get('turmaId') || user.turmaId
  }

  const alunos = await db.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      xp: true,
      xpTotal: true,
      turma: { select: { nome: true, ano: true } },
      turno: true,
      userBadges: { include: { badge: { select: { icone: true, raridade: true } } } },
    },
    orderBy: [{ xp: 'desc' }, { name: 'asc' }],
    take: limite,
  })

  const ranking = alunos.map((a, i) => ({
    posicao: i + 1,
    ...a,
    isMe: a.id === user.id,
  }))

  return NextResponse.json({ ranking, total: alunos.length })
}
