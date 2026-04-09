import { describe, it, expect, beforeEach } from 'vitest'
import { CadastrarClienteUseCase } from '../../../src/application/use-cases/clientes/cadastrar-cliente.usecase.js'
import { InMemoryUsuarioRepository } from '../../../src/infra/repositories/in-memory/in-memory-usuario.repository.js'
import { InMemoryClienteRepository } from '../../../src/infra/repositories/in-memory/in-memory-cliente.repository.js'
import { FakeHash } from '../../helpers/fake-hash.js'
import { makeUsuario } from '../../helpers/factories.js'
import { ConflictError } from '../../../src/domain/errors/domain.error.js'

// UC07 – Cadastrar Cliente
describe('CadastrarClienteUseCase', () => {
  let usuarioRepo: InMemoryUsuarioRepository
  let clienteRepo: InMemoryClienteRepository
  let hash: FakeHash
  let sut: CadastrarClienteUseCase

  const inputBase = {
    nome: 'Maria Souza',
    email: 'maria@email.com',
    senha: 'senha123',
    cpf: '123.456.789-00',
  }

  beforeEach(() => {
    usuarioRepo = new InMemoryUsuarioRepository()
    clienteRepo = new InMemoryClienteRepository()
    hash = new FakeHash()
    sut = new CadastrarClienteUseCase(usuarioRepo, clienteRepo, hash)
  })

  it('deve cadastrar cliente com sucesso e retornar ids', async () => {
    const result = await sut.execute(inputBase)

    expect(result.usuario.email).toBe('maria@email.com')
    expect(result.usuario.perfil).toBe('CLIENTE')
    expect(result.clienteId).toBeTruthy()
  })

  it('deve salvar usuário com senha hasheada', async () => {
    const result = await sut.execute(inputBase)
    const usuario = await usuarioRepo.findById(result.usuario.id)

    expect(usuario?.senhaHash).toBe('hashed:senha123')
    expect(usuario?.senhaHash).not.toBe('senha123')
  })

  it('deve lançar ConflictError para e-mail duplicado', async () => {
    await sut.execute(inputBase)

    await expect(sut.execute({ ...inputBase, cpf: '999.999.999-99' })).rejects.toThrow(ConflictError)
  })

  it('deve lançar ConflictError para CPF duplicado', async () => {
    await sut.execute(inputBase)

    await expect(sut.execute({ ...inputBase, email: 'outro@email.com' })).rejects.toThrow(ConflictError)
  })
})
