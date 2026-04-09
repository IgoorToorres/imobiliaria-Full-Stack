import type { Corretor } from '../entities/corretor.entity.js'

export interface ICorretorRepository {
  save(corretor: Corretor): Promise<void>
  findById(id: string): Promise<Corretor | null>
  findByUsuarioId(usuarioId: string): Promise<Corretor | null>
  findByCreci(creci: string): Promise<Corretor | null>
  findAll(): Promise<Corretor[]>
  update(corretor: Corretor): Promise<void>
}
