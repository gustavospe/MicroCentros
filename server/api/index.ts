import { connectToDatabase } from './mongo'
import type { H3Event } from 'h3'

export default defineEventHandler(async (_event: H3Event) => {
  // Exemplo de rota API básica
  const db = await connectToDatabase()
  return { status: 'ok', dbs: await db.admin().listDatabases() }
})
