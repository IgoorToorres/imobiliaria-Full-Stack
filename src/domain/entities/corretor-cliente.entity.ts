export interface CorretorClienteProps {
  id: string
  corretorId: string
  clienteId: string
  criadoEm: Date
}

export class CorretorCliente {
  readonly id: string
  corretorId: string
  clienteId: string
  criadoEm: Date

  constructor(props: CorretorClienteProps) {
    this.id = props.id
    this.corretorId = props.corretorId
    this.clienteId = props.clienteId
    this.criadoEm = props.criadoEm
  }

  static create(data: { corretorId: string; clienteId: string }): CorretorCliente {
    return new CorretorCliente({
      id: crypto.randomUUID(),
      corretorId: data.corretorId,
      clienteId: data.clienteId,
      criadoEm: new Date(),
    })
  }
}
