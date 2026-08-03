'use client'

import { useEffect, useMemo, useState } from 'react'
import { useApp, api } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Badge as BadgeUI } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar } from './Avatar'
import { ThemeToggle } from './ThemeToggle'
import { SobreEscolaButton } from './SobreEscolaButton'
import { toast } from 'sonner'
import {
  GraduationCap, Home, Bell, BookOpen, Bot, Trophy, User as UserIcon,
  Award, Bug, Rocket, LogOut, Users, ClipboardCheck, Sparkles, Coins,
  Megaphone, ShieldAlert, ClipboardList, Menu, Store, Library, Palette,
  Info, Settings, Cog, BadgeCheck, Wand2,
} from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { StudentHome } from './views/StudentHome'
import { StudentAvisos } from './views/StudentAvisos'
import { StudentTarefas } from './views/StudentTarefas'
import { StudentIA } from './views/StudentIA'
import { RankingView } from './views/RankingView'
import { PerfilView } from './views/PerfilView'
import { BadgesView } from './views/BadgesView'
import { BugsView } from './views/BugsView'
import { InscricaoDevView } from './views/InscricaoDevView'
import { LojaView } from './views/LojaView'
import { BibliotecaView } from './views/BibliotecaView'
import { InfoView } from './views/InfoView'
import { ProfTurmas } from './views/ProfTurmas'
import { ProfAvisos } from './views/ProfAvisos'
import { ProfTarefas } from './views/ProfTarefas'
import { ProfCorrigir } from './views/ProfCorrigir'
import { ProfXP } from './views/ProfXP'
import { ProfIA } from './views/ProfIA'
import { CoordAvisos } from './views/CoordAvisos'
import { CoordContas } from './views/CoordContas'
import { CoordBadgesView } from './views/CoordBadgesView'
import { CoordMoedinhas } from './views/CoordMoedinhas'
import { CoordManutencao } from './views/CoordManutencao'
import { CoordBugs } from './views/CoordBugs'
import { CoordInscricoes } from './views/CoordInscricoes'
import { CoordTarefas } from './views/CoordTarefas'

interface NavItem {
  id: any
  label: string
  icon: any
}

const NAV_ALUNO: NavItem[] = [
  { id: 'home', label: 'Início', icon: Home },
  { id: 'avisos', label: 'Avisos', icon: Bell },
  { id: 'tarefas', label: 'Tarefas', icon: BookOpen },
  { id: 'ia', label: 'Assistente IA', icon: Bot },
  { id: 'ranking', label: 'Ranking', icon: Trophy },
  { id: 'loja', label: 'Loja', icon: Store },
  { id: 'biblioteca', label: 'Biblioteca', icon: Library },
  { id: 'avatar', label: 'Meu Avatar', icon: Palette },
  { id: 'badges', label: 'Galeria de Badges', icon: Award },
  { id: 'bugs', label: 'Caça aos Bugs', icon: Bug },
  { id: 'inscricao-dev', label: 'Quero colaborar', icon: Rocket },
  { id: 'info', label: 'Sobre o Portal', icon: Info },
  { id: 'perfil', label: 'Meu Perfil', icon: UserIcon },
]

const NAV_PROF: NavItem[] = [
  { id: 'prof-turmas', label: 'Minhas Turmas', icon: Users },
  { id: 'prof-avisos', label: 'Avisos de Turma', icon: Megaphone },
  { id: 'prof-tarefas', label: 'Tarefas', icon: BookOpen },
  { id: 'prof-corrigir', label: 'Corrigir Entregas', icon: ClipboardCheck },
  { id: 'prof-xp', label: 'Conceder XP', icon: Sparkles },
  { id: 'prof-ia', label: 'Assistente IA', icon: Bot },
]

const NAV_COORD: NavItem[] = [
  { id: 'coord-avisos', label: 'Avisos Oficiais', icon: Megaphone },
  { id: 'coord-contas', label: 'Contas', icon: Users },
  { id: 'coord-tarefas', label: 'Tarefas', icon: ClipboardList },
  { id: 'coord-badges', label: 'Badges', icon: BadgeCheck },
  { id: 'coord-moedinhas', label: 'Moedinhas', icon: Coins },
  { id: 'coord-bugs', label: 'Bugs Reportados', icon: ShieldAlert },
  { id: 'coord-inscricoes', label: 'Inscrições Dev', icon: Rocket },
  { id: 'coord-manutencao', label: 'Manutenção', icon: Settings },
  { id: 'info', label: 'Sobre o Portal', icon: Info },
]

const NAV_BIB: NavItem[] = [
  { id: 'bib-resumos', label: 'Resumos da Biblioteca', icon: Library },
  { id: 'info', label: 'Sobre o Portal', icon: Info },
]

export function Dashboard() {
  const { user, view, setView, logout, setUser } = useApp()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems = useMemo<NavItem[]>(() => {
    if (user?.role === 'ALUNO') return NAV_ALUNO
    if (user?.role === 'PROFESSOR') return NAV_PROF
    if (user?.role === 'BIBLIOTECARIO') return NAV_BIB
    if (user?.role === 'COORDENACAO' || user?.role === 'ADMIN') return NAV_COORD
    return []
  }, [user])

  useEffect(() => {
    if (navItems.length > 0 && !navItems.find((n) => n.id === view)) {
      setView(navItems[0].id)
    }
  }, [navItems, view, setView])

  async function handleLogout() {
    await api('/api/auth/logout', { method: 'POST' })
    logout()
    toast.success('Você saiu da sua conta.')
  }

  async function refreshUser() {
    try {
      const data = await api<{ user: any }>('/api/me')
      setUser(data.user)
    } catch {}
  }

  function renderView() {
    switch (view) {
      case 'home': return <StudentHome />
      case 'avisos': return <StudentAvisos />
      case 'tarefas': return <StudentTarefas />
      case 'ia': return <StudentIA />
      case 'ranking': return <RankingView />
      case 'perfil': return <PerfilView userId={user?.id || ''} />
      case 'badges': return <BadgesView />
      case 'bugs': return <BugsView onXpGained={refreshUser} />
      case 'inscricao-dev': return <InscricaoDevView />
      case 'loja': return <LojaView onComprou={refreshUser} />
      case 'biblioteca': return <BibliotecaView />
      case 'bib-resumos': return <BibliotecaView />
      case 'avatar': return <PerfilView userId={user?.id || ''} editAvatar />
      case 'info': return <InfoView />
      // professor
      case 'prof-turmas': return <ProfTurmas />
      case 'prof-avisos': return <ProfAvisos />
      case 'prof-tarefas': return <ProfTarefas />
      case 'prof-corrigir': return <ProfCorrigir onXpGained={refreshUser} />
      case 'prof-xp': return <ProfXP onXpGained={refreshUser} />
      case 'prof-ia': return <ProfIA />
      // coordenacao
      case 'coord-avisos': return <CoordAvisos />
      case 'coord-contas': return <CoordContas />
      case 'coord-badges': return <CoordBadgesView />
      case 'coord-moedinhas': return <CoordMoedinhas />
      case 'coord-manutencao': return <CoordManutencao />
      case 'coord-bugs': return <CoordBugs onAvaliado={refreshUser} />
      case 'coord-inscricoes': return <CoordInscricoes />
      case 'coord-tarefas': return <CoordTarefas />
      default: return <StudentHome />
    }
  }

  const currentNav = navItems.find((n) => n.id === view)

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm leading-tight">Portal Escolar</p>
            <p className="text-[10px] text-sidebar-foreground/60">Inteligente</p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 px-2">
        <nav className="space-y-0.5 py-3">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = view === item.id
            return (
              <button
                key={item.id}
                onClick={() => {
                  setView(item.id)
                  setMobileOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            )
          })}
        </nav>
      </ScrollArea>

      <div className="p-3 border-t border-sidebar-border">
        <div className="flex items-center gap-2 p-2 rounded-lg bg-sidebar-accent/50 mb-2">
          <Avatar config={user?.avatarConfig} name={user?.name} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate text-sidebar-foreground">{user?.name}</p>
            <p className="text-[10px] text-sidebar-foreground/60 truncate">
              {user?.role === 'ALUNO'
                ? `${user?.turma?.nome || ''} · ${user?.turno === 'MANHA' ? 'Manhã' : 'Tarde'}`
                : user?.role === 'PROFESSOR'
                ? 'Professor(a)'
                : user?.role === 'BIBLIOTECARIO'
                ? 'Bibliotecário(a)'
                : user?.role === 'COORDENACAO'
                ? 'Coordenação'
                : 'Administrador'}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground">
          <LogOut className="w-4 h-4 mr-2" /> Sair
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="hidden lg:flex w-64 flex-shrink-0 bg-sidebar text-sidebar-foreground">
        {sidebarContent}
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 p-0 bg-sidebar text-sidebar-foreground">
          {sidebarContent}
        </SheetContent>
      </Sheet>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="border-b bg-card h-14 flex items-center justify-between px-4 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
            </Sheet>
            <h1 className="font-semibold text-base sm:text-lg">
              {currentNav?.label || 'Início'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {user?.role === 'ALUNO' && (
              <>
                <BadgeUI className="bg-amber-100 text-amber-900 hover:bg-amber-100 border-amber-200">
                  <Sparkles className="w-3 h-3 mr-1" />
                  {user.xp} XP
                </BadgeUI>
                <BadgeUI className="bg-emerald-100 text-emerald-900 hover:bg-emerald-100 border-emerald-200">
                  <Coins className="w-3 h-3 mr-1" />
                  {user.moedinhas || 0}
                </BadgeUI>
              </>
            )}
            <SobreEscolaButton />
            <ThemeToggle />
            <Avatar config={user?.avatarConfig} name={user?.name} size="sm" className="hidden sm:flex" />
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 overflow-x-hidden">
          {renderView()}
        </main>

        <footer className="border-t bg-card py-3 mt-auto">
          <div className="container mx-auto px-4 text-center text-[11px] text-muted-foreground">
            Portal Escolar Inteligente · Escola Est. Profª Eunice Souza dos Santos · Rondonópolis-MT
          </div>
        </footer>
      </div>
    </div>
  )
}

export { Cog, Wand2 } // evita warning de import não usado
