import type { FastifyInstance } from 'fastify'

export async function relatoriosRoutes(app: FastifyInstance) {
  const { container } = app

  // GET /relatorios/imoveis-marcados/:corretorId  (autenticado — ADMIN, GESTOR, CORRETOR)
  app.get('/imoveis-marcados/:corretorId', {
    preHandler: app.authenticate,
    schema: {
      tags: ['Relatorios'],
      summary: 'Relatório de imóveis marcados',
      description: 'Retorna imóveis do corretor com total de favoritos e interesses.',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        additionalProperties: false,
        required: ['corretorId'],
        properties: {
          corretorId: { type: 'string', format: 'uuid' },
        },
      },
      response: {
        200: {
          type: 'object',
          additionalProperties: false,
          required: ['itens'],
          properties: {
            itens: { type: 'array', items: { $ref: 'RelatorioImoveisMarcadosItem#' } },
          },
        },
        401: { $ref: 'ErrorResponse#' },
        403: { $ref: 'ErrorResponse#' },
        404: { $ref: 'ErrorResponse#' },
        500: { $ref: 'ErrorResponse#' },
      },
    },
  }, async (request, reply) => {
    const { corretorId } = request.params as { corretorId: string }

    const resultado = await container.relatorioImoveisMarcados.execute({
      perfilExecutor: request.usuario.perfil,
      corretorId,
    })

    return reply.status(200).send(resultado)
  })

  // GET /relatorios/desempenho-corretores  (autenticado — ADMIN, GESTOR)
  app.get('/desempenho-corretores', {
    preHandler: app.authenticate,
    schema: {
      tags: ['Relatorios'],
      summary: 'Relatório de desempenho de corretores',
      description: 'Indicadores de performance por corretor.',
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          additionalProperties: false,
          required: ['corretores'],
          properties: {
            corretores: { type: 'array', items: { $ref: 'RelatorioDesempenhoCorretorItem#' } },
          },
        },
        401: { $ref: 'ErrorResponse#' },
        403: { $ref: 'ErrorResponse#' },
        500: { $ref: 'ErrorResponse#' },
      },
    },
  }, async (request, reply) => {
    const resultado = await container.relatorioDesempenhoCorretor.execute({
      perfilExecutor: request.usuario.perfil,
    })

    return reply.status(200).send(resultado)
  })
}
