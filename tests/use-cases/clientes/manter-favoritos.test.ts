import { describe, it, expect, beforeEach } from 'vitest'
import {
  AdicionarFavoritoUseCase,
  RemoverFavoritoUseCase,
  ListarFavoritosUseCase,
} from '../../../src/application/use-cases/clientes/manter-favoritos.usecase.js'
import { InMemoryClienteRepository } from '../../../src/infra/repositories/in-memory/in-memory-cliente.repository.js'
import { InMemoryImovelRepository } from '../../../src/infra/repositories/in-memory/in-memory-imovel.repository.js'
import { InMemoryClienteFavoritoRepository } from '../../../src/infra/repositories/in-memory/in-memory-cliente-favorito.repository.js'
import { makeCliente, makeImovel, makeUsuario } from '../../helpers/factories.js'
import { ConflictError, NotFoundError } from '../../../src/domain/errors/domain.error.js'

// UC08 – Manter Favoritos
describe('ManterFavoritosUseCase', () => {
  let clienteRepo: InMemoryClienteRepository
  let imovelRepo: InMemoryImovelRepository
  let favoritoRepo: InMemoryClienteFavoritoRepository
  let adicionar: AdicionarFavoritoUseCase
  let remover: RemoverFavoritoUseCase
  let listar: ListarFavoritosUseCase

  beforeEach(() => {
    clienteRepo = new InMemoryClienteRepository()
    imovelRepo = new InMemoryImovelRepository()
    favoritoRepo = new InMemoryClienteFavoritoRepository()
    adicionar = new AdicionarFavoritoUseCase(clienteRepo, imovelRepo, favoritoRepo)
    remover = new RemoverFavoritoUseCase(favoritoRepo)
    listar = new ListarFavoritosUseCase(favoritoRepo)
  })

  it('deve adicionar imóvel aos favoritos do cliente', async () => {
    const usuario = makeUsuario()
    const cliente = makeCliente(usuario.id)
    const imovel = makeImovel()
    await clienteRepo.save(cliente)
    await imovelRepo.save(imovel)

    await adicionar.execute({ clienteId: cliente.id, imovelId: imovel.id })

    const { favoritos } = await listar.execute({ clienteId: cliente.id })
    expect(favoritos).toHaveLength(1)
    expect(favoritos[0].imovelId).toBe(imovel.id)
  })

  it('deve lançar ConflictError ao favoritar mesmo imóvel duas vezes', async () => {
    const usuario = makeUsuario()
    const cliente = makeCliente(usuario.id)
    const imovel = makeImovel()
    await clienteRepo.save(cliente)
    await imovelRepo.save(imovel)

    await adicionar.execute({ clienteId: cliente.id, imovelId: imovel.id })

    await expect(adicionar.execute({ clienteId: cliente.id, imovelId: imovel.id })).rejects.toThrow(ConflictError)
  })

  it('deve remover favorito existente', async () => {
    const usuario = makeUsuario()
    const cliente = makeCliente(usuario.id)
    const imovel = makeImovel()
    await clienteRepo.save(cliente)
    await imovelRepo.save(imovel)

    await adicionar.execute({ clienteId: cliente.id, imovelId: imovel.id })
    await remover.execute({ clienteId: cliente.id, imovelId: imovel.id })

    const { favoritos } = await listar.execute({ clienteId: cliente.id })
    expect(favoritos).toHaveLength(0)
  })

  it('deve lançar NotFoundError ao tentar remover favorito inexistente', async () => {
    await expect(remover.execute({ clienteId: 'c1', imovelId: 'i1' })).rejects.toThrow(NotFoundError)
  })

  it('deve lançar NotFoundError para cliente inexistente ao adicionar', async () => {
    const imovel = makeImovel()
    await imovelRepo.save(imovel)

    await expect(adicionar.execute({ clienteId: 'fake', imovelId: imovel.id })).rejects.toThrow(NotFoundError)
  })
})
