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
