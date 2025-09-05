import { MongoClient } from 'mongodb'
import { mongoConfig } from './mongo.config'

let client: MongoClient | null = null

export async function connectToDatabase() {
  if (!client) {
    client = new MongoClient(mongoConfig.uri)
    await client.connect()
  }
  return client.db(mongoConfig.dbName)
}

export async function closeDatabaseConnection() {
  if (client) {
    await client.close()
    client = null
  }
}
