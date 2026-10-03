import { NextRequest, NextResponse } from 'next/server'
import { db, garantirBanco } from '@/lib/db'
import { requireRole } from '@/lib/auth'

// POST /api/resumos-biblioteca/[id]/validar -> bibliotecária valida resumo e concede XP/moedinhas
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  await garantirBanco()
  const user = await requireRole(['BIBLIOTECARIO', 'COORDENACAO', 'ADMIN'])
  const { id } = await ctx.params
  const { status, xpRecompensa, moedinhasRecompensa, feedback } = await req.json()
  if (!['VALIDADO', 'RECUSADO'].includes(status)) {
    return NextResponse.json({ error: 'Status inválido' }, { status: 400 })
  }

  const resumo = await db.resumoBiblioteca.findUnique({ where: { id }, include: { aluno: true } })
  if (!resumo) return NextResponse.json({ error: 'Resumo não encontrado' }, { status: 404 })
  if (resumo.status !== 'PENDENTE') {
    return NextResponse.json({ error: 'Resumo já foi avaliado' }, { status: 400 })
  }

  const xp = status === 'VALIDADO' ? (Number(xpRecompensa) || resumo.xpRecompensa) : 0
  const moedinhas = status === 'VALIDADO' ? (Number(moedinhasRecompensa) || resumo.moedinhasRecompensa) : 0

  await db.$transaction(async (tx) => {
    await tx.resumoBiblioteca.update({
      where: { id },
      data: {
        status,
        xpRecompensa: xp,
        moedinhasRecompensa: moedinhas,
        feedback: feedback || null,
        validadoPorId: user.id,
        validadoEm: new Date(),
      },
    })
    if (xp > 0 || moedinhas > 0) {
      await tx.user.update({
        where: { id: resumo.alunoId },
        data: {
          xp: { increment: xp },
          xpTotal: { increment: xp },
          moedinhas: { increment: moedinhas },
        },
      })
      if (xp > 0) {
        await tx.xPLog.create({
          data: {
            userId: resumo.alunoId,
            quantidade: xp,
            motivo: `Resumo do livro: ${resumo.livroTitulo}`,
            origem: 'BIBLIOTECA',
          },
        })
      }
    }
  })

  return NextResponse.json({ ok: true, xpConcedido: xp, moedinhasConcedidas: moedinhas })
}
