import { describe, it, expect, beforeEach } from 'vitest'
import { RelatorioDesempenhoCorretorUseCase } from '../../../src/application/use-cases/relatorios/relatorio-desempenho-corretor.usecase.js'
import { InMemoryCorretorRepository } from '../../../src/infra/repositories/in-memory/in-memory-corretor.repository.js'
import { InMemoryUsuarioRepository } from '../../../src/infra/repositories/in-memory/in-memory-usuario.repository.js'
import { InMemoryCorretorImovelRepository } from '../../../src/infra/repositories/in-memory/in-memory-corretor-imovel.repository.js'
import { InMemoryCorretorClienteRepository } from '../../../src/infra/repositories/in-memory/in-memory-corretor-cliente.repository.js'
import { InMemoryInteresseRepository } from '../../../src/infra/repositories/in-memory/in-memory-interesse.repository.js'
import { InMemoryImovelRepository } from '../../../src/infra/repositories/in-memory/in-memory-imovel.repository.js'
import { makeCorretor, makeImovel, makeUsuario } from '../../helpers/factories.js'
import { CorretorImovel } from '../../../src/domain/entities/corretor-imovel.entity.js'
import { Interesse } from '../../../src/domain/entities/interesse.entity.js'
import { UnauthorizedError } from '../../../src/domain/errors/domain.error.js'

// UC15 – Relatório de Desempenho do Corretor
describe('RelatorioDesempenhoCorretorUseCase', () => {
  let corretorRepo: InMemoryCorretorRepository
  let usuarioRepo: InMemoryUsuarioRepository
  let corretorImovelRepo: InMemoryCorretorImovelRepository
  let corretorClienteRepo: InMemoryCorretorClienteRepository
  let interesseRepo: InMemoryInteresseRepository
  let imovelRepo: InMemoryImovelRepository
  let sut: RelatorioDesempenhoCorretorUseCase

  beforeEach(() => {
    corretorRepo = new InMemoryCorretorRepository()
    usuarioRepo = new InMemoryUsuarioRepository()
    corretorImovelRepo = new InMemoryCorretorImovelRepository()
    corretorClienteRepo = new InMemoryCorretorClienteRepository()
    interesseRepo = new InMemoryInteresseRepository()
    imovelRepo = new InMemoryImovelRepository()
    sut = new RelatorioDesempenhoCorretorUseCase(
      corretorRepo,
      usuarioRepo,
      corretorImovelRepo,
      corretorClienteRepo,
      interesseRepo,
      imovelRepo,
    )
  })

  it('deve retornar desempenho de todos os corretores', async () => {
    const usuario = makeUsuario({ perfil: 'CORRETOR' })
    const corretor = makeCorretor(usuario.id, { creci: 'SP-11111' })
    await usuarioRepo.save(usuario)
    await corretorRepo.save(corretor)

    const imovel = makeImovel({ corretorResponsavelId: corretor.id } as any)
    imovel.status = 'VENDIDO'
    await imovelRepo.save(imovel)

    await corretorImovelRepo.save(CorretorImovel.create({ corretorId: corretor.id, imovelId: imovel.id }))

    const interesse = Interesse.create({ clienteId: 'c1', imovelId: imovel.id, corretorId: corretor.id })
    interesse.status = 'FINALIZADO'
    await interesseRepo.save(interesse)

    const { corretores } = await sut.execute({ perfilExecutor: 'ADMINISTRADOR' })

    expect(corretores).toHaveLength(1)
    const desempenho = corretores[0]
    expect(desempenho.corretorNome).toBe(usuario.nome)
    expect(desempenho.totalImoveisVinculados).toBe(1)
    expect(desempenho.totalInteressesRecebidos).toBe(1)
    expect(desempenho.totalConversoes).toBe(1)
    expect(desempenho.totalFechamentos).toBe(1)
  })

  it('deve lançar UnauthorizedError para perfil CORRETOR', async () => {
    await expect(sut.execute({ perfilExecutor: 'CORRETOR' })).rejects.toThrow(UnauthorizedError)
  })

  it('deve lançar UnauthorizedError para CLIENTE', async () => {
    await expect(sut.execute({ perfilExecutor: 'CLIENTE' })).rejects.toThrow(UnauthorizedError)
  })
})
