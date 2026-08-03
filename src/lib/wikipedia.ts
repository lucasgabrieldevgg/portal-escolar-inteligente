export interface WikiResult { titulo: string; resumo: string; url: string; idioma: string }

export async function pesquisarWikipedia(query: string, max = 2): Promise<WikiResult[]> {
  if (!query || query.trim().length < 3) return []
  const pt = await pesquisar(query, 'pt', max)
  if (pt.length >= max) return pt
  const en = await pesquisar(query, 'en', max)
  return en.length > 0 ? en.map(r => ({ ...r, titulo: `${r.titulo} (artigo em inglês)` })) : pt
}

async function pesquisar(query: string, lang: string, max: number): Promise<WikiResult[]> {
  try {
    const sUrl = `https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srlimit=${max}&format=json&origin=*`
    const sRes = await fetch(sUrl, { signal: AbortSignal.timeout(5000) })
    if (!sRes.ok) return []
    const sData = await sRes.json()
    const results = sData?.query?.search || []
    if (!results.length) return []
    const titles = results.map((r:any)=>r.title)
    const eUrl = `https://${lang}.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=true&explaintext=true&titles=${encodeURIComponent(titles.join('|'))}&format=json&origin=*`
    const eRes = await fetch(eUrl, { signal: AbortSignal.timeout(5000) })
    if (!eRes.ok) return []
    const eData = await eRes.json()
    const pages = eData?.query?.pages || {}
    return Object.values(pages).map((p:any)=>({ titulo: p.title, resumo: (p.extract||'').slice(0,500), url: `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(p.title.replace(/ /g,'_'))}`, idioma: lang })).filter((r:WikiResult)=>r.resumo.length>50)
  } catch { return [] }
}

export function precisaPesquisaWiki(p: string): boolean {
  const s = p.toLowerCase()
  return /quem foi|o que é|o que foi|quando aconteceu|história de|biografia|definição|revolução|guerra|império|filósofo|cientista|autor|escritor/.test(s) || /\b[A-Z][a-z]+ [A-Z][a-z]+\b/.test(p)
}

export function formatarContextoWiki(r: WikiResult[]): string {
  if (!r.length) return ''
  return '\n\n--- Contexto da Wikipedia (use como referência, cite a fonte) ---\n' + r.map(x=>`**${x.titulo}** (${x.url}): ${x.resumo}`).join('\n\n')
}
