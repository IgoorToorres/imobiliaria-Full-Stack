import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest'
import type { FastifyInstance } from 'fastify'
import { getApp, closeApp } from './helpers/app.js'
import { cleanDb, loginAs, seedImovelViaApi, prisma } from './helpers/db.js'

describe('Imóveis E2E', () => {
  let app: FastifyInstance

  beforeAll(async () => { app = await getApp() })
  beforeEach(async () => { await cleanDb() })
  afterAll(async () => { await closeApp() })

  // ─── GET /imoveis ─────────────────────────────────────────────────────────

  describe('GET /imoveis', () => {
    it('retorna lista vazia quando não há imóveis', async () => {
      const res = await app.inject({ method: 'GET', url: '/imoveis' })

      expect(res.statusCode).toBe(200)
      expect(res.json()).toMatchObject({ imoveis: [], total: 0 })
    })

    it('retorna imóveis cadastrados', async () => {
      const { token } = await loginAs(app, 'ADMINISTRADOR')
      await seedImovelViaApi(app, { token, titulo: 'Casa SP', tipo: 'CASA' })
      await seedImovelViaApi(app, { token, titulo: 'Apto SP', tipo: 'APARTAMENTO' })

      const res = await app.inject({ method: 'GET', url: '/imoveis' })

      expect(res.statusCode).toBe(200)
      expect(res.json().total).toBe(2)
    })

    it('filtra por tipo', async () => {
      const { token } = await loginAs(app, 'ADMINISTRADOR')
      await seedImovelViaApi(app, { token, tipo: 'CASA' })
      await seedImovelViaApi(app, { token, tipo: 'APARTAMENTO' })

      const res = await app.inject({ method: 'GET', url: '/imoveis?tipo=CASA' })

      expect(res.statusCode).toBe(200)
      expect(res.json().total).toBe(1)
      expect(res.json().imoveis[0].tipo).toBe('CASA')
    })

    it('filtra por faixa de preço', async () => {
      const { token } = await loginAs(app, 'ADMINISTRADOR')
      await seedImovelViaApi(app, { token, preco: 200_000 })
      await seedImovelViaApi(app, { token, preco: 500_000 })

      const res = await app.inject({ method: 'GET', url: '/imoveis?precoMin=100000&precoMax=300000' })

      expect(res.statusCode).toBe(200)
      expect(res.json().total).toBe(1)
      expect(res.json().imoveis[0].preco).toBe(200_000)
    })

    it('retorna 400 para filtro inválido', async () => {
      const res = await app.inject({ method: 'GET', url: '/imoveis?tipo=INVALIDO' })
      expect(res.statusCode).toBe(400)
    })
  })

  // ─── GET /imoveis/:id ─────────────────────────────────────────────────────

  describe('GET /imoveis/:id', () => {
    it('retorna imóvel com totalFavoritos', async () => {
      const { token } = await loginAs(app, 'ADMINISTRADOR')
      const { imovel } = await seedImovelViaApi(app, { token })

      const res = await app.inject({ method: 'GET', url: `/imoveis/${imovel.id}` })

      expect(res.statusCode).toBe(200)
      expect(res.json()).toMatchObject({
        imovel: { id: imovel.id, titulo: expect.any(String) },
        totalFavoritos: 0,
      })
    })

    it('retorna 404 para id inexistente', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/imoveis/00000000-0000-0000-0000-000000000000',
      })
      expect(res.statusCode).toBe(404)
    })
  })

  // ─── POST /imoveis ────────────────────────────────────────────────────────

  describe('POST /imoveis', () => {
    const payload = {
      titulo: 'Apartamento Centro',
      tipo: 'APARTAMENTO',
      finalidade: 'VENDA',
      quartos: 3,
      banheiros: 2,
      vagas: 1,
      preco: 450_000,
      endereco: {
        cep: '01310-100',
        logradouro: 'Av. Paulista',
        numero: '100',
        bairro: 'Bela Vista',
        cidade: 'São Paulo',
        estado: 'SP',
      },
    }

    it('cria imóvel como ADMINISTRADOR', async () => {
      const { token } = await loginAs(app, 'ADMINISTRADOR')

      const res = await app.inject({
        method: 'POST',
        url: '/imoveis',
        headers: { authorization: `Bearer ${token}` },
        payload,
      })

      expect(res.statusCode).toBe(201)
      expect(res.json()).toMatchObject({
        imovel: {
          id: expect.any(String),
          titulo: 'Apartamento Centro',
          status: 'DISPONIVEL',
        },
      })
    })

    it('cria imóvel como CORRETOR', async () => {
      const { token } = await loginAs(app, 'CORRETOR')

      const res = await app.inject({
        method: 'POST',
        url: '/imoveis',
        headers: { authorization: `Bearer ${token}` },
        payload,
      })

      expect(res.statusCode).toBe(201)
    })

    it('retorna 403 para CLIENTE', async () => {
      const { token } = await loginAs(app, 'CLIENTE')

      const res = await app.inject({
        method: 'POST',
        url: '/imoveis',
        headers: { authorization: `Bearer ${token}` },
        payload,
      })

      expect(res.statusCode).toBe(403)
    })

    it('retorna 401 sem token', async () => {
      const res = await app.inject({ method: 'POST', url: '/imoveis', payload })
      expect(res.statusCode).toBe(401)
    })

    it('retorna 400 para payload inválido (sem titulo)', async () => {
      const { token } = await loginAs(app, 'ADMINISTRADOR')
      const { titulo: _, ...semTitulo } = payload

      const res = await app.inject({
        method: 'POST',
        url: '/imoveis',
        headers: { authorization: `Bearer ${token}` },
        payload: semTitulo,
      })

      expect(res.statusCode).toBe(400)
      expect(res.json().detalhes).toHaveProperty('titulo')
    })
  })

  // ─── PATCH /imoveis/:id ───────────────────────────────────────────────────

  describe('PATCH /imoveis/:id', () => {
    it('atualiza campos do imóvel', async () => {
      const { token } = await loginAs(app, 'ADMINISTRADOR')
      const { imovel } = await seedImovelViaApi(app, { token })

      const res = await app.inject({
        method: 'PATCH',
        url: `/imoveis/${imovel.id}`,
        headers: { authorization: `Bearer ${token}` },
        payload: { titulo: 'Título Atualizado', preco: 400_000 },
      })

      expect(res.statusCode).toBe(200)
      expect(res.json().imovel).toMatchObject({
        titulo: 'Título Atualizado',
        preco: 400_000,
      })
    })

    it('retorna 404 para imóvel inexistente', async () => {
      const { token } = await loginAs(app, 'ADMINISTRADOR')

      const res = await app.inject({
        method: 'PATCH',
        url: '/imoveis/00000000-0000-0000-0000-000000000000',
        headers: { authorization: `Bearer ${token}` },
        payload: { titulo: 'X' },
      })

      expect(res.statusCode).toBe(404)
    })
  })

  // ─── DELETE /imoveis/:id ──────────────────────────────────────────────────

  describe('DELETE /imoveis/:id', () => {
    it('exclui imóvel disponível', async () => {
      const { token } = await loginAs(app, 'ADMINISTRADOR')
      const { imovel } = await seedImovelViaApi(app, { token })

      const res = await app.inject({
        method: 'DELETE',
        url: `/imoveis/${imovel.id}`,
        headers: { authorization: `Bearer ${token}` },
      })

      expect(res.statusCode).toBe(204)

      // Confirma que sumiu do banco
      const found = await prisma.imovel.findUnique({ where: { id: imovel.id } })
      expect(found).toBeNull()
    })

    it('retorna 422 ao tentar excluir imóvel RESERVADO', async () => {
      const { token } = await loginAs(app, 'ADMINISTRADOR')
      const { imovel } = await seedImovelViaApi(app, { token })

      // Altera status para RESERVADO
      await app.inject({
        method: 'PATCH',
        url: `/imoveis/${imovel.id}`,
        headers: { authorization: `Bearer ${token}` },
        payload: { status: 'RESERVADO' },
      })

      const res = await app.inject({
        method: 'DELETE',
        url: `/imoveis/${imovel.id}`,
        headers: { authorization: `Bearer ${token}` },
      })

      expect(res.statusCode).toBe(422)
    })
  })
})
