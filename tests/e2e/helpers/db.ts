import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import type { FastifyInstance } from 'fastify'
import type { PerfilUsuario } from '../../../src/domain/entities/usuario.entity.js'

export const prisma = new PrismaClient()

// ─── Limpeza ─────────────────────────────────────────────────────────────────

export async function cleanDb(): Promise<void> {
  // TRUNCATE CASCADE respeita FK e limpa tudo de uma vez
  await prisma.$executeRaw`
    TRUNCATE TABLE
      interesses,
      clientes_favoritos,
      corretores_imoveis,
      corretores_clientes,
      tokens_recuperacao,
      sessoes,
      imoveis,
      clientes,
      corretores,
      usuarios
    RESTART IDENTITY CASCADE
  `
}

// ─── Factories diretas no banco ───────────────────────────────────────────────

type UserData = {
  email?: string
  senha?: string
  nome?: string
  perfil?: PerfilUsuario
}

export async function seedUsuario(data: UserData = {}) {
  const email = data.email ?? `u-${crypto.randomUUID()}@test.com`
  const senha = data.senha ?? 'Senha@123'
  const senhaHash = await bcrypt.hash(senha, 10)

  const usuario = await prisma.usuario.create({
    data: {
      id: crypto.randomUUID(),
      nome: data.nome ?? 'Usuário Teste',
      email,
      senhaHash,
      perfil: data.perfil ?? 'CLIENTE',
      ativo: true,
    },
  })

  return { ...usuario, senha }
}

export async function seedCorretorDb(data: UserData & { creci?: string } = {}) {
  const usuario = await seedUsuario({ ...data, perfil: 'CORRETOR' })

  const corretor = await prisma.corretor.create({
    data: {
      id: crypto.randomUUID(),
      usuarioId: usuario.id,
      creci: data.creci ?? `CRECI-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      ativo: true,
    },
  })

  return { usuario, corretor }
}

export async function seedClienteDb(data: UserData = {}) {
  const usuario = await seedUsuario({ ...data, perfil: 'CLIENTE' })

  const cliente = await prisma.cliente.create({
    data: {
      id: crypto.randomUUID(),
      usuarioId: usuario.id,
    },
  })

  return { usuario, cliente }
}

// ─── Helpers de autenticação ─────────────────────────────────────────────────

type LoginResult = {
  token: string
  usuarioId: string
  email: string
  senha: string
}

/**
 * Cria um usuário com o perfil indicado e faz login via API.
 * Retorna o token de sessão pronto para uso nos testes.
 */
export async function loginAs(
  app: FastifyInstance,
  perfil: PerfilUsuario,
  data: UserData = {},
): Promise<LoginResult> {
  let usuario: { id: string; email: string; senha: string }

  if (perfil === 'CORRETOR') {
    const result = await seedCorretorDb(data)
    usuario = result.usuario
  } else if (perfil === 'CLIENTE') {
    const result = await seedClienteDb(data)
    usuario = result.usuario
  } else {
    // ADMINISTRADOR ou GESTOR: só precisa do Usuario
    usuario = await seedUsuario({ ...data, perfil })
  }

  const loginRes = await app.inject({
    method: 'POST',
    url: '/auth/login',
    payload: { email: usuario.email, senha: usuario.senha },
  })

  const body = loginRes.json<{ token: string; usuario: { id: string } }>()

  return {
    token: body.token,
    usuarioId: body.usuario.id,
    email: usuario.email,
    senha: usuario.senha,
  }
}

// ─── Factories via API ────────────────────────────────────────────────────────

const enderecoBase = {
  cep: '01310-100',
  logradouro: 'Av. Paulista',
  numero: '1578',
  bairro: 'Bela Vista',
  cidade: 'São Paulo',
  estado: 'SP',
}

type ImovelSeed = {
  token: string
  titulo?: string
  tipo?: string
  finalidade?: string
  preco?: number
  status?: string
}

export async function seedImovelViaApi(app: FastifyInstance, data: ImovelSeed) {
  const res = await app.inject({
    method: 'POST',
    url: '/imoveis',
    headers: { authorization: `Bearer ${data.token}` },
    payload: {
      titulo: data.titulo ?? 'Apartamento Teste',
      tipo: data.tipo ?? 'APARTAMENTO',
      finalidade: data.finalidade ?? 'VENDA',
      quartos: 2,
      banheiros: 1,
      vagas: 1,
      preco: data.preco ?? 350_000,
      endereco: enderecoBase,
    },
  })

  return res.json<{ imovel: { id: string; titulo: string; status: string } }>()
}

type ClienteSeed = {
  email?: string
  senha?: string
  nome?: string
}

export async function seedClienteViaApi(app: FastifyInstance, data: ClienteSeed = {}) {
  const email = data.email ?? `c-${crypto.randomUUID()}@test.com`
  const senha = data.senha ?? 'Senha@123'

  const res = await app.inject({
    method: 'POST',
    url: '/clientes',
    payload: { nome: data.nome ?? 'Cliente Teste', email, senha },
  })

  const body = res.json<{ clienteId: string; usuario: { id: string } }>()

  const loginRes = await app.inject({
    method: 'POST',
    url: '/auth/login',
    payload: { email, senha },
  })

  const loginBody = loginRes.json<{ token: string }>()

  return {
    clienteId: body.clienteId,
    usuarioId: body.usuario.id,
    token: loginBody.token,
    email,
    senha,
  }
}

type CorretorSeed = { adminToken: string; creci?: string; email?: string }

export async function seedCorretorViaApi(app: FastifyInstance, data: CorretorSeed) {
  const email = data.email ?? `cor-${crypto.randomUUID()}@test.com`
  const senha = 'Senha@123'

  const res = await app.inject({
    method: 'POST',
    url: '/corretores',
    headers: { authorization: `Bearer ${data.adminToken}` },
    payload: {
      nome: 'Corretor Teste',
      email,
      senha,
      creci: data.creci ?? `CRECI-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
    },
  })

  const body = res.json<{ corretorId: string; usuarioId: string }>()

  const loginRes = await app.inject({
    method: 'POST',
    url: '/auth/login',
    payload: { email, senha },
  })

  const loginBody = loginRes.json<{ token: string }>()

  return { ...body, token: loginBody.token, email, senha }
}
