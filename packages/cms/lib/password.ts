import { randomBytes, pbkdf2, timingSafeEqual } from 'crypto'
import { promisify } from 'util'

const pbkdf2Async = promisify(pbkdf2)
const ITERATIONS = 100_000
const KEY_LEN = 32
const DIGEST = 'sha256'
const MIN_PASSWORD_LENGTH = 12

export function validatePassword(password: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères`
  }
  return null
}

export async function hashPassword(password: string): Promise<{ hash: string; salt: string }> {
  const salt = randomBytes(16).toString('hex')
  const key = await pbkdf2Async(password, salt, ITERATIONS, KEY_LEN, DIGEST)
  return { hash: key.toString('hex'), salt }
}

export async function verifyPassword(
  password: string,
  hash: string,
  salt: string
): Promise<boolean> {
  const key = await pbkdf2Async(password, salt, ITERATIONS, KEY_LEN, DIGEST)
  const stored = Buffer.from(hash, 'hex')
  if (key.length !== stored.length) return false
  return timingSafeEqual(key, stored)
}
