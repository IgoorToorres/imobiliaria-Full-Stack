# Real Estate API

API REST para sistema imobiliário desenvolvida com Node.js, Fastify e PostgreSQL, seguindo os princípios de **Domain-Driven Design (DDD)**.

---

## Status do projeto

| Camada | Status |
|---|---|
| Domain (entidades + repositórios) | Completo |
| Application (casos de uso) | Completo |
| Infra in-memory (para testes) | Completo |
| Testes unitários | 68 testes, 15 suítes — todos passando |
| Controllers HTTP (Fastify) | Pendente |
| Repositórios PostgreSQL | Pendente |
| Autenticação JWT/sessão no middleware | Pendente |

---

## Stack

- **Runtime:** Node.js (ESM)
- **Framework HTTP:** Fastify _(integração futura)_
- **Banco de dados:** PostgreSQL _(integração futura)_
- **Testes:** Vitest
- **Linguagem:** TypeScript (strict)
- **Arquitetura:** DDD com separação em camadas

---

## Arquitetura

```
src/
├── domain/                        # Núcleo do negócio — sem dependências externas
│   ├── entities/                  # Entidades e Value Objects
│   ├── repositories/              # Interfaces (contratos) dos repositórios
│   └── errors/                    # Erros de domínio tipados
│
├── application/                   # Casos de uso — orquestra o domínio
│   ├── ports/                     # Interfaces para serviços externos (hash, email...)
│   └── use-cases/
│       ├── auth/                  # UC01 – Autenticar, UC02 – Recuperar senha
│       ├── imoveis/               # UC03–UC06, UC12 – CRUD + pesquisa
│       ├── clientes/              # UC07, UC08 – Cadastro, edição, exclusão, favoritos
│       ├── corretores/            # UC09, UC10, UC11 – Cadastro e vínculos
│       ├── engajamento/           # UC13 – Registrar interesse + histórico
│       └── relatorios/            # UC14 – Imóveis marcados, UC15 – Desempenho
│
└── infra/
    └── repositories/
        └── in-memory/             # Implementações em memória usadas nos testes unitários

tests/
├── helpers/                       # FakeHash + factories de entidades
└── use-cases/                     # Testes unitários por caso de uso
```

---

## Casos de uso implementados

### Autenticação
| UC | Descrição |
|---|---|
| UC01 | Autenticar usuário com e-mail e senha, criando sessão |
| UC02 | Solicitar e usar token de recuperação de senha |

### Imóveis
| UC | Descrição |
|---|---|
| UC03 | Cadastrar imóvel (restrito a ADMINISTRADOR, GESTOR, CORRETOR) |
| UC04 | Editar imóvel |
| UC05 | Excluir imóvel (bloqueado se status ativo ou com interesses) |
| UC06 | Visualizar ficha detalhada com contador de favoritos |
| UC12 | Pesquisar com filtros: tipo, finalidade, preço, quartos, cidade, etc. |

### Clientes
| UC | Descrição |
|---|---|
| UC07 | Cadastrar cliente (cria usuário + perfil cliente) |
| — | Editar dados do cliente |
| RF023 | Excluir cliente (bloqueado se houver interesses ativos) |
| UC08 | Adicionar, remover e listar imóveis favoritos |

### Corretores
| UC | Descrição |
|---|---|
| UC09 | Cadastrar corretor (restrito a ADMINISTRADOR) |
| UC10 | Vincular corretor a imóvel |
| UC11 | Vincular corretor a cliente |

### Engajamento
| UC | Descrição |
|---|---|
| UC13 | Registrar interesse do cliente em imóvel (com histórico) |

### Relatórios
| UC | Descrição |
|---|---|
| UC14 | Relatório de imóveis marcados (favoritos + interesses por imóvel) |
| UC15 | Relatório de desempenho de corretores (restrito a ADMINISTRADOR/GESTOR) |

---

## Perfis de acesso

| Perfil | Permissões principais |
|---|---|
| ADMINISTRADOR | Acesso total |
| GESTOR | CRUD de imóveis, relatórios, vínculos |
| CORRETOR | Cadastrar/editar imóveis, vincular, relatório próprio |
| CLIENTE | Cadastro próprio, favoritos, registrar interesse |

---

## Swagger / OpenAPI

A documentação interativa está disponível em:

- `GET /docs`

Para ajustar a URL base exibida na UI, defina a variável de ambiente `SWAGGER_SERVER_URL`.

---

## Rodando os testes

```bash
npm install
npm test
```

Saída esperada:
```
Test Files  15 passed (15)
     Tests  68 passed (68)
```

---

## O que foi deixado para fora do MVP (intencional)

- **Envio de e-mail/SMS** para recuperação de senha (UC02 retorna o token diretamente)
- **Upload de mídias** — tabela `midia_imovel` modelada no banco mas sem endpoint no MVP
- **JWT** — sessões controladas por token UUID simples (sem assinar/verificar JWT ainda)
- **Middleware HTTP de autenticação** — `perfilExecutor` passado explicitamente nos use cases até a camada HTTP existir
- **Paginação** nas listagens
- **Log de transações** (`log_transacao`) — tabela existe no banco, integração futura

---

## Próximos passos

1. Implementar controllers Fastify com validação de schema (Zod)
2. Implementar repositórios PostgreSQL (com Drizzle ou `pg` direto)
3. Implementar `HashPort` com `bcrypt`
4. Middleware de autenticação que valida a sessão e injeta perfil/ids no request
5. Testes E2E com banco real (Vitest + Docker)
