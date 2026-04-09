import type { IClienteFavoritoRepository } from '../../../domain/repositories/cliente-favorito.repository.js'
import type { IClienteRepository } from '../../../domain/repositories/cliente.repository.js'
import type { IImovelRepository } from '../../../domain/repositories/imovel.repository.js'
import { ClienteFavorito } from '../../../domain/entities/cliente-favorito.entity.js'
import { NotFoundError, ConflictError } from '../../../domain/errors/domain.error.js'
import type { ClienteFavorito as ClienteFavoritoEntity } from '../../../domain/entities/cliente-favorito.entity.js'

export interface AdicionarFavoritoInput {
  clienteId: string
  imovelId: string
}

export interface ListarFavoritosInput {
  clienteId: string
}

export interface ListarFavoritosOutput {
  favoritos: ClienteFavoritoEntity[]
}

export class AdicionarFavoritoUseCase {
  constructor(
    private readonly clienteRepo: IClienteRepository,
    private readonly imovelRepo: IImovelRepository,
    private readonly favoritoRepo: IClienteFavoritoRepository,
  ) {}

  async execute(input: AdicionarFavoritoInput): Promise<void> {
    const cliente = await this.clienteRepo.findById(input.clienteId)
    if (!cliente) throw new NotFoundError('Cliente', input.clienteId)

    const imovel = await this.imovelRepo.findById(input.imovelId)
    if (!imovel) throw new NotFoundError('Imóvel', input.imovelId)

    const jaFavoritado = await this.favoritoRepo.findByClienteEImovel(input.clienteId, input.imovelId)
    if (jaFavoritado) throw new ConflictError('Imóvel já está nos favoritos')

    const favorito = ClienteFavorito.create({ clienteId: input.clienteId, imovelId: input.imovelId })
    await this.favoritoRepo.save(favorito)
  }
}

export class RemoverFavoritoUseCase {
  constructor(private readonly favoritoRepo: IClienteFavoritoRepository) {}

  async execute(input: { clienteId: string; imovelId: string }): Promise<void> {
    const favorito = await this.favoritoRepo.findByClienteEImovel(input.clienteId, input.imovelId)
    if (!favorito) throw new NotFoundError('Favorito')

    await this.favoritoRepo.delete(favorito.id)
  }
}

export class ListarFavoritosUseCase {
  constructor(private readonly favoritoRepo: IClienteFavoritoRepository) {}

  async execute(input: ListarFavoritosInput): Promise<ListarFavoritosOutput> {
    const favoritos = await this.favoritoRepo.findByClienteId(input.clienteId)
    return { favoritos }
  }
}
