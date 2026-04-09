import type { CorretorImovel } from '../entities/corretor-imovel.entity.js'

export interface ICorretorImovelRepository {
  save(vinculo: CorretorImovel): Promise<void>
  findByCorretorId(corretorId: string): Promise<CorretorImovel[]>
  findByImovelId(imovelId: string): Promise<CorretorImovel[]>
  findByCorretorEImovel(corretorId: string, imovelId: string): Promise<CorretorImovel | null>
  delete(id: string): Promise<void>
}
