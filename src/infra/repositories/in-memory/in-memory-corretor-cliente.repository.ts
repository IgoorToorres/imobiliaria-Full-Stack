import type { ICorretorClienteRepository } from '../../../domain/repositories/corretor-cliente.repository.js'
import type { CorretorCliente } from '../../../domain/entities/corretor-cliente.entity.js'

export class InMemoryCorretorClienteRepository implements ICorretorClienteRepository {
  private items: CorretorCliente[] = []

  async save(vinculo: CorretorCliente): Promise<void> {
    this.items.push(vinculo)
  }

  async findByCorretorId(corretorId: string): Promise<CorretorCliente[]> {
    return this.items.filter((v) => v.corretorId === corretorId)
  }

  async findByClienteId(clienteId: string): Promise<CorretorCliente[]> {
    return this.items.filter((v) => v.clienteId === clienteId)
  }

  async findByCorretorECliente(corretorId: string, clienteId: string): Promise<CorretorCliente | null> {
    return this.items.find((v) => v.corretorId === corretorId && v.clienteId === clienteId) ?? null
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter((v) => v.id !== id)
  }
}
