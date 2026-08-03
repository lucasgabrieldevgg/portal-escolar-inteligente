// Script para limpar a badge "Fundador do Portal Escolar" do banco.
// Roda automaticamente quando o banco é inicializado.

import { db } from './db'

export async function limparBadgeFundador() {
  try {
    const badge = await db.badge.findUnique({ where: { nome: 'Fundador do Portal Escolar' } })
    if (!badge) return
    // Remove todas as concessões da badge
    await db.userBadge.deleteMany({ where: { badgeId: badge.id } })
    // Remove a badge
    await db.badge.delete({ where: { id: badge.id } })
    console.log('[cleanup] Badge "Fundador do Portal Escolar" removida com sucesso.')
  } catch (e) {
    console.error('[cleanup] Erro ao remover badge Fundador:', e)
  }
}
