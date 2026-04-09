import type { IUsuarioRepository } from '../../../domain/repositories/usuario.repository.js'
import type { ISessaoRepository } from '../../../domain/repositories/sessao.repository.js'
import type { HashPort } from '../../ports/hash.port.js'
import { Sessao } from '../../../domain/entities/sessao.entity.js'
import { InvalidCredentialsError, UnauthorizedError } from '../../../domain/errors/domain.error.js'

export interface AutenticarUsuarioInput {
  email: string
  senha: string
  ip?: string
}

export interface AutenticarUsuarioOutput {
  token: string
  usuario: {
    id: string
    nome: string
    email: string
    perfil: string
  }
}

export class AutenticarUsuarioUseCase {
  constructor(
    private readonly usuarioRepo: IUsuarioRepository,
    private readonly sessaoRepo: ISessaoRepository,
    private readonly hash: HashPort,
  ) {}

  async execute(input: AutenticarUsuarioInput): Promise<AutenticarUsuarioOutput> {
    const usuario = await this.usuarioRepo.findByEmail(input.email)
    if (!usuario) throw new InvalidCredentialsError()

    if (!usuario.ativo) throw new UnauthorizedError('Usuário inativo')

    const senhaValida = await this.hash.compare(input.senha, usuario.senhaHash)
    if (!senhaValida) throw new InvalidCredentialsError()

    const sessao = Sessao.create({ usuarioId: usuario.id, ip: input.ip })
    await this.sessaoRepo.save(sessao)

    return {
      token: sessao.token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
      },
    }
  }
}
