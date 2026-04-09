import { describe, it, expect, beforeEach } from 'vitest'
import { AutenticarUsuarioUseCase } from '../../../src/application/use-cases/auth/autenticar-usuario.usecase.js'
import { InMemoryUsuarioRepository } from '../../../src/infra/repositories/in-memory/in-memory-usuario.repository.js'
import { InMemorySessaoRepository } from '../../../src/infra/repositories/in-memory/in-memory-sessao.repository.js'
import { FakeHash } from '../../helpers/fake-hash.js'
import { makeUsuario } from '../../helpers/factories.js'
import { InvalidCredentialsError, UnauthorizedError } from '../../../src/domain/errors/domain.error.js'

// UC01 – Autenticar Usuário
describe('AutenticarUsuarioUseCase', () => {
  let usuarioRepo: InMemoryUsuarioRepository
  let sessaoRepo: InMemorySessaoRepository
  let hash: FakeHash
  let sut: AutenticarUsuarioUseCase

  beforeEach(() => {
    usuarioRepo = new InMemoryUsuarioRepository()
    sessaoRepo = new InMemorySessaoRepository()
    hash = new FakeHash()
    sut = new AutenticarUsuarioUseCase(usuarioRepo, sessaoRepo, hash)
  })

  it('deve retornar token e dados do usuário ao autenticar com credenciais corretas', async () => {
    const usuario = makeUsuario({ email: 'admin@email.com', senhaHash: 'hashed:senha123' })
    await usuarioRepo.save(usuario)

    const result = await sut.execute({ email: 'admin@email.com', senha: 'senha123' })

    expect(result.token).toBeTruthy()
    expect(result.usuario.email).toBe('admin@email.com')
    expect(result.usuario.perfil).toBe('CLIENTE')
  })

  it('deve criar uma sessão ativa no repositório', async () => {
    const usuario = makeUsuario({ email: 'test@email.com', senhaHash: 'hashed:abc' })
    await usuarioRepo.save(usuario)

    const result = await sut.execute({ email: 'test@email.com', senha: 'abc' })

    const sessoes = await sessaoRepo.findByUsuarioId(usuario.id)
    expect(sessoes).toHaveLength(1)
    expect(sessoes[0].token).toBe(result.token)
    expect(sessoes[0].ativa).toBe(true)
  })

  it('deve lançar InvalidCredentialsError para e-mail não cadastrado', async () => {
    await expect(sut.execute({ email: 'nao@existe.com', senha: '123' })).rejects.toThrow(InvalidCredentialsError)
  })

  it('deve lançar InvalidCredentialsError para senha incorreta', async () => {
    const usuario = makeUsuario({ email: 'user@email.com', senhaHash: 'hashed:correta' })
    await usuarioRepo.save(usuario)

    await expect(sut.execute({ email: 'user@email.com', senha: 'errada' })).rejects.toThrow(InvalidCredentialsError)
  })

  it('deve lançar UnauthorizedError para usuário inativo', async () => {
    const usuario = makeUsuario({ email: 'inativo@email.com', senhaHash: 'hashed:123', ativo: false })
    await usuarioRepo.save(usuario)

    await expect(sut.execute({ email: 'inativo@email.com', senha: '123' })).rejects.toThrow(UnauthorizedError)
  })
})
