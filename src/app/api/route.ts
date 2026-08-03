import { NextResponse } from 'next/server'
import { garantirBanco } from '@/lib/db'

export async function GET() {
  await garantirBanco()
  return NextResponse.json({
    nome: 'Portal Escolar Inteligente',
    versao: '0.6.0',
    status: 'ok',
  })
}
