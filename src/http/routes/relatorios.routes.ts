import type { FastifyInstance } from 'fastify'

export async function relatoriosRoutes(app: FastifyInstance) {
  const { container } = app

  // GET /relatorios/imoveis-marcados/:corretorId  (autenticado — ADMIN, GESTOR, CORRETOR)
  app.get('/imoveis-marcados/:corretorId', {
    preHandler: app.authenticate,
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
  }, async (request, reply) => {
    const resultado = await container.relatorioDesempenhoCorretor.execute({
      perfilExecutor: request.usuario.perfil,
    })

    return reply.status(200).send(resultado)
  })
}
