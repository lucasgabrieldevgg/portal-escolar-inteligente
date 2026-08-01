# Portal Escolar Inteligente

Plataforma escolar com assistente de IA, sistema de XP/ranking, badges, programa de caça aos bugs e equipe de colaboradores estudantis.

> **Status**: MVP de demonstração · Pronto para apresentação à escola e deploy no Vercel.

## O que está implementado (MVP)

### 3 perfis de acesso
- **Aluno** — login (conta criada pela escola), avisos, tarefas, assistente IA com limite diário, ranking, perfil, badges, caça aos bugs, inscrição para colaborar
- **Professor** — ver turmas e alunos, criar tarefas, corrigir entregas e dar XP
- **Coordenação** — publicar/excluir avisos, ver usuários, ver bugs reportados, avaliar inscrições de dev

### Sistema de XP e Ranking
- XP da temporada (reseta mensalmente) separado do XP total (histórico)
- Rankings: global, por turno (manhã/tarde), por turma
- Medalhas para top 3

### Assistente de IA
- Usa `z-ai-web-dev-sdk` (substituível por qualquer provedor compatível com OpenAI)
- **Limite diário configurável** por usuário (default: 15 perguntas/dia)
- Reset automático à meia-noite
- System prompt com regras anti-fraude (não faz tarefas pelo aluno)

### Programa de Caça aos Bugs
- Aluno reporta: local, ação, ocorreu, esperado + categoria
- Coordenação avalia: crítico (+150 XP), normal (+80), sugestão (+30), inválido (0)
- Badge automática "Caçador de Bugs" no primeiro bug aceito

### Galeria de Badges
- 3 categorias: Acadêmica, Contribuição, Especial
- Badges especiais (Fundador, Designer) **não dão XP** — representam contribuição, não desempenho
- 5 níveis de raridade: Comum, Rara, Épica, Lendária, Especial

### Inscrição para Equipe de Dev
- Aluno preenche formulário (área + experiência + motivo)
- IA faz análise inicial com score 0-100 (não decide sozinha)
- Coordenação revisa e decide: aceitar, período de teste, recusar

## Como rodar localmente

```bash
bun install
bun run db:push     # cria o banco SQLite
bun run scripts/seed.ts  # popula com 104 alunos, 7 turmas, badges, avisos, tarefas
bun run dev
```

Abrir http://localhost:3000 e escolher um perfil de demonstração.

## Deploy no Vercel

1. Faça push do código para um repositório no GitHub.
2. No Vercel, importe o repositório.
3. Configurações:
   - **Framework Preset**: Next.js
   - **Build Command**: `bun run build`
   - **Install Command**: `bun install`
4. Variáveis de ambiente necessárias:
   - `DATABASE_URL` — use o Vercel Postgres (free tier) ou um Neon/Supabase. Substitua `provider = "sqlite"` por `"postgresql"` no `prisma/schema.prisma` se for o caso.
   - `.z-ai-config` — configurar via Vercel para o SDK de IA, OU substituir a inicialização em `src/app/api/ia/route.ts` por uma chamada direta à API do provedor desejado (OpenAI, Anthropic, etc).
5. Após o primeiro deploy, rode o seed: `vercel env pull && bun run scripts/seed.ts` ou crie um endpoint `/api/seed` protegido.

### Substituindo o provedor de IA

A rota `src/app/api/ia/route.ts` está isolada e usa `z-ai-web-dev-sdk`. Para usar outro provedor (OpenAI, Anthropic, Google Gemini), basta substituir o bloco:

```ts
const zai = await ZAI.create()
const completion = await zai.chat.completions.create({...})
```

pelo equivalente do seu provedor. O resto (limite diário, system prompt, histórico) continua igual.

## Stack técnica

- **Next.js 16** com App Router (TypeScript)
- **Prisma ORM** + SQLite (desenvolvimento) / Postgres (produção)
- **Tailwind CSS 4** + **shadcn/ui**
- **z-ai-web-dev-sdk** para IA
- **Zustand** para estado no cliente
- **date-fns** para formatação

## Próximos passos sugeridos (versão 2+)

- Biblioteca e resumos físicos com validação manual
- Avatares customizáveis e skins
- Eventos sazonais com XP multiplicador
- Editor visual de abas (admin cria novas seções)
- Notificações push
- App mobile (React Native)

## Sobre o projeto

Idealizado por um aluno de 13 anos que percebeu que pensa melhor andando.  
Esta é a versão de demonstração para conversar com a escola — o próximo passo é a apresentação oficial.
