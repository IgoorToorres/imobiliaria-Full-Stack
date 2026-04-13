import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

const registrarInteresseSchema = z.object({
  clienteId: z.string().uuid('clienteId deve ser um UUID'),
  imovelId: z.string().uuid('imovelId deve ser um UUID'),
  mensagem: z.string().optional(),
})

export async function interessesRoutes(app: FastifyInstance) {
  const { container } = app

  // POST /interesses  (autenticado)
  app.post('/', {
    preHandler: app.authenticate,
    schema: {
      tags: ['Interesses'],
      summary: 'Registrar interesse',
      description: 'Registra interesse de um cliente em um imóvel.',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        additionalProperties: false,
        required: ['clienteId', 'imovelId'],
        properties: {
          clienteId: { type: 'string', format: 'uuid' },
          imovelId: { type: 'string', format: 'uuid' },
          mensagem: { type: 'string' },
        },
      },
      response: {
        201: {
          type: 'object',
          additionalProperties: false,
          required: ['interesse'],
          properties: {
            interesse: { $ref: 'Interesse#' },
          },
        },
        400: { $ref: 'ValidationError#' },
        401: { $ref: 'ErrorResponse#' },
        404: { $ref: 'ErrorResponse#' },
        422: { $ref: 'ErrorResponse#' },
        500: { $ref: 'ErrorResponse#' },
      },
    },
  }, async (request, reply) => {
    const body = registrarInteresseSchema.parse(request.body)

    const resultado = await container.registrarInteresse.execute(body)

    return reply.status(201).send(resultado)
  })
}
