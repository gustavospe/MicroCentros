import pkg from 'jsonwebtoken'
import type { H3Event } from 'h3'
import { getHeader, createError } from 'h3'

const { verify } = pkg
const JWT_SECRET = process.env.JWT_SECRET || 'changeme'

export function verifyAuth(event: H3Event) {
  const authHeader = getHeader(event, 'authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Token de autorização necessário'
    })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = verify(token, JWT_SECRET)
    return decoded
  } catch {
    throw createError({
      statusCode: 401,
      statusMessage: 'Token inválido'
    })
  }
}
