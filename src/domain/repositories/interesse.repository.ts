import type { Interesse, StatusInteresse } from '../entities/interesse.entity.js'

export interface IInteresseRepository {
  save(interesse: Interesse): Promise<void>
  findById(id: string): Promise<Interesse | null>
  findByClienteId(clienteId: string): Promise<Interesse[]>
  findByImovelId(imovelId: string): Promise<Interesse[]>
  findByCorretorId(corretorId: string): Promise<Interesse[]>
  findByImovelEStatus(imovelId: string, status: StatusInteresse[]): Promise<Interesse[]>
  update(interesse: Interesse): Promise<void>
}
