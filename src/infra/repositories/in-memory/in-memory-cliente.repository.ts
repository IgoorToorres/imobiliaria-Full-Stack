import type { IClienteRepository } from '../../../domain/repositories/cliente.repository.js'
import type { Cliente } from '../../../domain/entities/cliente.entity.js'

export class InMemoryClienteRepository implements IClienteRepository {
  private items: Cliente[] = []

  async save(cliente: Cliente): Promise<void> {
    this.items.push(cliente)
  }

  async findById(id: string): Promise<Cliente | null> {
    return this.items.find((c) => c.id === id) ?? null
  }

  async findByUsuarioId(usuarioId: string): Promise<Cliente | null> {
    return this.items.find((c) => c.usuarioId === usuarioId) ?? null
  }

  async findAll(): Promise<Cliente[]> {
    return [...this.items]
  }

  async update(cliente: Cliente): Promise<void> {
    const idx = this.items.findIndex((c) => c.id === cliente.id)
    if (idx !== -1) this.items[idx] = cliente
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter((c) => c.id !== id)
  }
}
