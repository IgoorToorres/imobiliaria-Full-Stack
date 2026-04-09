import type { IImovelRepository, FiltrosImovel } from '../../../domain/repositories/imovel.repository.js'
import type { Imovel } from '../../../domain/entities/imovel.entity.js'

export type PesquisarImoveisInput = FiltrosImovel

export interface PesquisarImoveisOutput {
  imoveis: Imovel[]
  total: number
}

export class PesquisarImoveisUseCase {
  constructor(private readonly imovelRepo: IImovelRepository) {}

  async execute(input: PesquisarImoveisInput): Promise<PesquisarImoveisOutput> {
    const imoveis = await this.imovelRepo.findByFilters(input)
    return { imoveis, total: imoveis.length }
  }
}
