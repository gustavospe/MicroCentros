import { verifyAuth } from './auth.middleware'
import { connectToDatabase } from './mongo'
import type { H3Event } from 'h3'
import { getQuery } from 'h3'

interface FilterQuery {
  uf_sigla?: { $regex: string; $options: string }
  regiao_nome?: { $regex: string; $options: string }
  nome?: { $regex: string; $options: string }
  microrregiao_nome?: { $regex: string; $options: string }
  mesorregiao_nome?: { $regex: string; $options: string }
}

export default defineEventHandler(async (event: H3Event) => {
  // Verificar autenticação
  verifyAuth(event)

  try {
    const db = await connectToDatabase()
    const collection = db.collection('municipios')

    // Obter parâmetros de consulta
    const query = getQuery(event)
    const {
      uf,
      regiao,
      nome,
      microrregiao,
      mesorregiao,
      page = '1',
      limit = '50'
    } = query

    // Construir filtro de busca
    const filter: FilterQuery = {}

    if (uf && typeof uf === 'string') {
      filter.uf_sigla = { $regex: uf, $options: 'i' }
    }

    if (regiao && typeof regiao === 'string') {
      filter.regiao_nome = { $regex: regiao, $options: 'i' }
    }

    if (nome && typeof nome === 'string') {
      filter.nome = { $regex: nome, $options: 'i' }
    }

    if (microrregiao && typeof microrregiao === 'string') {
      filter.microrregiao_nome = { $regex: microrregiao, $options: 'i' }
    }

    if (mesorregiao && typeof mesorregiao === 'string') {
      filter.mesorregiao_nome = { $regex: mesorregiao, $options: 'i' }
    }

    // Configurar paginação
    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const skip = (pageNum - 1) * limitNum

    // Buscar dados
    const municipios = await collection
      .find(filter)
      .sort({ nome: 1 })
      .skip(skip)
      .limit(limitNum)
      .toArray()

    // Contar total de registros
    const total = await collection.countDocuments(filter)

    return {
      success: true,
      data: municipios,
      pagination: {
        current_page: pageNum,
        per_page: limitNum,
        total: total,
        total_pages: Math.ceil(total / limitNum)
      }
    }

  } catch (error) {
    console.error('Erro ao consultar municípios:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }
  }
})
