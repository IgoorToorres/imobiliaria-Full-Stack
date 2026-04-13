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
  app.post('/login', {
    schema: {
      tags: ['Auth'],
      summary: 'Autenticar usuário',
      description: 'Realiza login e retorna um token de sessão (Bearer).',
      body: {
        type: 'object',
        additionalProperties: false,
        required: ['email', 'senha'],
        properties: {
          email: { type: 'string', format: 'email', description: 'E-mail do usuário' },
          senha: { type: 'string', minLength: 1, description: 'Senha em texto plano' },
        },
      },
      response: {
        200: {
          type: 'object',
          additionalProperties: false,
          required: ['token', 'usuario'],
          properties: {
            token: { type: 'string', description: 'Token de autenticação' },
            usuario: { $ref: 'UsuarioPublic#' },
          },
        },
        400: { $ref: 'ValidationError#' },
        401: { $ref: 'ErrorResponse#' },
        403: { $ref: 'ErrorResponse#' },
        500: { $ref: 'ErrorResponse#' },
      },
    },
  }, async (request, reply) => {
    const body = loginSchema.parse(request.body)

    const resultado = await container.autenticarUsuario.execute({
      email: body.email,
      senha: body.senha,
      ip: request.ip,
    })

    return reply.status(200).send(resultado)
  })

  // POST /auth/recuperar-senha
  app.post('/recuperar-senha', {
    schema: {
      tags: ['Auth'],
      summary: 'Solicitar recuperação de senha',
      description: 'Gera um token temporário de recuperação de senha.',
      body: {
        type: 'object',
        additionalProperties: false,
        required: ['email'],
        properties: {
          email: { type: 'string', format: 'email' },
        },
      },
      response: {
        200: {
          type: 'object',
          additionalProperties: false,
          required: ['token'],
          properties: {
            token: { type: 'string', format: 'uuid', description: 'Token de recuperação' },
          },
        },
        400: { $ref: 'ValidationError#' },
        404: { $ref: 'ErrorResponse#' },
        500: { $ref: 'ErrorResponse#' },
      },
    },
  }, async (request, reply) => {
    const body = recuperarSenhaSchema.parse(request.body)

    const resultado = await container.solicitarRecuperacaoSenha.execute({
      email: body.email,
    })

    return reply.status(200).send(resultado)
  })

  // POST /auth/redefinir-senha
  app.post('/redefinir-senha', {
    schema: {
      tags: ['Auth'],
      summary: 'Redefinir senha',
      description: 'Redefine a senha utilizando um token de recuperação válido.',
      body: {
        type: 'object',
        additionalProperties: false,
        required: ['token', 'novaSenha'],
        properties: {
          token: { type: 'string', format: 'uuid' },
          novaSenha: { type: 'string', minLength: 6 },
        },
      },
      response: {
        204: { type: 'null', description: 'Senha redefinida com sucesso' },
        400: { $ref: 'ValidationError#' },
        404: { $ref: 'ErrorResponse#' },
        422: { $ref: 'ErrorResponse#' },
        500: { $ref: 'ErrorResponse#' },
      },
    },
  }, async (request, reply) => {
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
    schema: {
      tags: ['Auth'],
      summary: 'Encerrar sessão',
      description: 'Invalida o token atual.',
      security: [{ bearerAuth: [] }],
      response: {
        204: { type: 'null', description: 'Sessão encerrada' },
        401: { $ref: 'ErrorResponse#' },
        500: { $ref: 'ErrorResponse#' },
      },
    },
  }, async (request, reply) => {
    await container.sessaoRepo.invalidar(request.usuario.sessaoId)
    return reply.status(204).send()
  })
}
