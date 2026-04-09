import { describe, it, expect, beforeEach } from 'vitest'
import { CadastrarImovelUseCase } from '../../../src/application/use-cases/imoveis/cadastrar-imovel.usecase.js'
import { InMemoryImovelRepository } from '../../../src/infra/repositories/in-memory/in-memory-imovel.repository.js'
import { InMemoryCorretorRepository } from '../../../src/infra/repositories/in-memory/in-memory-corretor.repository.js'
import { makeCorretor, makeUsuario } from '../../helpers/factories.js'
import { UnauthorizedError, NotFoundError } from '../../../src/domain/errors/domain.error.js'

// UC03 – Cadastrar Imóvel
describe('CadastrarImovelUseCase', () => {
  let imovelRepo: InMemoryImovelRepository
  let corretorRepo: InMemoryCorretorRepository
  let sut: CadastrarImovelUseCase

  const inputBase = {
    titulo: 'Casa no Jardins',
    tipo: 'CASA' as const,
    finalidade: 'VENDA' as const,
    preco: 800000,
    quartos: 3,
    banheiros: 2,
    vagas: 2,
    endereco: {
      cep: '01401-001',
      logradouro: 'Rua Oscar Freire',
      numero: '500',
      bairro: 'Jardins',
      cidade: 'São Paulo',
      estado: 'SP',
    },
  }

  beforeEach(() => {
    imovelRepo = new InMemoryImovelRepository()
    corretorRepo = new InMemoryCorretorRepository()
    sut = new CadastrarImovelUseCase(imovelRepo, corretorRepo)
  })

  it('deve cadastrar imóvel com sucesso quando executor é ADMINISTRADOR', async () => {
    const { imovel } = await sut.execute({ ...inputBase, perfilExecutor: 'ADMINISTRADOR' })

    expect(imovel.id).toBeTruthy()
    expect(imovel.status).toBe('DISPONIVEL')
    expect(imovel.titulo).toBe('Casa no Jardins')
  })

  it('deve cadastrar imóvel com sucesso quando executor é CORRETOR', async () => {
    const { imovel } = await sut.execute({ ...inputBase, perfilExecutor: 'CORRETOR' })

    expect(imovel).toBeDefined()
    const salvo = await imovelRepo.findById(imovel.id)
    expect(salvo).not.toBeNull()
  })

  it('deve lançar UnauthorizedError quando executor é CLIENTE', async () => {
    await expect(sut.execute({ ...inputBase, perfilExecutor: 'CLIENTE' })).rejects.toThrow(UnauthorizedError)
  })

  it('deve lançar NotFoundError quando corretorResponsavelId não existe', async () => {
    await expect(
      sut.execute({ ...inputBase, perfilExecutor: 'ADMINISTRADOR', corretorResponsavelId: 'id-inexistente' }),
    ).rejects.toThrow(NotFoundError)
  })

  it('deve vincular corretor existente ao imóvel', async () => {
    const usuario = makeUsuario({ perfil: 'CORRETOR' })
    const corretor = makeCorretor(usuario.id, { creci: 'SP-99999' })
    await corretorRepo.save(corretor)

    const { imovel } = await sut.execute({
      ...inputBase,
      perfilExecutor: 'ADMINISTRADOR',
      corretorResponsavelId: corretor.id,
    })

    expect(imovel.corretorResponsavelId).toBe(corretor.id)
  })
})
