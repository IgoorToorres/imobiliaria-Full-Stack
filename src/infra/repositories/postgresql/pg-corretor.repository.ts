import type { PrismaClient } from '@prisma/client'
import type { ICorretorRepository } from '../../../domain/repositories/corretor.repository.js'
import { Corretor } from '../../../domain/entities/corretor.entity.js'

type CorretorRow = {
  id: string
  usuarioId: string
  creci: string
  bio: string | null
  fotoUrl: string | null
  ativo: boolean
  criadoEm: Date
}

export class PgCorretorRepository implements ICorretorRepository {
  constructor(private readonly db: PrismaClient) {}

  async save(corretor: Corretor): Promise<void> {
    await this.db.corretor.create({
      data: {
        id: corretor.id,
        usuarioId: corretor.usuarioId,
        creci: corretor.creci,
        bio: corretor.bio,
        fotoUrl: corretor.fotoUrl,
        ativo: corretor.ativo,
        criadoEm: corretor.criadoEm,
      },
    })
  }

  async findById(id: string): Promise<Corretor | null> {
    const row = await this.db.corretor.findUnique({ where: { id } })
    return row ? this.toEntity(row) : null
  }

  async findByUsuarioId(usuarioId: string): Promise<Corretor | null> {
    const row = await this.db.corretor.findUnique({ where: { usuarioId } })
    return row ? this.toEntity(row) : null
  }

  async findByCreci(creci: string): Promise<Corretor | null> {
    const row = await this.db.corretor.findUnique({ where: { creci } })
    return row ? this.toEntity(row) : null
  }

  async findAll(): Promise<Corretor[]> {
    const rows = await this.db.corretor.findMany()
    return rows.map(this.toEntity)
  }

  async update(corretor: Corretor): Promise<void> {
    await this.db.corretor.update({
      where: { id: corretor.id },
      data: {
        creci: corretor.creci,
        bio: corretor.bio,
        fotoUrl: corretor.fotoUrl,
        ativo: corretor.ativo,
      },
    })
  }

  private toEntity(row: CorretorRow): Corretor {
    return new Corretor({
      id: row.id,
      usuarioId: row.usuarioId,
      creci: row.creci,
      bio: row.bio ?? undefined,
      fotoUrl: row.fotoUrl ?? undefined,
      ativo: row.ativo,
      criadoEm: row.criadoEm,
    })
  }
}
