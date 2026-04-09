import type { Sessao } from '../entities/sessao.entity.js'

export interface ISessaoRepository {
  save(sessao: Sessao): Promise<void>
  findByToken(token: string): Promise<Sessao | null>
  findByUsuarioId(usuarioId: string): Promise<Sessao[]>
  invalidar(id: string): Promise<void>
  invalidarTodasDoUsuario(usuarioId: string): Promise<void>
}
