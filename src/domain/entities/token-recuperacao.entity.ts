export interface TokenRecuperacaoProps {
  id: string
  usuarioId: string
  token: string
  utilizado: boolean
  expiracao: Date
  criadoEm: Date
}

export class TokenRecuperacao {
  readonly id: string
  usuarioId: string
  token: string
  utilizado: boolean
  expiracao: Date
  criadoEm: Date

  constructor(props: TokenRecuperacaoProps) {
    this.id = props.id
    this.usuarioId = props.usuarioId
    this.token = props.token
    this.utilizado = props.utilizado
    this.expiracao = props.expiracao
    this.criadoEm = props.criadoEm
  }

  static create(usuarioId: string): TokenRecuperacao {
    const now = new Date()
    const expiracao = new Date(now.getTime() + 2 * 60 * 60 * 1000) // 2 horas
    return new TokenRecuperacao({
      id: crypto.randomUUID(),
      usuarioId,
      token: crypto.randomUUID(),
      utilizado: false,
      expiracao,
      criadoEm: now,
    })
  }

  estaValido(): boolean {
    return !this.utilizado && new Date() < this.expiracao
  }
}
