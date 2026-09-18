import { NextRequest, NextResponse } from 'next/server'
import { db, garantirBanco } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import { chat } from '@/lib/ia'

// POST /api/ia-professor -> IA para professores: ajuda a criar tarefas, rubricas, planos de aula
/* 🚦 Limite diário de IA (generoso) — mantém o site grátis no ar */
const LIMITE_DIA = 40;
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
  if (limiteEstourado(req)) return NextResponse.json({ erro: "Limite diário de IA atingido (40/dia) — volta amanhã! 💙" }, { status: 429 });
  await garantirBanco()
  const user = await requireRole(['PROFESSOR', 'COORDENACAO', 'ADMIN'])
  const { pergunta, contexto } = await req.json()
  if (!pergunta || typeof pergunta !== 'string' || pergunta.trim().length === 0) {
    return NextResponse.json({ error: 'Pergunta obrigatória' }, { status: 400 })
  }

  const systemPrompt = `Você é o assistente de IA do Portal Escolar Inteligente, em modo Professor.

Atende professores da Escola Estadual Professora Eunice Souza dos Santos, em Rondonópolis-MT.
Ajudar a:
- Criar tarefas e descrições didáticas para alunos do 6º ao 9º ano
- Sugerir rubricas de avaliação
- Planejar aulas e atividades
- Sugerir formas de explicar conceitos difíceis
- Resumir capítulos de livros didáticos

Use português brasileiro. Seja objetivo e prático. Não faça o trabalho inteiro pelo professor — proponha estruturas, exemplos e sugestões que ele possa adaptar.`

  const mensagens: any[] = [{ role: 'system', content: systemPrompt }]
  if (contexto) {
    mensagens.push({ role: 'system', content: `Contexto: ${String(contexto).slice(0, 1000)}` })
  }
  mensagens.push({ role: 'user', content: pergunta })

  try {
    const resposta = await chat(mensagens, { temperature: 0.5, maxTokens: 1500 })
    return NextResponse.json({ resposta })
  } catch (err: any) {
    console.error('[ia-professor] erro:', err?.message || err)
    return NextResponse.json({ error: 'Não foi possível falar com a IA agora.' }, { status: 502 })
  }
}
