import type { ISessaoRepository } from '../../../domain/repositories/sessao.repository.js'
import type { Sessao } from '../../../domain/entities/sessao.entity.js'

export class InMemorySessaoRepository implements ISessaoRepository {
  private items: Sessao[] = []

  async save(sessao: Sessao): Promise<void> {
    this.items.push(sessao)
  }

  async findByToken(token: string): Promise<Sessao | null> {
    return this.items.find((s) => s.token === token) ?? null
  }

  async findByUsuarioId(usuarioId: string): Promise<Sessao[]> {
    return this.items.filter((s) => s.usuarioId === usuarioId)
  }

  async invalidar(id: string): Promise<void> {
    const sessao = this.items.find((s) => s.id === id)
    if (sessao) sessao.ativa = false
  }

  async invalidarTodasDoUsuario(usuarioId: string): Promise<void> {
    this.items.filter((s) => s.usuarioId === usuarioId).forEach((s) => (s.ativa = false))
  }
}
