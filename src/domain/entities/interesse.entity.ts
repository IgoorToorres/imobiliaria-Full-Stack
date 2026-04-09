export type StatusInteresse =
  | 'PENDENTE'
  | 'EM_ATENDIMENTO'
  | 'AGENDADO'
  | 'FINALIZADO'
  | 'CANCELADO'

export interface InteresseProps {
  id: string
  clienteId: string
  imovelId: string
  corretorId?: string
  mensagem?: string
  status: StatusInteresse
  criadoEm: Date
  atualizadoEm: Date
}

export class Interesse {
  readonly id: string
  clienteId: string
  imovelId: string
  corretorId?: string
  mensagem?: string
  status: StatusInteresse
  criadoEm: Date
  atualizadoEm: Date

  constructor(props: InteresseProps) {
    this.id = props.id
    this.clienteId = props.clienteId
    this.imovelId = props.imovelId
    this.corretorId = props.corretorId
    this.mensagem = props.mensagem
    this.status = props.status
    this.criadoEm = props.criadoEm
    this.atualizadoEm = props.atualizadoEm
  }

  static create(data: {
    clienteId: string
    imovelId: string
    corretorId?: string
    mensagem?: string
  }): Interesse {
    const now = new Date()
    return new Interesse({
      id: crypto.randomUUID(),
      clienteId: data.clienteId,
      imovelId: data.imovelId,
      corretorId: data.corretorId,
      mensagem: data.mensagem,
      status: 'PENDENTE',
      criadoEm: now,
      atualizadoEm: now,
    })
  }
}
