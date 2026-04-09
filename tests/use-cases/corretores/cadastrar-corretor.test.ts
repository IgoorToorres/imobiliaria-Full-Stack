import { describe, it, expect, beforeEach } from 'vitest'
import { CadastrarCorretorUseCase } from '../../../src/application/use-cases/corretores/cadastrar-corretor.usecase.js'
import { InMemoryUsuarioRepository } from '../../../src/infra/repositories/in-memory/in-memory-usuario.repository.js'
import { InMemoryCorretorRepository } from '../../../src/infra/repositories/in-memory/in-memory-corretor.repository.js'
import { FakeHash } from '../../helpers/fake-hash.js'
import { ConflictError, UnauthorizedError } from '../../../src/domain/errors/domain.error.js'

// UC09 – Cadastrar Corretor
describe('CadastrarCorretorUseCase', () => {
  let usuarioRepo: InMemoryUsuarioRepository
  let corretorRepo: InMemoryCorretorRepository
  let hash: FakeHash
  let sut: CadastrarCorretorUseCase

  const inputBase = {
    nome: 'Carlos Corretor',
    email: 'carlos@imob.com',
    senha: 'senha456',
    creci: 'SP-12345',
    bio: 'Especialista em imóveis de alto padrão',
  }

  beforeEach(() => {
    usuarioRepo = new InMemoryUsuarioRepository()
    corretorRepo = new InMemoryCorretorRepository()
    hash = new FakeHash()
    sut = new CadastrarCorretorUseCase(usuarioRepo, corretorRepo, hash)
  })

  it('deve cadastrar corretor com sucesso quando executor é ADMINISTRADOR', async () => {
    const result = await sut.execute({ ...inputBase, perfilExecutor: 'ADMINISTRADOR' })

    expect(result.corretorId).toBeTruthy()
    expect(result.usuarioId).toBeTruthy()
  })

  it('deve salvar usuário com perfil CORRETOR', async () => {
    const result = await sut.execute({ ...inputBase, perfilExecutor: 'ADMINISTRADOR' })
    const usuario = await usuarioRepo.findById(result.usuarioId)

    expect(usuario?.perfil).toBe('CORRETOR')
  })

  it('deve lançar UnauthorizedError quando executor não é ADMINISTRADOR', async () => {
    await expect(sut.execute({ ...inputBase, perfilExecutor: 'GESTOR' })).rejects.toThrow(UnauthorizedError)
    await expect(sut.execute({ ...inputBase, perfilExecutor: 'CORRETOR' })).rejects.toThrow(UnauthorizedError)
    await expect(sut.execute({ ...inputBase, perfilExecutor: 'CLIENTE' })).rejects.toThrow(UnauthorizedError)
  })

  it('deve lançar ConflictError para e-mail duplicado', async () => {
    await sut.execute({ ...inputBase, perfilExecutor: 'ADMINISTRADOR' })

    await expect(
      sut.execute({ ...inputBase, perfilExecutor: 'ADMINISTRADOR', creci: 'SP-99999' }),
    ).rejects.toThrow(ConflictError)
  })

  it('deve lançar ConflictError para CRECI duplicado', async () => {
    await sut.execute({ ...inputBase, perfilExecutor: 'ADMINISTRADOR' })

    await expect(
      sut.execute({ ...inputBase, perfilExecutor: 'ADMINISTRADOR', email: 'outro@email.com' }),
    ).rejects.toThrow(ConflictError)
  })
})
