import type { PrismaClient } from '@prisma/client'
import type { IUsuarioRepository } from '../../../domain/repositories/usuario.repository.js'
import { Usuario, type PerfilUsuario } from '../../../domain/entities/usuario.entity.js'

type UsuarioRow = {
  id: string
  nome: string
  email: string
  senhaHash: string
  telefone: string | null
  cpf: string | null
  perfil: string
  ativo: boolean
  criadoEm: Date
  atualizadoEm: Date
}

export class PgUsuarioRepository implements IUsuarioRepository {
  constructor(private readonly db: PrismaClient) {}

  async save(usuario: Usuario): Promise<void> {
    await this.db.usuario.create({
      data: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        senhaHash: usuario.senhaHash,
        telefone: usuario.telefone,
        cpf: usuario.cpf,
        perfil: usuario.perfil,
        ativo: usuario.ativo,
        criadoEm: usuario.criadoEm,
      },
    })
  }

  async findById(id: string): Promise<Usuario | null> {
    const row = await this.db.usuario.findUnique({ where: { id } })
    return row ? this.toEntity(row) : null
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    const row = await this.db.usuario.findUnique({ where: { email } })
    return row ? this.toEntity(row) : null
  }

  async findByCpf(cpf: string): Promise<Usuario | null> {
    const row = await this.db.usuario.findUnique({ where: { cpf } })
    return row ? this.toEntity(row) : null
  }

  async update(usuario: Usuario): Promise<void> {
    await this.db.usuario.update({
      where: { id: usuario.id },
      data: {
        nome: usuario.nome,
        email: usuario.email,
        senhaHash: usuario.senhaHash,
        telefone: usuario.telefone,
        cpf: usuario.cpf,
        perfil: usuario.perfil,
        ativo: usuario.ativo,
      },
    })
  }

  async delete(id: string): Promise<void> {
    await this.db.usuario.delete({ where: { id } })
  }

  private toEntity(row: UsuarioRow): Usuario {
    return new Usuario({
      id: row.id,
      nome: row.nome,
      email: row.email,
      senhaHash: row.senhaHash,
      telefone: row.telefone ?? undefined,
      cpf: row.cpf ?? undefined,
      perfil: row.perfil as PerfilUsuario,
      ativo: row.ativo,
      criadoEm: row.criadoEm,
      atualizadoEm: row.atualizadoEm,
    })
  }
}
