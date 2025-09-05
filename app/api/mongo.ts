import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/microcentros'
let client: MongoClient | null = null

export async function connectToDatabase() {
  if (!client) {
    client = new MongoClient(uri)
    await client.connect()
  }
  return client.db()
}

export async function closeDatabaseConnection() {
  if (client) {
    await client.close()
    client = null
  }
}
