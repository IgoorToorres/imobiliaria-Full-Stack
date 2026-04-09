import type { ICorretorRepository } from '../../../domain/repositories/corretor.repository.js'
import type { IImovelRepository } from '../../../domain/repositories/imovel.repository.js'
import type { ICorretorImovelRepository } from '../../../domain/repositories/corretor-imovel.repository.js'
import { CorretorImovel } from '../../../domain/entities/corretor-imovel.entity.js'
import { NotFoundError, ConflictError, UnauthorizedError } from '../../../domain/errors/domain.error.js'
import type { PerfilUsuario } from '../../../domain/entities/usuario.entity.js'

export interface VincularCorretorImovelInput {
  perfilExecutor: PerfilUsuario
  corretorId: string
  imovelId: string
}

export class VincularCorretorImovelUseCase {
  constructor(
    private readonly corretorRepo: ICorretorRepository,
    private readonly imovelRepo: IImovelRepository,
    private readonly corretorImovelRepo: ICorretorImovelRepository,
  ) {}

  async execute(input: VincularCorretorImovelInput): Promise<void> {
    const perfisPermitidos: PerfilUsuario[] = ['ADMINISTRADOR', 'GESTOR', 'CORRETOR']
    if (!perfisPermitidos.includes(input.perfilExecutor)) {
      throw new UnauthorizedError('Sem permissão para vincular corretor a imóvel')
    }

    const corretor = await this.corretorRepo.findById(input.corretorId)
    if (!corretor) throw new NotFoundError('Corretor', input.corretorId)

    const imovel = await this.imovelRepo.findById(input.imovelId)
    if (!imovel) throw new NotFoundError('Imóvel', input.imovelId)

    const vinculoExistente = await this.corretorImovelRepo.findByCorretorEImovel(input.corretorId, input.imovelId)
    if (vinculoExistente) throw new ConflictError('Corretor já vinculado a este imóvel')

    const vinculo = CorretorImovel.create({ corretorId: input.corretorId, imovelId: input.imovelId })
    await this.corretorImovelRepo.save(vinculo)
  }
}
