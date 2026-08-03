import { create } from 'zustand'

export type Role = 'ALUNO' | 'PROFESSOR' | 'BIBLIOTECARIO' | 'COORDENACAO' | 'ADMIN'

export interface User {
  id: string; email: string; name: string; role: Role
  turno?: string | null; turmaId?: string | null
  turma?: { id: string; nome: string; turno: string; ano: string } | null
  xp: number; xpTotal: number; moedinhas: number
  iaUsadasHoje: number; iaLimiteDiario: number; sequenciaDias: number
  avatarConfig?: string | null
}

export type View =
  | 'home' | 'avisos' | 'tarefas' | 'ia' | 'ranking' | 'perfil' | 'badges' | 'bugs' | 'inscricao-dev' | 'avatar' | 'loja' | 'biblioteca'
  | 'prof-turmas' | 'prof-avisos' | 'prof-tarefas' | 'prof-corrigir' | 'prof-xp' | 'prof-ia'
  | 'coord-avisos' | 'coord-contas' | 'coord-badges' | 'coord-moedinhas' | 'coord-manutencao' | 'coord-bugs' | 'coord-inscricoes' | 'coord-tarefas'
  | 'bib-resumos' | 'info-escola' | 'info-portal' | 'info-faq'

interface AppState {
  user: User | null; loadingUser: boolean; view: View
  setUser: (u: User | null) => void; setLoadingUser: (b: boolean) => void; setView: (v: View) => void; logout: () => void
}

export const useApp = create<AppState>((set) => ({
  user: null, loadingUser: true, view: 'home',
  setUser: (u) => set({ user: u }), setLoadingUser: (b) => set({ loadingUser: b }),
  setView: (v) => set({ view: v }), logout: () => set({ user: null, view: 'home' }),
}))

export async function api<T = any>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...options, headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) } })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((data as any)?.error || `Erro ${res.status}`)
  return data as T
}
