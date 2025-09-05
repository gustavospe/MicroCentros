import bcrypt from 'bcrypt'
import pkg from 'jsonwebtoken'
import { connectToDatabase } from './mongo'
import type { H3Event } from 'h3'
import { readBody } from 'h3'

const { sign } = pkg

const JWT_SECRET = process.env.JWT_SECRET || 'changeme'

export default defineEventHandler(async (event: H3Event) => {
  const { email, password } = await readBody(event)
  if (!email || !password) {
    return { error: 'Email e senha são obrigatórios.' }
  }

  const db = await connectToDatabase()
  const user = await db.collection('users').findOne({ email })

  if (!user) {
    return { error: 'Credenciais inválidas.' }
  }

  // Verificar a senha criptografada
  const isPasswordValid = await bcrypt.compare(password, user.password)
  if (!isPasswordValid) {
    return { error: 'Credenciais inválidas.' }
  }

  const token = sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1d' })
  return { token }
})
