import type { PrismaClient } from '@prisma/client'
import type { ITokenRecuperacaoRepository } from '../../../domain/repositories/token-recuperacao.repository.js'
import { TokenRecuperacao } from '../../../domain/entities/token-recuperacao.entity.js'

type TokenRecuperacaoRow = {
  id: string
  usuarioId: string
  token: string
  utilizado: boolean
  expiracao: Date
  criadoEm: Date
}

export class PgTokenRecuperacaoRepository implements ITokenRecuperacaoRepository {
  constructor(private readonly db: PrismaClient) {}

  async save(token: TokenRecuperacao): Promise<void> {
    await this.db.tokenRecuperacao.create({
      data: {
        id: token.id,
        usuarioId: token.usuarioId,
        token: token.token,
        utilizado: token.utilizado,
        expiracao: token.expiracao,
        criadoEm: token.criadoEm,
      },
    })
  }

  async findByToken(token: string): Promise<TokenRecuperacao | null> {
    const row = await this.db.tokenRecuperacao.findUnique({ where: { token } })
    return row ? this.toEntity(row) : null
  }

  async marcarComoUtilizado(id: string): Promise<void> {
    await this.db.tokenRecuperacao.update({
      where: { id },
      data: { utilizado: true },
    })
  }

  private toEntity(row: TokenRecuperacaoRow): TokenRecuperacao {
    return new TokenRecuperacao({
      id: row.id,
      usuarioId: row.usuarioId,
      token: row.token,
      utilizado: row.utilizado,
      expiracao: row.expiracao,
      criadoEm: row.criadoEm,
    })
  }
}
