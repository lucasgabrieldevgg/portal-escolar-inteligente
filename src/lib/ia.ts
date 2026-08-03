import ZAI from 'z-ai-web-dev-sdk'

export interface ChatMessage { role: 'system'|'user'|'assistant'; content: string | any[] }
export interface ChatOptions { maxTokens?: number; temperature?: number; dificuldade?: 'simples'|'medio'|'complexo'; temImagem?: boolean }
export interface ChatResult { content: string; modelo: string; provedor: string }

const MODELO_TEXTO = 'nvidia/nemotron-3-super-120b-a12b:free'
const MODELO_VISION = 'nvidia/nemotron-nano-12b-2-vl:free'

export async function chat(messages: ChatMessage[], options: ChatOptions = {}): Promise<ChatResult> {
  const maxTokens = options.maxTokens || 1200
  const temperature = options.temperature ?? 0.5
  const temImagem = options.temImagem || messages.some(m => Array.isArray(m.content))

  if (process.env.OPENROUTER_API_KEYS) {
    const keys = process.env.OPENROUTER_API_KEYS.split(/[\s,]+/).map(s=>s.trim()).filter(s=>s.startsWith('sk-or-'))
    const modelos = temImagem ? [MODELO_VISION] : [MODELO_TEXTO]
    for (const modelo of modelos) {
      for (const key of keys) {
        try {
          const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json', 'HTTP-Referer': 'https://portal-escolar.vercel.app', 'X-Title': 'Portal Escolar Inteligente' },
            body: JSON.stringify({ model: modelo, messages, max_tokens: maxTokens, temperature, reasoning: { enabled: false } }),
          })
          if (!res.ok) { const t = await res.text().catch(()=>''); throw new Error(`OR ${res.status}: ${t.slice(0,100)}`) }
          const data = await res.json()
          let content = data.choices?.[0]?.message?.content
          if (typeof content === 'string' && content.includes('</think>')) content = content.split('</think>').pop() || content
          if (content) return { content, modelo, provedor: 'openrouter' }
        } catch (e: any) { console.warn(`OR falhou (${modelo}):`, e?.message?.slice(0,80)); continue }
      }
    }
  }
  try {
    const zai = await ZAI.create()
    const c = await zai.chat.completions.create({ messages: messages as any, thinking: { type: 'disabled' }, temperature, max_tokens: maxTokens })
    return { content: c.choices[0]?.message?.content || '', modelo: 'z-ai-default', provedor: 'z-ai-web-dev-sdk' }
  } catch (e: any) { throw new Error(`Todos os provedores falharam: ${e?.message}`) }
}

export function classificarDificuldade(p: string): 'simples'|'medio'|'complexo' {
  const s = p.toLowerCase()
  if (p.length > 500 || /analise|compare|critique|diferença entre|explique detalhadamente|passo a passo|resenha|tcc/.test(s)) return 'complexo'
  if (p.length > 150 || /explique|como funciona|por que|exemplo|resuma/.test(s)) return 'medio'
  return 'simples'
}
