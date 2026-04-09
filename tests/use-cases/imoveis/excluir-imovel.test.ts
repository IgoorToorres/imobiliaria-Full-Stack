import { describe, it, expect, beforeEach } from 'vitest'
import { ExcluirImovelUseCase } from '../../../src/application/use-cases/imoveis/excluir-imovel.usecase.js'
import { InMemoryImovelRepository } from '../../../src/infra/repositories/in-memory/in-memory-imovel.repository.js'
import { InMemoryInteresseRepository } from '../../../src/infra/repositories/in-memory/in-memory-interesse.repository.js'
import { makeImovel } from '../../helpers/factories.js'
import { Interesse } from '../../../src/domain/entities/interesse.entity.js'
import { UnauthorizedError, NotFoundError, BusinessRuleError } from '../../../src/domain/errors/domain.error.js'

// UC05 – Excluir Imóvel
describe('ExcluirImovelUseCase', () => {
  let imovelRepo: InMemoryImovelRepository
  let interesseRepo: InMemoryInteresseRepository
  let sut: ExcluirImovelUseCase

  beforeEach(() => {
    imovelRepo = new InMemoryImovelRepository()
    interesseRepo = new InMemoryInteresseRepository()
    sut = new ExcluirImovelUseCase(imovelRepo, interesseRepo)
  })

  it('deve excluir imóvel DISPONIVEL sem interesses ativos', async () => {
    const imovel = makeImovel()
    await imovelRepo.save(imovel)

    await sut.execute({ id: imovel.id, perfilExecutor: 'ADMINISTRADOR' })

    const encontrado = await imovelRepo.findById(imovel.id)
    expect(encontrado).toBeNull()
  })

  it('deve lançar BusinessRuleError para imóvel com status VENDIDO', async () => {
    const imovel = makeImovel()
    imovel.status = 'VENDIDO'
    await imovelRepo.save(imovel)

    await expect(sut.execute({ id: imovel.id, perfilExecutor: 'ADMINISTRADOR' })).rejects.toThrow(BusinessRuleError)
  })

  it('deve lançar BusinessRuleError para imóvel com status RESERVADO', async () => {
    const imovel = makeImovel()
    imovel.status = 'RESERVADO'
    await imovelRepo.save(imovel)

    await expect(sut.execute({ id: imovel.id, perfilExecutor: 'CORRETOR' })).rejects.toThrow(BusinessRuleError)
  })

  it('deve lançar BusinessRuleError para imóvel com interesses ativos', async () => {
    const imovel = makeImovel()
    await imovelRepo.save(imovel)

    const interesse = Interesse.create({ clienteId: 'c1', imovelId: imovel.id })
    await interesseRepo.save(interesse)

    await expect(sut.execute({ id: imovel.id, perfilExecutor: 'ADMINISTRADOR' })).rejects.toThrow(BusinessRuleError)
  })

  it('deve lançar NotFoundError para imóvel inexistente', async () => {
    await expect(sut.execute({ id: 'fake-id', perfilExecutor: 'ADMINISTRADOR' })).rejects.toThrow(NotFoundError)
  })

  it('deve lançar UnauthorizedError para CLIENTE', async () => {
    const imovel = makeImovel()
    await imovelRepo.save(imovel)

    await expect(sut.execute({ id: imovel.id, perfilExecutor: 'CLIENTE' })).rejects.toThrow(UnauthorizedError)
  })
})
