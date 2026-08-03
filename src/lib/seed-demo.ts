import { db } from '@/lib/db'
import { hashSenha } from '@/lib/senha'

export async function popularBancoDemo() {
  const SENHA_DEMO = 'demo1234'
  const senhaHash = hashSenha(SENHA_DEMO)

  // Settings
  await db.setting.upsert({ where: { chave: 'manutencao_ativa' }, update: {}, create: { chave: 'manutencao_ativa', valor: 'false' } })
  await db.setting.upsert({ where: { chave: 'manutencao_mensagem' }, update: {}, create: { chave: 'manutencao_mensagem', valor: 'O portal está em manutenção. Voltamos em breve!' } })
  await db.setting.upsert({ where: { chave: 'dominio_email' }, update: {}, create: { chave: 'dominio_email', valor: '@portal.escola.br' } })
  await db.setting.upsert({ where: { chave: 'ultima_reset_semanal' }, update: {}, create: { chave: 'ultima_reset_semanal', valor: new Date().toISOString() } })

  // Badges (SEM Fundador do Portal Escolar)
  const badges = [
    { nome: 'Designer do Sistema', descricao: 'Reconhecimento pela contribuição na criação da interface visual.', icone: '🎨', raridade: 'ESPECIAL', tipo: 'ESPECIAL', daXP: false, apenasAdmin: true },
    { nome: 'Participante do Portal', descricao: 'Concedida a quem utiliza ativamente o portal.', icone: '🌟', raridade: 'COMUM', tipo: 'ESPECIAL', daXP: false, automatica: true },
    { nome: 'Leitor Bronze', descricao: 'Leu e resumiu 5 livros da biblioteca.', icone: '📚', raridade: 'COMUM', tipo: 'ACADEMICA', daXP: true, xpRecompensa: 50 },
    { nome: 'Leitor Prata', descricao: 'Leu e resumiu 15 livros da biblioteca.', icone: '📖', raridade: 'RARA', tipo: 'ACADEMICA', daXP: true, xpRecompensa: 150 },
    { nome: 'Leitor Ouro', descricao: 'Leu e resumiu 30 livros da biblioteca.', icone: '🏆', raridade: 'LENDARIA', tipo: 'ACADEMICA', daXP: true, xpRecompensa: 300 },
    { nome: 'Sequência de Estudos', descricao: 'Manteve 7 dias consecutivos acessando o portal.', icone: '🔥', raridade: 'RARA', tipo: 'ACADEMICA', daXP: true, xpRecompensa: 100, automatica: true },
    { nome: 'Caçador de Bugs', descricao: 'Encontrou e relatou um problema válido.', icone: '🐞', raridade: 'RARA', tipo: 'CONTRIBUICAO', daXP: true, xpRecompensa: 80, automatica: true },
    { nome: 'Colaborador Técnico', descricao: 'Ajudou a melhorar a plataforma com 3 bugs válidos.', icone: '🔧', raridade: 'EPICA', tipo: 'CONTRIBUICAO', daXP: true, xpRecompensa: 200, apenasAdmin: true },
    { nome: 'Guardião do Portal', descricao: 'Encontrou 5 bugs críticos.', icone: '🛡️', raridade: 'LENDARIA', tipo: 'CONTRIBUICAO', daXP: true, xpRecompensa: 500, apenasAdmin: true },
    { nome: 'Top 3 da Semana', descricao: 'Ficou entre os 3 primeiros do ranking semanal.', icone: '🥉', raridade: 'EPICA', tipo: 'ACADEMICA', daXP: true, xpRecompensa: 250, apenasAdmin: true },
  ]
  for (const b of badges) await db.badge.upsert({ where: { nome: b.nome }, update: {}, create: b })

  // Skins
  const skins = [
    { nome: 'Esmeralda', descricao: 'Cor esmeralda', tipo: 'COR', raridade: 'COMUM', preco: 0, icone: '🟢', config: JSON.stringify({ cor: { bg: '#10b981', fg: '#ffffff' } }) },
    { nome: 'Âmbar', descricao: 'Cor âmbar', tipo: 'COR', raridade: 'COMUM', preco: 0, icone: '🟡', config: JSON.stringify({ cor: { bg: '#f59e0b', fg: '#ffffff' } }) },
    { nome: 'Rubi', descricao: 'Cor rubi', tipo: 'COR', raridade: 'COMUM', preco: 10, icone: '🔴', config: JSON.stringify({ cor: { bg: '#ef4444', fg: '#ffffff' } }) },
    { nome: 'Safira', descricao: 'Cor safira', tipo: 'COR', raridade: 'COMUM', preco: 10, icone: '🔵', config: JSON.stringify({ cor: { bg: '#3b82f6', fg: '#ffffff' } }) },
    { nome: 'Ametista', descricao: 'Cor ametista', tipo: 'COR', raridade: 'COMUM', preco: 15, icone: '🟣', config: JSON.stringify({ cor: { bg: '#8b5cf6', fg: '#ffffff' } }) },
    { nome: 'Rosa Neon', descricao: 'Cor rosa neon', tipo: 'COR', raridade: 'RARA', preco: 30, icone: '🌸', config: JSON.stringify({ cor: { bg: '#ec4899', fg: '#ffffff' } }) },
    { nome: 'Turquesa', descricao: 'Cor turquesa', tipo: 'COR', raridade: 'RARA', preco: 30, icone: '💎', config: JSON.stringify({ cor: { bg: '#14b8a6', fg: '#ffffff' } }) },
    { nome: 'Pôr do Sol', descricao: 'Gradiente laranja-rosa-roxo', tipo: 'GRADIENTE', raridade: 'RARA', preco: 50, icone: '🌅', config: JSON.stringify({ gradiente: 'linear-gradient(135deg, #f97316, #ec4899, #8b5cf6)' }) },
    { nome: 'Oceano', descricao: 'Gradiente azul-ciano-turquesa', tipo: 'GRADIENTE', raridade: 'RARA', preco: 50, icone: '🌊', config: JSON.stringify({ gradiente: 'linear-gradient(135deg, #3b82f6, #06b6d4, #14b8a6)' }) },
    { nome: 'Galáxia', descricao: 'Gradiente roxo-rosa-azul', tipo: 'GRADIENTE', raridade: 'EPICA', preco: 100, icone: '🌌', config: JSON.stringify({ gradiente: 'linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)' }) },
    { nome: 'Arco-Íris', descricao: 'Gradiente arco-íris', tipo: 'GRADIENTE', raridade: 'LENDARIA', preco: 200, icone: '🌈', config: JSON.stringify({ gradiente: 'linear-gradient(135deg, #ef4444, #f97316, #f59e0b, #84cc16, #10b981, #06b6d4, #3b82f6, #8b5cf6, #ec4899)' }) },
    { nome: 'Borda Dourada', descricao: 'Borda dourada', tipo: 'FRAME', raridade: 'RARA', preco: 40, icone: '🥇', config: JSON.stringify({ frame: '3px solid #fbbf24' }) },
    { nome: 'Borda Prateada', descricao: 'Borda prateada', tipo: 'FRAME', raridade: 'RARA', preco: 40, icone: '🥈', config: JSON.stringify({ frame: '3px solid #cbd5e1' }) },
    { nome: 'Foguetinho', descricao: 'Emoji foguete', tipo: 'EMOJI', raridade: 'COMUM', preco: 5, icone: '🚀', config: JSON.stringify({ emoji: '🚀' }) },
    { nome: 'Estrela', descricao: 'Emoji estrela', tipo: 'EMOJI', raridade: 'COMUM', preco: 5, icone: '⭐', config: JSON.stringify({ emoji: '⭐' }) },
    { nome: 'Coroa', descricao: 'Emoji coroa', tipo: 'EMOJI', raridade: 'RARA', preco: 35, icone: '👑', config: JSON.stringify({ emoji: '👑' }) },
    { nome: 'Diamante', descricao: 'Emoji diamante', tipo: 'EMOJI', raridade: 'EPICA', preco: 70, icone: '💎', config: JSON.stringify({ emoji: '💎' }) },
    { nome: 'Dragão', descricao: 'Emoji dragão', tipo: 'EMOJI', raridade: 'LENDARIA', preco: 180, icone: '🐉', config: JSON.stringify({ emoji: '🐉' }) },
  ]
  for (const s of skins) await db.skin.upsert({ where: { nome: s.nome }, update: {}, create: s })

  // Turmas (6º/7º = TARDE, 8º/9º = MANHÃ)
  const turmasData = [
    { nome: '6A', ano: '6º Ano', turno: 'TARDE' },
    { nome: '7A', ano: '7º Ano', turno: 'TARDE' },
    { nome: '8A', ano: '8º Ano', turno: 'MANHA' },
    { nome: '9A', ano: '9º Ano', turno: 'MANHA' },
  ]
  const turmas: any[] = []
  for (const t of turmasData) turmas.push(await db.turma.upsert({ where: { nome: t.nome }, update: {}, create: t }))
  const turma8A = turmas.find(t => t.nome === '8A')!

  // Equipe
  const admin = await db.user.upsert({ where: { email: 'admin@portal.escola.br' }, update: {}, create: { email: 'admin@portal.escola.br', senhaHash, name: 'Administrador do Sistema', role: 'ADMIN', avatarConfig: avatarPadrao('Admin'), moedinhas: 1000 } })
  const coord = await db.user.upsert({ where: { email: 'marta.silva@portal.escola.br' }, update: {}, create: { email: 'marta.silva@portal.escola.br', senhaHash, name: 'Profa. Marta Coordenadora', role: 'COORDENACAO', avatarConfig: avatarPadrao('Marta'), moedinhas: 500 } })
  const biblio = await db.user.upsert({ where: { email: 'biblioteca@portal.escola.br' }, update: {}, create: { email: 'biblioteca@portal.escola.br', senhaHash, name: 'Sra. Helena Bibliotecária', role: 'BIBLIOTECARIO', avatarConfig: avatarPadrao('Helena'), moedinhas: 200 } })
  const prof1 = await db.user.upsert({ where: { email: 'ana.costa@portal.escola.br' }, update: {}, create: { email: 'ana.costa@portal.escola.br', senhaHash, name: 'Profa. Ana Matemática', role: 'PROFESSOR', avatarConfig: avatarPadrao('Ana'), materias: JSON.stringify(['Matemática']) } })

  // Alunos
  const PRIMEIROS = ['Lucas','Sofia','Miguel','Helena','Bernardo','Valentina','Heitor','Alice','Davi','Laura','Théo','Manuela','Gabriel','Cecília','Samuel','Joana','Pedro','Antonella','Benício','Heloísa']
  const SOBRENOMES = ['Silva','Santos','Oliveira','Souza','Lima','Costa','Pereira','Almeida','Ferreira','Rodrigues','Gomes','Martins','Araújo','Barbosa','Ribeiro','Carvalho','Nascimento','Melo','Cardoso','Teixeira']
  const emailsUsados = new Set<string>()
  for (let i = 0; i < PRIMEIROS.length; i++) {
    const nome = `${PRIMEIROS[i]} ${SOBRENOMES[i]}`
    const turma = turmas[i % turmas.length]
    let email = gerarEmail(nome)
    let s = 2
    while (emailsUsados.has(email)) { const [l,d] = email.split('@'); email = `${l}.${s}@${d}`; s++ }
    emailsUsados.add(email)
    const xp = Math.floor(Math.random()*800)+50
    await db.user.upsert({ where: { email }, update: {}, create: { email, senhaHash, name: nome, role: 'ALUNO', turno: turma.turno, turmaId: turma.id, xp, xpTotal: xp+Math.floor(Math.random()*400), moedinhas: Math.floor(Math.random()*100)+20, iaLimiteDiario: 15, sequenciaDias: Math.floor(Math.random()*14), avatarConfig: avatarPadrao(nome) } })
  }

  // Luke
  const fundador = await db.user.upsert({ where: { email: 'luke.silva@portal.escola.br' }, update: {}, create: { email: 'luke.silva@portal.escola.br', senhaHash, name: 'Luke S.', role: 'ALUNO', turno: 'MANHA', turmaId: turma8A.id, xp: 900, xpTotal: 2500, moedinhas: 350, iaLimiteDiario: 15, sequenciaDias: 12, avatarConfig: JSON.stringify({ tipo: 'emoji', cor: { bg: '#f59e0b', fg: '#ffffff' }, emoji: '🚀' }) } })

  // Skins do Luke
  const skinPordosol = await db.skin.findUnique({ where: { nome: 'Pôr do Sol' } })
  const skinBorda = await db.skin.findUnique({ where: { nome: 'Borda Dourada' } })
  const skinCor = await db.skin.findUnique({ where: { nome: 'Esmeralda' } })
  if (skinPordosol) await db.userSkin.create({ data: { userId: fundador.id, skinId: skinPordosol.id } }).catch(() => {})
  if (skinBorda) await db.userSkin.create({ data: { userId: fundador.id, skinId: skinBorda.id } }).catch(() => {})
  if (skinCor) await db.userSkin.create({ data: { userId: fundador.id, skinId: skinCor.id } }).catch(() => {})

  // Badges (SEM Fundador)
  const bParticipante = await db.badge.findUnique({ where: { nome: 'Participante do Portal' } })
  const bSequencia = await db.badge.findUnique({ where: { nome: 'Sequência de Estudos' } })
  const bLeitorOuro = await db.badge.findUnique({ where: { nome: 'Leitor Ouro' } })
  const bCacador = await db.badge.findUnique({ where: { nome: 'Caçador de Bugs' } })
  const todosAlunos = await db.user.findMany({ where: { role: 'ALUNO' }, select: { id: true } })
  if (bParticipante) for (const a of todosAlunos) await db.userBadge.create({ data: { userId: a.id, badgeId: bParticipante.id } }).catch(() => {})
  if (bSequencia) await db.userBadge.create({ data: { userId: fundador.id, badgeId: bSequencia.id } }).catch(() => {})
  if (bLeitorOuro) await db.userBadge.create({ data: { userId: fundador.id, badgeId: bLeitorOuro.id } }).catch(() => {})
  if (bCacador) await db.userBadge.create({ data: { userId: fundador.id, badgeId: bCacador.id } }).catch(() => {})

  // Avisos
  await db.aviso.create({ data: { titulo: 'Bem-vindos ao Portal Escolar Inteligente!', conteudo: 'Este é o novo canal oficial de comunicação da escola. Aqui você encontra avisos, tarefas, ranking e o assistente de IA para tirar dúvidas. Explore tudo!', categoria: 'GERAL', destaque: true, autorId: coord.id } }).catch(() => {})
  await db.aviso.create({ data: { titulo: 'Prova de Matemática - 9º Ano', conteudo: 'A prova de matemática será na próxima quinta-feira. Conteúdo: capítulos 4 e 5.', categoria: 'ACADEMICO', autorId: prof1.id } }).catch(() => {})
  await db.aviso.create({ data: { titulo: 'Biblioteca: novos livros disponíveis', conteudo: 'A biblioteca recebeu novos títulos. Alunos que fizerem resumos ganham XP e moedinhas extras.', categoria: 'EVENTO', autorId: coord.id } }).catch(() => {})
  await db.aviso.create({ data: { titulo: 'URGENTE: mudança no horário de saída', conteudo: 'Devido a reunião de professores, amanhã a saída será antecipada em 30 minutos.', categoria: 'URGENTE', destaque: true, autorId: coord.id } }).catch(() => {})

  // Avisos de turma
  await db.avisoTurma.create({ data: { titulo: 'Aula de reposição', conteudo: 'Teremos aula de reposição na sexta-feira, das 14h às 15h.', turmaId: turma8A.id, professorId: prof1.id } }).catch(() => {})

  // Tarefas
  await db.tarefa.create({ data: { titulo: 'Lista de exercícios - Equações do 2º grau', descricao: 'Resolver os exercícios 1 a 15 da página 87.', turmaId: turma8A.id, professorId: prof1.id, xpRecompensa: 80, moedinhasRecompensa: 20, prazo: new Date(Date.now()+7*24*60*60*1000) } }).catch(() => {})
  await db.tarefa.create({ data: { titulo: 'Resenha - Revolução Francesa', descricao: 'Escrever uma resenha de 1 página sobre a Revolução Francesa.', turmaId: turma8A.id, professorId: prof1.id, xpRecompensa: 60, moedinhasRecompensa: 15, prazo: new Date(Date.now()+5*24*60*60*1000) } }).catch(() => {})

  console.log('[seed-demo] Banco populado (SEM badge Fundador)')
}

function gerarEmail(nome: string): string {
  const p = nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').split(/\s+/).filter(Boolean)
  if (p.length === 0) return 'usuario@portal.escola.br'
  if (p.length === 1) return `${p[0]}@portal.escola.br`
  return `${p[0]}.${p[p.length-1]}@portal.escola.br`
}

function avatarPadrao(nome: string): string {
  const cores = [{bg:'#10b981',fg:'#ffffff'},{bg:'#f59e0b',fg:'#ffffff'},{bg:'#ef4444',fg:'#ffffff'},{bg:'#3b82f6',fg:'#ffffff'},{bg:'#8b5cf6',fg:'#ffffff'},{bg:'#ec4899',fg:'#ffffff'},{bg:'#14b8a6',fg:'#ffffff'},{bg:'#f97316',fg:'#ffffff'}]
  return JSON.stringify({ tipo: 'inicial', cor: cores[nome.charCodeAt(0)%cores.length], emoji: null })
}
