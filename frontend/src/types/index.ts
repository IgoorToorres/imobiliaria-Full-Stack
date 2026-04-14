// ─── Enums ────────────────────────────────────────────────────────────────────

export type PerfilUsuario = 'ADMINISTRADOR' | 'GESTOR' | 'CORRETOR' | 'CLIENTE'

export type TipoImovel =
  | 'APARTAMENTO'
  | 'CASA'
  | 'COMERCIAL'
  | 'TERRENO'
  | 'RURAL'
  | 'STUDIO'
  | 'COBERTURA'

export type FinalidadeImovel = 'VENDA' | 'LOCACAO' | 'VENDA_LOCACAO'

export type StatusImovel =
  | 'DISPONIVEL'
  | 'RESERVADO'
  | 'VENDIDO'
  | 'LOCADO'
  | 'INATIVO'

export type StatusInteresse =
  | 'PENDENTE'
  | 'EM_ATENDIMENTO'
  | 'AGENDADO'
  | 'FINALIZADO'
  | 'CANCELADO'

// ─── Entidades ────────────────────────────────────────────────────────────────

export interface Usuario {
  id: string
  nome: string
  email: string
  perfil: PerfilUsuario
}

export interface EnderecoImovel {
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

export interface Imovel {
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
  endereco: EnderecoImovel
  corretorResponsavelId?: string
  dataConstrucao?: string
  criadoEm: string
  atualizadoEm: string
}

export interface Cliente {
  id: string
  usuarioId: string
  dataNascimento?: string
  profissao?: string
  criadoEm: string
}

export interface Corretor {
  id: string
  usuarioId: string
  creci: string
  bio?: string
  fotoUrl?: string
  ativo: boolean
  criadoEm: string
}

export interface Interesse {
  id: string
  clienteId: string
  imovelId: string
  corretorId?: string
  mensagem?: string
  status: StatusInteresse
  criadoEm: string
  atualizadoEm: string
}

export interface ClienteFavorito {
  id: string
  clienteId: string
  imovelId: string
  criadoEm: string
}

// ─── Request Bodies ───────────────────────────────────────────────────────────

export interface LoginInput {
  email: string
  senha: string
}

export interface RecuperarSenhaInput {
  email: string
}

export interface RedefinirSenhaInput {
  token: string
  novaSenha: string
}

export interface CadastrarClienteInput {
  nome: string
  email: string
  senha: string
  telefone?: string
  cpf?: string
  dataNascimento?: string
  profissao?: string
}

export interface EditarClienteInput {
  nome?: string
  telefone?: string
  dataNascimento?: string
  profissao?: string
}

export interface CadastrarCorretorInput {
  nome: string
  email: string
  senha: string
  telefone?: string
  cpf?: string
  creci: string
  bio?: string
}

export interface CadastrarImovelInput {
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
  endereco: EnderecoImovel
  corretorResponsavelId?: string
  dataConstrucao?: string
}

export interface EditarImovelInput extends Partial<CadastrarImovelInput> {
  status?: StatusImovel
}

export interface FiltrosImovel {
  tipo?: TipoImovel
  finalidade?: FinalidadeImovel
  status?: StatusImovel
  cidade?: string
  estado?: string
  bairro?: string
  precoMin?: number
  precoMax?: number
  areaMin?: number
  quartos?: number
  banheiros?: number
  vagas?: number
  ordenarPor?: 'preco' | 'criadoEm' | 'dataConstrucao'
  ordem?: 'asc' | 'desc'
}

export interface RegistrarInteresseInput {
  clienteId: string
  imovelId: string
  mensagem?: string
}

// ─── Responses ────────────────────────────────────────────────────────────────

export interface LoginResponse {
  token: string
  usuario: Usuario
}

export interface PesquisarImoveisResponse {
  imoveis: Imovel[]
  total: number
}

export interface VisualizarImovelResponse {
  imovel: Imovel
  totalFavoritos: number
}

export interface RelatorioImovelMarcado {
  imovelId: string
  titulo: string
  status: StatusImovel
  totalFavoritos: number
  totalInteresses: number
}

export interface RelatorioDesempenhoCorretor {
  corretorId: string
  corretorNome: string
  creci: string
  totalImoveisVinculados: number
  totalClientesAtendidos: number
  totalInteressesRecebidos: number
  totalConversoes: number
  totalFechamentos: number
}
