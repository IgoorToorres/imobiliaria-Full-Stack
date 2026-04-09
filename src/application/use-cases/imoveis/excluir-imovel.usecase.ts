import type { IImovelRepository } from '../../../domain/repositories/imovel.repository.js'
import type { IInteresseRepository } from '../../../domain/repositories/interesse.repository.js'
import { NotFoundError, UnauthorizedError, BusinessRuleError } from '../../../domain/errors/domain.error.js'
import type { PerfilUsuario } from '../../../domain/entities/usuario.entity.js'

export interface ExcluirImovelInput {
  id: string
  perfilExecutor: PerfilUsuario
}

export class ExcluirImovelUseCase {
  constructor(
    private readonly imovelRepo: IImovelRepository,
    private readonly interesseRepo: IInteresseRepository,
  ) {}

  async execute(input: ExcluirImovelInput): Promise<void> {
    const perfisPermitidos: PerfilUsuario[] = ['ADMINISTRADOR', 'CORRETOR', 'GESTOR']
    if (!perfisPermitidos.includes(input.perfilExecutor)) {
      throw new UnauthorizedError('Apenas Administrador, Gestor ou Corretor podem excluir imóveis')
    }

    const imovel = await this.imovelRepo.findById(input.id)
    if (!imovel) throw new NotFoundError('Imóvel', input.id)

    // RF012: imóvel com contrato ativo (RESERVADO, VENDIDO, LOCADO) não pode ser excluído
    if (imovel.temStatusAtivo()) {
      throw new BusinessRuleError(
        `Imóvel com status "${imovel.status}" não pode ser excluído. Altere o status antes de excluir.`,
      )
    }

    // Verifica interesses ativos
    const interessesAtivos = await this.interesseRepo.findByImovelEStatus(input.id, [
      'PENDENTE',
      'EM_ATENDIMENTO',
      'AGENDADO',
    ])
    if (interessesAtivos.length > 0) {
      throw new BusinessRuleError('Imóvel com interesses ativos não pode ser excluído')
    }

    await this.imovelRepo.delete(input.id)
  }
}
