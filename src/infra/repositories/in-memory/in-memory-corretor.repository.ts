import type { ICorretorRepository } from '../../../domain/repositories/corretor.repository.js'
import type { Corretor } from '../../../domain/entities/corretor.entity.js'

export class InMemoryCorretorRepository implements ICorretorRepository {
  private items: Corretor[] = []

  async save(corretor: Corretor): Promise<void> {
    this.items.push(corretor)
  }

  async findById(id: string): Promise<Corretor | null> {
    return this.items.find((c) => c.id === id) ?? null
  }

  async findByUsuarioId(usuarioId: string): Promise<Corretor | null> {
    return this.items.find((c) => c.usuarioId === usuarioId) ?? null
  }

  async findByCreci(creci: string): Promise<Corretor | null> {
    return this.items.find((c) => c.creci === creci) ?? null
  }

  async findAll(): Promise<Corretor[]> {
    return [...this.items]
  }

  async update(corretor: Corretor): Promise<void> {
    const idx = this.items.findIndex((c) => c.id === corretor.id)
    if (idx !== -1) this.items[idx] = corretor
  }
}
