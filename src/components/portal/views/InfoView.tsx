'use client'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { School, GraduationCap, BookOpen, Bot, Trophy, Award, Bug, Rocket, Library, Store, Palette, Bell, ClipboardList } from 'lucide-react'

export function InfoView() {
  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <Tabs defaultValue="info-escola">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="info-escola">Sobre a Escola</TabsTrigger>
          <TabsTrigger value="info-portal">Sobre o Portal</TabsTrigger>
          <TabsTrigger value="info-faq">FAQ</TabsTrigger>
        </TabsList>

        <TabsContent value="info-escola" className="mt-4 space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <School className="w-5 h-5 text-emerald-600" />
                Escola Estadual Professora Eunice Souza dos Santos
              </CardTitle>
              <CardDescription>
                Escola pública estadual de Ensino Fundamental II.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="flex items-start gap-2">
                <GraduationCap className="w-4 h-4 mt-0.5 text-emerald-600 flex-shrink-0" />
                <span><strong>Localização:</strong> Rondonópolis — Mato Grosso (MT)</span>
              </p>
              <p className="flex items-start gap-2">
                <BookOpen className="w-4 h-4 mt-0.5 text-emerald-600 flex-shrink-0" />
                <span><strong>Atendimento:</strong> Ensino Fundamental II (6º ao 9º ano).</span>
              </p>
              <p className="flex items-start gap-2">
                <School className="w-4 h-4 mt-0.5 text-emerald-600 flex-shrink-0" />
                <span><strong>Turnos:</strong> 6º e 7º ano à tarde · 8º e 9º ano pela manhã.</span>
              </p>
              <p className="flex items-start gap-2">
                <Library className="w-4 h-4 mt-0.5 text-emerald-600 flex-shrink-0" />
                <span><strong>Biblioteca ativa:</strong> Programa de leitura com recompensas em XP e moedinhas para resumos de livros.</span>
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="info-portal" className="mt-4 space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-emerald-600" /> Portal Escolar Inteligente
              </CardTitle>
              <CardDescription>
                Plataforma desenvolvida para gamificar o aprendizado.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <Recurso icon={Bell} titulo="Avisos Oficiais" descricao="Comunicação oficial da coordenação e avisos de turma dos professores." />
              <Recurso icon={Bot} titulo="Assistente de IA" descricao="Tira dúvidas de estudo com limite diário. Não faz tarefas por você." />
              <Recurso icon={Trophy} titulo="Ranking Semanal" descricao="XP reseta toda segunda. Rankings global, por turno e por turma." />
              <Recurso icon={Award} titulo="Badges" descricao="Conquistas acadêmicas, de contribuição e especiais que dão XP." />
              <Recurso icon={Bug} titulo="Caça aos Bugs" descricao="Reporte problemas e ganhe XP. Crítico: +150 · Normal: +80 · Sugestão: +30." />
              <Recurso icon={Rocket} titulo="Quero colaborar" descricao="Alunos podem se inscrever para ajudar a melhorar o portal." />
              <Recurso icon={Store} titulo="Loja de Avatares" descricao="Use moedinhas para personalizar seu avatar: cores, gradientes, frames e emojis." />
              <Recurso icon={Library} titulo="Biblioteca" descricao="Envie resumos de livros e ganhe XP + moedinhas." />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Papéis no sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><strong className="text-emerald-700">Aluno:</strong> acessa avisos, tarefas, IA, ranking, loja, biblioteca, badges, caça aos bugs e pode se inscrever como colaborador.</p>
              <p><strong className="text-amber-700">Professor:</strong> cria avisos de turma e tarefas, corrige entregas e concede XP.</p>
              <p><strong className="text-purple-700">Bibliotecário:</strong> valida resumos de livros enviados pelos alunos.</p>
              <p><strong className="text-rose-700">Coordenação:</strong> gerencia contas, badges, moedinhas, manutenção e avalia bugs e inscrições.</p>
              <p><strong className="text-slate-700">Admin:</strong> acesso total, equivalente à coordenação.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="info-faq" className="mt-4 space-y-3">
          <Card>
            <CardHeader><CardTitle className="text-base">Perguntas frequentes</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <FAQ q="Como faço login?" a="Use seu email institucional (@portal.escola.br) e a senha que a coordenação te entregou. Em demonstração, todas as contas usam senha demo1234." />
              <FAQ q="Esqueci minha senha, e agora?" a="Procure a coordenação. Ela pode resetar sua senha e te entregar uma nova." />
              <FAQ q="Como ganho XP?" a="Entregando tarefas (o professor avalia), reportando bugs válidos, resumindo livros, recebendo badges e ganhar XP manual do professor." />
              <FAQ q="Como ganho moedinhas?" a="Resumindo livros, ganham algumas a cada badge de contribuição, ou a coordenação/professor pode conceder manualmente." />
              <FAQ q="O ranking reseta?" a="Sim! O XP semanal reseta toda segunda-feira. Seu XP total (histórico) fica registrado no perfil e nunca é perdido." />
              <FAQ q="A IA faz minha tarefa?" a="Não. A IA é um assistente de estudos: ela explica, resume e dá dicas. Usar IA para gerar respostas inteiras e copiar é anti-fraude e pode anular o XP." />
              <FAQ q="Posso trocar meu avatar?" a="Sim! Vá em 'Meu Avatar' no menu. Use skins que já possui ou compre novas na Loja com moedinhas." />
              <FAQ q="Como reportar um bug?" a="Vá em 'Caça aos Bugs' e preencha o formulário com o máximo de detalhes. A coordenação avalia e você ganha XP se for válido." />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function Recurso({ icon: Icon, titulo, descricao }: { icon: any; titulo: string; descricao: string }) {
  return (
    <div className="flex items-start gap-2 p-2 rounded-lg border bg-card/50">
      <Icon className="w-4 h-4 mt-0.5 text-emerald-600 flex-shrink-0" />
      <div>
        <p className="font-semibold text-sm">{titulo}</p>
        <p className="text-xs text-muted-foreground">{descricao}</p>
      </div>
    </div>
  )
}

function FAQ({ q, a }: { q: string; a: string }) {
  return (
    <div className="border-l-2 border-emerald-400 pl-3">
      <p className="font-semibold">{q}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{a}</p>
    </div>
  )
}

export { ClipboardList, Palette }
