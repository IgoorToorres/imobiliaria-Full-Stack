import type { PrismaClient } from '@prisma/client'
import type { IClienteFavoritoRepository } from '../../../domain/repositories/cliente-favorito.repository.js'
import { ClienteFavorito } from '../../../domain/entities/cliente-favorito.entity.js'

type ClienteFavoritoRow = {
  id: string
  clienteId: string
  imovelId: string
  criadoEm: Date
}

export class PgClienteFavoritoRepository implements IClienteFavoritoRepository {
  constructor(private readonly db: PrismaClient) {}

  async save(favorito: ClienteFavorito): Promise<void> {
    await this.db.clienteFavorito.create({
      data: {
        id: favorito.id,
        clienteId: favorito.clienteId,
        imovelId: favorito.imovelId,
        criadoEm: favorito.criadoEm,
      },
    })
  }

  async findByClienteId(clienteId: string): Promise<ClienteFavorito[]> {
    const rows = await this.db.clienteFavorito.findMany({ where: { clienteId } })
    return rows.map(this.toEntity)
  }

  async findByImovelId(imovelId: string): Promise<ClienteFavorito[]> {
    const rows = await this.db.clienteFavorito.findMany({ where: { imovelId } })
    return rows.map(this.toEntity)
  }

  async findByClienteEImovel(clienteId: string, imovelId: string): Promise<ClienteFavorito | null> {
    const row = await this.db.clienteFavorito.findUnique({
      where: { clienteId_imovelId: { clienteId, imovelId } },
    })
    return row ? this.toEntity(row) : null
  }

  async countByImovelId(imovelId: string): Promise<number> {
    return this.db.clienteFavorito.count({ where: { imovelId } })
  }

  async delete(id: string): Promise<void> {
    await this.db.clienteFavorito.delete({ where: { id } })
  }

  private toEntity(row: ClienteFavoritoRow): ClienteFavorito {
    return new ClienteFavorito({
      id: row.id,
      clienteId: row.clienteId,
      imovelId: row.imovelId,
      criadoEm: row.criadoEm,
    })
  }
}
