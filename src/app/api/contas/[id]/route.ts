import { NextRequest, NextResponse } from 'next/server'
import { db, garantirBanco } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import { hashSenha, gerarSenhaAleatoria } from '@/lib/senha'

// PATCH /api/contas/[id] -> edita conta (nome, role, turma, materias, ativo)
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  await garantirBanco()
  await requireRole(['COORDENACAO', 'ADMIN'])
  const { id } = await ctx.params
  const { name, role, turmaId, materias, ativo } = await req.json()

  const alvo = await db.user.findUnique({ where: { id } })
  if (!alvo) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

  const data: any = {}
  if (typeof name === 'string' && name.trim()) data.name = name.trim()
  if (role) {
    const rolesValidas = ['ALUNO', 'PROFESSOR', 'BIBLIOTECARIO', 'COORDENACAO', 'ADMIN']
    if (!rolesValidas.includes(role)) {
      return NextResponse.json({ error: 'Role inválido' }, { status: 400 })
    }
    data.role = role
    if (role === 'ALUNO') {
      if (!turmaId) return NextResponse.json({ error: 'Aluno precisa de turma' }, { status: 400 })
      const turma = await db.turma.findUnique({ where: { id: turmaId } })
      if (!turma) return NextResponse.json({ error: 'Turma inválida' }, { status: 400 })
      data.turmaId = turmaId
      data.turno = turma.turno
    } else {
      data.turmaId = null
      data.turno = null
    }
  }
  if (materias !== undefined) {
    data.materias = materias ? JSON.stringify(materias) : null
  }
  if (typeof ativo === 'boolean') data.ativo = ativo

  const atualizado = await db.user.update({
    where: { id },
    data,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      turno: true,
      ativo: true,
      materias: true,
      turma: { select: { nome: true, ano: true } },
    },
  })
  return NextResponse.json({ user: atualizado })
}

// POST /api/contas/[id]/reset-senha -> reseta senha
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  await garantirBanco()
  await requireRole(['COORDENACAO', 'ADMIN'])
  const { id } = await ctx.params
  const { senha } = await req.json()
  const alvo = await db.user.findUnique({ where: { id } })
  if (!alvo) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

  const novaSenha = typeof senha === 'string' && senha.length >= 4 ? senha : gerarSenhaAleatoria()
  await db.user.update({
    where: { id },
    data: { senhaHash: hashSenha(novaSenha) },
  })
  return NextResponse.json({ senhaGerada: typeof senha === 'string' && senha.length >= 4 ? null : novaSenha })
}

// DELETE /api/contas/[id] -> desativa a conta (não exclui fisicamente)
export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  await garantirBanco()
  const user = await requireRole(['COORDENACAO', 'ADMIN'])
  const { id } = await ctx.params
  if (id === user.id) {
    return NextResponse.json({ error: 'Você não pode desativar a própria conta' }, { status: 400 })
  }
  const alvo = await db.user.findUnique({ where: { id } })
  if (!alvo) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

  // Apenas desativa (soft delete)
  await db.user.update({ where: { id }, data: { ativo: false } })
  // Encerra sessões ativas
  await db.sessao.deleteMany({ where: { userId: id } })
  return NextResponse.json({ ok: true })
}
