import type { Usuario } from '../entities/usuario.entity.js'

export interface IUsuarioRepository {
  save(usuario: Usuario): Promise<void>
  findById(id: string): Promise<Usuario | null>
  findByEmail(email: string): Promise<Usuario | null>
  findByCpf(cpf: string): Promise<Usuario | null>
  update(usuario: Usuario): Promise<void>
  delete(id: string): Promise<void>
}
