import type { FastifyError, FastifyRequest, FastifyReply } from 'fastify'
import { ZodError } from 'zod'
import {
  DomainError,
  NotFoundError,
  UnauthorizedError,
  ConflictError,
  BusinessRuleError,
  InvalidCredentialsError,
} from '../../domain/errors/domain.error.js'

export function errorHandler(
  error: FastifyError | Error,
  request: FastifyRequest,
  reply: FastifyReply,
): void {
  // ─── Validação de entrada (Zod) ──────────────────────────────────────────
  if (error instanceof ZodError) {
    reply.status(400).send({
      erro: 'Dados inválidos',
      detalhes: error.flatten().fieldErrors,
    })
    return
  }

  // ─── Erros de domínio (mapeados para 4xx) ────────────────────────────────
  if (error instanceof InvalidCredentialsError) {
    reply.status(401).send({ erro: error.message })
    return
  }

  if (error instanceof UnauthorizedError) {
    reply.status(403).send({ erro: error.message })
    return
  }

  if (error instanceof NotFoundError) {
    reply.status(404).send({ erro: error.message })
    return
  }

  if (error instanceof ConflictError) {
    reply.status(409).send({ erro: error.message })
    return
  }

  if (error instanceof BusinessRuleError) {
    reply.status(422).send({ erro: error.message })
    return
  }

  if (error instanceof DomainError) {
    reply.status(400).send({ erro: error.message })
    return
  }

  // ─── Erros do Fastify (400 de payload, etc.) ─────────────────────────────
  if ('statusCode' in error && typeof error.statusCode === 'number' && error.statusCode < 500) {
    reply.status(error.statusCode).send({ erro: error.message })
    return
  }

  // ─── Erro inesperado (5xx) ────────────────────────────────────────────────
  request.log.error(error)
  reply.status(500).send({ erro: 'Erro interno do servidor' })
}
