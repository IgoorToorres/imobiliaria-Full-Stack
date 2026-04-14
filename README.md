# Real Estate — Fullstack

Sistema imobiliário completo com backend em Node.js/Fastify e frontend em React. Cobre autenticação, gestão de imóveis, clientes, corretores, interesses e relatórios gerenciais.

---

## Visão geral

**Backend**
- API REST com Node.js + Fastify, arquitetura DDD em camadas
- Autenticação via Bearer token (sessão UUID), perfis de acesso
- CRUD de imóveis, clientes, corretores, favoritos, interesses
- Relatórios de desempenho e imóveis marcados
- Documentação Swagger/OpenAPI em `/docs`

**Frontend**
- SPA em React + Vite consumindo a API do backend
- Listagem pública de imóveis com filtros e página de detalhes
- Dashboard por perfil (Admin, Gestor, Corretor, Cliente)
- Autenticação completa: login, cadastro, recuperação de senha
- Gerenciamento de estado com Zustand e cache de dados com TanStack Query

---

## Tecnologias

### Backend
- **Node.js** (ESM) + **TypeScript** (strict)
- **Fastify** — HTTP server
- **Zod** — validação de entrada
- **Prisma** — ORM + migrations
- **PostgreSQL** — banco de dados
- **bcryptjs** — hash de senha
- **Vitest** — testes unitários
- **Swagger/OpenAPI** — documentação

### Frontend
- **React 18** + **TypeScript**
- **Vite** — bundler e dev server
- **React Router v6** — roteamento client-side
- **TanStack Query v5** — cache e sincronização de dados
- **shadcn/ui** + **Tailwind CSS** — componentes e estilo
- **Zustand** — gerenciamento de estado de autenticação
- **Axios** — cliente HTTP

---

## Estrutura do projeto

```
projet-rodrigo/
│
├── src/                           # Backend
│   ├── domain/                    # Núcleo — entidades, repositórios, erros
│   ├── application/               # Casos de uso por contexto
│   ├── http/                      # Rotas, plugins, handler de erros
│   └── infra/                     # Repositórios in-memory e PostgreSQL
│
├── prisma/                        # Schema, migrations e seed
├── tests/                         # Testes unitários
│
└── frontend/                      # Frontend
    └── src/
        ├── app/                   # Router + Providers (QueryClient)
        ├── components/
        │   ├── ui/                # Componentes shadcn/ui
        │   └── layout/            # Layout compartilhado (header, nav)
        ├── features/              # Por domínio: api/ + hooks/
        │   ├── auth/
        │   ├── imoveis/
        │   ├── clientes/
        │   ├── corretores/
        │   ├── interesses/
        │   └── relatorios/
        ├── pages/                 # Páginas da aplicação
        ├── store/                 # Estado global (auth)
        ├── types/                 # Tipos TypeScript alinhados com o backend
        └── lib/                   # Utilitários (api.ts, utils.ts)
```

---

## Requisitos

- **Node.js** 20+ (LTS recomendado)
- **npm**
- **Docker** (para o banco PostgreSQL)

---

## Backend — Como rodar

### 1. Clonar o repositório
```bash
git clone <URL_DO_REPO>
cd projet-rodrigo
```

### 2. Instalar dependências
```bash
npm install
```

### 3. Configurar variáveis de ambiente
```bash
cp .env.example .env
```

Edite o `.env` conforme necessário:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/projet_rodrigo"
```

### 4. Subir o banco de dados via Docker
```bash
npm run db:up
```

### 5. Rodar migrations e gerar o client Prisma
```bash
npm run prisma:generate
npm run prisma:migrate
```

### 6. (Opcional) Popular o banco com dados de exemplo
```bash
npx prisma db seed
```

Isso cria automaticamente:

| Perfil | E-mail | Senha |
|---|---|---|
| Administrador | admin@imobiliaria.com | senha123 |
| Gestor | fernanda@imobiliaria.com | senha123 |
| Gestor | ricardo@imobiliaria.com | senha123 |
| Corretor | carlos@imobiliaria.com | senha123 |
| Corretor | ana.paula@imobiliaria.com | senha123 |
| Corretor | marcelo@imobiliaria.com | senha123 |
| Cliente | maria@email.com | senha123 |
| Cliente | joao@email.com | senha123 |
| *(+ 8 clientes)* | ... | senha123 |

Além de 20 imóveis (SP, RJ, MG, SC), 15 favoritos e 8 interesses com status variados.

### 7. Iniciar o servidor
```bash
npm run dev
```

API disponível em `http://localhost:3000`
Swagger em `http://localhost:3000/docs`

---

## Frontend — Como rodar

### 1. Entrar na pasta do frontend
```bash
cd frontend
```

### 2. Instalar dependências
```bash
npm install
```

### 3. Configurar variáveis de ambiente
```bash
cp .env.example .env
```

Conteúdo do `.env`:
```
VITE_API_URL=http://localhost:3000
```

### 4. Iniciar o dev server
```bash
npm run dev
```

Frontend disponível em `http://localhost:5173`

> O backend precisa estar rodando em `localhost:3000` para o frontend funcionar.

---

## Funcionalidades do frontend

### Públicas (sem login)
| Rota | Descrição |
|---|---|
| `/imoveis` | Listagem de imóveis com busca por cidade |
| `/imoveis/:id` | Detalhes do imóvel (quartos, área, preço, endereço, favoritos) |
| `/login` | Login com e-mail e senha |
| `/cadastro` | Auto-cadastro de cliente |
| `/recuperar-senha` | Solicitação de recuperação de senha |

### Autenticadas (requer login)
| Rota | Perfis | Descrição |
|---|---|---|
| `/dashboard` | Todos | Painel com atalhos baseados no perfil |
| `/clientes` | Todos | Listagem de clientes |
| `/imoveis/novo` | Admin, Gestor, Corretor | Cadastro de imóvel |
| `/imoveis/:id/editar` | Admin, Gestor, Corretor | Edição de imóvel |
| `/corretores` | Admin, Gestor | Gestão de corretores |
| `/relatorios` | Admin, Gestor | Relatórios de desempenho |

### Comportamentos
- Header adapta o menu de navegação conforme o perfil logado
- Rotas protegidas redirecionam para `/login` se não autenticado
- Rotas de Admin/Gestor redirecionam para `/dashboard` se perfil insuficiente
- Token Bearer injetado automaticamente em todas as requisições autenticadas
- Redirect para `/login` automático em resposta `401`

### Adicionar componentes shadcn/ui
```bash
cd frontend
npx shadcn@latest add dialog select toast
```

---

## Rotas da API

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

### Interesses
| Método | Rota | Acesso |
|---|---|---|
| POST | `/interesses` | Autenticado |

### Relatórios
| Método | Rota | Acesso |
|---|---|---|
| GET | `/relatorios/imoveis-marcados/:corretorId` | Admin, Gestor, Corretor |
| GET | `/relatorios/desempenho-corretores` | Admin, Gestor |

### Health check
| Método | Rota | Acesso |
|---|---|---|
| GET | `/health` | Público |

---

## Perfis de acesso

| Perfil | Permissões |
|---|---|
| **ADMINISTRADOR** | Acesso total |
| **GESTOR** | CRUD de imóveis, relatórios, vínculos, excluir clientes |
| **CORRETOR** | Cadastrar/editar imóveis, vínculos, relatório próprio |
| **CLIENTE** | Auto-cadastro, favoritos, registrar interesse |

---

## Testes

```bash
# Unitários
npm test

# Cobertura
npm run test:coverage

# E2E
npm run test:e2e
```
