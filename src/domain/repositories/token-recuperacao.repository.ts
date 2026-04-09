import type { TokenRecuperacao } from '../entities/token-recuperacao.entity.js'

export interface ITokenRecuperacaoRepository {
  save(token: TokenRecuperacao): Promise<void>
  findByToken(token: string): Promise<TokenRecuperacao | null>
  marcarComoUtilizado(id: string): Promise<void>
}
