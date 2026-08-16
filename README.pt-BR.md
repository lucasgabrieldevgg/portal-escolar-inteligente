# Portal Escolar Inteligente

> Plataforma escolar com assistente de IA, XP/moedinhas, loja de skins, badges e biblioteca com validação por IA.
>
> **Status:** MVP de demonstração · Escola Estadual Professora Eunice Souza dos Santos (Rondonópolis-MT)

[Read in English](README.md)

---

# Portal Escolar Inteligente

Plataforma escolar com assistente de IA, sistema de XP/moedinhas, loja de skins, badges, biblioteca com validação por IA, ranking semanal e programa de caça aos bugs.

> **Status**: MVP de demonstração · Desenvolvido para a Escola Estadual Professora Eunice Souza dos Santos (Rondonópolis-MT)

## Demonstração online

**https://my-project-swart-nine-11.vercel.app**

## Como usar

1. Acesse a URL acima
2. Clique em qualquer perfil de demonstração (sem senha)
3. Explore o portal!

### Perfis de demonstração

| Perfil | Email | Acesso |
|--------|-------|--------|
| Luke S. (Aluno) | luke.silva@portal.escola.br | IA, tarefas, ranking, loja, badges |
| Profa. Ana (Professora) | ana.costa@portal.escola.br | Turmas, tarefas, corrigir, IA própria |
| Sra. Helena (Bibliotecária) | biblioteca@portal.escola.br | Validar resumos com IA |
| Profa. Marta (Coordenação) | marta.silva@portal.escola.br | Gerenciar contas, avisos, badges, moedinhas |
| Administrador | admin@portal.escola.br | Tudo + modo manutenção |

## Funcionalidades

### 5 perfis de acesso
- **Aluno** — avisos, tarefas, IA, ranking, loja, biblioteca, badges, bugs, avatar
- **Professor** — turmas, avisos de turma, tarefas, corrigir, conceder XP/moedinhas, IA própria
- **Bibliotecário** — valida resumos de livros com ajuda da IA (foto do resumo à mão)
- **Coordenação** — avisos oficiais, gerenciar contas, conceder badges/moedinhas, modo manutenção
- **Admin** — tudo da coordenação + configurações do sistema

### Sistema de XP + Moedinhas (separados)
- **XP semanal**: reseta toda segunda-feira (ranking competitivo)
- **XP total**: histórico, nunca reseta (registrado no perfil)
- **Moedinhas**: ganha em tarefas/biblioteca/bugs, gasta na loja de skins, nunca somem
- Todo aluno começa com 50 moedinhas

### IA Multi-modelo (OpenRouter)
- **Modelo de texto**: `nvidia/nemotron-3-super-120b-a12b:free` (377B params, free)
- **Modelo de visão**: `nvidia/nemotron-nano-12b-2-vl:free` (único free que lê imagem)
- Aluno pode anexar imagem (ex: foto de exercício, slide, gráfico)
- Bibliotecária pode enviar foto de resumo escrito à mão para análise
- Fallback automático para z-ai-web-dev-sdk se OpenRouter falhar
- Limite diário configurável (default: 15 perguntas/dia)
- Wikipedia integrada (PT + EN com tradução)
- System prompt didático (método socrático adaptado, exemplos do cotidiano)
- Reformular textos com IA (avisos, descrição de badges) com undo/redo

### IA para Professores
- System prompt específico: criar questões, rubricas, atividades, adaptar conteúdo
- Sugestões prontas: criar questões, montar rubrica, sugerir atividade, adaptar para alunos com dificuldade
- Não conta no limite dos alunos

### Biblioteca (resumo em papel + IA)
- Aluno lê livro, escreve resumo **À MÃO em papel**, entrega na biblioteca
- Bibliotecária tira **foto do resumo** e registra no sistema
- IA analisa a foto e dá feedback:
  - Transcreve o resumo automaticamente
  - Detecta o nome do livro do cabeçalho
  - Avalia legibilidade, qualidade, se parece copiado
  - Recomendação (SIM/TALVEZ/NÃO)
- Bibliotecária aprova ou recusa (decisão final é dela, IA só ajuda)
- Se aprovado: +30 XP + 15 moedinhas + contagem para badges Leitor Bronze/Prata/Ouro
- Aba "Conceder XP/Moedas" para premiar sem registrar resumo

### Loja de Skins (18 itens)
- **Cores** (7): sólidas, algumas grátis, outras 10-30 moedinhas
- **Gradientes** (5): Pôr do Sol, Oceano, Galáxia, Arco-Íris — 50-200 moedinhas
- **Frames/bordas** (2): Dourada, Prateada — 40 moedinhas
- **Emojis premium** (5): Coroa, Diamante, Dragão — 5-180 moedinhas
- Raridades: Comum, Rara, Épica, Lendária

### Ranking Semanal
- Reseta toda segunda-feira automaticamente
- 4 abas: Global, Manhã, Tarde, Minha turma
- Top 3 com medalhas (ouro/prata/bronze)
- Clicar em qualquer pessoa abre o perfil completo

### Badges
- 10 badges (sem "Fundador do Portal")
- 3 categorias: Acadêmica, Contribuição, Especial
- Badges Especiais não dão XP — representam contribuição
- Badges Automáticas concedidas pelo sistema
- Badges Admin só coordenação concede
- Galeria com selos 🔒 Admin e Auto
- Coordenação pode **criar badges personalizadas** com emoji picker (9 categorias) + reformular descrição com IA

### Avisos (3 tipos)
- **Oficiais** (coordenação): visíveis para todos, com categorias e destaques
- **De turma** (professor ou coordenação): visíveis apenas para a turma selecionada
- Reformulação com IA (4 tons: claro, formal, amigável, urgente) + undo/redo

### Modo Manutenção
- Switch no painel da coordenação
- Alunos/professores não conseguem fazer login quando ativo
- Mensagem customizável

### Gerenciamento de Contas (só coordenação/admin)
- Criar conta: nome personalizado, cargo (Aluno, Professor, Bibliotecário, Coordenação, Admin)
- Professor: seleciona matérias (12 predefinidas + customizada)
- Aluno: seleciona turma (turno vem automático)
- Editar: nome, cargo, turma, matérias, ativar/desativar
- Resetar senha: gerar nova OU personalizada
- Email gerado automaticamente: `nome.sobrenome@portal.escola.br`

### Menu Informações (escondido)
- Colapsável no final do menu lateral
- 3 sub-itens: Sobre a Escola, Sobre o Portal, Perguntas Frequentes
- FAQ com 8 perguntas comuns

### Tema claro/escuro
- Toggle no header
- Persiste no navegador

## Stack técnica

- **Next.js 16** com App Router (TypeScript)
- **Prisma ORM** + SQLite (desenvolvimento e produção)
- **Tailwind CSS 4** + **shadcn/ui**
- **z-ai-web-dev-sdk** para fallback de IA
- **OpenRouter** para modelos free (Nemotron 3 Super + Nemotron Nano 12B VL)
- **Zustand** para estado no cliente
- **next-themes** para tema claro/escuro

## Como rodar localmente

```bash
bun install
bun run db:push          # cria o banco SQLite
bun run dev              # inicia o servidor
```

Abrir http://localhost:3000. Clique em qualquer perfil para entrar (sem senha).

## Deploy na Vercel

1. Faça push do código para um repositório no GitHub
2. No Vercel, importe o repositório
3. Configurações:
   - Framework Preset: Next.js
   - Build Command: `bun run build`
   - Install Command: `bun install`
4. Variáveis de ambiente:
   - `DATABASE_URL` = `file:/tmp/portal.db`
   - `OPENROUTER_API_KEYS` = suas chaves do OpenRouter (opcional, tem fallback)
5. Deploy!

O banco SQLite é criado automaticamente em `/tmp` no primeiro acesso e populado com dados de demonstração. Os dados persistem durante a sessão do servidor (cold starts podem resetar os dados).

## Lista de modelos OpenRouter (todos free)

### Modelos de Texto
| Modelo | Params | Contexto | Velocidade |
|--------|--------|----------|------------|
| `nvidia/nemotron-3-super-120b-a12b:free` | 377B | 262.144 | 71 t/s |
| `nvidia/nemotron-3-nano-30b-a3b:free` | 50,1B | 256.000 | 123 t/s |
| `nvidia/nemotron-nano-9b-v2:free` | 16,5B | 128.000 | 32 t/s |
| `openai/gpt-oss-20b:free` | 11,3B | 131.072 | 22 t/s |
| `google/gemma-4-31b:free` | 1,68B | 262.144 | 21 t/s |
| `google/gemma-4-26b-a4b:free` | 16,8B | 262.144 | 14 t/s |

### Modelo de Visão (imagem)
| Modelo | Params | Contexto |
|--------|--------|----------|
| `nvidia/nemotron-nano-12b-2-vl:free` | 11,7B | 128.000 |

## Para configurar suas próprias chaves OpenRouter

1. Acesse https://openrouter.ai
2. Sign in → Keys → Create Key
3. Copie a chave `sk-or-v1-...`
4. No Vercel: Settings → Environment Variables → `OPENROUTER_API_KEYS`

Wikipedia API não precisa de chave (pública e gratuita).

## Sobre o projeto

Idealizado por Lucas Gabriel, um aluno que percebeu que pensa melhor andando.
Desenvolvido para a Escola Estadual Professora Eunice Souza dos Santos (Rondonópolis-MT).

Este é um projeto de demonstração. Mesmo que a escola não adote, fica como portfólio no GitHub.

## Licença

MIT — sinta-se livre para usar, modificar e distribuir.
