import type { PrismaClient } from '@prisma/client'
import type { IInteresseRepository } from '../../../domain/repositories/interesse.repository.js'
import { Interesse, type StatusInteresse } from '../../../domain/entities/interesse.entity.js'

type InteresseRow = {
  id: string
  clienteId: string
  imovelId: string
  corretorId: string | null
  mensagem: string | null
  status: string
  criadoEm: Date
  atualizadoEm: Date
}

export class PgInteresseRepository implements IInteresseRepository {
  constructor(private readonly db: PrismaClient) {}

  async save(interesse: Interesse): Promise<void> {
    await this.db.interesse.create({
      data: {
        id: interesse.id,
        clienteId: interesse.clienteId,
        imovelId: interesse.imovelId,
        corretorId: interesse.corretorId,
        mensagem: interesse.mensagem,
        status: interesse.status,
        criadoEm: interesse.criadoEm,
      },
    })
  }

  async findById(id: string): Promise<Interesse | null> {
    const row = await this.db.interesse.findUnique({ where: { id } })
    return row ? this.toEntity(row) : null
  }

  async findByClienteId(clienteId: string): Promise<Interesse[]> {
    const rows = await this.db.interesse.findMany({ where: { clienteId } })
    return rows.map(this.toEntity)
  }

  async findByImovelId(imovelId: string): Promise<Interesse[]> {
    const rows = await this.db.interesse.findMany({ where: { imovelId } })
    return rows.map(this.toEntity)
  }

  async findByCorretorId(corretorId: string): Promise<Interesse[]> {
    const rows = await this.db.interesse.findMany({ where: { corretorId } })
    return rows.map(this.toEntity)
  }

  async findByImovelEStatus(imovelId: string, status: StatusInteresse[]): Promise<Interesse[]> {
    const rows = await this.db.interesse.findMany({
      where: {
        imovelId,
        status: { in: status },
      },
    })
    return rows.map(this.toEntity)
  }

  async update(interesse: Interesse): Promise<void> {
    await this.db.interesse.update({
      where: { id: interesse.id },
      data: {
        corretorId: interesse.corretorId,
        mensagem: interesse.mensagem,
        status: interesse.status,
      },
    })
  }

  private toEntity(row: InteresseRow): Interesse {
    return new Interesse({
      id: row.id,
      clienteId: row.clienteId,
      imovelId: row.imovelId,
      corretorId: row.corretorId ?? undefined,
      mensagem: row.mensagem ?? undefined,
      status: row.status as StatusInteresse,
      criadoEm: row.criadoEm,
      atualizadoEm: row.atualizadoEm,
    })
  }
}
