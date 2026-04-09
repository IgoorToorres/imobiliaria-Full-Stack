import type { ICorretorRepository } from '../../../domain/repositories/corretor.repository.js'
import type { IClienteRepository } from '../../../domain/repositories/cliente.repository.js'
import type { ICorretorClienteRepository } from '../../../domain/repositories/corretor-cliente.repository.js'
import { CorretorCliente } from '../../../domain/entities/corretor-cliente.entity.js'
import { NotFoundError, ConflictError, UnauthorizedError } from '../../../domain/errors/domain.error.js'
import type { PerfilUsuario } from '../../../domain/entities/usuario.entity.js'

export interface VincularCorretorClienteInput {
  perfilExecutor: PerfilUsuario
  corretorId: string
  clienteId: string
}

export class VincularCorretorClienteUseCase {
  constructor(
    private readonly corretorRepo: ICorretorRepository,
    private readonly clienteRepo: IClienteRepository,
    private readonly corretorClienteRepo: ICorretorClienteRepository,
  ) {}

  async execute(input: VincularCorretorClienteInput): Promise<void> {
    const perfisPermitidos: PerfilUsuario[] = ['ADMINISTRADOR', 'GESTOR', 'CORRETOR']
    if (!perfisPermitidos.includes(input.perfilExecutor)) {
      throw new UnauthorizedError('Sem permissão para vincular corretor a cliente')
    }

    const corretor = await this.corretorRepo.findById(input.corretorId)
    if (!corretor) throw new NotFoundError('Corretor', input.corretorId)

    const cliente = await this.clienteRepo.findById(input.clienteId)
    if (!cliente) throw new NotFoundError('Cliente', input.clienteId)

    const vinculoExistente = await this.corretorClienteRepo.findByCorretorECliente(input.corretorId, input.clienteId)
    if (vinculoExistente) throw new ConflictError('Corretor já vinculado a este cliente')

    const vinculo = CorretorCliente.create({ corretorId: input.corretorId, clienteId: input.clienteId })
    await this.corretorClienteRepo.save(vinculo)
  }
}
