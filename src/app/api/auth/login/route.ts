import { NextRequest, NextResponse } from 'next/server'
import { db, garantirBanco } from '@/lib/db'
import { createSession, SESSION_COOKIE, hojeISO } from '@/lib/auth'
import { verificarSenha } from '@/lib/senha'

export async function POST(req: NextRequest) {
  await garantirBanco()
  const { email, senha } = await req.json()
  if (!email || !senha) return NextResponse.json({ error: 'Email e senha são obrigatórios' }, { status: 400 })

  const user = await db.user.findUnique({ where: { email: email.toLowerCase().trim() }, include: { turma: true } })
  if (!user || !user.ativo) return NextResponse.json({ error: 'Email ou senha incorretos' }, { status: 404 })
  if (!verificarSenha(senha, user.senhaHash)) return NextResponse.json({ error: 'Email ou senha incorretos' }, { status: 404 })

  const manutencao = await db.setting.findUnique({ where: { chave: 'manutencao_ativa' } })
  if (manutencao?.valor === 'true' && user.role !== 'COORDENACAO' && user.role !== 'ADMIN') {
    const msg = await db.setting.findUnique({ where: { chave: 'manutencao_mensagem' } })
    return NextResponse.json({ error: msg?.valor || 'Portal em manutenção', manutencao: true }, { status: 503 })
  }

  const hoje = hojeISO()
  if (user.iaDataUltima !== hoje) {
    const ontem = new Date(); ontem.setDate(ontem.getDate()-1)
    const ontemStr = `${ontem.getFullYear()}-${String(ontem.getMonth()+1).padStart(2,'0')}-${String(ontem.getDate()).padStart(2,'0')}`
    const novaSeq = user.iaDataUltima === ontemStr ? user.sequenciaDias+1 : 1
    await db.user.update({ where: { id: user.id }, data: { iaUsadasHoje: 0, iaDataUltima: hoje, sequenciaDias: novaSeq } })
    user.sequenciaDias = novaSeq; user.iaUsadasHoje = 0
  }

  const sessao = await createSession(user.id)
  const res = NextResponse.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role, turno: user.turno, turmaId: user.turmaId, turma: user.turma, xp: user.xp, xpTotal: user.xpTotal, moedinhas: user.moedinhas, iaUsadasHoje: user.iaUsadasHoje, iaLimiteDiario: user.iaLimiteDiario, sequenciaDias: user.sequenciaDias, avatarConfig: user.avatarConfig } })
  res.cookies.set(SESSION_COOKIE, sessao.token, { httpOnly: true, sameSite: 'lax', maxAge: 7*24*60*60, path: '/' })
  return res
}

export async function GET() {
  await garantirBanco()
  const users = await db.user.findMany({ where: { ativo: true }, select: { id: true, email: true, name: true, role: true, turno: true, turma: { select: { nome: true, ano: true } } }, orderBy: [{ role: 'asc' }, { name: 'asc' }] })
  const equipe = users.filter(u => u.role !== 'ALUNO')
  const luke = users.find(u => u.email === 'luke.silva@portal.escola.br')
  const outros = users.filter(u => u.role === 'ALUNO' && u.email !== 'luke.silva@portal.escola.br').slice(0, 3)
  const ordem: Record<string, number> = { ADMIN: 0, COORDENACAO: 1, BIBLIOTECARIO: 2, PROFESSOR: 3 }
  equipe.sort((a, b) => (ordem[a.role] ?? 99) - (ordem[b.role] ?? 99))
  return NextResponse.json({ users: [...equipe, ...(luke ? [luke, ...outros] : outros)] })
}
