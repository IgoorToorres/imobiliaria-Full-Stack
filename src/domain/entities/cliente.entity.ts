export interface ClienteProps {
  id: string
  usuarioId: string
  dataNascimento?: Date
  profissao?: string
  criadoEm: Date
}

export class Cliente {
  readonly id: string
  usuarioId: string
  dataNascimento?: Date
  profissao?: string
  criadoEm: Date

  constructor(props: ClienteProps) {
    this.id = props.id
    this.usuarioId = props.usuarioId
    this.dataNascimento = props.dataNascimento
    this.profissao = props.profissao
    this.criadoEm = props.criadoEm
  }

  static create(data: Omit<ClienteProps, 'id' | 'criadoEm'> & { id?: string }): Cliente {
    return new Cliente({
      id: data.id ?? crypto.randomUUID(),
      criadoEm: new Date(),
      ...data,
    })
  }
}
