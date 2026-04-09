import type { IClienteFavoritoRepository } from '../../../domain/repositories/cliente-favorito.repository.js'
import type { ClienteFavorito } from '../../../domain/entities/cliente-favorito.entity.js'

export class InMemoryClienteFavoritoRepository implements IClienteFavoritoRepository {
  private items: ClienteFavorito[] = []

  async save(favorito: ClienteFavorito): Promise<void> {
    this.items.push(favorito)
  }

  async findByClienteId(clienteId: string): Promise<ClienteFavorito[]> {
    return this.items.filter((f) => f.clienteId === clienteId)
  }

  async findByImovelId(imovelId: string): Promise<ClienteFavorito[]> {
    return this.items.filter((f) => f.imovelId === imovelId)
  }

  async findByClienteEImovel(clienteId: string, imovelId: string): Promise<ClienteFavorito | null> {
    return this.items.find((f) => f.clienteId === clienteId && f.imovelId === imovelId) ?? null
  }

  async countByImovelId(imovelId: string): Promise<number> {
    return this.items.filter((f) => f.imovelId === imovelId).length
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter((f) => f.id !== id)
  }
}
