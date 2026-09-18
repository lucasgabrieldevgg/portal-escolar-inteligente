import { NextRequest, NextResponse } from 'next/server'
import { db, garantirBanco } from '@/lib/db'
import { requireUser } from '@/lib/auth'
import { chat } from '@/lib/ia'

// POST /api/ia/reformular -> reformula um texto com IA, mantendo o sentido.
// Modos: simplificar, ampliar, formal, informal, corrigir
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
  const user = await requireUser()
  const { texto, modo } = await req.json()
  if (!texto || typeof texto !== 'string' || texto.trim().length < 5) {
    return NextResponse.json({ error: 'Texto muito curto' }, { status: 400 })
  }
  if (texto.length > 5000) {
    return NextResponse.json({ error: 'Texto muito longo (máx. 5000 caracteres)' }, { status: 400 })
  }
  const modosValidos = ['simplificar', 'ampliar', 'formal', 'informal', 'corrigir']
  const m = modosValidos.includes(modo) ? modo : 'simplificar'

  const instrucoes: Record<string, string> = {
    simplificar: 'Reescreva o texto abaixo de forma mais simples e direta, mantendo o sentido. Use vocabulário acessível para um aluno do ensino fundamental.',
    ampliar: 'Amplie o texto abaixo, adicionando detalhes, exemplos e explicações, sem inventar fatos novos.',
    formal: 'Reescreva o texto abaixo em um tom mais formal, adequado para um trabalho escolar sério.',
    informal: 'Reescreva o texto abaixo em um tom mais leve e conversacional, sem perder a clareza.',
    corrigir: 'Corrija a gramática, ortografia e pontuação do texto abaixo. Mantenha o sentido e o estilo do autor. Não reescreva, apenas corrija.',
  }

  try {
    const resposta = await chat(
      [
        { role: 'system', content: instrucoes[m] + ' Responda APENAS com o texto reformulado, sem comentários.' },
        { role: 'user', content: texto },
      ],
      { temperature: 0.4, maxTokens: 1500 }
    )
    return NextResponse.json({ texto: resposta.trim(), modo: m })
  } catch (err: any) {
    console.error('[ia/reformular] erro:', err?.message || err)
    return NextResponse.json({ error: 'Não foi possível reformular agora. Tente novamente.' }, { status: 502 })
  }
}
