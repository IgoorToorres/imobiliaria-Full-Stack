export interface CorretorProps {
  id: string
  usuarioId: string
  creci: string
  bio?: string
  fotoUrl?: string
  ativo: boolean
  criadoEm: Date
}

export class Corretor {
  readonly id: string
  usuarioId: string
  creci: string
  bio?: string
  fotoUrl?: string
  ativo: boolean
  criadoEm: Date

  constructor(props: CorretorProps) {
    this.id = props.id
    this.usuarioId = props.usuarioId
    this.creci = props.creci
    this.bio = props.bio
    this.fotoUrl = props.fotoUrl
    this.ativo = props.ativo
    this.criadoEm = props.criadoEm
  }

  static create(data: Omit<CorretorProps, 'id' | 'ativo' | 'criadoEm'> & { id?: string }): Corretor {
    return new Corretor({
      id: data.id ?? crypto.randomUUID(),
      ativo: true,
      criadoEm: new Date(),
      ...data,
    })
  }
}
