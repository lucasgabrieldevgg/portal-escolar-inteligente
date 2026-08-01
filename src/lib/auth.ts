import { cookies } from 'next/headers'
import { db } from '@/lib/db'

export const SESSION_COOKIE = 'portal_session'

export async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null

  const sessao = await db.sessao.findUnique({
    where: { token },
    include: { user: { include: { turma: true } } },
  })
  if (!sessao) return null
  if (sessao.expiresAt < new Date()) return null

  return sessao
}

export async function requireUser() {
  const sessao = await getSession()
  if (!sessao) throw new Error('Não autenticado')
  return sessao.user
}

export async function requireRole(roles: string[]) {
  const user = await requireUser()
  if (!roles.includes(user.role)) throw new Error('Sem permissão')
  return user
}

export async function createSession(userId: string) {
  const token = crypto.randomUUID() + '-' + crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const sessao = await db.sessao.create({
    data: { token, userId, expiresAt },
  })
  return sessao
}

export async function destroySession(token: string) {
  await db.sessao.deleteMany({ where: { token } })
}

export function hojeISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
