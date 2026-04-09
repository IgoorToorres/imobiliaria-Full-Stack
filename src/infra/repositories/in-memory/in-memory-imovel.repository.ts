import type { IImovelRepository, FiltrosImovel } from '../../../domain/repositories/imovel.repository.js'
import type { Imovel } from '../../../domain/entities/imovel.entity.js'

export class InMemoryImovelRepository implements IImovelRepository {
  private items: Imovel[] = []

  async save(imovel: Imovel): Promise<void> {
    this.items.push(imovel)
  }

  async findById(id: string): Promise<Imovel | null> {
    return this.items.find((i) => i.id === id) ?? null
  }

  async findAll(): Promise<Imovel[]> {
    return [...this.items]
  }

  async findByFilters(filtros: FiltrosImovel): Promise<Imovel[]> {
    let result = [...this.items]

    if (filtros.tipo) result = result.filter((i) => i.tipo === filtros.tipo)
    if (filtros.finalidade) result = result.filter((i) => i.finalidade === filtros.finalidade)
    if (filtros.status) result = result.filter((i) => i.status === filtros.status)
    if (filtros.cidade) result = result.filter((i) => i.endereco.cidade.toLowerCase().includes(filtros.cidade!.toLowerCase()))
    if (filtros.estado) result = result.filter((i) => i.endereco.estado === filtros.estado)
    if (filtros.bairro) result = result.filter((i) => i.endereco.bairro.toLowerCase().includes(filtros.bairro!.toLowerCase()))
    if (filtros.precoMin !== undefined) result = result.filter((i) => i.preco >= filtros.precoMin!)
    if (filtros.precoMax !== undefined) result = result.filter((i) => i.preco <= filtros.precoMax!)
    if (filtros.areaMin !== undefined) result = result.filter((i) => (i.areaTotal ?? 0) >= filtros.areaMin!)
    if (filtros.quartos !== undefined) result = result.filter((i) => i.quartos >= filtros.quartos!)
    if (filtros.banheiros !== undefined) result = result.filter((i) => i.banheiros >= filtros.banheiros!)
    if (filtros.vagas !== undefined) result = result.filter((i) => i.vagas >= filtros.vagas!)

    if (filtros.ordenarPor) {
      const ordem = filtros.ordem ?? 'asc'
      result.sort((a, b) => {
        let av: number, bv: number
        if (filtros.ordenarPor === 'preco') {
          av = a.preco; bv = b.preco
        } else if (filtros.ordenarPor === 'criadoEm') {
          av = a.criadoEm.getTime(); bv = b.criadoEm.getTime()
        } else {
          av = a.dataConstrucao?.getTime() ?? 0
          bv = b.dataConstrucao?.getTime() ?? 0
        }
        return ordem === 'asc' ? av - bv : bv - av
      })
    }

    return result
  }

  async update(imovel: Imovel): Promise<void> {
    const idx = this.items.findIndex((i) => i.id === imovel.id)
    if (idx !== -1) this.items[idx] = imovel
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter((i) => i.id !== id)
  }
}
