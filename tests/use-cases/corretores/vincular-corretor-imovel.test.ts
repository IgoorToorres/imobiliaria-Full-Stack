import { describe, it, expect, beforeEach } from 'vitest'
import { VincularCorretorImovelUseCase } from '../../../src/application/use-cases/corretores/vincular-corretor-imovel.usecase.js'
import { InMemoryCorretorRepository } from '../../../src/infra/repositories/in-memory/in-memory-corretor.repository.js'
import { InMemoryImovelRepository } from '../../../src/infra/repositories/in-memory/in-memory-imovel.repository.js'
import { InMemoryCorretorImovelRepository } from '../../../src/infra/repositories/in-memory/in-memory-corretor-imovel.repository.js'
import { makeCorretor, makeImovel, makeUsuario } from '../../helpers/factories.js'
import { ConflictError, NotFoundError, UnauthorizedError } from '../../../src/domain/errors/domain.error.js'

// UC10 – Vincular Corretor a Imóvel
describe('VincularCorretorImovelUseCase', () => {
  let corretorRepo: InMemoryCorretorRepository
  let imovelRepo: InMemoryImovelRepository
  let corretorImovelRepo: InMemoryCorretorImovelRepository
  let sut: VincularCorretorImovelUseCase

  beforeEach(() => {
    corretorRepo = new InMemoryCorretorRepository()
    imovelRepo = new InMemoryImovelRepository()
    corretorImovelRepo = new InMemoryCorretorImovelRepository()
    sut = new VincularCorretorImovelUseCase(corretorRepo, imovelRepo, corretorImovelRepo)
  })

  it('deve vincular corretor a imóvel com sucesso', async () => {
    const usuario = makeUsuario({ perfil: 'CORRETOR' })
    const corretor = makeCorretor(usuario.id)
    const imovel = makeImovel()
    await corretorRepo.save(corretor)
    await imovelRepo.save(imovel)

    await sut.execute({ perfilExecutor: 'ADMINISTRADOR', corretorId: corretor.id, imovelId: imovel.id })

    const vinculos = await corretorImovelRepo.findByCorretorId(corretor.id)
    expect(vinculos).toHaveLength(1)
    expect(vinculos[0].imovelId).toBe(imovel.id)
  })

  it('deve lançar ConflictError para vínculo duplicado', async () => {
    const usuario = makeUsuario({ perfil: 'CORRETOR' })
    const corretor = makeCorretor(usuario.id)
    const imovel = makeImovel()
    await corretorRepo.save(corretor)
    await imovelRepo.save(imovel)

    await sut.execute({ perfilExecutor: 'ADMINISTRADOR', corretorId: corretor.id, imovelId: imovel.id })

    await expect(
      sut.execute({ perfilExecutor: 'ADMINISTRADOR', corretorId: corretor.id, imovelId: imovel.id }),
    ).rejects.toThrow(ConflictError)
  })

  it('deve lançar NotFoundError para corretor inexistente', async () => {
    const imovel = makeImovel()
    await imovelRepo.save(imovel)

    await expect(
      sut.execute({ perfilExecutor: 'ADMINISTRADOR', corretorId: 'fake', imovelId: imovel.id }),
    ).rejects.toThrow(NotFoundError)
  })

  it('deve lançar UnauthorizedError para CLIENTE', async () => {
    await expect(
      sut.execute({ perfilExecutor: 'CLIENTE', corretorId: 'c1', imovelId: 'i1' }),
    ).rejects.toThrow(UnauthorizedError)
  })
})
