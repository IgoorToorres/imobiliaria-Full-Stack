import type { IClienteFavoritoRepository } from '../../../domain/repositories/cliente-favorito.repository.js'
import type { IInteresseRepository } from '../../../domain/repositories/interesse.repository.js'
import type { IImovelRepository } from '../../../domain/repositories/imovel.repository.js'
import type { ICorretorRepository } from '../../../domain/repositories/corretor.repository.js'
import { UnauthorizedError, NotFoundError } from '../../../domain/errors/domain.error.js'
import type { PerfilUsuario } from '../../../domain/entities/usuario.entity.js'

export interface RelatorioImoveisMarcadosInput {
  perfilExecutor: PerfilUsuario
  corretorId: string
}

export interface ItemRelatorioImovel {
  imovelId: string
  titulo: string
  status: string
  totalFavoritos: number
  totalInteresses: number
}

export interface RelatorioImoveisMarcadosOutput {
  itens: ItemRelatorioImovel[]
}

export class RelatorioImoveisMarcadosUseCase {
  constructor(
    private readonly corretorRepo: ICorretorRepository,
    private readonly imovelRepo: IImovelRepository,
    private readonly favoritoRepo: IClienteFavoritoRepository,
    private readonly interesseRepo: IInteresseRepository,
  ) {}

  async execute(input: RelatorioImoveisMarcadosInput): Promise<RelatorioImoveisMarcadosOutput> {
    const perfisPermitidos: PerfilUsuario[] = ['ADMINISTRADOR', 'GESTOR', 'CORRETOR']
    if (!perfisPermitidos.includes(input.perfilExecutor)) {
      throw new UnauthorizedError('Sem permissão para acessar relatório de imóveis marcados')
    }

    const corretor = await this.corretorRepo.findById(input.corretorId)
    if (!corretor) throw new NotFoundError('Corretor', input.corretorId)

    const todosImoveis = await this.imovelRepo.findAll()
    const imoveisDoCorretor = todosImoveis.filter((i) => i.corretorResponsavelId === input.corretorId)

    const itens: ItemRelatorioImovel[] = await Promise.all(
      imoveisDoCorretor.map(async (imovel) => {
        const totalFavoritos = await this.favoritoRepo.countByImovelId(imovel.id)
        const interesses = await this.interesseRepo.findByImovelId(imovel.id)
        return {
          imovelId: imovel.id,
          titulo: imovel.titulo,
          status: imovel.status,
          totalFavoritos,
          totalInteresses: interesses.length,
        }
      }),
    )

    return { itens }
  }
}
