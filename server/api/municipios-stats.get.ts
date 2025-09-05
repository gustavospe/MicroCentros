import { verifyAuth } from './auth.middleware'
import { connectToDatabase } from './mongo'
import type { H3Event } from 'h3'

export default defineEventHandler(async (event: H3Event) => {
  // Verificar autenticação
  verifyAuth(event)

  try {
    const db = await connectToDatabase()
    const collection = db.collection('municipios')

    // Estatísticas gerais
    const totalMunicipios = await collection.countDocuments()

    // Estatísticas por região
    const porRegiao = await collection.aggregate([
      {
        $group: {
          _id: { sigla: '$regiao_sigla', nome: '$regiao_nome' },
          total: { $sum: 1 }
        }
      },
      { $sort: { '_id.nome': 1 } }
    ]).toArray()

    // Estatísticas por UF
    const porUF = await collection.aggregate([
      {
        $group: {
          _id: { sigla: '$uf_sigla', nome: '$uf_nome' },
          total: { $sum: 1 }
        }
      },
      { $sort: { '_id.sigla': 1 } }
    ]).toArray()

    // Top 10 mesorregiões com mais municípios
    const topMesorregioes = await collection.aggregate([
      {
        $group: {
          _id: '$mesorregiao_nome',
          total: { $sum: 1 },
          uf: { $first: '$uf_sigla' }
        }
      },
      { $sort: { total: -1 } },
      { $limit: 10 }
    ]).toArray()

    // Top 10 microrregiões com mais municípios
    const topMicrorregioes = await collection.aggregate([
      {
        $group: {
          _id: '$microrregiao_nome',
          total: { $sum: 1 },
          uf: { $first: '$uf_sigla' }
        }
      },
      { $sort: { total: -1 } },
      { $limit: 10 }
    ]).toArray()

    return {
      success: true,
      data: {
        total_municipios: totalMunicipios,
        por_regiao: porRegiao,
        por_uf: porUF,
        top_mesorregioes: topMesorregioes,
        top_microrregioes: topMicrorregioes
      }
    }

  } catch (error) {
    console.error('Erro ao obter estatísticas:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }
  }
})
