import type { PrismaClient } from '@prisma/client'
import type { IClienteRepository } from '../../../domain/repositories/cliente.repository.js'
import { Cliente } from '../../../domain/entities/cliente.entity.js'

type ClienteRow = {
  id: string
  usuarioId: string
  dataNascimento: Date | null
  profissao: string | null
  criadoEm: Date
}

export class PgClienteRepository implements IClienteRepository {
  constructor(private readonly db: PrismaClient) {}

  async save(cliente: Cliente): Promise<void> {
    await this.db.cliente.create({
      data: {
        id: cliente.id,
        usuarioId: cliente.usuarioId,
        dataNascimento: cliente.dataNascimento,
        profissao: cliente.profissao,
        criadoEm: cliente.criadoEm,
      },
    })
  }

  async findById(id: string): Promise<Cliente | null> {
    const row = await this.db.cliente.findUnique({ where: { id } })
    return row ? this.toEntity(row) : null
  }

  async findByUsuarioId(usuarioId: string): Promise<Cliente | null> {
    const row = await this.db.cliente.findUnique({ where: { usuarioId } })
    return row ? this.toEntity(row) : null
  }

  async findAll(): Promise<Cliente[]> {
    const rows = await this.db.cliente.findMany()
    return rows.map(this.toEntity)
  }

  async update(cliente: Cliente): Promise<void> {
    await this.db.cliente.update({
      where: { id: cliente.id },
      data: {
        dataNascimento: cliente.dataNascimento,
        profissao: cliente.profissao,
      },
    })
  }

  async delete(id: string): Promise<void> {
    await this.db.cliente.delete({ where: { id } })
  }

  private toEntity(row: ClienteRow): Cliente {
    return new Cliente({
      id: row.id,
      usuarioId: row.usuarioId,
      dataNascimento: row.dataNascimento ?? undefined,
      profissao: row.profissao ?? undefined,
      criadoEm: row.criadoEm,
    })
  }
}
