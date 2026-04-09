import type { IInteresseRepository } from '../../../domain/repositories/interesse.repository.js'
import type { Interesse, StatusInteresse } from '../../../domain/entities/interesse.entity.js'

export class InMemoryInteresseRepository implements IInteresseRepository {
  private items: Interesse[] = []

  async save(interesse: Interesse): Promise<void> {
    this.items.push(interesse)
  }

  async findById(id: string): Promise<Interesse | null> {
    return this.items.find((i) => i.id === id) ?? null
  }

  async findByClienteId(clienteId: string): Promise<Interesse[]> {
    return this.items.filter((i) => i.clienteId === clienteId)
  }

  async findByImovelId(imovelId: string): Promise<Interesse[]> {
    return this.items.filter((i) => i.imovelId === imovelId)
  }

  async findByCorretorId(corretorId: string): Promise<Interesse[]> {
    return this.items.filter((i) => i.corretorId === corretorId)
  }

  async findByImovelEStatus(imovelIdOrClienteId: string, status: StatusInteresse[]): Promise<Interesse[]> {
    // Usado tanto para busca por imovelId quanto por clienteId dependendo do contexto
    return this.items.filter(
      (i) =>
        (i.imovelId === imovelIdOrClienteId || i.clienteId === imovelIdOrClienteId) &&
        status.includes(i.status),
    )
  }

  async update(interesse: Interesse): Promise<void> {
    const idx = this.items.findIndex((i) => i.id === interesse.id)
    if (idx !== -1) this.items[idx] = interesse
  }
}
