import { sign } from 'jsonwebtoken'
import { connectToDatabase } from '../mongo'
import { H3Event, readBody } from 'h3'

const JWT_SECRET = process.env.JWT_SECRET || 'changeme'

export default defineEventHandler(async (event: H3Event) => {
  const { email, password } = await readBody(event)
  if (!email || !password) {
    return { error: 'Email e senha são obrigatórios.' }
  }
  const db = await connectToDatabase()
  const user = await db.collection('users').findOne({ email })
  if (!user || user.password !== password) {
    return { error: 'Credenciais inválidas.' }
  }
  const token = sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1d' })
  return { token }
})
