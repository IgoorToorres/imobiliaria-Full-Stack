# Documentação Técnica — Real Estate Fullstack

---

## Sumário

1. [Visão Geral](#1-visão-geral)
2. [Stack e Justificativas](#2-stack-e-justificativas)
3. [Estrutura de Pastas](#3-estrutura-de-pastas)
4. [Arquitetura DDD](#4-arquitetura-ddd)
5. [Banco de Dados](#5-banco-de-dados)
6. [Camada de Domínio](#6-camada-de-domínio)
7. [Casos de Uso](#7-casos-de-uso)
8. [Camada HTTP](#8-camada-http)
9. [Frontend](#9-frontend)
10. [Autenticação](#10-autenticação)
11. [Testes](#11-testes)
12. [Como Rodar](#12-como-rodar)
13. [Rotas da API](#13-rotas-da-api)
14. [Perfis e Permissões](#14-perfis-e-permissões)

---

## 1. Visão Geral

Sistema imobiliário fullstack para gerenciar imóveis, corretores, clientes e negociações.

**O que faz:**
- CRUD de imóveis com busca e filtros avançados
- 4 perfis de usuário com permissões distintas: Administrador, Gestor, Corretor, Cliente
- Autenticação via Bearer token (sessão UUID), recuperação de senha
- Clientes favoritam imóveis e registram interesse, gerando leads automáticos vinculados ao corretor
- Relatórios de desempenho de corretores

**Cenário real:**
1. Admin cadastra corretores e os vincula a imóveis/clientes
2. Gestores acompanham desempenho e portfólio
3. Corretores cadastram imóveis e gerenciam seus clientes
4. Clientes navegam no catálogo público, favoritam e registram interesse

---

## 2. Stack e Justificativas

### Backend

| Tecnologia | Por que |
|---|---|
| **Node.js 20+ (ESM)** | Padrão moderno (`import/export`), suporte nativo ao Prisma 5 |
| **TypeScript strict** | Elimina bugs em compile-time; `strict: true` ativa null-checks |
| **Fastify** | 30% mais rápido que Express, TypeScript nativo, Pino logger integrado |
| **Zod** | Schema único: valida entrada + gera tipo TypeScript + alimenta Swagger |
| **Prisma 5** | Client 100% tipado, migrations declarativas, Prisma Studio |
| **PostgreSQL 16 (Docker)** | UUID nativo, enums, índices; Docker elimina instalação local |
| **bcryptjs** | Hash lento (10 rounds ≈ 100ms) torna brute-force inviável; versão JS evita problemas de compilação em Alpine/Windows |
| **Vitest** | Nativo a ESM; Jest tem problemas históricos com módulos ES |

### Frontend

| Tecnologia | Por que |
|---|---|
| **React 18 + Vite 6** | HMR instantâneo; CRA/webpack foi depreciado |
| **React Router v6** | API limpa com hooks (`useNavigate`, `useParams`) |
| **TanStack Query v5** | Separa estado de servidor de estado de UI; cache com `staleTime` |
| **Zustand** | Redux tem muito boilerplate; Zustand resolve auth global em ~20 linhas |
| **Axios** | Interceptors: injeta token automaticamente e faz logout em 401 |
| **Tailwind + shadcn/ui** | shadcn copia o código para o projeto (Radix UI + Tailwind), permitindo modificar qualquer componente sem fork |

---

## 3. Estrutura de Pastas

```
projet-rodrigo/
├── src/
│   ├── domain/               # Entidades, interfaces de repositório, erros (zero deps externas)
│   ├── application/          # Casos de uso + ports (hash, email, etc.)
│   │   └── use-cases/        # 21 use cases: auth/, imoveis/, clientes/, corretores/, engajamento/, relatorios/
│   ├── http/                 # Rotas Fastify, plugins, container DI, error handler
│   └── infra/
│       ├── db/               # Prisma client singleton
│       ├── hash/             # BcryptHashAdapter
│       └── repositories/
│           ├── postgresql/   # 10 repositórios com Prisma
│           └── in-memory/    # 10 repositórios com arrays (para testes)
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── tests/
│   ├── unit/                 # 68 testes de casos de uso (in-memory)
│   ├── e2e/                  # Testes de rotas com banco real
│   └── helpers/              # factories.ts, fake-hash.ts
└── frontend/
    └── src/
        ├── app/              # router.tsx (guards), providers.tsx
        ├── components/ui/    # shadcn/ui components
        ├── features/         # Por domínio: api/ + hooks/ (auth, imoveis, clientes…)
        ├── pages/            # LoginPage, ImoveisListPage, ImovelDetailPage…
        ├── store/            # auth.store.ts (Zustand + persist)
        └── lib/              # api.ts (Axios + interceptors)
```

**Regra de dependência:** domínio ← aplicação ← http/infra. O domínio não conhece Prisma, Fastify ou bcrypt.

---

## 4. Arquitetura DDD

```
┌──────────────────────────────────┐
│  HTTP (Fastify) │ Infra (Prisma) │  ← detalhe técnico
├─────────────────┴────────────────┤
│        Application (Use Cases)   │  ← orquestração
├──────────────────────────────────┤
│             Domain               │  ← núcleo do negócio
└──────────────────────────────────┘
```

- **Domain**: entidades com fábricas (`static create()`), interfaces de repositório, erros tipados. Nenhuma dependência externa.
- **Application**: casos de uso recebem repositórios via construtor (injeção de dependência). Não sabe se está sendo chamado por HTTP ou por um job.
- **HTTP**: valida com Zod, chama o use case, mapeia erros para status HTTP.
- **Infra**: implementa as interfaces. Em produção usa PostgreSQL; nos testes usa arrays in-memory.

**Inversão de dependência:**
```
IImovelRepository (interface no domínio)
  ← PostgreSQLImovelRepository (infra)
    ← instanciado em container.ts
      ← injetado nos use cases
```

---

## 5. Banco de Dados

### Enums

| Enum | Valores |
|---|---|
| `PerfilUsuario` | `ADMINISTRADOR`, `GESTOR`, `CORRETOR`, `CLIENTE` |
| `TipoImovel` | `APARTAMENTO`, `CASA`, `COMERCIAL`, `TERRENO`, `RURAL`, `STUDIO`, `COBERTURA` |
| `FinalidadeImovel` | `VENDA`, `LOCACAO`, `VENDA_LOCACAO` |
| `StatusImovel` | `DISPONIVEL` → `RESERVADO` → `VENDIDO`/`LOCADO`/`INATIVO` |
| `StatusInteresse` | `PENDENTE` → `EM_ATENDIMENTO` → `AGENDADO` → `FINALIZADO`/`CANCELADO` |

### Modelos principais

**`Usuario`** — identidade central. UUID (não expõe volume de dados), `senhaHash` (nunca texto plano), `ativo` para soft delete, `@updatedAt` automático.

**`Sessao`** — token UUID com `expiraEm` e `ativa`. Permite logout real (vs JWT que não pode ser invalidado antes de expirar). Guarda IP para auditoria.

**`TokenRecuperacao`** — campo `utilizado` impede reutilização do mesmo link mesmo antes de expirar. Expiração de 2 horas.

**`Cliente` / `Corretor`** — tabelas separadas de `Usuario` (herança por tabela). Evita colunas nulas para perfis que não precisam desses campos. `creci` é `@unique` — reflete regra do negócio real.

**`Imovel`** — 29 campos. Endereço "achatado" como `end_*` (Value Object inline: elimina JOIN em toda query). 6 índices explícitos: `status`, `tipo`, `finalidade`, `endCidade`, `endEstado`, `preco` — usados nos filtros de busca. `endLatitude/endLongitude` preparado para busca geolocalizada futura.

**Relacionamentos N:N:**
- `CorretorImovel`, `CorretorCliente`, `ClienteFavorito` — tabelas de junção com `@@unique` para evitar duplicatas
- `Interesse` — também N:N, mas com estado próprio (`mensagem`, `status`, `criadoEm`). `corretorId` é opcional: herdado automaticamente de `imovel.corretorResponsavelId`

**`onDelete`:**
- `Cascade` para Cliente → apaga seus interesses/favoritos (dados sem dono)
- `SetNull` para Corretor em Interesse → histórico permanece, só perde a referência

---

## 6. Camada de Domínio

### Fábricas de entidade

```typescript
class Imovel {
  private constructor(private props: ImovelProps) {}
  static create(input: CriarImovelInput): Imovel { ... }
}
```

Construtor privado força uso de `Imovel.create()` — garantia de invariantes em tempo de compilação.

### Hierarquia de erros

```
DomainError
├── NotFoundError        → 404
├── UnauthorizedError    → 403
├── ConflictError        → 409
├── BusinessRuleError    → 422
└── InvalidCredentialsError → 401 (mensagem genérica — previne user enumeration)
```

`InvalidCredentialsError` retorna a mesma mensagem para e-mail errado e senha errada. Um atacante não consegue descobrir quais e-mails existem.

---

## 7. Casos de Uso

### Auth

- **`AutenticarUsuarioUseCase`**: busca por email → `bcrypt.compare` → cria Sessao (7 dias) → retorna token
- **`SolicitarRecuperacaoSenhaUseCase`**: cria `TokenRecuperacao` (2h). Se email não existe, retorna sucesso mesmo assim (não vaza existência)
- **`RedefinirSenhaUseCase`**: valida token (não expirado, não usado) → hash nova senha → marca `utilizado = true` → invalida todas as sessões

### Imóveis

- **`CadastrarImovelUseCase`**: apenas ADMIN/GESTOR/CORRETOR. Valida corretor responsável se fornecido
- **`ExcluirImovelUseCase`**: bloqueia exclusão se status for RESERVADO/VENDIDO/LOCADO ou se houver interesses PENDENTE/EM_ATENDIMENTO
- **`PesquisarImoveisUseCase`**: filtros por tipo, finalidade, status, cidade (contains), estado, preçoMin/Max, quartos/banheiros/vagas (mínimo), ordenação

### Clientes

- **`CadastrarClienteUseCase`**: único use case público. Cria `Usuario` + `Cliente` atomicamente
- **`AdicionarFavoritoUseCase`**: verifica duplicata antes de inserir para retornar `ConflictError` amigável

### Relatórios

- **`RelatorioDesempenhoCorretorUseCase`**: por corretor — total de imóveis, interesses por status, total de clientes. Útil para identificar corretores sobrecarregados ou com alta taxa de finalização

---

## 8. Camada HTTP

### Container de DI (`container.ts`)

DI manual: sem `inversify`. Mais transparente para o tamanho do projeto. Container é uma **função** (não singleton) para que os testes E2E possam criar instâncias limpas.

### Plugin `authenticate`

`preHandler` em rotas protegidas: extrai Bearer token → busca sessão → `sessao.estaValida()` → injeta `request.usuario`. Augmentation de tipo em `types.ts` garante que `request.usuario` seja tipado.

### Error handler global

```
ZodError        → 400  (campo a campo)
InvalidCredentials → 401
Unauthorized    → 403
NotFound        → 404
Conflict        → 409
BusinessRule    → 422
Inesperado      → 500 (mensagem genérica, stack trace só no log interno)
```

Centralizar elimina try/catch em cada rota.

### Zod no response schema

Garante que o Fastify serialize **apenas** os campos declarados — se um use case retornar `senhaHash` por engano, ele é filtrado antes de chegar ao cliente.

---

## 9. Frontend

### Guards de rota

```typescript
// PrivateRoute: redireciona para /login se não autenticado
// AdminGestorRoute: redireciona para /dashboard se perfil insuficiente
// Navigate usa replace: "voltar" no browser não retorna à rota protegida
```

### Zustand auth store

Guarda `token`, `usuario`, `clienteId`, `corretorId`. Middleware `persist` salva no `localStorage` — recarregar a página não faz logout. `clienteId`/`corretorId` evitam buscas extras ao chamar rotas como `GET /clientes/:id/favoritos`.

### Axios interceptors

1. **Request**: lê token do `localStorage` e injeta `Authorization: Bearer {token}` em todas as chamadas
2. **Response**: `401` → chama `signOut()` e redireciona para `/login`

Lê o `localStorage` diretamente (em vez do store) para evitar dependência circular.

### TanStack Query

`queryKey: ['imoveis', filtros]` — mudar filtros invalida o cache automaticamente. `staleTime: 5min` evita refetches desnecessários ao navegar.

---

## 10. Autenticação

### Login
```
POST /auth/login → bcrypt.compare → cria Sessao → retorna token
Frontend → Zustand.signIn() → localStorage atualizado
Próximas requests → Axios injeta Authorization: Bearer {token}
Backend → busca Sessao → sessao.estaValida() → injeta request.usuario
```

### Recuperação de senha
```
POST /auth/recuperar-senha → cria TokenRecuperacao (UUID, 2h)
POST /auth/redefinir-senha → valida token → hash nova senha → utilizado=true → invalida sessões
```

### Logout
```
DELETE /auth/logout → sessao.ativa = false no banco → 204
```

---

## 11. Testes

### Unitários (`tests/unit/`)
- Testam os **casos de uso** com repositórios in-memory (sem banco, sem HTTP)
- Convenção: `"deve [resultado] quando [condição]"`
- `beforeEach` reseta o estado dos repositórios

### E2E (`tests/e2e/`)
- Testam rotas completas (request → validação → use case → banco → response)
- `cleanDb()` limpa tabelas antes de cada suite
- `loginAs(app, email, senha)` retorna token Bearer para testes autenticados

### Helpers

**`factories.ts`**: `makeUsuario({ perfil: 'ADMIN' })` com e-mail UUID aleatório evita colisão entre testes.

**`FakeHash`**:
```typescript
hash(plain) → `hashed:${plain}`
compare(plain, hashed) → hashed === `hashed:${plain}`
```
Comportamento real sem custo do bcrypt (~100ms/hash × 68 testes = 7s economizados).

---

## 12. Como Rodar

### Pré-requisitos
```bash
node --version   # v20+
docker --version # 24+
docker compose version # v2+
```

### Backend

```bash
# 1. Instalar dependências
npm install

# 2. Configurar ambiente
cp .env.example .env
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/projet-imobiliaria"

# 3. Subir o PostgreSQL
npm run db:up
# Aguarde ~5s para o banco inicializar

# 4. Gerar o Prisma Client (tipado a partir do schema)
npm run prisma:generate

# 5. Criar as tabelas
npm run prisma:migrate

# 6. Popular com dados de exemplo (recomendado)
npx prisma db seed

# 7. Iniciar o servidor
npm run dev
# API:     http://localhost:3000
# Swagger: http://localhost:3000/docs
```

### Frontend

```bash
# Em outro terminal
cd frontend

npm install

cp .env.example .env
# VITE_API_URL=http://localhost:3000
# (prefixo VITE_ obrigatório para Vite expor a variável ao browser)

npm run dev
# http://localhost:5173
```

### Testes

```bash
npm test             # unitários (in-memory, rápidos)
npm run test:ui      # interface visual
npm run test:coverage
npm run test:e2e     # requer banco rodando
```

### Prisma útil

```bash
npx prisma studio                          # interface visual do banco
npx prisma migrate dev --name descricao    # nova migration após alterar schema
npx prisma migrate reset                   # reseta banco + re-seed
```

### Parar

```bash
Ctrl+C               # para o servidor Node.js
npm run db:down      # para o PostgreSQL
docker compose down -v  # para + apaga dados (irreversível)
```

---

## 13. Rotas da API

### Auth
| Método | Rota | Acesso |
|---|---|---|
| POST | `/auth/login` | Público |
| POST | `/auth/recuperar-senha` | Público |
| POST | `/auth/redefinir-senha` | Público |
| DELETE | `/auth/logout` | Autenticado |

### Imóveis
| Método | Rota | Acesso |
|---|---|---|
| GET | `/imoveis` | Público |
| GET | `/imoveis/:id` | Público |
| POST | `/imoveis` | Admin, Gestor, Corretor |
| PATCH | `/imoveis/:id` | Admin, Gestor, Corretor |
| DELETE | `/imoveis/:id` | Admin, Gestor, Corretor |

**Query params de busca:** `tipo`, `finalidade`, `status`, `cidade`, `estado`, `precoMin`, `precoMax`, `quartos`, `banheiros`, `vagas`, `ordem` (preco/criadoEm/dataConstrucao), `direcao` (asc/desc)

### Clientes
| Método | Rota | Acesso |
|---|---|---|
| POST | `/clientes` | Público |
| PATCH | `/clientes/:id` | Autenticado |
| DELETE | `/clientes/:id` | Admin, Gestor |
| GET | `/clientes/:id/favoritos` | Autenticado |
| POST | `/clientes/:id/favoritos` | Autenticado |
| DELETE | `/clientes/:id/favoritos/:imovelId` | Autenticado |
| GET | `/clientes/:id/interesses` | Autenticado |

### Corretores
| Método | Rota | Acesso |
|---|---|---|
| POST | `/corretores` | Admin |
| POST | `/corretores/:id/imoveis` | Admin, Gestor, Corretor |
| POST | `/corretores/:id/clientes` | Admin, Gestor, Corretor |

### Outros
| Método | Rota | Acesso |
|---|---|---|
| POST | `/interesses` | Autenticado |
| GET | `/relatorios/imoveis-marcados/:corretorId` | Admin, Gestor, Corretor |
| GET | `/relatorios/desempenho-corretores` | Admin, Gestor |
| GET | `/health` | Público |

---

## 14. Perfis e Permissões

| Ação | Admin | Gestor | Corretor | Cliente |
|------|:---:|:---:|:---:|:---:|
| Cadastrar corretor | ✅ | ❌ | ❌ | ❌ |
| CRUD imóveis | ✅ | ✅ | ✅ | ❌ |
| Editar qualquer cliente | ✅ | ✅ | ❌ | ❌ |
| Editar próprio perfil | ✅ | ✅ | ✅ | ✅ |
| Excluir cliente | ✅ | ✅ | ❌ | ❌ |
| Vincular corretor-imóvel/cliente | ✅ | ✅ | ✅ | ❌ |
| Relatório de desempenho geral | ✅ | ✅ | ❌ | ❌ |
| Relatório próprio | ✅ | ✅ | ✅ | ❌ |
| Favoritos e interesses | ✅ | ✅ | ✅ | ✅ |
| Auto-cadastro | — | — | — | ✅ |

### Dados de seed (após `npx prisma db seed`)

| Perfil | E-mail | Senha |
|---|---|---|
| Admin | admin@imobiliaria.com | senha123 |
| Gestor | fernanda@imobiliaria.com | senha123 |
| Gestor | ricardo@imobiliaria.com | senha123 |
| Corretor | carlos@imobiliaria.com | senha123 |
| Corretor | ana.paula@imobiliaria.com | senha123 |
| Corretor | marcelo@imobiliaria.com | senha123 |
| Cliente | maria@email.com | senha123 |
| Cliente | joao@email.com | senha123 |
| + 8 clientes | ... | senha123 |

20 imóveis (SP, RJ, MG, SC), 15 favoritos, 8 interesses com status variados.
