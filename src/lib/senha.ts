import { scryptSync, randomBytes, timingSafeEqual } from 'crypto'

export function hashSenha(senha: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(senha, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

export function verificarSenha(senha: string, stored: string): boolean {
  const [salt, key] = stored.split(':')
  if (!salt || !key) return false
  try {
    const hashBuf = scryptSync(senha, salt, 64)
    const keyBuf = Buffer.from(key, 'hex')
    return hashBuf.length === keyBuf.length && timingSafeEqual(hashBuf, keyBuf)
  } catch { return false }
}

export function gerarSenhaAleatoria(): string {
  const c = ['b','c','d','f','g','l','m','n','p','r','s','t','v','z']
  const v = ['a','e','i','o','u']
  let s = ''
  for (let i = 0; i < 4; i++) { s += c[Math.floor(Math.random()*c.length)]; s += v[Math.floor(Math.random()*v.length)] }
  return s + Math.floor(Math.random()*90+10)
}
