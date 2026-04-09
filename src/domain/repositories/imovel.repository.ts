import type { Imovel, TipoImovel, FinalidadeImovel, StatusImovel } from '../entities/imovel.entity.js'

export interface FiltrosImovel {
  tipo?: TipoImovel
  finalidade?: FinalidadeImovel
  status?: StatusImovel
  cidade?: string
  estado?: string
  bairro?: string
  precoMin?: number
  precoMax?: number
  areaMin?: number
  quartos?: number
  banheiros?: number
  vagas?: number
  ordenarPor?: 'preco' | 'criadoEm' | 'dataConstrucao'
  ordem?: 'asc' | 'desc'
}

export interface IImovelRepository {
  save(imovel: Imovel): Promise<void>
  findById(id: string): Promise<Imovel | null>
  findByFilters(filtros: FiltrosImovel): Promise<Imovel[]>
  findAll(): Promise<Imovel[]>
  update(imovel: Imovel): Promise<void>
  delete(id: string): Promise<void>
}
