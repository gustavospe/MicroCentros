// Configuração centralizada do MongoDB
const host = process.env.MONGODB_HOST || 'localhost'
const port = process.env.MONGODB_PORT || '27017'
const user = process.env.MONGODB_USER || ''
const pass = process.env.MONGODB_PASS || ''
const dbName = process.env.MONGODB_DB || 'microcentros'

let auth = ''
if (user && pass) {
  auth = `${encodeURIComponent(user)}:${encodeURIComponent(pass)}@`
}
const uri = `mongodb://${auth}${host}:${port}`

export const mongoConfig = {
  uri,
  dbName,
}