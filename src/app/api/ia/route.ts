import { NextRequest, NextResponse } from 'next/server'
import { db, garantirBanco } from '@/lib/db'
import { requireUser, hojeISO } from '@/lib/auth'
import { chat, classificarDificuldade, ChatMessage } from '@/lib/ia'
import { pesquisarWikipedia, precisaPesquisaWiki, formatarContextoWiki } from '@/lib/wikipedia'
import { detectarFerramentas, formatarFerramentas } from '@/lib/ferramentas'

const SYSTEM_PROMPT = `Você é o assistente de IA do Portal Escolar Inteligente, da Escola Estadual Professora Eunice Souza dos Santos (Rondonópolis-MT).

Você ajuda alunos do 6º ao 9º ano do Ensino Fundamental (idades 11-15 anos) a estudar.

## PRINCÍPIOS PEDAGÓGICOS
1. Didática e clareza acima de tudo — use linguagem simples, exemplos do cotidiano, analogias.
2. Método socrático adaptado — em vez de dar a resposta direta, guie o aluno com perguntas e dicas progressivas.
3. Para exercícios — NUNCA dê a resposta direta sem antes perguntar "Você tentou? Até onde chegou?" e dar dicas.
4. Para trabalhos e redações — a IA PODE ajudar a estruturar, sugerir abordagens, gerar ideias iniciais e reformular textos. Mas a ideia principal e o texto final devem ser do aluno.
5. Adapte o nível — se o aluno demonstrar dificuldade, simplifique.

## FORMATO DE RESPOSTA
- Use títulos (##), bullets, negrito para destaque
- Use exemplos: "Imagine que...", "É tipo quando..."
- Confirme entendimento: termine perguntando "Ficou claro?"
- Use emojis com moderação (1-2 por resposta)
- Não seja prolixo

## REGRAS
- Português brasileiro
- Se a pergunta não for educacional, recuse educadamente
- Recomende ferramentas externas quando forem melhores para a tarefa
- Não responda conteúdo inadequado
- Ao pesquisar na Wikipedia, cite a fonte com link`

/* 🚦 Limite diário de IA (generoso) — mantém o site grátis no ar */
const LIMITE_DIA = 60;
const _HITS = new Map();
function limiteEstourado(req: Request): boolean {
  const hoje = new Date().toISOString().slice(0, 10);
  for (const k of [..._HITS.keys()]) if (!k.startsWith(hoje)) _HITS.delete(k);
  const ip = String(req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "anon";
  const k = hoje + ":" + ip;
  const n = _HITS.get(k) || 0;
  if (n >= LIMITE_DIA) return true;
  _HITS.set(k, n + 1);
  return false;
}

export async function POST(req: NextRequest) {
  if (limiteEstourado(req)) return NextResponse.json({ erro: "Você bateu o limite diário de IA (60 mensagens/dia) — volta amanhã! 💙" }, { status: 429 });
  await garantirBanco()
  const user = await requireUser()
  const { pergunta, historico, imagem } = await req.json()

  if (!pergunta || typeof pergunta !== 'string' || pergunta.trim().length === 0) {
    return NextResponse.json({ error: 'Pergunta obrigatória' }, { status: 400 })
  }
  if (pergunta.length > 2000) {
    return NextResponse.json({ error: 'Pergunta muito longa (máx. 2000 caracteres)' }, { status: 400 })
  }

  const temImagem = !!imagem && typeof imagem === 'string' && imagem.startsWith('data:image/')
  if (temImagem && imagem.length > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'Imagem muito grande (máx. 5MB)' }, { status: 400 })
  }

  const hoje = hojeISO()
  if (user.iaDataUltima !== hoje) {
    await db.user.update({ where: { id: user.id }, data: { iaUsadasHoje: 0, iaDataUltima: hoje } })
    user.iaUsadasHoje = 0; user.iaDataUltima = hoje
  }

  if (user.iaUsadasHoje >= user.iaLimiteDiario) {
    return NextResponse.json({ error: `Limite diário de ${user.iaLimiteDiario} perguntas atingido. Volte amanhã!`, limiteAtingido: true }, { status: 429 })
  }

  await db.user.update({ where: { id: user.id }, data: { iaUsadasHoje: { increment: 1 } } })

  const dificuldade = classificarDificuldade(pergunta)

  const mensagens: ChatMessage[] = [{ role: 'system', content: SYSTEM_PROMPT }]
  if (Array.isArray(historico)) {
    for (const m of historico.slice(-6)) {
      if (m.role === 'user' || m.role === 'assistant') {
        mensagens.push({ role: m.role, content: String(m.content).slice(0, 2000) })
      }
    }
  }

  let contextoWiki = ''
  if (precisaPesquisaWiki(pergunta) && !temImagem) {
    try { const r = await pesquisarWikipedia(pergunta, 2); contextoWiki = formatarContextoWiki(r) } catch {}
  }

  const ferramentas = detectarFerramentas(pergunta)
  const textoFerramentas = formatarFerramentas(ferramentas)

  const textoUsuario = pergunta + contextoWiki
  if (temImagem) {
    mensagens.push({ role: 'user', content: [{ type: 'text', text: textoUsuario }, { type: 'image_url', image_url: { url: imagem } }] } as any)
  } else {
    mensagens.push({ role: 'user', content: textoUsuario })
  }

  try {
    const maxTokens = dificuldade === 'complexo' ? 1500 : dificuldade === 'medio' ? 1000 : 700
    const result = await chat(mensagens, { dificuldade, temImagem, maxTokens, temperature: 0.5 })
    const respostaFinal = result.content + textoFerramentas

    return NextResponse.json({
      resposta: respostaFinal,
      usosRestantes: Math.max(0, user.iaLimiteDiario - user.iaUsadasHoje - 1),
      limiteDiario: user.iaLimiteDiario,
      modelo: result.modelo,
      provedor: result.provedor,
      dificuldade,
    })
  } catch (err: any) {
    await db.user.update({ where: { id: user.id }, data: { iaUsadasHoje: { decrement: 1 } } })
    console.error('Erro IA:', err?.message || err)
    return NextResponse.json({ error: 'Não foi possível falar com a IA agora. Tente novamente.' }, { status: 502 })
  }
}
