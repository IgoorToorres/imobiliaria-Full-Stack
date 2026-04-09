import type { IImovelRepository } from '../../../domain/repositories/imovel.repository.js'
import type { TipoImovel, FinalidadeImovel, StatusImovel, EnderecoImovelVO } from '../../../domain/entities/imovel.entity.js'
import { NotFoundError, UnauthorizedError } from '../../../domain/errors/domain.error.js'
import type { PerfilUsuario } from '../../../domain/entities/usuario.entity.js'
import type { Imovel } from '../../../domain/entities/imovel.entity.js'

export interface EditarImovelInput {
  id: string
  perfilExecutor: PerfilUsuario
  titulo?: string
  tipo?: TipoImovel
  finalidade?: FinalidadeImovel
  descricao?: string
  areaTotal?: number
  areaUtil?: number
  quartos?: number
  banheiros?: number
  vagas?: number
  preco?: number
  status?: StatusImovel
  endereco?: EnderecoImovelVO
  corretorResponsavelId?: string
  dataConstrucao?: Date
}

export interface EditarImovelOutput {
  imovel: Imovel
}

export class EditarImovelUseCase {
  constructor(private readonly imovelRepo: IImovelRepository) {}

  async execute(input: EditarImovelInput): Promise<EditarImovelOutput> {
    const perfisPermitidos: PerfilUsuario[] = ['ADMINISTRADOR', 'CORRETOR', 'GESTOR']
    if (!perfisPermitidos.includes(input.perfilExecutor)) {
      throw new UnauthorizedError('Apenas Administrador, Gestor ou Corretor podem editar imóveis')
    }

    const imovel = await this.imovelRepo.findById(input.id)
    if (!imovel) throw new NotFoundError('Imóvel', input.id)

    if (input.titulo !== undefined) imovel.titulo = input.titulo
    if (input.tipo !== undefined) imovel.tipo = input.tipo
    if (input.finalidade !== undefined) imovel.finalidade = input.finalidade
    if (input.descricao !== undefined) imovel.descricao = input.descricao
    if (input.areaTotal !== undefined) imovel.areaTotal = input.areaTotal
    if (input.areaUtil !== undefined) imovel.areaUtil = input.areaUtil
    if (input.quartos !== undefined) imovel.quartos = input.quartos
    if (input.banheiros !== undefined) imovel.banheiros = input.banheiros
    if (input.vagas !== undefined) imovel.vagas = input.vagas
    if (input.preco !== undefined) imovel.preco = input.preco
    if (input.status !== undefined) imovel.status = input.status
    if (input.endereco !== undefined) imovel.endereco = input.endereco
    if (input.corretorResponsavelId !== undefined) imovel.corretorResponsavelId = input.corretorResponsavelId
    if (input.dataConstrucao !== undefined) imovel.dataConstrucao = input.dataConstrucao

    imovel.atualizadoEm = new Date()

    await this.imovelRepo.update(imovel)
    return { imovel }
  }
}
