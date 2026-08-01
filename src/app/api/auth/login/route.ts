import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createSession, SESSION_COOKIE } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  if (!email) {
    return NextResponse.json({ error: 'Email obrigatório' }, { status: 400 })
  }

  const user = await db.user.findUnique({
    where: { email },
    include: { turma: true },
  })
  if (!user) {
    return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
  }
  if (!user.ativo) {
    return NextResponse.json({ error: 'Conta desativada. Procure a coordenação.' }, { status: 403 })
  }

  const sessao = await createSession(user.id)
  const res = NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      turno: user.turno,
      turmaId: user.turmaId,
      turma: user.turma,
      xp: user.xp,
      xpTotal: user.xpTotal,
      iaUsadasHoje: user.iaUsadasHoje,
      iaLimiteDiario: user.iaLimiteDiario,
      sequenciaDias: user.sequenciaDias,
    },
  })
  res.cookies.set(SESSION_COOKIE, sessao.token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  })
  return res
}

export async function GET() {
  const users = await db.user.findMany({
    where: {
      OR: [
        { role: 'ALUNO' },
        { role: 'PROFESSOR' },
        { role: 'COORDENACAO' },
        { role: 'ADMIN' },
      ],
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      turno: true,
      turma: { select: { nome: true, ano: true } },
    },
    orderBy: [{ role: 'asc' }, { name: 'asc' }],
  })
  return NextResponse.json({ users })
}
