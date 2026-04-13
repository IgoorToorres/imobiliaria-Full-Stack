import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(1, 'Senha obrigatória'),
})

const recuperarSenhaSchema = z.object({
  email: z.string().email('E-mail inválido'),
})

const redefinirSenhaSchema = z.object({
  token: z.string().uuid('Token inválido'),
  novaSenha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
})

export async function authRoutes(app: FastifyInstance) {
  const { container } = app

  // POST /auth/login
  app.post('/login', async (request, reply) => {
    const body = loginSchema.parse(request.body)

    const resultado = await container.autenticarUsuario.execute({
      email: body.email,
      senha: body.senha,
      ip: request.ip,
    })

    return reply.status(200).send(resultado)
  })

  // POST /auth/recuperar-senha
  app.post('/recuperar-senha', async (request, reply) => {
    const body = recuperarSenhaSchema.parse(request.body)

    const resultado = await container.solicitarRecuperacaoSenha.execute({
      email: body.email,
    })

    return reply.status(200).send(resultado)
  })

  // POST /auth/redefinir-senha
  app.post('/redefinir-senha', async (request, reply) => {
    const body = redefinirSenhaSchema.parse(request.body)

    await container.redefinirSenha.execute({
      token: body.token,
      novaSenha: body.novaSenha,
    })

    return reply.status(204).send()
  })

  // DELETE /auth/logout  (autenticado)
  app.delete('/logout', {
    preHandler: app.authenticate,
  }, async (request, reply) => {
    await container.sessaoRepo.invalidar(request.usuario.sessaoId)
    return reply.status(204).send()
  })
}
