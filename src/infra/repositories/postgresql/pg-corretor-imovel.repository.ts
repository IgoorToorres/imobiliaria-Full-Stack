import type { PrismaClient } from '@prisma/client'
import type { ICorretorImovelRepository } from '../../../domain/repositories/corretor-imovel.repository.js'
import { CorretorImovel } from '../../../domain/entities/corretor-imovel.entity.js'

type CorretorImovelRow = {
  id: string
  corretorId: string
  imovelId: string
  criadoEm: Date
}

export class PgCorretorImovelRepository implements ICorretorImovelRepository {
  constructor(private readonly db: PrismaClient) {}

  async save(vinculo: CorretorImovel): Promise<void> {
    await this.db.corretorImovel.create({
      data: {
        id: vinculo.id,
        corretorId: vinculo.corretorId,
        imovelId: vinculo.imovelId,
        criadoEm: vinculo.criadoEm,
      },
    })
  }

  async findByCorretorId(corretorId: string): Promise<CorretorImovel[]> {
    const rows = await this.db.corretorImovel.findMany({ where: { corretorId } })
    return rows.map(this.toEntity)
  }

  async findByImovelId(imovelId: string): Promise<CorretorImovel[]> {
    const rows = await this.db.corretorImovel.findMany({ where: { imovelId } })
    return rows.map(this.toEntity)
  }

  async findByCorretorEImovel(corretorId: string, imovelId: string): Promise<CorretorImovel | null> {
    const row = await this.db.corretorImovel.findUnique({
      where: { corretorId_imovelId: { corretorId, imovelId } },
    })
    return row ? this.toEntity(row) : null
  }

  async delete(id: string): Promise<void> {
    await this.db.corretorImovel.delete({ where: { id } })
  }

  private toEntity(row: CorretorImovelRow): CorretorImovel {
    return new CorretorImovel({
      id: row.id,
      corretorId: row.corretorId,
      imovelId: row.imovelId,
      criadoEm: row.criadoEm,
    })
  }
}
