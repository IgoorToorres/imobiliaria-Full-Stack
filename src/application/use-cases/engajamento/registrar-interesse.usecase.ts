import type { IInteresseRepository } from '../../../domain/repositories/interesse.repository.js'
import type { IClienteRepository } from '../../../domain/repositories/cliente.repository.js'
import type { IImovelRepository } from '../../../domain/repositories/imovel.repository.js'
import { Interesse } from '../../../domain/entities/interesse.entity.js'
import { NotFoundError, BusinessRuleError } from '../../../domain/errors/domain.error.js'
import type { Interesse as InteresseEntity } from '../../../domain/entities/interesse.entity.js'

export interface RegistrarInteresseInput {
  clienteId: string
  imovelId: string
  mensagem?: string
}

export interface RegistrarInteresseOutput {
  interesse: InteresseEntity
}

export class RegistrarInteresseUseCase {
  constructor(
    private readonly interesseRepo: IInteresseRepository,
    private readonly clienteRepo: IClienteRepository,
    private readonly imovelRepo: IImovelRepository,
  ) {}

  async execute(input: RegistrarInteresseInput): Promise<RegistrarInteresseOutput> {
    const cliente = await this.clienteRepo.findById(input.clienteId)
    if (!cliente) throw new NotFoundError('Cliente', input.clienteId)

    const imovel = await this.imovelRepo.findById(input.imovelId)
    if (!imovel) throw new NotFoundError('Imóvel', input.imovelId)

    if (imovel.status === 'VENDIDO' || imovel.status === 'LOCADO' || imovel.status === 'INATIVO') {
      throw new BusinessRuleError(`Imóvel com status "${imovel.status}" não aceita registros de interesse`)
    }

    const interesse = Interesse.create({
      clienteId: input.clienteId,
      imovelId: input.imovelId,
      corretorId: imovel.corretorResponsavelId,
      mensagem: input.mensagem,
    })

    await this.interesseRepo.save(interesse)

    // TODO: Em produção, notificar o corretor responsável (RF050)

    return { interesse }
  }
}

export interface HistoricoInteressesInput {
  clienteId: string
}

export interface HistoricoInteressesOutput {
  interesses: InteresseEntity[]
}

export class HistoricoInteressesUseCase {
  constructor(private readonly interesseRepo: IInteresseRepository) {}

  async execute(input: HistoricoInteressesInput): Promise<HistoricoInteressesOutput> {
    const interesses = await this.interesseRepo.findByClienteId(input.clienteId)
    return { interesses }
  }
}
