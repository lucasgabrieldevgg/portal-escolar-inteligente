import { NextRequest, NextResponse } from 'next/server'
import { db, garantirBanco } from '@/lib/db'
import { requireUser, requireRole } from '@/lib/auth'

// GET /api/resumos-biblioteca -> lista resumos (aluno vê só os seus, bibliotecária vê todos)
export async function GET() {
  await garantirBanco()
  const user = await requireUser()
  const where = user.role === 'ALUNO' ? { alunoId: user.id } : {}
  const resumos = await db.resumoBiblioteca.findMany({
    where,
    include: {
      aluno: { select: { id: true, name: true, turma: { select: { nome: true, ano: true } } } },
      validadoPor: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ resumos })
}

// POST /api/resumos-biblioteca -> aluno envia resumo
export async function POST(req: NextRequest) {
  await garantirBanco()
  const user = await requireUser()
  if (user.role !== 'ALUNO') {
    return NextResponse.json({ error: 'Apenas alunos enviam resumos' }, { status: 403 })
  }
  const { livroTitulo, livroAutor, resumo } = await req.json()
  if (!livroTitulo || !resumo || resumo.trim().length < 50) {
    return NextResponse.json({ error: 'Título do livro e resumo (mín. 50 caracteres) são obrigatórios' }, { status: 400 })
  }
  const criado = await db.resumoBiblioteca.create({
    data: {
      alunoId: user.id,
      livroTitulo,
      livroAutor: livroAutor || null,
      resumo: resumo.trim(),
    },
  })
  return NextResponse.json({ resumo: criado })
}
