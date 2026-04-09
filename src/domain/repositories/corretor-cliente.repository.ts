import type { CorretorCliente } from '../entities/corretor-cliente.entity.js'

export interface ICorretorClienteRepository {
  save(vinculo: CorretorCliente): Promise<void>
  findByCorretorId(corretorId: string): Promise<CorretorCliente[]>
  findByClienteId(clienteId: string): Promise<CorretorCliente[]>
  findByCorretorECliente(corretorId: string, clienteId: string): Promise<CorretorCliente | null>
  delete(id: string): Promise<void>
}
