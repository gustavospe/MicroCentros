import bcrypt from 'bcrypt'
import { connectToDatabase } from './mongo'
import type { H3Event } from 'h3'
import { readBody } from 'h3'

export default defineEventHandler(async (event: H3Event) => {
  const { name, email, password } = await readBody(event)
  if (!name || !email || !password) {
    return { error: 'Nome, email e senha são obrigatórios.' }
  }
  
  // Criptografar a senha
  const saltRounds = 10
  const hashedPassword = await bcrypt.hash(password, saltRounds)
  
  const db = await connectToDatabase()
  const exists = await db.collection('users').findOne({ email })
  if (exists) {
    return { error: 'Email já cadastrado.' }
  }
  
  await db.collection('users').insertOne({ name, email, password: hashedPassword })
  return { ok: true }
})
