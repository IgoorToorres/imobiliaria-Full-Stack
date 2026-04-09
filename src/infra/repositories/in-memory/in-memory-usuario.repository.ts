import type { IUsuarioRepository } from '../../../domain/repositories/usuario.repository.js'
import type { Usuario } from '../../../domain/entities/usuario.entity.js'

export class InMemoryUsuarioRepository implements IUsuarioRepository {
  private items: Usuario[] = []

  async save(usuario: Usuario): Promise<void> {
    this.items.push(usuario)
  }

  async findById(id: string): Promise<Usuario | null> {
    return this.items.find((u) => u.id === id) ?? null
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    return this.items.find((u) => u.email === email) ?? null
  }

  async findByCpf(cpf: string): Promise<Usuario | null> {
    return this.items.find((u) => u.cpf === cpf) ?? null
  }

  async update(usuario: Usuario): Promise<void> {
    const idx = this.items.findIndex((u) => u.id === usuario.id)
    if (idx !== -1) this.items[idx] = usuario
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter((u) => u.id !== id)
  }
}
