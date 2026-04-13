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
  }, async (request, reply) => {
    const body = registrarInteresseSchema.parse(request.body)

    const resultado = await container.registrarInteresse.execute(body)

    return reply.status(201).send(resultado)
  })
}
