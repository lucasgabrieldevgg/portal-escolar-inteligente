# Portal Escolar Inteligente (Smart School Portal)

> School platform with an AI assistant, XP/coins system, skin shop, badges, AI-validated library, weekly ranking and a bug-hunting program.

> **Status:** demonstration MVP · Built for Escola Estadual Professora Eunice Souza dos Santos (Rondonópolis, MT, Brazil)

[Leia em Português](README.pt-BR.md)

## Online demo

**https://my-project-swart-nine-11.vercel.app**

## How to use

1. Open the URL above
2. Click any demo profile (no password)
3. Explore the portal!

### Demo profiles

| Profile | Email | Access |
|---------|-------|--------|
| Luke S. (Student) | luke.silva@portal.escola.br | AI, tasks, ranking, shop, badges |
| Ms. Ana (Teacher) | ana.costa@portal.escola.br | Classes, tasks, grading, own AI |
| Ms. Helena (Librarian) | biblioteca@portal.escola.br | Validate summaries with AI |
| Ms. Marta (Coordination) | marta.silva@portal.escola.br | Manage accounts, announcements, badges, coins |
| Administrator | admin@portal.escola.br | Everything + maintenance mode |

## Features

### 5 access roles
- **Student** — announcements, tasks, AI, ranking, shop, library, badges, bugs, avatar
- **Teacher** — classes, class announcements, tasks, grading, grant XP/coins, own AI
- **Librarian** — validates book summaries with AI help (photo of the handwritten summary)
- **Coordination** — official announcements, manage accounts, grant badges/coins, maintenance mode
- **Admin** — everything coordination does + system settings

### XP + Coins system (separate)
- **Weekly XP**: resets every Monday (competitive ranking)
- **Total XP**: lifetime, never resets (shown on the profile)
- **Coins**: earned from tasks/library/bugs, spent in the skin shop, never expire
- Every student starts with 50 coins

### Multi-model AI (OpenRouter)
- **Text model**: `nvidia/nemotron-3-super-120b-a12b:free` (377B params, free)
- **Vision model**: `nvidia/nemotron-nano-12b-2-vl:free` (the only free model that reads images)
- Students can attach an image (e.g. a photo of an exercise, slide or chart)
- The librarian can send a photo of a handwritten summary for analysis
- Automatic fallback to z-ai-web-dev-sdk if OpenRouter fails
- Configurable daily limit (default: 15 questions/day)
- Wikipedia integration (PT + EN with translation)
- Didactic system prompt (adapted Socratic method, everyday examples)
- AI rewriting for texts (announcements, badge descriptions) with undo/redo

### Teacher AI
- Dedicated system prompt: create questions, rubrics, activities, adapt content
- Ready-made suggestions: create questions, build a rubric, suggest an activity, adapt for struggling students
- Does not count towards the student limit

### Library (paper summary + AI)
- Student reads a book, writes a summary **BY HAND on paper**, hands it in at the library
- Librarian takes a **photo of the summary** and registers it in the system
- The AI analyzes the photo and gives feedback:
  - Automatically transcribes the summary
  - Detects the book title from the header
  - Assesses legibility, quality, whether it looks copied
  - Recommendation (YES/MAYBE/NO)
- The librarian approves or rejects (the final call is theirs, the AI only helps)
- If approved: +30 XP + 15 coins + counts towards Bronze/Silver/Gold Reader badges
- "Grant XP/Coins" tab to reward without registering a summary

### Skin shop (18 items)
- **Colors** (7): solid, some free, others 10–30 coins
- **Gradients** (5): Sunset, Ocean, Galaxy, Rainbow — 50–200 coins
- **Frames/borders** (2): Gold, Silver — 40 coins
- **Premium emojis** (5): Crown, Diamond, Dragon — 5–180 coins
- Rarities: Common, Rare, Epic, Legendary

### Weekly ranking
- Resets automatically every Monday
- 4 tabs: Global, Morning, Afternoon, My class
- Top 3 with medals (gold/silver/bronze)
- Click anyone to open their full profile

### Badges
- 10 badges (no "Portal Founder")
- 3 categories: Academic, Contribution, Special
- Special badges give no XP — they represent contribution
- Automatic badges granted by the system
- Admin-only badges granted by coordination
- Gallery with 🔒 Admin and Auto seals
- Coordination can **create custom badges** with an emoji picker (9 categories) + AI-rewrite the description

### Announcements (3 types)
- **Official** (coordination): visible to everyone, with categories and highlights
- **Class** (teacher or coordination): visible only to the selected class
- AI rewriting (4 tones: clear, formal, friendly, urgent) + undo/redo

### Maintenance mode
- Switch in the coordination panel
- Students/teachers cannot log in while active
- Custom message

### Account management (coordination/admin only)
- Create account: custom name, role (Student, Teacher, Librarian, Coordination, Admin)
- Teacher: pick subjects (12 presets + custom)
- Student: pick class (shift fills in automatically)
- Edit: name, role, class, subjects, activate/deactivate
- Reset password: generate a new one OR custom
- Email generated automatically: `name.surname@portal.escola.br`

### Info menu (hidden)
- Collapsible at the bottom of the sidebar
- 3 sub-items: About the School, About the Portal, FAQ
- FAQ with 8 common questions

### Light/dark theme
- Toggle in the header
- Persists in the browser

## Tech stack

- **Next.js 16** with App Router (TypeScript)
- **Prisma ORM** + SQLite (development and production)
- **Tailwind CSS 4** + **shadcn/ui**
- **z-ai-web-dev-sdk** as AI fallback
- **OpenRouter** for free models (Nemotron 3 Super + Nemotron Nano 12B VL)
- **Zustand** for client state
- **next-themes** for light/dark theme

## Run locally

```bash
bun install
bun run db:push          # creates the SQLite database
bun run dev              # starts the server
```

Open http://localhost:3000 and click any profile to log in (no password).

## Deploy to Vercel

1. Push the code to a GitHub repository
2. In Vercel, import the repository
3. Settings:
   - Framework Preset: Next.js
   - Build Command: `bun run build`
   - Install Command: `bun install`
4. Environment variables:
   - `DATABASE_URL` = `file:/tmp/portal.db`
   - `OPENROUTER_API_KEYS` = your OpenRouter keys (optional, there is a fallback)
5. Deploy!

The SQLite database is created automatically in `/tmp` on first access and seeded with demo data. Data persists while the server session lives (cold starts may reset it).

## OpenRouter model list (all free)

### Text models
| Model | Params | Context | Speed |
|-------|--------|---------|-------|
| `nvidia/nemotron-3-super-120b-a12b:free` | 377B | 262,144 | 71 t/s |
| `nvidia/nemotron-3-nano-30b-a3b:free` | 50.1B | 256,000 | 123 t/s |
| `nvidia/nemotron-nano-9b-v2:free` | 16.5B | 128,000 | 32 t/s |
| `openai/gpt-oss-20b:free` | 11.3B | 131,072 | 22 t/s |
| `google/gemma-4-31b:free` | 1.68B | 262,144 | 21 t/s |
| `google/gemma-4-26b-a4b:free` | 16.8B | 262,144 | 14 t/s |

### Vision (image) model
| Model | Params | Context |
|-------|--------|---------|
| `nvidia/nemotron-nano-12b-2-vl:free` | 11.7B | 128,000 |

## Setting up your own OpenRouter keys

1. Go to https://openrouter.ai
2. Sign in → Keys → Create Key
3. Copy the `sk-or-v1-...` key
4. In Vercel: Settings → Environment Variables → `OPENROUTER_API_KEYS`

The Wikipedia API needs no key (public and free).

## About the project

Created by Lucas Gabriel, a student who realized he thinks better while walking.
Built for Escola Estadual Professora Eunice Souza dos Santos (Rondonópolis, MT).

This is a demonstration project. Even if the school doesn't adopt it, it stands as a portfolio piece on GitHub.

## License

MIT — feel free to use, modify and distribute.
