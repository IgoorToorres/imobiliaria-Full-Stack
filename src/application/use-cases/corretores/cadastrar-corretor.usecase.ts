import type { IUsuarioRepository } from '../../../domain/repositories/usuario.repository.js'
import type { ICorretorRepository } from '../../../domain/repositories/corretor.repository.js'
import type { HashPort } from '../../ports/hash.port.js'
import { Usuario } from '../../../domain/entities/usuario.entity.js'
import { Corretor } from '../../../domain/entities/corretor.entity.js'
import { ConflictError, UnauthorizedError } from '../../../domain/errors/domain.error.js'
import type { PerfilUsuario } from '../../../domain/entities/usuario.entity.js'

export interface CadastrarCorretorInput {
  perfilExecutor: PerfilUsuario
  nome: string
  email: string
  senha: string
  telefone?: string
  cpf?: string
  creci: string
  bio?: string
}

export interface CadastrarCorretorOutput {
  usuarioId: string
  corretorId: string
}

export class CadastrarCorretorUseCase {
  constructor(
    private readonly usuarioRepo: IUsuarioRepository,
    private readonly corretorRepo: ICorretorRepository,
    private readonly hash: HashPort,
  ) {}

  async execute(input: CadastrarCorretorInput): Promise<CadastrarCorretorOutput> {
    if (input.perfilExecutor !== 'ADMINISTRADOR') {
      throw new UnauthorizedError('Apenas Administrador pode cadastrar corretores')
    }

    const emailExistente = await this.usuarioRepo.findByEmail(input.email)
    if (emailExistente) throw new ConflictError('E-mail já cadastrado')

    const creciExistente = await this.corretorRepo.findByCreci(input.creci)
    if (creciExistente) throw new ConflictError('CRECI já cadastrado')

    const senhaHash = await this.hash.hash(input.senha)

    const usuario = Usuario.create({
      nome: input.nome,
      email: input.email,
      senhaHash,
      telefone: input.telefone,
      cpf: input.cpf,
      perfil: 'CORRETOR',
      ativo: true,
    })

    const corretor = Corretor.create({
      usuarioId: usuario.id,
      creci: input.creci,
      bio: input.bio,
    })

    await this.usuarioRepo.save(usuario)
    await this.corretorRepo.save(corretor)

    return { usuarioId: usuario.id, corretorId: corretor.id }
  }
}
