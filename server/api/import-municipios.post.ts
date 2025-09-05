import { verifyAuth } from './auth.middleware'
import { connectToDatabase } from './mongo'
import type { H3Event } from 'h3'

interface IBGEMunicipio {
  id: number
  nome: string
  microrregiao: {
    id: number
    nome: string
    mesorregiao: {
      id: number
      nome: string
      UF: {
        id: number
        sigla: string
        nome: string
        regiao: {
          id: number
          sigla: string
          nome: string
        }
      }
    }
  }
  'regiao-imediata': {
    id: number
    nome: string
    'regiao-intermediaria': {
      id: number
      nome: string
      UF: {
        id: number
        sigla: string
        nome: string
        regiao: {
          id: number
          sigla: string
          nome: string
        }
      }
    }
  }
}

interface MunicipioFlat {
  ibge_id: number
  nome: string

  // Microrregião
  microrregiao_id: number
  microrregiao_nome: string

  // Mesorregião
  mesorregiao_id: number
  mesorregiao_nome: string

  // UF da Mesorregião
  uf_id: number
  uf_sigla: string
  uf_nome: string

  // Região da UF
  regiao_id: number
  regiao_sigla: string
  regiao_nome: string

  // Região Imediata
  regiao_imediata_id: number
  regiao_imediata_nome: string

  // Região Intermediária
  regiao_intermediaria_id: number
  regiao_intermediaria_nome: string

  // UF da Região Intermediária
  regiao_intermediaria_uf_id: number
  regiao_intermediaria_uf_sigla: string
  regiao_intermediaria_uf_nome: string

  // Região da UF Intermediária
  regiao_intermediaria_regiao_id: number
  regiao_intermediaria_regiao_sigla: string
  regiao_intermediaria_regiao_nome: string

  // Metadados
  created_at: Date
  updated_at: Date
}

export default defineEventHandler(async (event: H3Event) => {
  // Verificar autenticação
  verifyAuth(event)

  try {
    // Buscar dados do IBGE
    console.log('Buscando dados dos municípios do IBGE...')
    const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/municipios/')

    if (!response.ok) {
      throw new Error(`Erro ao buscar dados do IBGE: ${response.status}`)
    }

    const municipios: IBGEMunicipio[] = await response.json()
    console.log(`${municipios.length} municípios recebidos do IBGE`)

    // Conectar ao banco
    const db = await connectToDatabase()
    const collection = db.collection('municipios')

    // Limpar collection existente
    await collection.deleteMany({})
    console.log('Collection de municípios limpa')

    // Processar e inserir dados
    const municipiosFlat: MunicipioFlat[] = municipios.map(municipio => ({
      ibge_id: municipio.id,
      nome: municipio.nome,

      // Microrregião
      microrregiao_id: municipio.microrregiao.id,
      microrregiao_nome: municipio.microrregiao.nome,

      // Mesorregião
      mesorregiao_id: municipio.microrregiao.mesorregiao.id,
      mesorregiao_nome: municipio.microrregiao.mesorregiao.nome,

      // UF da Mesorregião
      uf_id: municipio.microrregiao.mesorregiao.UF.id,
      uf_sigla: municipio.microrregiao.mesorregiao.UF.sigla,
      uf_nome: municipio.microrregiao.mesorregiao.UF.nome,

      // Região da UF
      regiao_id: municipio.microrregiao.mesorregiao.UF.regiao.id,
      regiao_sigla: municipio.microrregiao.mesorregiao.UF.regiao.sigla,
      regiao_nome: municipio.microrregiao.mesorregiao.UF.regiao.nome,

      // Região Imediata
      regiao_imediata_id: municipio['regiao-imediata'].id,
      regiao_imediata_nome: municipio['regiao-imediata'].nome,

      // Região Intermediária
      regiao_intermediaria_id: municipio['regiao-imediata']['regiao-intermediaria'].id,
      regiao_intermediaria_nome: municipio['regiao-imediata']['regiao-intermediaria'].nome,

      // UF da Região Intermediária
      regiao_intermediaria_uf_id: municipio['regiao-imediata']['regiao-intermediaria'].UF.id,
      regiao_intermediaria_uf_sigla: municipio['regiao-imediata']['regiao-intermediaria'].UF.sigla,
      regiao_intermediaria_uf_nome: municipio['regiao-imediata']['regiao-intermediaria'].UF.nome,

      // Região da UF Intermediária
      regiao_intermediaria_regiao_id: municipio['regiao-imediata']['regiao-intermediaria'].UF.regiao.id,
      regiao_intermediaria_regiao_sigla: municipio['regiao-imediata']['regiao-intermediaria'].UF.regiao.sigla,
      regiao_intermediaria_regiao_nome: municipio['regiao-imediata']['regiao-intermediaria'].UF.regiao.nome,

      // Metadados
      created_at: new Date(),
      updated_at: new Date()
    }))

    // Inserir em lotes para melhor performance
    const batchSize = 1000
    let insertedCount = 0

    for (let i = 0; i < municipiosFlat.length; i += batchSize) {
      const batch = municipiosFlat.slice(i, i + batchSize)
      await collection.insertMany(batch)
      insertedCount += batch.length
      console.log(`Inseridos ${insertedCount}/${municipiosFlat.length} municípios`)
    }

    // Criar índices para otimizar consultas
    await collection.createIndex({ ibge_id: 1 }, { unique: true })
    await collection.createIndex({ nome: 1 })
    await collection.createIndex({ uf_sigla: 1 })
    await collection.createIndex({ regiao_sigla: 1 })
    await collection.createIndex({ microrregiao_nome: 1 })
    await collection.createIndex({ mesorregiao_nome: 1 })

    console.log('Índices criados com sucesso')

    return {
      success: true,
      message: `${insertedCount} municípios importados com sucesso`,
      total: insertedCount
    }

  } catch (error) {
    console.error('Erro ao importar municípios:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }
  }
})
