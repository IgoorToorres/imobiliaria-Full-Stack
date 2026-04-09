export interface SessaoProps {
  id: string
  usuarioId: string
  token: string
  ip?: string
  ativa: boolean
  criadoEm: Date
  expiraEm: Date
}

export class Sessao {
  readonly id: string
  usuarioId: string
  token: string
  ip?: string
  ativa: boolean
  criadoEm: Date
  expiraEm: Date

  constructor(props: SessaoProps) {
    this.id = props.id
    this.usuarioId = props.usuarioId
    this.token = props.token
    this.ip = props.ip
    this.ativa = props.ativa
    this.criadoEm = props.criadoEm
    this.expiraEm = props.expiraEm
  }

  static create(data: { usuarioId: string; ip?: string; duracaoHoras?: number }): Sessao {
    const now = new Date()
    const horas = data.duracaoHoras ?? 24 * 7
    const expiraEm = new Date(now.getTime() + horas * 60 * 60 * 1000)
    return new Sessao({
      id: crypto.randomUUID(),
      usuarioId: data.usuarioId,
      token: crypto.randomUUID(),
      ip: data.ip,
      ativa: true,
      criadoEm: now,
      expiraEm,
    })
  }

  estaValida(): boolean {
    return this.ativa && new Date() < this.expiraEm
  }
}
