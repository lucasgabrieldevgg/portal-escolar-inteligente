import { NextRequest, NextResponse } from 'next/server'
import { db, garantirBanco } from '@/lib/db'
import { requireRole } from '@/lib/auth'

// GET /api/settings -> retorna status de manutenção + mensagem + domínio de email
export async function GET() {
  await garantirBanco()
  const [manut, msg, dominio] = await Promise.all([
    db.setting.findUnique({ where: { chave: 'manutencao_ativa' } }),
    db.setting.findUnique({ where: { chave: 'manutencao_mensagem' } }),
    db.setting.findUnique({ where: { chave: 'dominio_email' } }),
  ])
  return NextResponse.json({
    manutencao: manut?.valor === 'true',
    mensagem: msg?.valor || '',
    dominioEmail: dominio?.valor || 'portal.escola.br',
  })
}

// POST /api/settings -> atualiza (coordenação/admin apenas)
export async function POST(req: NextRequest) {
  await garantirBanco()
  await requireRole(['COORDENACAO', 'ADMIN'])
  const { manutencao, mensagem, dominioEmail } = await req.json()

  if (typeof manutencao === 'boolean') {
    await db.setting.upsert({
      where: { chave: 'manutencao_ativa' },
      update: { valor: String(manutencao) },
      create: { chave: 'manutencao_ativa', valor: String(manutencao) },
    })
  }
  if (typeof mensagem === 'string') {
    await db.setting.upsert({
      where: { chave: 'manutencao_mensagem' },
      update: { valor: mensagem },
      create: { chave: 'manutencao_mensagem', valor: mensagem },
    })
  }
  if (typeof dominioEmail === 'string' && dominioEmail.trim()) {
    await db.setting.upsert({
      where: { chave: 'dominio_email' },
      update: { valor: dominioEmail.trim() },
      create: { chave: 'dominio_email', valor: dominioEmail.trim() },
    })
  }
  return NextResponse.json({ ok: true })
}
