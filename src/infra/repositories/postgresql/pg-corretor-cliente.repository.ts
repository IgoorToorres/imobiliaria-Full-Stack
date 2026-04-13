import type { PrismaClient } from '@prisma/client'
import type { ICorretorClienteRepository } from '../../../domain/repositories/corretor-cliente.repository.js'
import { CorretorCliente } from '../../../domain/entities/corretor-cliente.entity.js'

type CorretorClienteRow = {
  id: string
  corretorId: string
  clienteId: string
  criadoEm: Date
}

export class PgCorretorClienteRepository implements ICorretorClienteRepository {
  constructor(private readonly db: PrismaClient) {}

  async save(vinculo: CorretorCliente): Promise<void> {
    await this.db.corretorCliente.create({
      data: {
        id: vinculo.id,
        corretorId: vinculo.corretorId,
        clienteId: vinculo.clienteId,
        criadoEm: vinculo.criadoEm,
      },
    })
  }

  async findByCorretorId(corretorId: string): Promise<CorretorCliente[]> {
    const rows = await this.db.corretorCliente.findMany({ where: { corretorId } })
    return rows.map(this.toEntity)
  }

  async findByClienteId(clienteId: string): Promise<CorretorCliente[]> {
    const rows = await this.db.corretorCliente.findMany({ where: { clienteId } })
    return rows.map(this.toEntity)
  }

  async findByCorretorECliente(corretorId: string, clienteId: string): Promise<CorretorCliente | null> {
    const row = await this.db.corretorCliente.findUnique({
      where: { corretorId_clienteId: { corretorId, clienteId } },
    })
    return row ? this.toEntity(row) : null
  }

  async delete(id: string): Promise<void> {
    await this.db.corretorCliente.delete({ where: { id } })
  }

  private toEntity(row: CorretorClienteRow): CorretorCliente {
    return new CorretorCliente({
      id: row.id,
      corretorId: row.corretorId,
      clienteId: row.clienteId,
      criadoEm: row.criadoEm,
    })
  }
}
