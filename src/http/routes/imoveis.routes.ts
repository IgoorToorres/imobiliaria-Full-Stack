import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

const enderecoSchema = z.object({
  cep: z.string().min(1),
  logradouro: z.string().min(1),
  numero: z.string().min(1),
  complemento: z.string().optional(),
  bairro: z.string().min(1),
  cidade: z.string().min(1),
  estado: z.string().length(2, 'Estado deve ter 2 letras'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
})

const tipoImovelValues = ['APARTAMENTO', 'CASA', 'COMERCIAL', 'TERRENO', 'RURAL', 'STUDIO', 'COBERTURA'] as const
const finalidadeValues = ['VENDA', 'LOCACAO', 'VENDA_LOCACAO'] as const
const statusValues = ['DISPONIVEL', 'RESERVADO', 'VENDIDO', 'LOCADO', 'INATIVO'] as const

const tipoImovelEnum = z.enum(tipoImovelValues)
const finalidadeEnum = z.enum(finalidadeValues)
const statusEnum = z.enum(statusValues)

const cadastrarImovelSchema = z.object({
  titulo: z.string().min(1, 'Título obrigatório'),
  tipo: tipoImovelEnum,
  finalidade: finalidadeEnum,
  descricao: z.string().optional(),
  areaTotal: z.number().positive().optional(),
  areaUtil: z.number().positive().optional(),
  quartos: z.number().int().min(0).default(0),
  banheiros: z.number().int().min(0).default(0),
  vagas: z.number().int().min(0).default(0),
  preco: z.number().positive('Preço deve ser positivo'),
  endereco: enderecoSchema,
  corretorResponsavelId: z.string().uuid().optional(),
  dataConstrucao: z.coerce.date().optional(),
})

const editarImovelSchema = z.object({
  titulo: z.string().min(1).optional(),
  tipo: tipoImovelEnum.optional(),
  finalidade: finalidadeEnum.optional(),
  descricao: z.string().optional(),
  areaTotal: z.number().positive().optional(),
  areaUtil: z.number().positive().optional(),
  quartos: z.number().int().min(0).optional(),
  banheiros: z.number().int().min(0).optional(),
  vagas: z.number().int().min(0).optional(),
  preco: z.number().positive().optional(),
  status: statusEnum.optional(),
  endereco: enderecoSchema.optional(),
  corretorResponsavelId: z.string().uuid().optional(),
  dataConstrucao: z.coerce.date().optional(),
})

const filtrosSchema = z.object({
  tipo: tipoImovelEnum.optional(),
  finalidade: finalidadeEnum.optional(),
  status: statusEnum.optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  bairro: z.string().optional(),
  precoMin: z.coerce.number().positive().optional(),
  precoMax: z.coerce.number().positive().optional(),
  areaMin: z.coerce.number().positive().optional(),
  quartos: z.coerce.number().int().min(0).optional(),
  banheiros: z.coerce.number().int().min(0).optional(),
  vagas: z.coerce.number().int().min(0).optional(),
  ordenarPor: z.enum(['preco', 'criadoEm', 'dataConstrucao']).optional(),
  ordem: z.enum(['asc', 'desc']).optional(),
})

export async function imoveisRoutes(app: FastifyInstance) {
  const { container } = app

  // GET /imoveis  (público)
  app.get('/', {
    schema: {
      tags: ['Imoveis'],
      summary: 'Pesquisar imóveis',
      description: 'Lista imóveis com filtros opcionais e total encontrado.',
      querystring: {
        type: 'object',
        additionalProperties: false,
        properties: {
          tipo: { type: 'string', enum: [...tipoImovelValues] },
          finalidade: { type: 'string', enum: [...finalidadeValues] },
          status: { type: 'string', enum: [...statusValues] },
          cidade: { type: 'string' },
          estado: { type: 'string' },
          bairro: { type: 'string' },
          precoMin: { type: 'number', minimum: 0 },
          precoMax: { type: 'number', minimum: 0 },
          areaMin: { type: 'number', minimum: 0 },
          quartos: { type: 'integer', minimum: 0 },
          banheiros: { type: 'integer', minimum: 0 },
          vagas: { type: 'integer', minimum: 0 },
          ordenarPor: { type: 'string', enum: ['preco', 'criadoEm', 'dataConstrucao'] },
          ordem: { type: 'string', enum: ['asc', 'desc'] },
        },
      },
      response: {
        200: {
          type: 'object',
          additionalProperties: false,
          required: ['imoveis', 'total'],
          properties: {
            imoveis: { type: 'array', items: { $ref: 'Imovel#' } },
            total: { type: 'integer', minimum: 0 },
          },
        },
        400: { $ref: 'ValidationError#' },
        500: { $ref: 'ErrorResponse#' },
      },
    },
  }, async (request, reply) => {
    const filtros = filtrosSchema.parse(request.query)
    const resultado = await container.pesquisarImoveis.execute(filtros)
    return reply.status(200).send(resultado)
  })

  // GET /imoveis/:id  (público)
  app.get('/:id', {
    schema: {
      tags: ['Imoveis'],
      summary: 'Detalhar imóvel',
      description: 'Retorna os dados do imóvel e o total de favoritos.',
      params: {
        type: 'object',
        additionalProperties: false,
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
      response: {
        200: {
          type: 'object',
          additionalProperties: false,
          required: ['imovel', 'totalFavoritos'],
          properties: {
            imovel: { $ref: 'Imovel#' },
            totalFavoritos: { type: 'integer', minimum: 0 },
          },
        },
        404: { $ref: 'ErrorResponse#' },
        500: { $ref: 'ErrorResponse#' },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const resultado = await container.visualizarImovel.execute(id)
    return reply.status(200).send(resultado)
  })

  // POST /imoveis  (autenticado)
  app.post('/', {
    preHandler: app.authenticate,
    schema: {
      tags: ['Imoveis'],
      summary: 'Cadastrar imóvel',
      description: 'Cria um novo imóvel. Requer perfil ADMINISTRADOR, GESTOR ou CORRETOR.',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        additionalProperties: false,
        required: ['titulo', 'tipo', 'finalidade', 'preco', 'endereco'],
        properties: {
          titulo: { type: 'string' },
          tipo: { type: 'string', enum: [...tipoImovelValues] },
          finalidade: { type: 'string', enum: [...finalidadeValues] },
          descricao: { type: 'string' },
          areaTotal: { type: 'number', minimum: 0 },
          areaUtil: { type: 'number', minimum: 0 },
          quartos: { type: 'integer', minimum: 0, default: 0 },
          banheiros: { type: 'integer', minimum: 0, default: 0 },
          vagas: { type: 'integer', minimum: 0, default: 0 },
          preco: { type: 'number', minimum: 0 },
          endereco: { $ref: 'ImovelEndereco#' },
          corretorResponsavelId: { type: 'string', format: 'uuid' },
          dataConstrucao: { type: 'string', format: 'date-time' },
        },
      },
      response: {
        201: {
          type: 'object',
          additionalProperties: false,
          required: ['imovel'],
          properties: {
            imovel: { $ref: 'Imovel#' },
          },
        },
        400: { $ref: 'ValidationError#' },
        401: { $ref: 'ErrorResponse#' },
        403: { $ref: 'ErrorResponse#' },
        404: { $ref: 'ErrorResponse#' },
        500: { $ref: 'ErrorResponse#' },
      },
    },
  }, async (request, reply) => {
    const body = cadastrarImovelSchema.parse(request.body)

    const resultado = await container.cadastrarImovel.execute({
      perfilExecutor: request.usuario.perfil,
      ...body,
    })

    return reply.status(201).send(resultado)
  })

  // PATCH /imoveis/:id  (autenticado)
  app.patch('/:id', {
    preHandler: app.authenticate,
    schema: {
      tags: ['Imoveis'],
      summary: 'Editar imóvel',
      description: 'Atualiza campos do imóvel. Requer perfil ADMINISTRADOR, GESTOR ou CORRETOR.',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        additionalProperties: false,
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
      body: {
        type: 'object',
        additionalProperties: false,
        properties: {
          titulo: { type: 'string' },
          tipo: { type: 'string', enum: [...tipoImovelValues] },
          finalidade: { type: 'string', enum: [...finalidadeValues] },
          descricao: { type: 'string' },
          areaTotal: { type: 'number', minimum: 0 },
          areaUtil: { type: 'number', minimum: 0 },
          quartos: { type: 'integer', minimum: 0 },
          banheiros: { type: 'integer', minimum: 0 },
          vagas: { type: 'integer', minimum: 0 },
          preco: { type: 'number', minimum: 0 },
          status: { type: 'string', enum: [...statusValues] },
          endereco: { $ref: 'ImovelEndereco#' },
          corretorResponsavelId: { type: 'string', format: 'uuid' },
          dataConstrucao: { type: 'string', format: 'date-time' },
        },
      },
      response: {
        200: {
          type: 'object',
          additionalProperties: false,
          required: ['imovel'],
          properties: {
            imovel: { $ref: 'Imovel#' },
          },
        },
        400: { $ref: 'ValidationError#' },
        401: { $ref: 'ErrorResponse#' },
        403: { $ref: 'ErrorResponse#' },
        404: { $ref: 'ErrorResponse#' },
        500: { $ref: 'ErrorResponse#' },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const body = editarImovelSchema.parse(request.body)

    const resultado = await container.editarImovel.execute({
      id,
      perfilExecutor: request.usuario.perfil,
      ...body,
    })

    return reply.status(200).send(resultado)
  })

  // DELETE /imoveis/:id  (autenticado)
  app.delete('/:id', {
    preHandler: app.authenticate,
    schema: {
      tags: ['Imoveis'],
      summary: 'Excluir imóvel',
      description: 'Remove um imóvel pelo ID. Requer perfil ADMINISTRADOR, GESTOR ou CORRETOR.',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        additionalProperties: false,
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
      response: {
        204: { type: 'null', description: 'Imóvel removido' },
        401: { $ref: 'ErrorResponse#' },
        403: { $ref: 'ErrorResponse#' },
        404: { $ref: 'ErrorResponse#' },
        500: { $ref: 'ErrorResponse#' },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string }

    await container.excluirImovel.execute({
      id,
      perfilExecutor: request.usuario.perfil,
    })

    return reply.status(204).send()
  })
}
