import type { IImovelRepository } from '../../../domain/repositories/imovel.repository.js'
import type { IClienteFavoritoRepository } from '../../../domain/repositories/cliente-favorito.repository.js'
import type { Imovel } from '../../../domain/entities/imovel.entity.js'
import { NotFoundError } from '../../../domain/errors/domain.error.js'

export interface VisualizarImovelOutput {
  imovel: Imovel
  totalFavoritos: number
}

export class VisualizarImovelUseCase {
  constructor(
    private readonly imovelRepo: IImovelRepository,
    private readonly favoritoRepo: IClienteFavoritoRepository,
  ) {}

  async execute(id: string): Promise<VisualizarImovelOutput> {
    const imovel = await this.imovelRepo.findById(id)
    if (!imovel) throw new NotFoundError('Imóvel', id)

    const totalFavoritos = await this.favoritoRepo.countByImovelId(id)

    return { imovel, totalFavoritos }
  }
}
