import { NextRequest, NextResponse } from 'next/server'
import { db, garantirBanco } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import { chat } from '@/lib/ia'

// POST /api/ia-bibliotecario -> bibliotecário envia foto de resumo e IA analisa
export async function POST(req: NextRequest) {
  await garantirBanco()
  const user = await requireRole(['BIBLIOTECARIO', 'COORDENACAO', 'ADMIN'])
  const { imagemBase64, livroTitulo, alunoNome } = await req.json()
  if (!imagemBase64) {
    return NextResponse.json({ error: 'Imagem obrigatória' }, { status: 400 })
  }

  const prompt = `Você é um assistente da bibliotecária da escola. Analise a foto do resumo do livro "${livroTitulo || 'não identificado'}" enviado pela aluna(o) ${alunoNome || 'não identificado(a)'}.

Responda APENAS um JSON válido no formato:
{
  "resumoExtraido": "transcrição do resumo que está na imagem (mantenha o texto do aluno)",
  "qualidade": "ALTA | MEDIA | BAIXA",
  "parecer": "string curta com observação sobre o resumo (clareza, organização, profundidade)",
  "recomendaXP": número 0-50,
  "recomendaMoedinhas": número 0-30
}

Critérios:
- ALTA: resumo bem escrito, organizado, demonstra leitura real.
- MEDIA: resumo básico, mas demonstra leitura.
- BAIXA: resumo vago, copiado de fonte externa, ou sem demonstrar leitura.

Se não conseguir ler a imagem, retorne qualidade BAIXA e recomendaXP 0.`

  try {
    const resposta = await chat(
      [
        { role: 'system', content: prompt },
        { role: 'user', content: 'Analise a foto do resumo em anexo.' },
      ],
      { temperature: 0.3, maxTokens: 800, imagemBase64, json: true }
    )
    // Tenta parsear como JSON
    let parsed: any = null
    try {
      const match = resposta.match(/\{[\s\S]*\}/)
      parsed = match ? JSON.parse(match[0]) : null
    } catch {}
    if (!parsed) {
      return NextResponse.json({
        resumoExtraido: '',
        qualidade: 'MEDIA',
        parecer: resposta.slice(0, 300),
        recomendaXP: 20,
        recomendaMoedinhas: 10,
      })
    }
    return NextResponse.json(parsed)
  } catch (err: any) {
    console.error('[ia-bibliotecario] erro:', err?.message || err)
    return NextResponse.json({ error: 'Não foi possível analisar a imagem agora.' }, { status: 502 })
  }
}
