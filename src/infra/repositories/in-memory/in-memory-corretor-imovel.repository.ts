import type { ICorretorImovelRepository } from '../../../domain/repositories/corretor-imovel.repository.js'
import type { CorretorImovel } from '../../../domain/entities/corretor-imovel.entity.js'

export class InMemoryCorretorImovelRepository implements ICorretorImovelRepository {
  private items: CorretorImovel[] = []

  async save(vinculo: CorretorImovel): Promise<void> {
    this.items.push(vinculo)
  }

  async findByCorretorId(corretorId: string): Promise<CorretorImovel[]> {
    return this.items.filter((v) => v.corretorId === corretorId)
  }

  async findByImovelId(imovelId: string): Promise<CorretorImovel[]> {
    return this.items.filter((v) => v.imovelId === imovelId)
  }

  async findByCorretorEImovel(corretorId: string, imovelId: string): Promise<CorretorImovel | null> {
    return this.items.find((v) => v.corretorId === corretorId && v.imovelId === imovelId) ?? null
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter((v) => v.id !== id)
  }
}
