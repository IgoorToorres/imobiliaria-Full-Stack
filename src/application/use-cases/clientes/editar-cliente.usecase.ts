import type { IUsuarioRepository } from '../../../domain/repositories/usuario.repository.js'
import type { IClienteRepository } from '../../../domain/repositories/cliente.repository.js'
import { NotFoundError, UnauthorizedError } from '../../../domain/errors/domain.error.js'
import type { PerfilUsuario } from '../../../domain/entities/usuario.entity.js'

export interface EditarClienteInput {
  clienteId: string
  usuarioExecutorId: string
  perfilExecutor: PerfilUsuario
  nome?: string
  telefone?: string
  dataNascimento?: Date
  profissao?: string
}

export class EditarClienteUseCase {
  constructor(
    private readonly usuarioRepo: IUsuarioRepository,
    private readonly clienteRepo: IClienteRepository,
  ) {}

  async execute(input: EditarClienteInput): Promise<void> {
    const cliente = await this.clienteRepo.findById(input.clienteId)
    if (!cliente) throw new NotFoundError('Cliente', input.clienteId)

    const perfisAdminOuGestor: PerfilUsuario[] = ['ADMINISTRADOR', 'GESTOR']
    const ehDonoOuAdmin =
      perfisAdminOuGestor.includes(input.perfilExecutor) ||
      (input.perfilExecutor === 'CLIENTE' && cliente.usuarioId === input.usuarioExecutorId)

    if (!ehDonoOuAdmin) {
      throw new UnauthorizedError('Sem permissão para editar este cliente')
    }

    const usuario = await this.usuarioRepo.findById(cliente.usuarioId)
    if (!usuario) throw new NotFoundError('Usuário')

    if (input.nome !== undefined) {
      usuario.nome = input.nome
      usuario.atualizadoEm = new Date()
      await this.usuarioRepo.update(usuario)
    }

    if (input.telefone !== undefined) {
      usuario.telefone = input.telefone
      usuario.atualizadoEm = new Date()
      await this.usuarioRepo.update(usuario)
    }

    if (input.dataNascimento !== undefined) cliente.dataNascimento = input.dataNascimento
    if (input.profissao !== undefined) cliente.profissao = input.profissao

    await this.clienteRepo.update(cliente)
  }
}
