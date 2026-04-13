import { prisma } from '../infra/db/prisma.js'
import { BcryptHashAdapter } from '../infra/hash/bcrypt-hash.adapter.js'

import { PgUsuarioRepository } from '../infra/repositories/postgresql/pg-usuario.repository.js'
import { PgSessaoRepository } from '../infra/repositories/postgresql/pg-sessao.repository.js'
import { PgTokenRecuperacaoRepository } from '../infra/repositories/postgresql/pg-token-recuperacao.repository.js'
import { PgClienteRepository } from '../infra/repositories/postgresql/pg-cliente.repository.js'
import { PgCorretorRepository } from '../infra/repositories/postgresql/pg-corretor.repository.js'
import { PgImovelRepository } from '../infra/repositories/postgresql/pg-imovel.repository.js'
import { PgInteresseRepository } from '../infra/repositories/postgresql/pg-interesse.repository.js'
import { PgClienteFavoritoRepository } from '../infra/repositories/postgresql/pg-cliente-favorito.repository.js'
import { PgCorretorImovelRepository } from '../infra/repositories/postgresql/pg-corretor-imovel.repository.js'
import { PgCorretorClienteRepository } from '../infra/repositories/postgresql/pg-corretor-cliente.repository.js'

import { AutenticarUsuarioUseCase } from '../application/use-cases/auth/autenticar-usuario.usecase.js'
import {
  SolicitarRecuperacaoSenhaUseCase,
  RedefinirSenhaUseCase,
} from '../application/use-cases/auth/recuperar-senha.usecase.js'

import { CadastrarImovelUseCase } from '../application/use-cases/imoveis/cadastrar-imovel.usecase.js'
import { EditarImovelUseCase } from '../application/use-cases/imoveis/editar-imovel.usecase.js'
import { ExcluirImovelUseCase } from '../application/use-cases/imoveis/excluir-imovel.usecase.js'
import { VisualizarImovelUseCase } from '../application/use-cases/imoveis/visualizar-imovel.usecase.js'
import { PesquisarImoveisUseCase } from '../application/use-cases/imoveis/pesquisar-imoveis.usecase.js'

import { CadastrarClienteUseCase } from '../application/use-cases/clientes/cadastrar-cliente.usecase.js'
import { EditarClienteUseCase } from '../application/use-cases/clientes/editar-cliente.usecase.js'
import { ExcluirClienteUseCase } from '../application/use-cases/clientes/excluir-cliente.usecase.js'
import {
  AdicionarFavoritoUseCase,
  RemoverFavoritoUseCase,
  ListarFavoritosUseCase,
} from '../application/use-cases/clientes/manter-favoritos.usecase.js'

import { CadastrarCorretorUseCase } from '../application/use-cases/corretores/cadastrar-corretor.usecase.js'
import { VincularCorretorImovelUseCase } from '../application/use-cases/corretores/vincular-corretor-imovel.usecase.js'
import { VincularCorretorClienteUseCase } from '../application/use-cases/corretores/vincular-corretor-cliente.usecase.js'

import {
  RegistrarInteresseUseCase,
  HistoricoInteressesUseCase,
} from '../application/use-cases/engajamento/registrar-interesse.usecase.js'

import { RelatorioImoveisMarcadosUseCase } from '../application/use-cases/relatorios/relatorio-imoveis-marcados.usecase.js'
import { RelatorioDesempenhoCorretorUseCase } from '../application/use-cases/relatorios/relatorio-desempenho-corretor.usecase.js'

export function buildContainer() {
  // ─── Infra ────────────────────────────────────────────────────────────────
  const hash = new BcryptHashAdapter()

  const usuarioRepo = new PgUsuarioRepository(prisma)
  const sessaoRepo = new PgSessaoRepository(prisma)
  const tokenRecuperacaoRepo = new PgTokenRecuperacaoRepository(prisma)
  const clienteRepo = new PgClienteRepository(prisma)
  const corretorRepo = new PgCorretorRepository(prisma)
  const imovelRepo = new PgImovelRepository(prisma)
  const interesseRepo = new PgInteresseRepository(prisma)
  const clienteFavoritoRepo = new PgClienteFavoritoRepository(prisma)
  const corretorImovelRepo = new PgCorretorImovelRepository(prisma)
  const corretorClienteRepo = new PgCorretorClienteRepository(prisma)

  // ─── Use Cases ───────────────────────────────────────────────────────────
  return {
    // Repositórios expostos para uso direto na camada HTTP (sessão/autenticação)
    sessaoRepo,
    usuarioRepo,

    // Auth
    autenticarUsuario: new AutenticarUsuarioUseCase(usuarioRepo, sessaoRepo, hash),
    solicitarRecuperacaoSenha: new SolicitarRecuperacaoSenhaUseCase(usuarioRepo, tokenRecuperacaoRepo),
    redefinirSenha: new RedefinirSenhaUseCase(usuarioRepo, tokenRecuperacaoRepo, hash),

    // Imóveis
    cadastrarImovel: new CadastrarImovelUseCase(imovelRepo, corretorRepo),
    editarImovel: new EditarImovelUseCase(imovelRepo),
    excluirImovel: new ExcluirImovelUseCase(imovelRepo, interesseRepo),
    visualizarImovel: new VisualizarImovelUseCase(imovelRepo, clienteFavoritoRepo),
    pesquisarImoveis: new PesquisarImoveisUseCase(imovelRepo),

    // Clientes
    cadastrarCliente: new CadastrarClienteUseCase(usuarioRepo, clienteRepo, hash),
    editarCliente: new EditarClienteUseCase(usuarioRepo, clienteRepo),
    excluirCliente: new ExcluirClienteUseCase(clienteRepo, usuarioRepo, interesseRepo),
    adicionarFavorito: new AdicionarFavoritoUseCase(clienteRepo, imovelRepo, clienteFavoritoRepo),
    removerFavorito: new RemoverFavoritoUseCase(clienteFavoritoRepo),
    listarFavoritos: new ListarFavoritosUseCase(clienteFavoritoRepo),

    // Corretores
    cadastrarCorretor: new CadastrarCorretorUseCase(usuarioRepo, corretorRepo, hash),
    vincularCorretorImovel: new VincularCorretorImovelUseCase(corretorRepo, imovelRepo, corretorImovelRepo),
    vincularCorretorCliente: new VincularCorretorClienteUseCase(corretorRepo, clienteRepo, corretorClienteRepo),

    // Engajamento
    registrarInteresse: new RegistrarInteresseUseCase(interesseRepo, clienteRepo, imovelRepo),
    historicoInteresses: new HistoricoInteressesUseCase(interesseRepo),

    // Relatórios
    relatorioImoveisMarcados: new RelatorioImoveisMarcadosUseCase(
      corretorRepo,
      imovelRepo,
      clienteFavoritoRepo,
      interesseRepo,
    ),
    relatorioDesempenhoCorretor: new RelatorioDesempenhoCorretorUseCase(
      corretorRepo,
      usuarioRepo,
      corretorImovelRepo,
      corretorClienteRepo,
      interesseRepo,
      imovelRepo,
    ),
  }
}

export type Container = ReturnType<typeof buildContainer>
