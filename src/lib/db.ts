import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined; __bancoInicializado?: boolean; __initPromise?: Promise<void> }

export const db = globalForPrisma.prisma ?? new PrismaClient({ log: process.env.NODE_ENV === 'development' ? ['error','warn'] : ['error'] })
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

export async function garantirBanco() {
  if (globalForPrisma.__bancoInicializado) return
  if (!globalForPrisma.__initPromise) globalForPrisma.__initPromise = initBanco()
  await globalForPrisma.__initPromise
  globalForPrisma.__bancoInicializado = true
}

async function initBanco() {
  try {
    await verificarResetSemanal()
    const count = await db.user.count().catch(() => 0)
    if (count === 0) {
      try {
        const { popularBancoDemo } = await import('./seed-demo')
        await popularBancoDemo()
        console.log('[db] Banco populado')
      } catch (e) { console.error('[db] Erro popular:', e) }
    }
  } catch (e) { console.error('[db] Erro init:', e) }
}

async function verificarResetSemanal() {
  try {
    const setting = await db.setting.findUnique({ where: { chave: 'ultima_reset_semanal' } })
    const agora = new Date()
    const hoje = agora.getDay()
    if (!setting) {
      await db.setting.upsert({ where: { chave: 'ultima_reset_semanal' }, update: { valor: agora.toISOString() }, create: { chave: 'ultima_reset_semanal', valor: agora.toISOString() } })
      return
    }
    const ultima = new Date(setting.valor)
    const diffDias = (agora.getTime() - ultima.getTime()) / (1000*60*60*24)
    if (diffDias >= 7 || (hoje === 1 && diffDias >= 1)) {
      await db.user.updateMany({ where: { role: 'ALUNO' }, data: { xp: 0 } })
      await db.setting.upsert({ where: { chave: 'ultima_reset_semanal' }, update: { valor: agora.toISOString() }, create: { chave: 'ultima_reset_semanal', valor: agora.toISOString() } })
      console.log('[db] Ranking semanal resetado')
    }
  } catch (e) { console.error('[db] Erro reset semanal:', e) }
}
