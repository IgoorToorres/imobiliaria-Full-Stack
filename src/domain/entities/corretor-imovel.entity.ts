export interface CorretorImovelProps {
  id: string
  corretorId: string
  imovelId: string
  criadoEm: Date
}

export class CorretorImovel {
  readonly id: string
  corretorId: string
  imovelId: string
  criadoEm: Date

  constructor(props: CorretorImovelProps) {
    this.id = props.id
    this.corretorId = props.corretorId
    this.imovelId = props.imovelId
    this.criadoEm = props.criadoEm
  }

  static create(data: { corretorId: string; imovelId: string }): CorretorImovel {
    return new CorretorImovel({
      id: crypto.randomUUID(),
      corretorId: data.corretorId,
      imovelId: data.imovelId,
      criadoEm: new Date(),
    })
  }
}
