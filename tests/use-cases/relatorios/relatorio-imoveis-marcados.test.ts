import { describe, it, expect, beforeEach } from 'vitest'
import { RelatorioImoveisMarcadosUseCase } from '../../../src/application/use-cases/relatorios/relatorio-imoveis-marcados.usecase.js'
import { InMemoryCorretorRepository } from '../../../src/infra/repositories/in-memory/in-memory-corretor.repository.js'
import { InMemoryImovelRepository } from '../../../src/infra/repositories/in-memory/in-memory-imovel.repository.js'
import { InMemoryClienteFavoritoRepository } from '../../../src/infra/repositories/in-memory/in-memory-cliente-favorito.repository.js'
import { InMemoryInteresseRepository } from '../../../src/infra/repositories/in-memory/in-memory-interesse.repository.js'
import { makeCorretor, makeImovel, makeUsuario } from '../../helpers/factories.js'
import { ClienteFavorito } from '../../../src/domain/entities/cliente-favorito.entity.js'
import { Interesse } from '../../../src/domain/entities/interesse.entity.js'
import { UnauthorizedError } from '../../../src/domain/errors/domain.error.js'

// UC14 – Relatório de Imóveis Marcados
describe('RelatorioImoveisMarcadosUseCase', () => {
  let corretorRepo: InMemoryCorretorRepository
  let imovelRepo: InMemoryImovelRepository
  let favoritoRepo: InMemoryClienteFavoritoRepository
  let interesseRepo: InMemoryInteresseRepository
  let sut: RelatorioImoveisMarcadosUseCase

  beforeEach(() => {
    corretorRepo = new InMemoryCorretorRepository()
    imovelRepo = new InMemoryImovelRepository()
    favoritoRepo = new InMemoryClienteFavoritoRepository()
    interesseRepo = new InMemoryInteresseRepository()
    sut = new RelatorioImoveisMarcadosUseCase(corretorRepo, imovelRepo, favoritoRepo, interesseRepo)
  })

  it('deve retornar relatório de imóveis do corretor com contadores corretos', async () => {
    const usuario = makeUsuario({ perfil: 'CORRETOR' })
    const corretor = makeCorretor(usuario.id)
    await corretorRepo.save(corretor)

    const imovel1 = makeImovel({ corretorResponsavelId: corretor.id } as any)
    const imovel2 = makeImovel({ corretorResponsavelId: corretor.id } as any)
    await imovelRepo.save(imovel1)
    await imovelRepo.save(imovel2)

    await favoritoRepo.save(ClienteFavorito.create({ clienteId: 'c1', imovelId: imovel1.id }))
    await favoritoRepo.save(ClienteFavorito.create({ clienteId: 'c2', imovelId: imovel1.id }))
    await interesseRepo.save(Interesse.create({ clienteId: 'c1', imovelId: imovel1.id }))

    const { itens } = await sut.execute({ perfilExecutor: 'CORRETOR', corretorId: corretor.id })

    expect(itens).toHaveLength(2)
    const item1 = itens.find((i) => i.imovelId === imovel1.id)!
    expect(item1.totalFavoritos).toBe(2)
    expect(item1.totalInteresses).toBe(1)
  })

  it('deve lançar UnauthorizedError para CLIENTE', async () => {
    await expect(
      sut.execute({ perfilExecutor: 'CLIENTE', corretorId: 'fake' }),
    ).rejects.toThrow(UnauthorizedError)
  })
})
