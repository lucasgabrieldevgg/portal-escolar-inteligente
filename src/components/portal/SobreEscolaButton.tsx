'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog'
import { School, MapPin, Calendar, Users, Award, BookOpen } from 'lucide-react'

export function SobreEscolaButton() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-xs">
          <School className="w-3.5 h-3.5 mr-1" /> Sobre a escola
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <School className="w-5 h-5 text-emerald-600" />
            Escola Estadual Professora Eunice Souza dos Santos
          </DialogTitle>
          <DialogDescription>
            Conheça um pouco sobre a nossa escola.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <p className="flex items-start gap-2">
            <MapPin className="w-4 h-4 mt-0.5 text-emerald-600 flex-shrink-0" />
            <span><strong>Localização:</strong> Rondonópolis — Mato Grosso (MT)</span>
          </p>
          <p className="flex items-start gap-2">
            <Users className="w-4 h-4 mt-0.5 text-emerald-600 flex-shrink-0" />
            <span><strong>Atendimento:</strong> Ensino Fundamental II (6º ao 9º ano), nos turnos manhã e tarde.</span>
          </p>
          <p className="flex items-start gap-2">
            <Calendar className="w-4 h-4 mt-0.5 text-emerald-600 flex-shrink-0" />
            <span><strong>Turnos:</strong> 6º e 7º ano à tarde · 8º e 9º ano pela manhã.</span>
          </p>
          <p className="flex items-start gap-2">
            <BookOpen className="w-4 h-4 mt-0.5 text-emerald-600 flex-shrink-0" />
            <span><strong>Biblioteca:</strong> Ativa com programa de leitura — alunos que resumem livros ganham XP e moedinhas.</span>
          </p>
          <p className="flex items-start gap-2">
            <Award className="w-4 h-4 mt-0.5 text-emerald-600 flex-shrink-0" />
            <span><strong>Portal Escolar Inteligente:</strong> Plataforma desenvolvida para gamificar o aprendizado e dar aos alunos um canal moderno de comunicação com a escola.</span>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
