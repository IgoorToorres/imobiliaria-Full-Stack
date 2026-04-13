import type { FastifyRequest, FastifyReply } from 'fastify'
import type { PerfilUsuario } from '../domain/entities/usuario.entity.js'
import type { Container } from './container.js'

export interface UsuarioAutenticado {
  id: string
  nome: string
  email: string
  perfil: PerfilUsuario
  sessaoId: string
}

declare module 'fastify' {
  interface FastifyInstance {
    container: Container
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  }

  interface FastifyRequest {
    usuario: UsuarioAutenticado
  }
}
