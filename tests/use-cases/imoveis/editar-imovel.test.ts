import { describe, it, expect, beforeEach } from 'vitest'
import { EditarImovelUseCase } from '../../../src/application/use-cases/imoveis/editar-imovel.usecase.js'
import { InMemoryImovelRepository } from '../../../src/infra/repositories/in-memory/in-memory-imovel.repository.js'
import { makeImovel } from '../../helpers/factories.js'
import { UnauthorizedError, NotFoundError } from '../../../src/domain/errors/domain.error.js'

// UC04 – Editar Imóvel
describe('EditarImovelUseCase', () => {
  let imovelRepo: InMemoryImovelRepository
  let sut: EditarImovelUseCase

  beforeEach(() => {
    imovelRepo = new InMemoryImovelRepository()
    sut = new EditarImovelUseCase(imovelRepo)
  })

  it('deve editar campos do imóvel com sucesso', async () => {
    const imovel = makeImovel()
    await imovelRepo.save(imovel)

    const { imovel: atualizado } = await sut.execute({
      id: imovel.id,
      perfilExecutor: 'ADMINISTRADOR',
      titulo: 'Novo Título',
      preco: 500000,
    })

    expect(atualizado.titulo).toBe('Novo Título')
    expect(atualizado.preco).toBe(500000)
    expect(atualizado.tipo).toBe(imovel.tipo) // não alterado
  })

  it('deve atualizar atualizadoEm ao editar', async () => {
    const imovel = makeImovel()
    const antesDaEdicao = imovel.atualizadoEm
    await imovelRepo.save(imovel)

    await new Promise((r) => setTimeout(r, 5))
    const { imovel: atualizado } = await sut.execute({
      id: imovel.id,
      perfilExecutor: 'GESTOR',
      titulo: 'Atualizado',
    })

    expect(atualizado.atualizadoEm.getTime()).toBeGreaterThan(antesDaEdicao.getTime())
  })

  it('deve lançar NotFoundError para imóvel inexistente', async () => {
    await expect(
      sut.execute({ id: 'id-falso', perfilExecutor: 'ADMINISTRADOR', titulo: 'X' }),
    ).rejects.toThrow(NotFoundError)
  })

  it('deve lançar UnauthorizedError para CLIENTE', async () => {
    const imovel = makeImovel()
    await imovelRepo.save(imovel)

    await expect(
      sut.execute({ id: imovel.id, perfilExecutor: 'CLIENTE', titulo: 'X' }),
    ).rejects.toThrow(UnauthorizedError)
  })
})
