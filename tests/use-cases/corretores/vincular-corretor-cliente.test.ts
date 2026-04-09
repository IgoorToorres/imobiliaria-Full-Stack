import { describe, it, expect, beforeEach } from 'vitest'
import { VincularCorretorClienteUseCase } from '../../../src/application/use-cases/corretores/vincular-corretor-cliente.usecase.js'
import { InMemoryCorretorRepository } from '../../../src/infra/repositories/in-memory/in-memory-corretor.repository.js'
import { InMemoryClienteRepository } from '../../../src/infra/repositories/in-memory/in-memory-cliente.repository.js'
import { InMemoryCorretorClienteRepository } from '../../../src/infra/repositories/in-memory/in-memory-corretor-cliente.repository.js'
import { makeCliente, makeCorretor, makeUsuario } from '../../helpers/factories.js'
import { ConflictError, NotFoundError, UnauthorizedError } from '../../../src/domain/errors/domain.error.js'

// UC11 – Vincular Corretor a Cliente
describe('VincularCorretorClienteUseCase', () => {
  let corretorRepo: InMemoryCorretorRepository
  let clienteRepo: InMemoryClienteRepository
  let corretorClienteRepo: InMemoryCorretorClienteRepository
  let sut: VincularCorretorClienteUseCase

  beforeEach(() => {
    corretorRepo = new InMemoryCorretorRepository()
    clienteRepo = new InMemoryClienteRepository()
    corretorClienteRepo = new InMemoryCorretorClienteRepository()
    sut = new VincularCorretorClienteUseCase(corretorRepo, clienteRepo, corretorClienteRepo)
  })

  it('deve vincular corretor a cliente com sucesso', async () => {
    const usuarioCorretor = makeUsuario({ perfil: 'CORRETOR' })
    const corretor = makeCorretor(usuarioCorretor.id)
    const usuarioCliente = makeUsuario({ email: 'cli@email.com' })
    const cliente = makeCliente(usuarioCliente.id)
    await corretorRepo.save(corretor)
    await clienteRepo.save(cliente)

    await sut.execute({ perfilExecutor: 'ADMINISTRADOR', corretorId: corretor.id, clienteId: cliente.id })

    const vinculos = await corretorClienteRepo.findByCorretorId(corretor.id)
    expect(vinculos).toHaveLength(1)
    expect(vinculos[0].clienteId).toBe(cliente.id)
  })

  it('deve lançar ConflictError para vínculo duplicado', async () => {
    const usuarioCorretor = makeUsuario({ perfil: 'CORRETOR' })
    const corretor = makeCorretor(usuarioCorretor.id)
    const usuarioCliente = makeUsuario({ email: 'cli@email.com' })
    const cliente = makeCliente(usuarioCliente.id)
    await corretorRepo.save(corretor)
    await clienteRepo.save(cliente)

    await sut.execute({ perfilExecutor: 'ADMINISTRADOR', corretorId: corretor.id, clienteId: cliente.id })

    await expect(
      sut.execute({ perfilExecutor: 'ADMINISTRADOR', corretorId: corretor.id, clienteId: cliente.id }),
    ).rejects.toThrow(ConflictError)
  })

  it('deve lançar NotFoundError para cliente inexistente', async () => {
    const usuarioCorretor = makeUsuario({ perfil: 'CORRETOR' })
    const corretor = makeCorretor(usuarioCorretor.id)
    await corretorRepo.save(corretor)

    await expect(
      sut.execute({ perfilExecutor: 'ADMINISTRADOR', corretorId: corretor.id, clienteId: 'fake' }),
    ).rejects.toThrow(NotFoundError)
  })

  it('deve lançar UnauthorizedError para CLIENTE', async () => {
    await expect(
      sut.execute({ perfilExecutor: 'CLIENTE', corretorId: 'c1', clienteId: 'cl1' }),
    ).rejects.toThrow(UnauthorizedError)
  })
})
