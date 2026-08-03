'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Settings, AlertTriangle, Save, Wrench } from 'lucide-react'
import { toast } from 'sonner'

export function CoordManutencao() {
  const [manutencao, setManutencao] = useState(false)
  const [mensagem, setMensagem] = useState('')
  const [dominioEmail, setDominioEmail] = useState('')
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    api<{ manutencao: boolean; mensagem: string; dominioEmail: string }>('/api/settings').then((d) => {
      setManutencao(d.manutencao)
      setMensagem(d.mensagem)
      setDominioEmail(d.dominioEmail)
    })
  }, [])

  async function salvar() {
    setSalvando(true)
    try {
      await api('/api/settings', {
        method: 'POST',
        body: JSON.stringify({
          manutencao,
          mensagem,
          dominioEmail,
        }),
      })
      toast.success('Configurações salvas!')
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center gap-2">
        <Wrench className="w-5 h-5 text-rose-600" />
        <h2 className="text-xl font-bold">Manutenção e Configurações</h2>
      </div>

      <Card className={manutencao ? 'border-rose-300 bg-rose-50/30 dark:bg-rose-950/20' : ''}>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="w-4 h-4" /> Modo de manutenção
          </CardTitle>
          <CardDescription>
            Quando ativado, alunos e professores veem uma tela de manutenção ao entrar no portal. Coordenação e admin continuam com acesso.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <Switch checked={manutencao} onCheckedChange={setManutencao} />
            <Label className="text-sm">
              {manutencao ? 'Manutenção ATIVADA — portal bloqueado para usuários comuns' : 'Manutenção desativada — portal funcionando normalmente'}
            </Label>
          </div>
          {manutencao && (
            <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg p-3 text-xs text-rose-900 dark:text-rose-200 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Atenção!</p>
                <p>Os usuários não conseguirão entrar enquanto o modo manutenção estiver ativo. Use apenas quando realmente necessário.</p>
              </div>
            </div>
          )}
          <div>
            <Label className="text-xs">Mensagem exibida no modo manutenção</Label>
            <Textarea value={mensagem} onChange={(e) => setMensagem(e.target.value)} rows={3} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Domínio de email</CardTitle>
          <CardDescription>
            Domínio dos emails institucionais da escola. Usado para validar cadastros e exibir no rodapé.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Label className="text-xs">Domínio</Label>
          <Input value={dominioEmail} onChange={(e) => setDominioEmail(e.target.value)} placeholder="portal.escola.br" />
        </CardContent>
      </Card>

      <Button onClick={salvar} disabled={salvando} className="w-full">
        <Save className="w-4 h-4 mr-2" /> {salvando ? 'Salvando...' : 'Salvar configurações'}
      </Button>
    </div>
  )
}
