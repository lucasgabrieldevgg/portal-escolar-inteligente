import { NextRequest, NextResponse } from 'next/server'
import { db, garantirBanco } from '@/lib/db'
import { requireUser } from '@/lib/auth'

// POST /api/tarefas/[id]/entregar -> aluno entrega tarefa
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  await garantirBanco()
  const user = await requireUser()
  if (user.role !== 'ALUNO') {
    return NextResponse.json({ error: 'Apenas alunos podem entregar tarefas' }, { status: 403 })
  }
  const { id } = await ctx.params
  const { conteudo } = await req.json()
  if (!conteudo || conteudo.trim().length < 10) {
    return NextResponse.json({ error: 'Conteúdo muito curto' }, { status: 400 })
  }

  const tarefa = await db.tarefa.findUnique({ where: { id } })
  if (!tarefa) return NextResponse.json({ error: 'Tarefa não encontrada' }, { status: 404 })

  const existente = await db.entrega.findFirst({
    where: { tarefaId: id, alunoId: user.id },
  })
  if (existente && existente.status === 'CORRIGIDA') {
    return NextResponse.json({ error: 'Tarefa já corrigida' }, { status: 400 })
  }

  if (existente) {
    const atualizada = await db.entrega.update({
      where: { id: existente.id },
      data: { conteudo, status: 'PENDENTE' },
    })
    return NextResponse.json({ entrega: atualizada })
  }

  const entrega = await db.entrega.create({
    data: { tarefaId: id, alunoId: user.id, conteudo },
  })
  return NextResponse.json({ entrega })
}
