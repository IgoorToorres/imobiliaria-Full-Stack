import type { IUsuarioRepository } from '../../../domain/repositories/usuario.repository.js'
import type { ITokenRecuperacaoRepository } from '../../../domain/repositories/token-recuperacao.repository.js'
import type { HashPort } from '../../ports/hash.port.js'
import { TokenRecuperacao } from '../../../domain/entities/token-recuperacao.entity.js'
import { NotFoundError, BusinessRuleError } from '../../../domain/errors/domain.error.js'

// UC02 - Parte 1: Solicitar recuperação de senha
export interface SolicitarRecuperacaoInput {
  email: string
}

export interface SolicitarRecuperacaoOutput {
  token: string // Em produção: enviado por e-mail/SMS. No MVP retornado diretamente.
}

export class SolicitarRecuperacaoSenhaUseCase {
  constructor(
    private readonly usuarioRepo: IUsuarioRepository,
    private readonly tokenRepo: ITokenRecuperacaoRepository,
  ) {}

  async execute(input: SolicitarRecuperacaoInput): Promise<SolicitarRecuperacaoOutput> {
    const usuario = await this.usuarioRepo.findByEmail(input.email)
    if (!usuario) throw new NotFoundError('Usuário')

    const tokenRecuperacao = TokenRecuperacao.create(usuario.id)
    await this.tokenRepo.save(tokenRecuperacao)

    // TODO: Em produção, enviar por e-mail/SMS (RF003)
    return { token: tokenRecuperacao.token }
  }
}

// UC02 - Parte 2: Redefinir senha com token
export interface RedefinirSenhaInput {
  token: string
  novaSenha: string
}

export class RedefinirSenhaUseCase {
  constructor(
    private readonly usuarioRepo: IUsuarioRepository,
    private readonly tokenRepo: ITokenRecuperacaoRepository,
    private readonly hash: HashPort,
  ) {}

  async execute(input: RedefinirSenhaInput): Promise<void> {
    const tokenRecuperacao = await this.tokenRepo.findByToken(input.token)
    if (!tokenRecuperacao || !tokenRecuperacao.estaValido()) {
      throw new BusinessRuleError('Token inválido ou expirado')
    }

    const usuario = await this.usuarioRepo.findById(tokenRecuperacao.usuarioId)
    if (!usuario) throw new NotFoundError('Usuário')

    usuario.senhaHash = await this.hash.hash(input.novaSenha)
    usuario.atualizadoEm = new Date()

    await this.usuarioRepo.update(usuario)
    await this.tokenRepo.marcarComoUtilizado(tokenRecuperacao.id)
  }
}
