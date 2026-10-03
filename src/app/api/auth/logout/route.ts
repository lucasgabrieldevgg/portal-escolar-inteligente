import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db, garantirBanco } from '@/lib/db'
import { SESSION_COOKIE, destroySession, getSession } from '@/lib/auth'

export async function POST() {
  await garantirBanco()
  const sessao = await getSession()
  if (sessao) {
    await destroySession(sessao.token)
  }
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
  return NextResponse.json({ ok: true })
}
