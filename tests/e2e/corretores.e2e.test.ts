import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest'
import type { FastifyInstance } from 'fastify'
import { getApp, closeApp } from './helpers/app.js'
import { cleanDb, loginAs, seedImovelViaApi, seedCorretorViaApi, seedClienteViaApi } from './helpers/db.js'

describe('Corretores E2E', () => {
  let app: FastifyInstance

  beforeAll(async () => { app = await getApp() })
  beforeEach(async () => { await cleanDb() })
  afterAll(async () => { await closeApp() })

  // ─── POST /corretores ─────────────────────────────────────────────────────

  describe('POST /corretores', () => {
    const payload = {
      nome: 'Carlos Corretor',
      email: 'carlos@imob.com',
      senha: 'Senha@123',
      creci: 'CRECI-SP-12345',
    }

    it('ADMINISTRADOR cria corretor com sucesso', async () => {
      const { token } = await loginAs(app, 'ADMINISTRADOR')

      const res = await app.inject({
        method: 'POST',
        url: '/corretores',
        headers: { authorization: `Bearer ${token}` },
        payload,
      })

      expect(res.statusCode).toBe(201)
      expect(res.json()).toMatchObject({
        usuarioId: expect.any(String),
        corretorId: expect.any(String),
      })
    })

    it('retorna 403 quando GESTOR tenta cadastrar corretor', async () => {
      const { token } = await loginAs(app, 'GESTOR')

      const res = await app.inject({
        method: 'POST',
        url: '/corretores',
        headers: { authorization: `Bearer ${token}` },
        payload,
      })

      expect(res.statusCode).toBe(403)
    })

    it('retorna 403 quando CLIENTE tenta cadastrar corretor', async () => {
      const { token } = await loginAs(app, 'CLIENTE')

      const res = await app.inject({
        method: 'POST',
        url: '/corretores',
        headers: { authorization: `Bearer ${token}` },
        payload,
      })

      expect(res.statusCode).toBe(403)
    })

    it('retorna 409 para CRECI duplicado', async () => {
      const { token } = await loginAs(app, 'ADMINISTRADOR')

      await app.inject({
        method: 'POST',
        url: '/corretores',
        headers: { authorization: `Bearer ${token}` },
        payload,
      })

      const res = await app.inject({
        method: 'POST',
        url: '/corretores',
        headers: { authorization: `Bearer ${token}` },
        payload: { ...payload, email: 'outro@imob.com' },
      })

      expect(res.statusCode).toBe(409)
      expect(res.json()).toMatchObject({ erro: expect.stringContaining('CRECI') })
    })

    it('retorna 409 para e-mail duplicado', async () => {
      const { token } = await loginAs(app, 'ADMINISTRADOR')

      await app.inject({
        method: 'POST',
        url: '/corretores',
        headers: { authorization: `Bearer ${token}` },
        payload,
      })

      const res = await app.inject({
        method: 'POST',
        url: '/corretores',
        headers: { authorization: `Bearer ${token}` },
        payload: { ...payload, creci: 'CRECI-SP-99999' },
      })

      expect(res.statusCode).toBe(409)
      expect(res.json()).toMatchObject({ erro: expect.stringContaining('E-mail') })
    })
  })

  // ─── POST /corretores/:id/imoveis ─────────────────────────────────────────

  describe('POST /corretores/:id/imoveis', () => {
    it('vincula corretor a imóvel', async () => {
      const { token: adminToken } = await loginAs(app, 'ADMINISTRADOR')
      const corretor = await seedCorretorViaApi(app, { adminToken })
      const { imovel } = await seedImovelViaApi(app, { token: adminToken })

      const res = await app.inject({
        method: 'POST',
        url: `/corretores/${corretor.corretorId}/imoveis`,
        headers: { authorization: `Bearer ${adminToken}` },
        payload: { imovelId: imovel.id },
      })

      expect(res.statusCode).toBe(201)
    })

    it('retorna 409 ao vincular corretor já vinculado ao mesmo imóvel', async () => {
      const { token: adminToken } = await loginAs(app, 'ADMINISTRADOR')
      const corretor = await seedCorretorViaApi(app, { adminToken })
      const { imovel } = await seedImovelViaApi(app, { token: adminToken })

      await app.inject({
        method: 'POST',
        url: `/corretores/${corretor.corretorId}/imoveis`,
        headers: { authorization: `Bearer ${adminToken}` },
        payload: { imovelId: imovel.id },
      })

      const res = await app.inject({
        method: 'POST',
        url: `/corretores/${corretor.corretorId}/imoveis`,
        headers: { authorization: `Bearer ${adminToken}` },
        payload: { imovelId: imovel.id },
      })

      expect(res.statusCode).toBe(409)
    })

    it('retorna 404 para corretor inexistente', async () => {
      const { token: adminToken } = await loginAs(app, 'ADMINISTRADOR')
      const { imovel } = await seedImovelViaApi(app, { token: adminToken })

      const res = await app.inject({
        method: 'POST',
        url: '/corretores/00000000-0000-0000-0000-000000000000/imoveis',
        headers: { authorization: `Bearer ${adminToken}` },
        payload: { imovelId: imovel.id },
      })

      expect(res.statusCode).toBe(404)
    })
  })

  // ─── POST /corretores/:id/clientes ────────────────────────────────────────

  describe('POST /corretores/:id/clientes', () => {
    it('vincula corretor a cliente', async () => {
      const { token: adminToken } = await loginAs(app, 'ADMINISTRADOR')
      const corretor = await seedCorretorViaApi(app, { adminToken })
      const { clienteId } = await seedClienteViaApi(app)

      const res = await app.inject({
        method: 'POST',
        url: `/corretores/${corretor.corretorId}/clientes`,
        headers: { authorization: `Bearer ${adminToken}` },
        payload: { clienteId },
      })

      expect(res.statusCode).toBe(201)
    })

    it('retorna 409 ao vincular corretor já vinculado ao mesmo cliente', async () => {
      const { token: adminToken } = await loginAs(app, 'ADMINISTRADOR')
      const corretor = await seedCorretorViaApi(app, { adminToken })
      const { clienteId } = await seedClienteViaApi(app)

      await app.inject({
        method: 'POST',
        url: `/corretores/${corretor.corretorId}/clientes`,
        headers: { authorization: `Bearer ${adminToken}` },
        payload: { clienteId },
      })

      const res = await app.inject({
        method: 'POST',
        url: `/corretores/${corretor.corretorId}/clientes`,
        headers: { authorization: `Bearer ${adminToken}` },
        payload: { clienteId },
      })

      expect(res.statusCode).toBe(409)
    })
  })
})
