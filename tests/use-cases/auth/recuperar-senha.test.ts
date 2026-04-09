import { describe, it, expect, beforeEach } from 'vitest'
import {
  SolicitarRecuperacaoSenhaUseCase,
  RedefinirSenhaUseCase,
} from '../../../src/application/use-cases/auth/recuperar-senha.usecase.js'
import { InMemoryUsuarioRepository } from '../../../src/infra/repositories/in-memory/in-memory-usuario.repository.js'
import { InMemoryTokenRecuperacaoRepository } from '../../../src/infra/repositories/in-memory/in-memory-token-recuperacao.repository.js'
import { FakeHash } from '../../helpers/fake-hash.js'
import { makeUsuario } from '../../helpers/factories.js'
import { NotFoundError, BusinessRuleError } from '../../../src/domain/errors/domain.error.js'

// UC02 – Recuperar Senha
describe('RecuperarSenhaUseCase', () => {
  let usuarioRepo: InMemoryUsuarioRepository
  let tokenRepo: InMemoryTokenRecuperacaoRepository
  let hash: FakeHash
  let solicitar: SolicitarRecuperacaoSenhaUseCase
  let redefinir: RedefinirSenhaUseCase

  beforeEach(() => {
    usuarioRepo = new InMemoryUsuarioRepository()
    tokenRepo = new InMemoryTokenRecuperacaoRepository()
    hash = new FakeHash()
    solicitar = new SolicitarRecuperacaoSenhaUseCase(usuarioRepo, tokenRepo)
    redefinir = new RedefinirSenhaUseCase(usuarioRepo, tokenRepo, hash)
  })

  it('deve gerar token de recuperação para e-mail existente', async () => {
    const usuario = makeUsuario({ email: 'user@email.com' })
    await usuarioRepo.save(usuario)

    const result = await solicitar.execute({ email: 'user@email.com' })

    expect(result.token).toBeTruthy()
  })

  it('deve lançar NotFoundError para e-mail não cadastrado', async () => {
    await expect(solicitar.execute({ email: 'nao@existe.com' })).rejects.toThrow(NotFoundError)
  })

  it('deve redefinir senha com token válido e invalidar o token', async () => {
    const usuario = makeUsuario({ email: 'user@email.com', senhaHash: 'hashed:velha' })
    await usuarioRepo.save(usuario)

    const { token } = await solicitar.execute({ email: 'user@email.com' })
    await redefinir.execute({ token, novaSenha: 'novaSenha123' })

    const usuarioAtualizado = await usuarioRepo.findById(usuario.id)
    expect(usuarioAtualizado?.senhaHash).toBe('hashed:novaSenha123')

    const tokenSalvo = await tokenRepo.findByToken(token)
    expect(tokenSalvo?.utilizado).toBe(true)
  })

  it('deve lançar BusinessRuleError ao tentar usar token já utilizado', async () => {
    const usuario = makeUsuario({ email: 'user@email.com' })
    await usuarioRepo.save(usuario)

    const { token } = await solicitar.execute({ email: 'user@email.com' })
    await redefinir.execute({ token, novaSenha: 'nova1' })

    await expect(redefinir.execute({ token, novaSenha: 'nova2' })).rejects.toThrow(BusinessRuleError)
  })

  it('deve lançar BusinessRuleError para token inválido', async () => {
    await expect(redefinir.execute({ token: 'token-falso', novaSenha: 'nova' })).rejects.toThrow(BusinessRuleError)
  })
})
