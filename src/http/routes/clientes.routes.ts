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
  app.post('/', {
    schema: {
      tags: ['Clientes'],
      summary: 'Cadastrar cliente',
      description: 'Auto-cadastro de clientes (perfil CLIENTE).',
      body: {
        type: 'object',
        additionalProperties: false,
        required: ['nome', 'email', 'senha'],
        properties: {
          nome: { type: 'string' },
          email: { type: 'string', format: 'email' },
          senha: { type: 'string', minLength: 6 },
          telefone: { type: 'string' },
          cpf: { type: 'string' },
          dataNascimento: { type: 'string', format: 'date-time' },
          profissao: { type: 'string' },
        },
      },
      response: {
        201: {
          type: 'object',
          additionalProperties: false,
          required: ['usuario', 'clienteId'],
          properties: {
            usuario: { $ref: 'UsuarioPublic#' },
            clienteId: { type: 'string', format: 'uuid' },
          },
        },
        400: { $ref: 'ValidationError#' },
        409: { $ref: 'ErrorResponse#' },
        500: { $ref: 'ErrorResponse#' },
      },
    },
  }, async (request, reply) => {
    const body = cadastrarClienteSchema.parse(request.body)

    const resultado = await container.cadastrarCliente.execute(body)

    return reply.status(201).send(resultado)
  })

  // PATCH /clientes/:id  (autenticado)
  app.patch('/:id', {
    preHandler: app.authenticate,
    schema: {
      tags: ['Clientes'],
      summary: 'Editar cliente',
      description: 'Atualiza dados do cliente autenticado.',
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
          nome: { type: 'string' },
          telefone: { type: 'string' },
          dataNascimento: { type: 'string', format: 'date-time' },
          profissao: { type: 'string' },
        },
      },
      response: {
        204: { type: 'null', description: 'Cliente atualizado' },
        400: { $ref: 'ValidationError#' },
        401: { $ref: 'ErrorResponse#' },
        403: { $ref: 'ErrorResponse#' },
        404: { $ref: 'ErrorResponse#' },
        500: { $ref: 'ErrorResponse#' },
      },
    },
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
    schema: {
      tags: ['Clientes'],
      summary: 'Excluir cliente',
      description: 'Remove um cliente (perfil ADMINISTRADOR ou GESTOR).',
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
        204: { type: 'null', description: 'Cliente removido' },
        401: { $ref: 'ErrorResponse#' },
        403: { $ref: 'ErrorResponse#' },
        404: { $ref: 'ErrorResponse#' },
        500: { $ref: 'ErrorResponse#' },
      },
    },
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
    schema: {
      tags: ['Clientes'],
      summary: 'Listar favoritos',
      description: 'Retorna os imóveis favoritos de um cliente.',
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
        200: {
          type: 'object',
          additionalProperties: false,
          required: ['favoritos'],
          properties: {
            favoritos: { type: 'array', items: { $ref: 'ClienteFavorito#' } },
          },
        },
        401: { $ref: 'ErrorResponse#' },
        500: { $ref: 'ErrorResponse#' },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string }

    const resultado = await container.listarFavoritos.execute({ clienteId: id })

    return reply.status(200).send(resultado)
  })

  // POST /clientes/:id/favoritos  (autenticado)
  app.post('/:id/favoritos', {
    preHandler: app.authenticate,
    schema: {
      tags: ['Clientes'],
      summary: 'Adicionar favorito',
      description: 'Adiciona um imóvel aos favoritos do cliente.',
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
        201: { type: 'null', description: 'Favorito adicionado' },
        400: { $ref: 'ValidationError#' },
        401: { $ref: 'ErrorResponse#' },
        404: { $ref: 'ErrorResponse#' },
        409: { $ref: 'ErrorResponse#' },
        500: { $ref: 'ErrorResponse#' },
      },
    },
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
    schema: {
      tags: ['Clientes'],
      summary: 'Remover favorito',
      description: 'Remove um imóvel dos favoritos do cliente.',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'imovelId'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          imovelId: { type: 'string', format: 'uuid' },
        },
      },
      response: {
        204: { type: 'null', description: 'Favorito removido' },
        401: { $ref: 'ErrorResponse#' },
        404: { $ref: 'ErrorResponse#' },
        500: { $ref: 'ErrorResponse#' },
      },
    },
  }, async (request, reply) => {
    const { id, imovelId } = request.params as { id: string; imovelId: string }

    await container.removerFavorito.execute({ clienteId: id, imovelId })

    return reply.status(204).send()
  })

  // ─── Interesses do cliente ──────────────────────────────────────────────

  // GET /clientes/:id/interesses  (autenticado)
  app.get('/:id/interesses', {
    preHandler: app.authenticate,
    schema: {
      tags: ['Clientes'],
      summary: 'Histórico de interesses',
      description: 'Lista interesses registrados pelo cliente.',
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
        200: {
          type: 'object',
          additionalProperties: false,
          required: ['interesses'],
          properties: {
            interesses: { type: 'array', items: { $ref: 'Interesse#' } },
          },
        },
        401: { $ref: 'ErrorResponse#' },
        500: { $ref: 'ErrorResponse#' },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string }

    const resultado = await container.historicoInteresses.execute({ clienteId: id })

    return reply.status(200).send(resultado)
  })
}
