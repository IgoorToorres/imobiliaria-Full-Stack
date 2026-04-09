import type { Cliente } from '../entities/cliente.entity.js'

export interface IClienteRepository {
  save(cliente: Cliente): Promise<void>
  findById(id: string): Promise<Cliente | null>
  findByUsuarioId(usuarioId: string): Promise<Cliente | null>
  findAll(): Promise<Cliente[]>
  update(cliente: Cliente): Promise<void>
  delete(id: string): Promise<void>
}
