import type { IUsuarioRepository } from '../../../domain/repositories/usuario.repository.js'
import type { IClienteRepository } from '../../../domain/repositories/cliente.repository.js'
import type { HashPort } from '../../ports/hash.port.js'
import { Usuario } from '../../../domain/entities/usuario.entity.js'
import { Cliente } from '../../../domain/entities/cliente.entity.js'
import { ConflictError } from '../../../domain/errors/domain.error.js'

export interface CadastrarClienteInput {
  nome: string
  email: string
  senha: string
  telefone?: string
  cpf?: string
  dataNascimento?: Date
  profissao?: string
}

export interface CadastrarClienteOutput {
  usuario: {
    id: string
    nome: string
    email: string
    perfil: string
  }
  clienteId: string
}

export class CadastrarClienteUseCase {
  constructor(
    private readonly usuarioRepo: IUsuarioRepository,
    private readonly clienteRepo: IClienteRepository,
    private readonly hash: HashPort,
  ) {}

  async execute(input: CadastrarClienteInput): Promise<CadastrarClienteOutput> {
    const emailExistente = await this.usuarioRepo.findByEmail(input.email)
    if (emailExistente) throw new ConflictError('E-mail já cadastrado')

    if (input.cpf) {
      const cpfExistente = await this.usuarioRepo.findByCpf(input.cpf)
      if (cpfExistente) throw new ConflictError('CPF já cadastrado')
    }

    const senhaHash = await this.hash.hash(input.senha)

    const usuario = Usuario.create({
      nome: input.nome,
      email: input.email,
      senhaHash,
      telefone: input.telefone,
      cpf: input.cpf,
      perfil: 'CLIENTE',
      ativo: true,
    })

    const cliente = Cliente.create({
      usuarioId: usuario.id,
      dataNascimento: input.dataNascimento,
      profissao: input.profissao,
    })

    await this.usuarioRepo.save(usuario)
    await this.clienteRepo.save(cliente)

    return {
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, perfil: usuario.perfil },
      clienteId: cliente.id,
    }
  }
}
