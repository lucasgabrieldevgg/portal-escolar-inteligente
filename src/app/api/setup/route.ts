import { NextResponse } from 'next/server'
import { garantirBanco } from '@/lib/db'

// GET /api/setup -> força inicialização do banco (útil para warm-up em produção)
export async function GET() {
  await garantirBanco()
  return NextResponse.json({ ok: true, mensagem: 'Banco inicializado' })
}
