import { NextResponse } from 'next/server'
import { db, garantirBanco } from '@/lib/db'

// GET /api/badges -> todas as badges do catálogo
export async function GET() {
  await garantirBanco()
  const badges = await db.badge.findMany({
    orderBy: [{ tipo: 'asc' }, { raridade: 'asc' }],
  })
  return NextResponse.json({ badges })
}
