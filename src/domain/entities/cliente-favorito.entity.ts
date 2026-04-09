export interface ClienteFavoritoProps {
  id: string
  clienteId: string
  imovelId: string
  criadoEm: Date
}

export class ClienteFavorito {
  readonly id: string
  clienteId: string
  imovelId: string
  criadoEm: Date

  constructor(props: ClienteFavoritoProps) {
    this.id = props.id
    this.clienteId = props.clienteId
    this.imovelId = props.imovelId
    this.criadoEm = props.criadoEm
  }

  static create(data: { clienteId: string; imovelId: string }): ClienteFavorito {
    return new ClienteFavorito({
      id: crypto.randomUUID(),
      clienteId: data.clienteId,
      imovelId: data.imovelId,
      criadoEm: new Date(),
    })
  }
}
