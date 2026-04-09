import type { ICorretorRepository } from '../../../domain/repositories/corretor.repository.js'
import type { ICorretorImovelRepository } from '../../../domain/repositories/corretor-imovel.repository.js'
import type { ICorretorClienteRepository } from '../../../domain/repositories/corretor-cliente.repository.js'
import type { IInteresseRepository } from '../../../domain/repositories/interesse.repository.js'
import type { IImovelRepository } from '../../../domain/repositories/imovel.repository.js'
import type { IUsuarioRepository } from '../../../domain/repositories/usuario.repository.js'
import { UnauthorizedError } from '../../../domain/errors/domain.error.js'
import type { PerfilUsuario } from '../../../domain/entities/usuario.entity.js'

export interface RelatorioDesempenhoCorretorInput {
  perfilExecutor: PerfilUsuario
}

export interface DesempenhoCorretor {
  corretorId: string
  corretorNome: string
  creci: string
  totalImoveisVinculados: number
  totalClientesAtendidos: number
  totalInteressesRecebidos: number
  totalConversoes: number
  totalFechamentos: number
}

export interface RelatorioDesempenhoCorretorOutput {
  corretores: DesempenhoCorretor[]
}

export class RelatorioDesempenhoCorretorUseCase {
  constructor(
    private readonly corretorRepo: ICorretorRepository,
    private readonly usuarioRepo: IUsuarioRepository,
    private readonly corretorImovelRepo: ICorretorImovelRepository,
    private readonly corretorClienteRepo: ICorretorClienteRepository,
    private readonly interesseRepo: IInteresseRepository,
    private readonly imovelRepo: IImovelRepository,
  ) {}

  async execute(input: RelatorioDesempenhoCorretorInput): Promise<RelatorioDesempenhoCorretorOutput> {
    const perfisPermitidos: PerfilUsuario[] = ['ADMINISTRADOR', 'GESTOR']
    if (!perfisPermitidos.includes(input.perfilExecutor)) {
      throw new UnauthorizedError('Apenas Administrador ou Gestor podem acessar o relatório de desempenho')
    }

    const corretores = await this.corretorRepo.findAll()

    const desempenhos: DesempenhoCorretor[] = await Promise.all(
      corretores.map(async (corretor) => {
        const usuario = await this.usuarioRepo.findById(corretor.usuarioId)
        const imoveisVinculados = await this.corretorImovelRepo.findByCorretorId(corretor.id)
        const clientesAtendidos = await this.corretorClienteRepo.findByCorretorId(corretor.id)
        const interesses = await this.interesseRepo.findByCorretorId(corretor.id)
        const todosImoveis = await this.imovelRepo.findAll()

        const totalConversoes = interesses.filter((i) => i.status === 'FINALIZADO').length
        const imoveisResponsavel = todosImoveis.filter((i) => i.corretorResponsavelId === corretor.id)
        const totalFechamentos = imoveisResponsavel.filter(
          (i) => i.status === 'VENDIDO' || i.status === 'LOCADO',
        ).length

        return {
          corretorId: corretor.id,
          corretorNome: usuario?.nome ?? 'Desconhecido',
          creci: corretor.creci,
          totalImoveisVinculados: imoveisVinculados.length,
          totalClientesAtendidos: clientesAtendidos.length,
          totalInteressesRecebidos: interesses.length,
          totalConversoes,
          totalFechamentos,
        }
      }),
    )

    return { corretores: desempenhos }
  }
}
