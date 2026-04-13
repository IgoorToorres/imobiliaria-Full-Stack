import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

const cadastrarClienteSchema = z.object({
  nome: z.string().min(1, 'Nome obrigatório'),
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  telefone: z.string().optional(),
  cpf: z.string().optional(),
  dataNascimento: z.coerce.date().optional(),
  profissao: z.string().optional(),
})

const editarClienteSchema = z.object({
  nome: z.string().min(1).optional(),
  telefone: z.string().optional(),
  dataNascimento: z.coerce.date().optional(),
  profissao: z.string().optional(),
})

export async function clientesRoutes(app: FastifyInstance) {
  const { container } = app

  // POST /clientes  (público — auto-cadastro)
  app.post('/', async (request, reply) => {
    const body = cadastrarClienteSchema.parse(request.body)

    const resultado = await container.cadastrarCliente.execute(body)

    return reply.status(201).send(resultado)
  })

  // PATCH /clientes/:id  (autenticado)
  app.patch('/:id', {
    preHandler: app.authenticate,
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const body = editarClienteSchema.parse(request.body)

    await container.editarCliente.execute({
      clienteId: id,
      usuarioExecutorId: request.usuario.id,
      perfilExecutor: request.usuario.perfil,
      ...body,
    })

    return reply.status(204).send()
  })

  // DELETE /clientes/:id  (autenticado — ADMINISTRADOR, GESTOR)
  app.delete('/:id', {
    preHandler: app.authenticate,
  }, async (request, reply) => {
    const { id } = request.params as { id: string }

    await container.excluirCliente.execute({
      clienteId: id,
      perfilExecutor: request.usuario.perfil,
    })

    return reply.status(204).send()
  })

  // ─── Favoritos ──────────────────────────────────────────────────────────

  // GET /clientes/:id/favoritos  (autenticado)
  app.get('/:id/favoritos', {
    preHandler: app.authenticate,
  }, async (request, reply) => {
    const { id } = request.params as { id: string }

    const resultado = await container.listarFavoritos.execute({ clienteId: id })

    return reply.status(200).send(resultado)
  })

  // POST /clientes/:id/favoritos  (autenticado)
  app.post('/:id/favoritos', {
    preHandler: app.authenticate,
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const body = z.object({ imovelId: z.string().uuid('imovelId deve ser um UUID') }).parse(request.body)

    await container.adicionarFavorito.execute({
      clienteId: id,
      imovelId: body.imovelId,
    })

    return reply.status(201).send()
  })

  // DELETE /clientes/:id/favoritos/:imovelId  (autenticado)
  app.delete('/:id/favoritos/:imovelId', {
    preHandler: app.authenticate,
  }, async (request, reply) => {
    const { id, imovelId } = request.params as { id: string; imovelId: string }

    await container.removerFavorito.execute({ clienteId: id, imovelId })

    return reply.status(204).send()
  })

  // ─── Interesses do cliente ──────────────────────────────────────────────

  // GET /clientes/:id/interesses  (autenticado)
  app.get('/:id/interesses', {
    preHandler: app.authenticate,
  }, async (request, reply) => {
    const { id } = request.params as { id: string }

    const resultado = await container.historicoInteresses.execute({ clienteId: id })

    return reply.status(200).send(resultado)
  })
}
