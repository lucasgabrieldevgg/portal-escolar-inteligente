import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  __bancoInicializado?: boolean
  __initPromise?: Promise<void>
}

function createClient() {
  const url = process.env.DATABASE_URL || 'file:/tmp/portal.db'
  return new PrismaClient({
    datasources: { db: { url } },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
}

export const db = globalForPrisma.prisma ?? createClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

export async function garantirBanco() {
  if (globalForPrisma.__bancoInicializado) return
  if (!globalForPrisma.__initPromise) globalForPrisma.__initPromise = initBanco()
  await globalForPrisma.__initPromise
  globalForPrisma.__bancoInicializado = true
}

async function initBanco() {
  try {
    let precisaCriar = false
    try { await db.user.count() } catch { precisaCriar = true }

    if (precisaCriar) { await criarSchemaSQLite() }

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
    const diffDias = (agora.getTime() - ultima.getTime()) / (1000 * 60 * 60 * 24)
    if (diffDias >= 7 || (hoje === 1 && diffDias >= 1)) {
      await db.user.updateMany({ where: { role: 'ALUNO' }, data: { xp: 0 } })
      await db.setting.upsert({ where: { chave: 'ultima_reset_semanal' }, update: { valor: agora.toISOString() }, create: { chave: 'ultima_reset_semanal', valor: agora.toISOString() } })
      console.log('[db] Ranking semanal resetado')
    }
  } catch (e) { console.error('[db] Erro reset semanal:', e) }
}

async function criarSchemaSQLite() {
  const stmts = [
    `CREATE TABLE IF NOT EXISTS User (id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, senhaHash TEXT NOT NULL DEFAULT '', name TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'ALUNO', turno TEXT, turmaId TEXT, materias TEXT, avatarConfig TEXT, xp INTEGER NOT NULL DEFAULT 0, xpTotal INTEGER NOT NULL DEFAULT 0, moedinhas INTEGER NOT NULL DEFAULT 50, iaUsadasHoje INTEGER NOT NULL DEFAULT 0, iaDataUltima TEXT, iaLimiteDiario INTEGER NOT NULL DEFAULT 15, sequenciaDias INTEGER NOT NULL DEFAULT 0, ativo INTEGER NOT NULL DEFAULT 1, criadoPorId TEXT, createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS Turma (id TEXT PRIMARY KEY, nome TEXT NOT NULL UNIQUE, turno TEXT NOT NULL, ano TEXT NOT NULL, createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS Aviso (id TEXT PRIMARY KEY, titulo TEXT NOT NULL, conteudo TEXT NOT NULL, categoria TEXT NOT NULL DEFAULT 'GERAL', destaque INTEGER NOT NULL DEFAULT 0, autorId TEXT NOT NULL, createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME NOT NULL, FOREIGN KEY (autorId) REFERENCES User(id))`,
    `CREATE TABLE IF NOT EXISTS AvisoTurma (id TEXT PRIMARY KEY, titulo TEXT NOT NULL, conteudo TEXT NOT NULL, turmaId TEXT NOT NULL, professorId TEXT NOT NULL, createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (turmaId) REFERENCES Turma(id), FOREIGN KEY (professorId) REFERENCES User(id))`,
    `CREATE TABLE IF NOT EXISTS Tarefa (id TEXT PRIMARY KEY, titulo TEXT NOT NULL, descricao TEXT NOT NULL, turmaId TEXT NOT NULL, professorId TEXT NOT NULL, xpRecompensa INTEGER NOT NULL DEFAULT 50, moedinhasRecompensa INTEGER NOT NULL DEFAULT 10, prazo DATETIME, createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (turmaId) REFERENCES Turma(id), FOREIGN KEY (professorId) REFERENCES User(id))`,
    `CREATE TABLE IF NOT EXISTS Entrega (id TEXT PRIMARY KEY, tarefaId TEXT NOT NULL, alunoId TEXT NOT NULL, conteudo TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'PENDENTE', xpConcedido INTEGER, moedinhasConcedidas INTEGER, corretorId TEXT, feedback TEXT, createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, corrigidoEm DATETIME, FOREIGN KEY (tarefaId) REFERENCES Tarefa(id), FOREIGN KEY (alunoId) REFERENCES User(id), FOREIGN KEY (corretorId) REFERENCES User(id))`,
    `CREATE TABLE IF NOT EXISTS XPLog (id TEXT PRIMARY KEY, userId TEXT NOT NULL, quantidade INTEGER NOT NULL, motivo TEXT NOT NULL, origem TEXT NOT NULL, tipo TEXT NOT NULL DEFAULT 'XP', createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (userId) REFERENCES User(id))`,
    `CREATE TABLE IF NOT EXISTS BugReport (id TEXT PRIMARY KEY, userId TEXT NOT NULL, local TEXT NOT NULL, acao TEXT NOT NULL, ocorreu TEXT NOT NULL, esperado TEXT NOT NULL, categoria TEXT NOT NULL DEFAULT 'SUGESTAO', status TEXT NOT NULL DEFAULT 'ABERTO', recompensaXP INTEGER, createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, resolvidoEm DATETIME, FOREIGN KEY (userId) REFERENCES User(id))`,
    `CREATE TABLE IF NOT EXISTS Badge (id TEXT PRIMARY KEY, nome TEXT NOT NULL UNIQUE, descricao TEXT NOT NULL, icone TEXT NOT NULL, raridade TEXT NOT NULL DEFAULT 'COMUM', tipo TEXT NOT NULL DEFAULT 'ACADEMICA', daXP INTEGER NOT NULL DEFAULT 0, xpRecompensa INTEGER NOT NULL DEFAULT 0, apenasAdmin INTEGER NOT NULL DEFAULT 0, automatica INTEGER NOT NULL DEFAULT 0)`,
    `CREATE TABLE IF NOT EXISTS UserBadge (id TEXT PRIMARY KEY, userId TEXT NOT NULL, badgeId TEXT NOT NULL, concedidoEm DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, concedidoPor TEXT, FOREIGN KEY (userId) REFERENCES User(id), FOREIGN KEY (badgeId) REFERENCES Badge(id))`,
    `CREATE TABLE IF NOT EXISTS Skin (id TEXT PRIMARY KEY, nome TEXT NOT NULL UNIQUE, descricao TEXT NOT NULL, tipo TEXT NOT NULL, raridade TEXT NOT NULL DEFAULT 'COMUM', preco INTEGER NOT NULL DEFAULT 10, config TEXT NOT NULL, icone TEXT NOT NULL, ativa INTEGER NOT NULL DEFAULT 1)`,
    `CREATE TABLE IF NOT EXISTS UserSkin (id TEXT PRIMARY KEY, userId TEXT NOT NULL, skinId TEXT NOT NULL, compradoEm DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (userId) REFERENCES User(id), FOREIGN KEY (skinId) REFERENCES Skin(id))`,
    `CREATE TABLE IF NOT EXISTS InscricaoDev (id TEXT PRIMARY KEY, userId TEXT NOT NULL, area TEXT NOT NULL, experiencia TEXT, motivo TEXT NOT NULL, analiseIA TEXT, scoreIA INTEGER, status TEXT NOT NULL DEFAULT 'PENDENTE', createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, decididoEm DATETIME, FOREIGN KEY (userId) REFERENCES User(id))`,
    `CREATE TABLE IF NOT EXISTS Sessao (id TEXT PRIMARY KEY, token TEXT NOT NULL UNIQUE, userId TEXT NOT NULL UNIQUE, createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, expiresAt DATETIME NOT NULL, FOREIGN KEY (userId) REFERENCES User(id))`,
    `CREATE TABLE IF NOT EXISTS ResumoBiblioteca (id TEXT PRIMARY KEY, alunoId TEXT NOT NULL, livroTitulo TEXT NOT NULL, livroAutor TEXT, resumo TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'PENDENTE', xpRecompensa INTEGER NOT NULL DEFAULT 30, moedinhasRecompensa INTEGER NOT NULL DEFAULT 15, validadoPorId TEXT, feedback TEXT, createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, validadoEm DATETIME, FOREIGN KEY (alunoId) REFERENCES User(id), FOREIGN KEY (validadoPorId) REFERENCES User(id))`,
    `CREATE TABLE IF NOT EXISTS Setting (id TEXT PRIMARY KEY, chave TEXT NOT NULL UNIQUE, valor TEXT NOT NULL, updatedAt DATETIME NOT NULL)`,
  ]
  for (const s of stmts) { try { await db.$executeRawUnsafe(s) } catch (e) {} }
  console.log('[db] Schema SQLite criado')
}
