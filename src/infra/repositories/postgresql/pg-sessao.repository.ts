import type { PrismaClient } from '@prisma/client'
import type { ISessaoRepository } from '../../../domain/repositories/sessao.repository.js'
import { Sessao } from '../../../domain/entities/sessao.entity.js'

type SessaoRow = {
  id: string
  usuarioId: string
  token: string
  ip: string | null
  ativa: boolean
  criadoEm: Date
  expiraEm: Date
}

export class PgSessaoRepository implements ISessaoRepository {
  constructor(private readonly db: PrismaClient) {}

  async save(sessao: Sessao): Promise<void> {
    await this.db.sessao.create({
      data: {
        id: sessao.id,
        usuarioId: sessao.usuarioId,
        token: sessao.token,
        ip: sessao.ip,
        ativa: sessao.ativa,
        criadoEm: sessao.criadoEm,
        expiraEm: sessao.expiraEm,
      },
    })
  }

  async findByToken(token: string): Promise<Sessao | null> {
    const row = await this.db.sessao.findUnique({ where: { token } })
    return row ? this.toEntity(row) : null
  }

  async findByUsuarioId(usuarioId: string): Promise<Sessao[]> {
    const rows = await this.db.sessao.findMany({ where: { usuarioId } })
    return rows.map(this.toEntity)
  }

  async invalidar(id: string): Promise<void> {
    await this.db.sessao.update({
      where: { id },
      data: { ativa: false },
    })
  }

  async invalidarTodasDoUsuario(usuarioId: string): Promise<void> {
    await this.db.sessao.updateMany({
      where: { usuarioId },
      data: { ativa: false },
    })
  }

  private toEntity(row: SessaoRow): Sessao {
    return new Sessao({
      id: row.id,
      usuarioId: row.usuarioId,
      token: row.token,
      ip: row.ip ?? undefined,
      ativa: row.ativa,
      criadoEm: row.criadoEm,
      expiraEm: row.expiraEm,
    })
  }
}
