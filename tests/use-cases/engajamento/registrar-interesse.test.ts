import { describe, it, expect, beforeEach } from 'vitest'
import {
  RegistrarInteresseUseCase,
  HistoricoInteressesUseCase,
} from '../../../src/application/use-cases/engajamento/registrar-interesse.usecase.js'
import { InMemoryInteresseRepository } from '../../../src/infra/repositories/in-memory/in-memory-interesse.repository.js'
import { InMemoryClienteRepository } from '../../../src/infra/repositories/in-memory/in-memory-cliente.repository.js'
import { InMemoryImovelRepository } from '../../../src/infra/repositories/in-memory/in-memory-imovel.repository.js'
import { makeCliente, makeImovel, makeUsuario } from '../../helpers/factories.js'
import { BusinessRuleError, NotFoundError } from '../../../src/domain/errors/domain.error.js'

// UC13 – Registrar Interesse
describe('RegistrarInteresseUseCase', () => {
  let interesseRepo: InMemoryInteresseRepository
  let clienteRepo: InMemoryClienteRepository
  let imovelRepo: InMemoryImovelRepository
  let registrar: RegistrarInteresseUseCase
  let historico: HistoricoInteressesUseCase

  beforeEach(() => {
    interesseRepo = new InMemoryInteresseRepository()
    clienteRepo = new InMemoryClienteRepository()
    imovelRepo = new InMemoryImovelRepository()
    registrar = new RegistrarInteresseUseCase(interesseRepo, clienteRepo, imovelRepo)
    historico = new HistoricoInteressesUseCase(interesseRepo)
  })

  it('deve registrar interesse com status PENDENTE', async () => {
    const usuario = makeUsuario()
    const cliente = makeCliente(usuario.id)
    const imovel = makeImovel()
    await clienteRepo.save(cliente)
    await imovelRepo.save(imovel)

    const { interesse } = await registrar.execute({
      clienteId: cliente.id,
      imovelId: imovel.id,
      mensagem: 'Gostaria de agendar uma visita',
    })

    expect(interesse.id).toBeTruthy()
    expect(interesse.status).toBe('PENDENTE')
    expect(interesse.mensagem).toBe('Gostaria de agendar uma visita')
  })

  it('deve associar corretor responsável ao interesse automaticamente', async () => {
    const usuarioCorretor = makeUsuario({ perfil: 'CORRETOR', email: 'c@c.com' })
    const usuario = makeUsuario()
    const cliente = makeCliente(usuario.id)
    const imovel = makeImovel({ corretorResponsavelId: 'corretor-abc' } as any)
    await clienteRepo.save(cliente)
    await imovelRepo.save(imovel)

    const { interesse } = await registrar.execute({ clienteId: cliente.id, imovelId: imovel.id })

    expect(interesse.corretorId).toBe('corretor-abc')
  })

  it('deve lançar BusinessRuleError para imóvel VENDIDO', async () => {
    const usuario = makeUsuario()
    const cliente = makeCliente(usuario.id)
    const imovel = makeImovel()
    imovel.status = 'VENDIDO'
    await clienteRepo.save(cliente)
    await imovelRepo.save(imovel)

    await expect(registrar.execute({ clienteId: cliente.id, imovelId: imovel.id })).rejects.toThrow(BusinessRuleError)
  })

  it('deve lançar BusinessRuleError para imóvel INATIVO', async () => {
    const usuario = makeUsuario()
    const cliente = makeCliente(usuario.id)
    const imovel = makeImovel()
    imovel.status = 'INATIVO'
    await clienteRepo.save(cliente)
    await imovelRepo.save(imovel)

    await expect(registrar.execute({ clienteId: cliente.id, imovelId: imovel.id })).rejects.toThrow(BusinessRuleError)
  })

  it('deve retornar histórico de interesses do cliente', async () => {
    const usuario = makeUsuario()
    const cliente = makeCliente(usuario.id)
    const imovel1 = makeImovel()
    const imovel2 = makeImovel()
    await clienteRepo.save(cliente)
    await imovelRepo.save(imovel1)
    await imovelRepo.save(imovel2)

    await registrar.execute({ clienteId: cliente.id, imovelId: imovel1.id })
    await registrar.execute({ clienteId: cliente.id, imovelId: imovel2.id })

    const { interesses } = await historico.execute({ clienteId: cliente.id })
    expect(interesses).toHaveLength(2)
  })

  it('deve lançar NotFoundError para cliente inexistente', async () => {
    const imovel = makeImovel()
    await imovelRepo.save(imovel)

    await expect(registrar.execute({ clienteId: 'fake', imovelId: imovel.id })).rejects.toThrow(NotFoundError)
  })
})
