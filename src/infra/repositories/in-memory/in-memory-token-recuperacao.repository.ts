import type { ITokenRecuperacaoRepository } from '../../../domain/repositories/token-recuperacao.repository.js'
import type { TokenRecuperacao } from '../../../domain/entities/token-recuperacao.entity.js'

export class InMemoryTokenRecuperacaoRepository implements ITokenRecuperacaoRepository {
  private items: TokenRecuperacao[] = []

  async save(token: TokenRecuperacao): Promise<void> {
    this.items.push(token)
  }

  async findByToken(token: string): Promise<TokenRecuperacao | null> {
    return this.items.find((t) => t.token === token) ?? null
  }

  async marcarComoUtilizado(id: string): Promise<void> {
    const token = this.items.find((t) => t.id === id)
    if (token) token.utilizado = true
  }
}
