import { describe, it, expect, beforeEach } from 'vitest'
import { PesquisarImoveisUseCase } from '../../../src/application/use-cases/imoveis/pesquisar-imoveis.usecase.js'
import { InMemoryImovelRepository } from '../../../src/infra/repositories/in-memory/in-memory-imovel.repository.js'
import { makeImovel } from '../../helpers/factories.js'

// UC12 – Pesquisar Imóveis
describe('PesquisarImoveisUseCase', () => {
  let imovelRepo: InMemoryImovelRepository
  let sut: PesquisarImoveisUseCase

  const enderecoPadrao = {
    cep: '01310-100',
    logradouro: 'Av. Paulista',
    numero: '100',
    bairro: 'Bela Vista',
    estado: 'SP',
  }

  beforeEach(async () => {
    imovelRepo = new InMemoryImovelRepository()
    sut = new PesquisarImoveisUseCase(imovelRepo)

    await imovelRepo.save(makeImovel({ tipo: 'APARTAMENTO', preco: 300000, quartos: 2, endereco: { ...enderecoPadrao, cidade: 'São Paulo' } }))
    await imovelRepo.save(makeImovel({ tipo: 'CASA', preco: 800000, quartos: 4, endereco: { ...enderecoPadrao, cidade: 'Campinas' } }))
    await imovelRepo.save(makeImovel({ tipo: 'APARTAMENTO', preco: 150000, quartos: 1, endereco: { ...enderecoPadrao, cidade: 'São Paulo' } }))
  })

  it('deve retornar todos os imóveis sem filtro', async () => {
    const { imoveis, total } = await sut.execute({})
    expect(total).toBe(3)
  })

  it('deve filtrar por tipo', async () => {
    const { imoveis } = await sut.execute({ tipo: 'APARTAMENTO' })
    expect(imoveis).toHaveLength(2)
    imoveis.forEach((i) => expect(i.tipo).toBe('APARTAMENTO'))
  })

  it('deve filtrar por preço mínimo e máximo', async () => {
    const { imoveis } = await sut.execute({ precoMin: 200000, precoMax: 500000 })
    expect(imoveis).toHaveLength(1)
    expect(imoveis[0].preco).toBe(300000)
  })

  it('deve filtrar por número mínimo de quartos', async () => {
    const { imoveis } = await sut.execute({ quartos: 3 })
    expect(imoveis).toHaveLength(1)
    expect(imoveis[0].quartos).toBe(4)
  })

  it('deve ordenar por preço ascendente', async () => {
    const { imoveis } = await sut.execute({ ordenarPor: 'preco', ordem: 'asc' })
    expect(imoveis[0].preco).toBeLessThanOrEqual(imoveis[1].preco)
    expect(imoveis[1].preco).toBeLessThanOrEqual(imoveis[2].preco)
  })

  it('deve ordenar por preço descendente', async () => {
    const { imoveis } = await sut.execute({ ordenarPor: 'preco', ordem: 'desc' })
    expect(imoveis[0].preco).toBeGreaterThanOrEqual(imoveis[1].preco)
  })

  it('deve filtrar por cidade', async () => {
    const { imoveis } = await sut.execute({ cidade: 'Campinas' })
    expect(imoveis).toHaveLength(1)
    expect(imoveis[0].tipo).toBe('CASA')
  })
})
