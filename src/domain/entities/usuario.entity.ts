export type PerfilUsuario = 'ADMINISTRADOR' | 'GESTOR' | 'CORRETOR' | 'CLIENTE'

export interface UsuarioProps {
  id: string
  nome: string
  email: string
  senhaHash: string
  telefone?: string
  cpf?: string
  perfil: PerfilUsuario
  ativo: boolean
  criadoEm: Date
  atualizadoEm: Date
}

export class Usuario {
  readonly id: string
  nome: string
  email: string
  senhaHash: string
  telefone?: string
  cpf?: string
  perfil: PerfilUsuario
  ativo: boolean
  criadoEm: Date
  atualizadoEm: Date

  constructor(props: UsuarioProps) {
    this.id = props.id
    this.nome = props.nome
    this.email = props.email
    this.senhaHash = props.senhaHash
    this.telefone = props.telefone
    this.cpf = props.cpf
    this.perfil = props.perfil
    this.ativo = props.ativo
    this.criadoEm = props.criadoEm
    this.atualizadoEm = props.atualizadoEm
  }

  static create(data: Omit<UsuarioProps, 'id' | 'criadoEm' | 'atualizadoEm'> & { id?: string }): Usuario {
    const now = new Date()
    return new Usuario({
      id: data.id ?? crypto.randomUUID(),
      criadoEm: now,
      atualizadoEm: now,
      ativo: data.ativo ?? true,
      ...data,
    })
  }
}
