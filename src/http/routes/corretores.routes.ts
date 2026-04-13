import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

const cadastrarCorretorSchema = z.object({
  nome: z.string().min(1, 'Nome obrigatório'),
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  telefone: z.string().optional(),
  cpf: z.string().optional(),
  creci: z.string().min(1, 'CRECI obrigatório'),
  bio: z.string().optional(),
})

const vincularImovelSchema = z.object({
  imovelId: z.string().uuid('imovelId deve ser um UUID'),
})

const vincularClienteSchema = z.object({
  clienteId: z.string().uuid('clienteId deve ser um UUID'),
})

export async function corretoresRoutes(app: FastifyInstance) {
  const { container } = app

  // POST /corretores  (autenticado — apenas ADMINISTRADOR)
  app.post('/', {
    preHandler: app.authenticate,
    schema: {
      tags: ['Corretores'],
      summary: 'Cadastrar corretor',
      description: 'Cria um usuário corretor. Requer perfil ADMINISTRADOR.',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        additionalProperties: false,
        required: ['nome', 'email', 'senha', 'creci'],
        properties: {
          nome: { type: 'string' },
          email: { type: 'string', format: 'email' },
          senha: { type: 'string', minLength: 6 },
          telefone: { type: 'string' },
          cpf: { type: 'string' },
          creci: { type: 'string' },
          bio: { type: 'string' },
        },
      },
      response: {
        201: {
          type: 'object',
          additionalProperties: false,
          required: ['usuarioId', 'corretorId'],
          properties: {
            usuarioId: { type: 'string', format: 'uuid' },
            corretorId: { type: 'string', format: 'uuid' },
          },
        },
        400: { $ref: 'ValidationError#' },
        401: { $ref: 'ErrorResponse#' },
        403: { $ref: 'ErrorResponse#' },
        409: { $ref: 'ErrorResponse#' },
        500: { $ref: 'ErrorResponse#' },
      },
    },
  }, async (request, reply) => {
    const body = cadastrarCorretorSchema.parse(request.body)

    const resultado = await container.cadastrarCorretor.execute({
      perfilExecutor: request.usuario.perfil,
      ...body,
    })

    return reply.status(201).send(resultado)
  })

  // POST /corretores/:id/imoveis  (autenticado)
  app.post('/:id/imoveis', {
    preHandler: app.authenticate,
    schema: {
      tags: ['Corretores'],
      summary: 'Vincular imóvel ao corretor',
      description: 'Associa um imóvel existente a um corretor.',
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
        required: ['imovelId'],
        properties: {
          imovelId: { type: 'string', format: 'uuid' },
        },
      },
      response: {
        201: { type: 'null', description: 'Vínculo criado' },
        400: { $ref: 'ValidationError#' },
        401: { $ref: 'ErrorResponse#' },
        403: { $ref: 'ErrorResponse#' },
        404: { $ref: 'ErrorResponse#' },
        409: { $ref: 'ErrorResponse#' },
        500: { $ref: 'ErrorResponse#' },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const body = vincularImovelSchema.parse(request.body)

    await container.vincularCorretorImovel.execute({
      perfilExecutor: request.usuario.perfil,
      corretorId: id,
      imovelId: body.imovelId,
    })

    return reply.status(201).send()
  })

  // POST /corretores/:id/clientes  (autenticado)
  app.post('/:id/clientes', {
    preHandler: app.authenticate,
    schema: {
      tags: ['Corretores'],
      summary: 'Vincular cliente ao corretor',
      description: 'Associa um cliente existente a um corretor.',
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
        required: ['clienteId'],
        properties: {
          clienteId: { type: 'string', format: 'uuid' },
        },
      },
      response: {
        201: { type: 'null', description: 'Vínculo criado' },
        400: { $ref: 'ValidationError#' },
        401: { $ref: 'ErrorResponse#' },
        403: { $ref: 'ErrorResponse#' },
        404: { $ref: 'ErrorResponse#' },
        409: { $ref: 'ErrorResponse#' },
        500: { $ref: 'ErrorResponse#' },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const body = vincularClienteSchema.parse(request.body)

    await container.vincularCorretorCliente.execute({
      perfilExecutor: request.usuario.perfil,
      corretorId: id,
      clienteId: body.clienteId,
    })

    return reply.status(201).send()
  })
}
