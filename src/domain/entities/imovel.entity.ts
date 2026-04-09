export type TipoImovel =
  | 'APARTAMENTO'
  | 'CASA'
  | 'COMERCIAL'
  | 'TERRENO'
  | 'RURAL'
  | 'STUDIO'
  | 'COBERTURA'

export type FinalidadeImovel = 'VENDA' | 'LOCACAO' | 'VENDA_LOCACAO'

export type StatusImovel = 'DISPONIVEL' | 'RESERVADO' | 'VENDIDO' | 'LOCADO' | 'INATIVO'

export interface EnderecoImovelVO {
  cep: string
  logradouro: string
  numero: string
  complemento?: string
  bairro: string
  cidade: string
  estado: string
  latitude?: number
  longitude?: number
}

export interface ImovelProps {
  id: string
  titulo: string
  tipo: TipoImovel
  finalidade: FinalidadeImovel
  descricao?: string
  areaTotal?: number
  areaUtil?: number
  quartos: number
  banheiros: number
  vagas: number
  preco: number
  status: StatusImovel
  endereco: EnderecoImovelVO
  corretorResponsavelId?: string
  dataConstrucao?: Date
  criadoEm: Date
  atualizadoEm: Date
}

export class Imovel {
  readonly id: string
  titulo: string
  tipo: TipoImovel
  finalidade: FinalidadeImovel
  descricao?: string
  areaTotal?: number
  areaUtil?: number
  quartos: number
  banheiros: number
  vagas: number
  preco: number
  status: StatusImovel
  endereco: EnderecoImovelVO
  corretorResponsavelId?: string
  dataConstrucao?: Date
  criadoEm: Date
  atualizadoEm: Date

  constructor(props: ImovelProps) {
    this.id = props.id
    this.titulo = props.titulo
    this.tipo = props.tipo
    this.finalidade = props.finalidade
    this.descricao = props.descricao
    this.areaTotal = props.areaTotal
    this.areaUtil = props.areaUtil
    this.quartos = props.quartos
    this.banheiros = props.banheiros
    this.vagas = props.vagas
    this.preco = props.preco
    this.status = props.status
    this.endereco = props.endereco
    this.corretorResponsavelId = props.corretorResponsavelId
    this.dataConstrucao = props.dataConstrucao
    this.criadoEm = props.criadoEm
    this.atualizadoEm = props.atualizadoEm
  }

  static create(
    data: Omit<ImovelProps, 'id' | 'status' | 'criadoEm' | 'atualizadoEm'> & { id?: string },
  ): Imovel {
    const now = new Date()
    return new Imovel({
      id: data.id ?? crypto.randomUUID(),
      status: 'DISPONIVEL',
      criadoEm: now,
      atualizadoEm: now,
      ...data,
    })
  }

  temStatusAtivo(): boolean {
    return ['RESERVADO', 'VENDIDO', 'LOCADO'].includes(this.status)
  }
}
