import { describe, it, expect, beforeEach } from 'vitest'
import { VisualizarImovelUseCase } from '../../../src/application/use-cases/imoveis/visualizar-imovel.usecase.js'
import { InMemoryImovelRepository } from '../../../src/infra/repositories/in-memory/in-memory-imovel.repository.js'
import { InMemoryClienteFavoritoRepository } from '../../../src/infra/repositories/in-memory/in-memory-cliente-favorito.repository.js'
import { makeImovel } from '../../helpers/factories.js'
import { ClienteFavorito } from '../../../src/domain/entities/cliente-favorito.entity.js'
import { NotFoundError } from '../../../src/domain/errors/domain.error.js'

// UC06 – Visualizar Detalhes do Imóvel
describe('VisualizarImovelUseCase', () => {
  let imovelRepo: InMemoryImovelRepository
  let favoritoRepo: InMemoryClienteFavoritoRepository
  let sut: VisualizarImovelUseCase

  beforeEach(() => {
    imovelRepo = new InMemoryImovelRepository()
    favoritoRepo = new InMemoryClienteFavoritoRepository()
    sut = new VisualizarImovelUseCase(imovelRepo, favoritoRepo)
  })

  it('deve retornar dados do imóvel e contador de favoritos', async () => {
    const imovel = makeImovel()
    await imovelRepo.save(imovel)

    const fav1 = ClienteFavorito.create({ clienteId: 'c1', imovelId: imovel.id })
    const fav2 = ClienteFavorito.create({ clienteId: 'c2', imovelId: imovel.id })
    await favoritoRepo.save(fav1)
    await favoritoRepo.save(fav2)

    const result = await sut.execute(imovel.id)

    expect(result.imovel.id).toBe(imovel.id)
    expect(result.totalFavoritos).toBe(2)
  })

  it('deve retornar 0 favoritos quando nenhum cliente favoritou', async () => {
    const imovel = makeImovel()
    await imovelRepo.save(imovel)

    const result = await sut.execute(imovel.id)

    expect(result.totalFavoritos).toBe(0)
  })

  it('deve lançar NotFoundError para id inexistente', async () => {
    await expect(sut.execute('id-falso')).rejects.toThrow(NotFoundError)
  })
})
