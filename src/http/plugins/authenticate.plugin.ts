import fp from 'fastify-plugin'
import type { FastifyInstance } from 'fastify'

export const authenticatePlugin = fp(async (app: FastifyInstance) => {
  app.decorate('authenticate', async (request, reply) => {
    const authHeader = request.headers.authorization

    if (!authHeader?.startsWith('Bearer ')) {
      return reply.status(401).send({ erro: 'Token de autenticação não fornecido' })
    }

    const token = authHeader.split(' ')[1]

    const sessao = await app.container.sessaoRepo.findByToken(token)

    if (!sessao || !sessao.estaValida()) {
      return reply.status(401).send({ erro: 'Sessão inválida ou expirada' })
    }

    const usuario = await app.container.usuarioRepo.findById(sessao.usuarioId)

    if (!usuario || !usuario.ativo) {
      return reply.status(401).send({ erro: 'Usuário não encontrado ou inativo' })
    }

    request.usuario = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil,
      sessaoId: sessao.id,
    }
  })
})
