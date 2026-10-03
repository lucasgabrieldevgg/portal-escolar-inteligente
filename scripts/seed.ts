// Seed do Portal Escolar Inteligente
// Cria: admin, coordenação, professores, 100+ alunos divididos por turno/turma,
// avisos, tarefas, badges iniciais (incluindo a badge Fundador do Portal).

import { db } from '../src/lib/db'

const TURMAS_MANHA = [
  { nome: '6A', ano: '6º Ano' },
  { nome: '7A', ano: '7º Ano' },
  { nome: '8A', ano: '8º Ano' },
  { nome: '9A', ano: '9º Ano' },
]

const TURMAS_TARDE = [
  { nome: '1EM-A', ano: '1º EM' },
  { nome: '2EM-A', ano: '2º EM' },
  { nome: '3EM-A', ano: '3º EM' },
]

const PRIMEIROS = [
  'Lucas', 'Sofia', 'Miguel', 'Helena', 'Bernardo', 'Valentina', 'Heitor', 'Alice',
  'Davi', 'Laura', 'Théo', 'Manuela', 'Gabriel', 'Cecília', 'Samuel', 'Joana',
  'Pedro', 'Antonella', 'Benício', 'Heloísa', 'Ravi', 'Liz', 'João', 'Maria',
  'Noah', 'Eduarda', 'Bento', 'Lorena', 'Augusto', 'Beatriz', 'Murilo', 'Cecília',
  'Enzo', 'Yara', 'Lorenzo', 'Nina', 'Anthony', 'Ayla', 'Henry', 'Esther',
  'Matheus', 'Lavínia', 'Nicolas', 'Mel', 'Theodoro', 'Sarah', 'Vicente', 'Letícia',
  'Otávio', 'Antonia', 'Leonardo', 'Catarina', 'Daniel', 'Rafaela', 'Gustavo',
  'Marina', 'Felipe', 'Bruna', 'Vinícius', 'Carolina', 'Rafael', 'Júlia',
  'Caio', 'Bianca', 'André', 'Larissa', 'Rodrigo', 'Fernanda', 'Marcelo', 'Patrícia',
  'Tomás', 'Vitória', 'Vinicius', 'Amanda', 'Arthur', 'Bruno', 'Camila', 'Diego',
  'Eduardo', 'Fernando', 'Gabriela', 'Hugo', 'Igor', 'Jaqueline', 'Leandro',
  'Mariana', 'Natália', 'Osvaldo', 'Paula', 'Queila', 'Renato', 'Sandra',
  'Tatiane', 'Ulisses', 'Vanessa', 'Wagner', 'Xavier', 'Yasmin', 'Zara',
  'Adriano', 'Brenda', 'Caio', 'Débora',
]

const SOBRENOMES = [
  'Silva', 'Santos', 'Oliveira', 'Souza', 'Lima', 'Costa', 'Pereira', 'Almeida',
  'Ferreira', 'Rodrigues', 'Gomes', 'Martins', 'Araújo', 'Barbosa', 'Ribeiro',
  'Carvalho', 'Nascimento', 'Melo', 'Cardoso', 'Teixeira', 'Mendes', 'Freitas',
]

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length]
}

async function main() {
  console.log('Limpando banco...')
  await db.userBadge.deleteMany()
  await db.xPLog.deleteMany()
  await db.bugReport.deleteMany()
  await db.inscricaoDev.deleteMany()
  await db.entrega.deleteMany()
  await db.tarefa.deleteMany()
  await db.aviso.deleteMany()
  await db.sessao.deleteMany()
  await db.user.deleteMany()
  await db.turma.deleteMany()
  await db.badge.deleteMany()

  console.log('Criando badges...')
  const badges = await Promise.all([
    db.badge.create({ data: {
      nome: 'Fundador do Portal Escolar',
      descricao: 'Concedida aos alunos que participaram da criação inicial e desenvolvimento do Portal Escolar Inteligente.',
      icone: '💻',
      raridade: 'ESPECIAL',
      tipo: 'ESPECIAL',
      daXP: false,
    }}),
    db.badge.create({ data: {
      nome: 'Designer do Sistema',
      descricao: 'Concedida aos alunos que ajudaram na criação da interface visual e experiência do usuário.',
      icone: '🎨',
      raridade: 'ESPECIAL',
      tipo: 'ESPECIAL',
      daXP: false,
    }}),
    db.badge.create({ data: {
      nome: 'Leitor Bronze',
      descricao: 'Leu e resumiu 5 livros da biblioteca escolar.',
      icone: '📚',
      raridade: 'COMUM',
      tipo: 'ACADEMICA',
      daXP: true,
    }}),
    db.badge.create({ data: {
      nome: 'Leitor Prata',
      descricao: 'Leu e resumiu 15 livros da biblioteca escolar.',
      icone: '📖',
      raridade: 'RARA',
      tipo: 'ACADEMICA',
      daXP: true,
    }}),
    db.badge.create({ data: {
      nome: 'Leitor Ouro',
      descricao: 'Leu e resumiu 30 livros da biblioteca escolar.',
      icone: '🏆',
      raridade: 'LENDARIA',
      tipo: 'ACADEMICA',
      daXP: true,
    }}),
    db.badge.create({ data: {
      nome: 'Sequência de Estudos',
      descricao: 'Manteve uma sequência de 7 dias consecutivos acessando o portal.',
      icone: '🔥',
      raridade: 'RARA',
      tipo: 'ACADEMICA',
      daXP: true,
    }}),
    db.badge.create({ data: {
      nome: 'Caçador de Bugs',
      descricao: 'Encontrou e relatou um problema válido no sistema.',
      icone: '🐞',
      raridade: 'RARA',
      tipo: 'CONTRIBUICAO',
      daXP: true,
    }}),
    db.badge.create({ data: {
      nome: 'Colaborador Técnico',
      descricao: 'Ajudou a melhorar a plataforma com 3 bugs válidos.',
      icone: '🔧',
      raridade: 'EPICA',
      tipo: 'CONTRIBUICAO',
      daXP: true,
    }}),
    db.badge.create({ data: {
      nome: 'Guardião do Portal',
      descricao: 'Encontrou 5 bugs críticos ou importantes.',
      icone: '🛡️',
      raridade: 'LENDARIA',
      tipo: 'CONTRIBUICAO',
      daXP: true,
    }}),
    db.badge.create({ data: {
      nome: 'Top 3 da Temporada',
      descricao: 'Ficou entre os 3 primeiros do ranking ao final de uma temporada.',
      icone: '🥉',
      raridade: 'EPICA',
      tipo: 'ACADEMICA',
      daXP: true,
    }}),
  ])

  console.log('Criando turmas...')
  const turmasManha = await Promise.all(
    TURMAS_MANHA.map(t => db.turma.create({ data: { nome: t.nome, ano: t.ano, turno: 'MANHA' }}))
  )
  const turmasTarde = await Promise.all(
    TURMAS_TARDE.map(t => db.turma.create({ data: { nome: t.nome, ano: t.ano, turno: 'TARDE' }}))
  )
  const todasTurmas = [...turmasManha, ...turmasTarde]

  console.log('Criando admin, coordenação e professores...')
  const admin = await db.user.create({ data: {
    email: 'admin@escola.edu.br', name: 'Administrador do Sistema', role: 'ADMIN',
  }})
  const coord = await db.user.create({ data: {
    email: 'coordenacao@escola.edu.br', name: 'Profa. Marta Coordenadora', role: 'COORDENACAO',
  }})
  const prof1 = await db.user.create({ data: {
    email: 'ana@escola.edu.br', name: 'Profa. Ana Matemática', role: 'PROFESSOR',
  }})
  const prof2 = await db.user.create({ data: {
    email: 'bruno@escola.edu.br', name: 'Prof. Bruno História', role: 'PROFESSOR',
  }})
  const prof3 = await db.user.create({ data: {
    email: 'carla@escola.edu.br', name: 'Profa. Carla Português', role: 'PROFESSOR',
  }})

  console.log('Criando alunos (100+)...')
  const alunos = []
  for (let i = 0; i < PRIMEIROS.length; i++) {
    const primeiro = PRIMEIROS[i]
    const sobrenome = pick(SOBRENOMES, i)
    const nome = `${primeiro} ${sobrenome}`
    const turma = i % 2 === 0 ? pick(turmasManha, Math.floor(i / 2)) : pick(turmasTarde, Math.floor(i / 2))
    const turno = turma.turno
    const xpBase = Math.floor(Math.random() * 1800) + 100
    const email = `${primeiro.toLowerCase()}.${sobrenome.toLowerCase()}@aluno.escola.edu.br`
    const aluno = await db.user.create({ data: {
      email,
      name: nome,
      role: 'ALUNO',
      turno,
      turmaId: turma.id,
      xp: xpBase,
      xpTotal: xpBase + Math.floor(Math.random() * 400),
      iaLimiteDiario: 15,
      sequenciaDias: Math.floor(Math.random() * 14),
    }})
    alunos.push(aluno)
  }

  // Conceder badge Fundador para o aluno desenvolvedor
  const fundador = await db.user.create({ data: {
    email: 'luke.silva@aluno.escola.edu.br',
    name: 'Luke S. (Fundador)',
    role: 'ALUNO',
    turno: 'MANHA',
    turmaId: turmasManha[3].id,
    xp: 2500,
    xpTotal: 2500,
    iaLimiteDiario: 15,
    sequenciaDias: 12,
  }})
  await db.userBadge.create({ data: { userId: fundador.id, badgeId: badges[0].id }})
  await db.userBadge.create({ data: { userId: fundador.id, badgeId: badges[4].id }})
  await db.userBadge.create({ data: { userId: fundador.id, badgeId: badges[6].id }})

  for (let i = 0; i < 8; i++) {
    const a = pick(alunos, i * 7)
    await db.userBadge.create({ data: { userId: a.id, badgeId: badges[2].id }})
  }
  for (let i = 0; i < 3; i++) {
    const a = pick(alunos, i * 13)
    await db.userBadge.create({ data: { userId: a.id, badgeId: badges[3].id }})
  }

  console.log('Criando avisos oficiais...')
  await db.aviso.create({ data: {
    titulo: 'Bem-vindos ao Portal Escolar Inteligente!',
    conteudo: 'Este é o novo canal oficial de comunicação da escola. Aqui você encontra avisos, tarefas, ranking e o assistente de IA para tirar dúvidas. Explore tudo!',
    categoria: 'GERAL',
    destaque: true,
    autorId: coord.id,
  }})
  await db.aviso.create({ data: {
    titulo: 'Prova de Matemática - 9º Ano',
    conteudo: 'A prova de matemática para o 9º ano será realizada na próxima quinta-feira. Conteúdo: capítulos 4 e 5. Estudem!',
    categoria: 'ACADEMICO',
    autorId: prof1.id,
  }})
  await db.aviso.create({ data: {
    titulo: 'Biblioteca: novos livros disponíveis',
    conteudo: 'A biblioteca recebeu novos títulos. Alunos que fizerem resumos físicos ganham XP extra. Procure a bibliotecária.',
    categoria: 'EVENTO',
    autorId: coord.id,
  }})
  await db.aviso.create({ data: {
    titulo: 'URGENTE: mudança no horário de saída',
    conteudo: 'Devido a reunião de professores, amanhã a saída será antecipada em 30 minutos para ambos os turnos.',
    categoria: 'URGENTE',
    destaque: true,
    autorId: coord.id,
  }})

  console.log('Criando tarefas...')
  await db.tarefa.create({ data: {
    titulo: 'Lista de exercícios - Equações do 2º grau',
    descricao: 'Resolver os exercícios 1 a 15 da página 87 do livro.',
    turmaId: turmasManha[3].id,
    professorId: prof1.id,
    xpRecompensa: 80,
    prazo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  }})
  await db.tarefa.create({ data: {
    titulo: 'Resenha - Revolução Francesa',
    descricao: 'Escrever uma resenha de 1 página sobre os principais acontecimentos da Revolução Francesa.',
    turmaId: turmasManha[3].id,
    professorId: prof2.id,
    xpRecompensa: 60,
    prazo: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
  }})
  await db.tarefa.create({ data: {
    titulo: 'Análise do poema "Os Lusíadas"',
    descricao: 'Ler o canto I e escrever uma análise crítica de 2 páginas.',
    turmaId: turmasTarde[0].id,
    professorId: prof3.id,
    xpRecompensa: 100,
    prazo: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
  }})

  console.log('Criando alguns logs de XP e bugs demo...')
  for (let i = 0; i < 5; i++) {
    const a = pick(alunos, i * 11)
    await db.bugReport.create({ data: {
      userId: a.id,
      local: 'Tela de ranking',
      acao: 'Carreguei a página de ranking global',
      ocorreu: 'A página ficou em branco por 5 segundos antes de mostrar os dados',
      esperado: 'Deveria mostrar um esqueleto de carregamento imediatamente',
      categoria: 'NORMAL',
      status: 'EM_ANALISE',
    }})
  }

  console.log('Seed concluído!')
  console.log(`- ${alunos.length + 1} alunos`)
  console.log(`- ${todasTurmas.length} turmas`)
  console.log(`- 3 professores + 1 coordenação + 1 admin`)
  console.log(`- ${badges.length} badges`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
