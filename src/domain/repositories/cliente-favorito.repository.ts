import type { ClienteFavorito } from '../entities/cliente-favorito.entity.js'

export interface IClienteFavoritoRepository {
  save(favorito: ClienteFavorito): Promise<void>
  findByClienteId(clienteId: string): Promise<ClienteFavorito[]>
  findByImovelId(imovelId: string): Promise<ClienteFavorito[]>
  findByClienteEImovel(clienteId: string, imovelId: string): Promise<ClienteFavorito | null>
  countByImovelId(imovelId: string): Promise<number>
  delete(id: string): Promise<void>
}
