'use client'

import { cn } from '@/lib/utils'

export interface AvatarConfig {
  cor?: string | { bg?: string; fg?: string }
  gradiente?: string
  frame?: string
  emoji?: string
}

function parseConfig(input?: string | null): AvatarConfig {
  if (!input) return {}
  try {
    return JSON.parse(input) as AvatarConfig
  } catch {
    return {}
  }
}

function corOuGradiente(cfg: AvatarConfig): string {
  if (cfg.gradiente) return cfg.gradiente
  if (cfg.cor) {
    // cor pode ser string (hex) ou objeto {bg, fg} (formato antigo)
    if (typeof cfg.cor === 'string') return cfg.cor
    if (typeof cfg.cor === 'object' && (cfg.cor as any).bg) return (cfg.cor as any).bg
  }
  return 'linear-gradient(135deg, #10b981, #f59e0b)'
}

function frameClass(frame?: string): string {
  if (!frame) return ''
  switch (frame) {
    case 'gold':
      return 'ring-4 ring-amber-400 ring-offset-2 ring-offset-background'
    case 'neon':
      return 'ring-4 ring-fuchsia-400 shadow-[0_0_18px_4px_rgba(232,121,249,0.6)]'
    case 'pixel':
      return 'ring-4 ring-emerald-500 [border-image:repeating-linear-gradient(0deg,#000_0_4px,#fff_4px_8px)_2]'
    case 'floral':
      return 'ring-4 ring-rose-300 ring-offset-2 ring-offset-background'
    default:
      return ''
  }
}

interface AvatarProps {
  config?: string | null
  name?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const SIZE_MAP: Record<NonNullable<AvatarProps['size']>, string> = {
  sm: 'w-9 h-9 text-sm',
  md: 'w-12 h-12 text-base',
  lg: 'w-16 h-16 text-2xl',
  xl: 'w-24 h-24 text-4xl',
}

export function Avatar({ config, name, size = 'md', className }: AvatarProps) {
  const cfg = parseConfig(config)
  const inicial = (name || '?').charAt(0).toUpperCase()
  const estilo: React.CSSProperties = {}
  if (cfg.gradiente) {
    estilo.background = cfg.gradiente
  } else if (cfg.cor) {
    if (typeof cfg.cor === 'string') {
      estilo.background = cfg.cor
    } else if (cfg.cor && cfg.cor.bg) {
      estilo.background = cfg.cor.bg
    }
  } else {
    estilo.background = corOuGradiente(cfg)
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 select-none',
        SIZE_MAP[size],
        frameClass(cfg.frame),
        className
      )}
      style={estilo}
    >
      {cfg.emoji ? <span>{cfg.emoji}</span> : <span>{inicial}</span>}
    </div>
  )
}

export { parseConfig as parseAvatarConfig, corOuGradiente as avatarBackground, frameClass as avatarFrameClass }
