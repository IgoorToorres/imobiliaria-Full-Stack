import type { IClienteRepository } from '../../../domain/repositories/cliente.repository.js'
import type { IUsuarioRepository } from '../../../domain/repositories/usuario.repository.js'
import type { IInteresseRepository } from '../../../domain/repositories/interesse.repository.js'
import { NotFoundError, UnauthorizedError, BusinessRuleError } from '../../../domain/errors/domain.error.js'
import type { PerfilUsuario } from '../../../domain/entities/usuario.entity.js'

export interface ExcluirClienteInput {
  clienteId: string
  perfilExecutor: PerfilUsuario
}

export class ExcluirClienteUseCase {
  constructor(
    private readonly clienteRepo: IClienteRepository,
    private readonly usuarioRepo: IUsuarioRepository,
    private readonly interesseRepo: IInteresseRepository,
  ) {}

  async execute(input: ExcluirClienteInput): Promise<void> {
    const perfisPermitidos: PerfilUsuario[] = ['ADMINISTRADOR', 'GESTOR']
    if (!perfisPermitidos.includes(input.perfilExecutor)) {
      throw new UnauthorizedError('Apenas Administrador ou Gestor podem excluir clientes')
    }

    const cliente = await this.clienteRepo.findById(input.clienteId)
    if (!cliente) throw new NotFoundError('Cliente', input.clienteId)

    // RF023: impedir exclusão se houver vínculos ativos
    const interessesAtivos = await this.interesseRepo.findByImovelEStatus(
      // Busca por clienteId via findByClienteId — verificar interesses ativos do cliente
      input.clienteId,
      ['PENDENTE', 'EM_ATENDIMENTO', 'AGENDADO'],
    )
    if (interessesAtivos.length > 0) {
      throw new BusinessRuleError('Cliente com interesses ativos não pode ser excluído')
    }

    await this.clienteRepo.delete(input.clienteId)
    await this.usuarioRepo.delete(cliente.usuarioId)
  }
}
