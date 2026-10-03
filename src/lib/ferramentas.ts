export interface Ferramenta { nome: string; url: string; categoria: string; quandoUsar: string; comoUsar: string }

export const FERRAMENTAS: Ferramenta[] = [
  { nome: 'Google NotebookLM', url: 'https://notebooklm.google.com', categoria: 'Estudo com IA', quandoUsar: 'Quando você tem muitos materiais (PDFs, slides) e quer que a IA entenda o contexto da sua aula.', comoUsar: '1) Acesse notebooklm.google.com 2) Crie um notebook e faça upload 3) Faça perguntas com citações' },
  { nome: 'Gamma', url: 'https://gamma.app', categoria: 'Apresentações', quandoUsar: 'Quando precisa criar slides para um trabalho rápido.', comoUsar: '1) Acesse gamma.app 2) Escolha Gerar e descreva o tema 3) Edite e exporte' },
  { nome: 'Canva para Educação', url: 'https://canva.com/education', categoria: 'Design', quandoUsar: 'Para criar capa, cartaz, infográfico.', comoUsar: '1) Acesse canva.com/education 2) Busque template 3) Edite e baixe PDF' },
  { nome: 'Khan Academy', url: 'https://pt.khanacademy.org', categoria: 'Aulas de reforço', quandoUsar: 'Quando não entendeu a aula e quer ver explicado de outro jeito.', comoUsar: '1) Acesse pt.khanacademy.org 2) Escolha matéria 3) Assista e faça exercícios' },
  { nome: 'Google Scholar', url: 'https://scholar.google.com', categoria: 'Fontes acadêmicas', quandoUsar: 'Quando precisa de fontes confiáveis para um trabalho.', comoUsar: '1) Acesse scholar.google.com 2) Pesquise 3) Use Citado por para artigos relacionados' },
  { nome: 'DeepL', url: 'https://deepl.com', categoria: 'Tradução', quandoUsar: 'Para traduzir textos com qualidade melhor que Google Translate.', comoUsar: '1) Acesse deepl.com 2) Cole o texto 3) Escolha idioma e copie' },
]

export function detectarFerramentas(p: string): Ferramenta[] {
  const s = p.toLowerCase()
  const r: Ferramenta[] = []
  if (/slide|apresenta|seminário|powerpoint/.test(s)) r.push(FERRAMENTAS[1])
  if (/capa|cartaz|infográfico|design|imagem/.test(s)) r.push(FERRAMENTAS[2])
  if (/resumir.*material|resumir.*pdf|slide.*professor/.test(s)) r.push(FERRAMENTAS[0])
  if (/traduz|inglês|espanhol/.test(s)) r.push(FERRAMENTAS[5])
  if (/fonte|científico|artigo acadêmico|tcc/.test(s)) r.push(FERRAMENTAS[4])
  if (/não entendi|explicar de novo|exercício|praticar|reforço/.test(s)) r.push(FERRAMENTAS[3])
  return r.filter((f,i,a)=>f&&a.indexOf(f)===i).slice(0,2)
}

export function formatarFerramentas(f: Ferramenta[]): string {
  if (!f.length) return ''
  return '\n\n---\n\n**Ferramentas que valem a pena usar:**\n\n' + f.map(x=>`**${x.nome}** (${x.url})\n• Quando usar: ${x.quandoUsar}\n• Como: ${x.comoUsar}`).join('\n\n')
}
