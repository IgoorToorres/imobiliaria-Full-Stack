# Real Estate API

API REST para gestão imobiliária. A aplicação cobre autenticação, gestão de imóveis, clientes, corretores, interesses e relatórios gerenciais. Foi construída com Node.js + Fastify e segue uma arquitetura em camadas inspirada em Domain-Driven Design (DDD).

---

## Visão geral

**O que é**
- Backend de um sistema imobiliário: cadastro de imóveis, clientes, corretores e registro de interesses.
- Autenticação via token (Bearer) e endpoints públicos/privados.
- Relatórios de desempenho e de imóveis marcados.

**O que contém**
- Rotas HTTP completas (REST)
- Regras de negócio no domínio
- Casos de uso isolados na camada application
- Repositórios in-memory (usados nos testes)
- Documentação Swagger/OpenAPI

---

## Tecnologias usadas

- **Node.js** (ESM)
- **TypeScript** (strict)
- **Fastify** (HTTP)
- **Zod** (validação)
- **Prisma** (modelagem/cliente)
- **Vitest** (testes)
- **Swagger/OpenAPI** (documentação)

---

## Estrutura do projeto (DDD em camadas)

```
src/
├── domain/                        # Núcleo do negócio — sem dependências externas
│   ├── entities/                  # Entidades e Value Objects
│   ├── repositories/              # Interfaces (contratos) dos repositórios
│   └── errors/                    # Erros de domínio tipados
│
├── application/                   # Casos de uso — orquestra o domínio
│   ├── ports/                     # Interfaces para serviços externos (hash, email...)
│   └── use-cases/                 # Casos de uso por contexto
│       ├── auth/                  # Autenticação, recuperação de senha
│       ├── imoveis/               # CRUD + pesquisa
│       ├── clientes/              # Cadastro, edição, favoritos
│       ├── corretores/            # Cadastro e vínculos
│       ├── engajamento/           # Interesses + histórico
│       └── relatorios/            # Relatórios gerenciais
│
├── http/                          # Camada HTTP (Fastify)
│   ├── routes/                    # Rotas
│   ├── plugins/                   # Plugins (auth, swagger)
│   └── errors/                    # Handler global de erros
│
└── infra/
    └── repositories/
        └── in-memory/             # Implementações em memória (testes)

prisma/                            # Schema Prisma (DB)

tests/                             # Testes unitários
```

---

## Decisões de arquitetura

- **DDD em camadas**: o domínio não depende do HTTP nem de banco.
- **Casos de uso explícitos**: cada funcionalidade é uma classe de aplicação.
- **Fastify + Zod**: validação de entrada e performance no HTTP.
- **Swagger**: documentação e teste visual das rotas.
- **Sessão por token UUID** (não JWT) no MVP, para simplificar.

---

## Requisitos

- **Node.js** 20+ (recomendado LTS)
- **npm**
- **Docker** (opcional, para subir o banco)

---

## Como rodar o projeto (passo a passo)

### 1. Clonar o repositório
```
git clone <URL_DO_REPO>
cd projet-imobiliaria
```

### 2. Instalar dependências
```
npm install
```

### 3. (Opcional) Subir banco PostgreSQL via Docker
Se quiser usar o banco local:
```
npm run db:up
```

### 4. (Opcional) Rodar migrations do Prisma
```
npm run prisma:generate
npm run prisma:migrate
```

### 5. Rodar o servidor em modo desenvolvimento
```
npm run dev
```

A aplicação inicia em `http://localhost:3000`.

---

## Documentação Swagger

A UI do Swagger fica em:

- `GET /docs`

Para ajustar a URL base exibida no Swagger, defina:

- `SWAGGER_SERVER_URL`

---

## Rotas principais

### Auth
- `POST /auth/login`
- `POST /auth/recuperar-senha`
- `POST /auth/redefinir-senha`
- `DELETE /auth/logout`

### Imóveis
- `GET /imoveis`
- `GET /imoveis/:id`
- `POST /imoveis`
- `PATCH /imoveis/:id`
- `DELETE /imoveis/:id`

### Clientes
- `POST /clientes`
- `PATCH /clientes/:id`
- `DELETE /clientes/:id`
- `GET /clientes/:id/favoritos`
- `POST /clientes/:id/favoritos`
- `DELETE /clientes/:id/favoritos/:imovelId`
- `GET /clientes/:id/interesses`

### Corretores
- `POST /corretores`
- `POST /corretores/:id/imoveis`
- `POST /corretores/:id/clientes`

### Interesses
- `POST /interesses`

### Relatórios
- `GET /relatorios/imoveis-marcados/:corretorId`
- `GET /relatorios/desempenho-corretores`

### Health check
- `GET /health`

---

## Perfis de acesso

- **ADMINISTRADOR**: acesso total
- **GESTOR**: CRUD de imóveis, relatórios, vínculos
- **CORRETOR**: cadastrar/editar imóveis, vínculo, relatório próprio
- **CLIENTE**: auto-cadastro, favoritos, registrar interesse

---

## Testes

Rodar testes unitários:
```
npm test
```

Rodar testes E2E:
```
npm run test:e2e
```

