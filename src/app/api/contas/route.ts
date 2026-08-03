import { NextRequest, NextResponse } from 'next/server'
import { db, garantirBanco } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import { hashSenha, gerarSenhaAleatoria } from '@/lib/senha'

// GET /api/contas -> lista todas as contas (coordenação/admin)
export async function GET() {
  await garantirBanco()
  await requireRole(['COORDENACAO', 'ADMIN'])
  const users = await db.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      turno: true,
      materias: true,
      ativo: true,
      xp: true,
      moedinhas: true,
      turma: { select: { id: true, nome: true, ano: true } },
      createdAt: true,
    },
    orderBy: [{ role: 'asc' }, { name: 'asc' }],
  })
  return NextResponse.json({ users })
}

// POST /api/contas -> cria nova conta
export async function POST(req: NextRequest) {
  await garantirBanco()
  const user = await requireRole(['COORDENACAO', 'ADMIN'])
  const { name, email, role, turmaId, turno, materias, senha } = await req.json()
  if (!name || !email || !role) {
    return NextResponse.json({ error: 'Nome, email e role são obrigatórios' }, { status: 400 })
  }
  const rolesValidas = ['ALUNO', 'PROFESSOR', 'BIBLIOTECARIO', 'COORDENACAO', 'ADMIN']
  if (!rolesValidas.includes(role)) {
    return NextResponse.json({ error: 'Role inválido' }, { status: 400 })
  }
  const emailNorm = String(email).toLowerCase().trim()
  const existente = await db.user.findUnique({ where: { email: emailNorm } })
  if (existente) {
    return NextResponse.json({ error: 'Já existe conta com este email' }, { status: 400 })
  }

  // Se aluno, turmaId é obrigatório e turno vem da turma
  let turnoFinal: string | null = turno || null
  if (role === 'ALUNO') {
    if (!turmaId) {
      return NextResponse.json({ error: 'Aluno precisa de turma' }, { status: 400 })
    }
    const turma = await db.turma.findUnique({ where: { id: turmaId } })
    if (!turma) {
      return NextResponse.json({ error: 'Turma inválida' }, { status: 400 })
    }
    turnoFinal = turma.turno
  }

  const senhaFinal = senha || gerarSenhaAleatoria()
  const novo = await db.user.create({
    data: {
      email: emailNorm,
      senhaHash: hashSenha(senhaFinal),
      name,
      role,
      turno: turnoFinal,
      turmaId: role === 'ALUNO' ? turmaId : null,
      materias: materias ? JSON.stringify(materias) : null,
      criadoPorId: user.id,
      moedinhas: role === 'ALUNO' ? 50 : role === 'ADMIN' ? 1000 : role === 'COORDENACAO' ? 500 : 200,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      turno: true,
      turma: { select: { nome: true, ano: true } },
    },
  })
  return NextResponse.json({ user: novo, senhaGerada: senha ? null : senhaFinal })
}
