import type { IImovelRepository } from '../../../domain/repositories/imovel.repository.js'
import type { ICorretorRepository } from '../../../domain/repositories/corretor.repository.js'
import { Imovel, TipoImovel, FinalidadeImovel, EnderecoImovelVO } from '../../../domain/entities/imovel.entity.js'
import { NotFoundError, UnauthorizedError } from '../../../domain/errors/domain.error.js'
import type { PerfilUsuario } from '../../../domain/entities/usuario.entity.js'

export interface CadastrarImovelInput {
  perfilExecutor: PerfilUsuario
  titulo: string
  tipo: TipoImovel
  finalidade: FinalidadeImovel
  descricao?: string
  areaTotal?: number
  areaUtil?: number
  quartos?: number
  banheiros?: number
  vagas?: number
  preco: number
  endereco: EnderecoImovelVO
  corretorResponsavelId?: string
  dataConstrucao?: Date
}

export interface CadastrarImovelOutput {
  imovel: Imovel
}

export class CadastrarImovelUseCase {
  constructor(
    private readonly imovelRepo: IImovelRepository,
    private readonly corretorRepo: ICorretorRepository,
  ) {}

  async execute(input: CadastrarImovelInput): Promise<CadastrarImovelOutput> {
    const perfisPermitidos: PerfilUsuario[] = ['ADMINISTRADOR', 'CORRETOR', 'GESTOR']
    if (!perfisPermitidos.includes(input.perfilExecutor)) {
      throw new UnauthorizedError('Apenas Administrador, Gestor ou Corretor podem cadastrar imóveis')
    }

    if (input.corretorResponsavelId) {
      const corretor = await this.corretorRepo.findById(input.corretorResponsavelId)
      if (!corretor) throw new NotFoundError('Corretor', input.corretorResponsavelId)
    }

    const imovel = Imovel.create({
      titulo: input.titulo,
      tipo: input.tipo,
      finalidade: input.finalidade,
      descricao: input.descricao,
      areaTotal: input.areaTotal,
      areaUtil: input.areaUtil,
      quartos: input.quartos ?? 0,
      banheiros: input.banheiros ?? 0,
      vagas: input.vagas ?? 0,
      preco: input.preco,
      endereco: input.endereco,
      corretorResponsavelId: input.corretorResponsavelId,
      dataConstrucao: input.dataConstrucao,
    })

    await this.imovelRepo.save(imovel)
    return { imovel }
  }
}
