import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest'
import type { FastifyInstance } from 'fastify'
import { getApp, closeApp } from './helpers/app.js'
import { cleanDb, loginAs, seedImovelViaApi, seedClienteViaApi } from './helpers/db.js'

describe('Interesses E2E', () => {
  let app: FastifyInstance

  beforeAll(async () => { app = await getApp() })
  beforeEach(async () => { await cleanDb() })
  afterAll(async () => { await closeApp() })

  // ─── POST /interesses ─────────────────────────────────────────────────────

  describe('POST /interesses', () => {
    it('registra interesse em imóvel disponível', async () => {
      const { clienteId, token } = await seedClienteViaApi(app)
      const { token: adminToken } = await loginAs(app, 'ADMINISTRADOR')
      const { imovel } = await seedImovelViaApi(app, { token: adminToken })

      const res = await app.inject({
        method: 'POST',
        url: '/interesses',
        headers: { authorization: `Bearer ${token}` },
        payload: { clienteId, imovelId: imovel.id, mensagem: 'Tenho interesse neste imóvel' },
      })

      expect(res.statusCode).toBe(201)
      expect(res.json()).toMatchObject({
        interesse: {
          id: expect.any(String),
          clienteId,
          imovelId: imovel.id,
          status: 'PENDENTE',
          mensagem: 'Tenho interesse neste imóvel',
        },
      })
    })

    it('registra interesse sem mensagem', async () => {
      const { clienteId, token } = await seedClienteViaApi(app)
      const { token: adminToken } = await loginAs(app, 'ADMINISTRADOR')
      const { imovel } = await seedImovelViaApi(app, { token: adminToken })

      const res = await app.inject({
        method: 'POST',
        url: '/interesses',
        headers: { authorization: `Bearer ${token}` },
        payload: { clienteId, imovelId: imovel.id },
      })

      expect(res.statusCode).toBe(201)
      expect(res.json().interesse.status).toBe('PENDENTE')
    })

    it('retorna 422 para imóvel com status VENDIDO', async () => {
      const { clienteId, token } = await seedClienteViaApi(app)
      const { token: adminToken } = await loginAs(app, 'ADMINISTRADOR')
      const { imovel } = await seedImovelViaApi(app, { token: adminToken })

      // Muda status para VENDIDO
      await app.inject({
        method: 'PATCH',
        url: `/imoveis/${imovel.id}`,
        headers: { authorization: `Bearer ${adminToken}` },
        payload: { status: 'VENDIDO' },
      })

      const res = await app.inject({
        method: 'POST',
        url: '/interesses',
        headers: { authorization: `Bearer ${token}` },
        payload: { clienteId, imovelId: imovel.id },
      })

      expect(res.statusCode).toBe(422)
    })

    it('retorna 422 para imóvel com status INATIVO', async () => {
      const { clienteId, token } = await seedClienteViaApi(app)
      const { token: adminToken } = await loginAs(app, 'ADMINISTRADOR')
      const { imovel } = await seedImovelViaApi(app, { token: adminToken })

      await app.inject({
        method: 'PATCH',
        url: `/imoveis/${imovel.id}`,
        headers: { authorization: `Bearer ${adminToken}` },
        payload: { status: 'INATIVO' },
      })

      const res = await app.inject({
        method: 'POST',
        url: '/interesses',
        headers: { authorization: `Bearer ${token}` },
        payload: { clienteId, imovelId: imovel.id },
      })

      expect(res.statusCode).toBe(422)
    })

    it('retorna 422 para imóvel com status LOCADO', async () => {
      const { clienteId, token } = await seedClienteViaApi(app)
      const { token: adminToken } = await loginAs(app, 'ADMINISTRADOR')
      const { imovel } = await seedImovelViaApi(app, { token: adminToken })

      await app.inject({
        method: 'PATCH',
        url: `/imoveis/${imovel.id}`,
        headers: { authorization: `Bearer ${adminToken}` },
        payload: { status: 'LOCADO' },
      })

      const res = await app.inject({
        method: 'POST',
        url: '/interesses',
        headers: { authorization: `Bearer ${token}` },
        payload: { clienteId, imovelId: imovel.id },
      })

      expect(res.statusCode).toBe(422)
    })

    it('aceita interesse em imóvel RESERVADO (pode ser cancelado)', async () => {
      const { clienteId, token } = await seedClienteViaApi(app)
      const { token: adminToken } = await loginAs(app, 'ADMINISTRADOR')
      const { imovel } = await seedImovelViaApi(app, { token: adminToken })

      await app.inject({
        method: 'PATCH',
        url: `/imoveis/${imovel.id}`,
        headers: { authorization: `Bearer ${adminToken}` },
        payload: { status: 'RESERVADO' },
      })

      const res = await app.inject({
        method: 'POST',
        url: '/interesses',
        headers: { authorization: `Bearer ${token}` },
        payload: { clienteId, imovelId: imovel.id },
      })

      expect(res.statusCode).toBe(201)
    })

    it('retorna 404 para cliente inexistente', async () => {
      const { token } = await loginAs(app, 'CLIENTE')
      const { token: adminToken } = await loginAs(app, 'ADMINISTRADOR')
      const { imovel } = await seedImovelViaApi(app, { token: adminToken })

      const res = await app.inject({
        method: 'POST',
        url: '/interesses',
        headers: { authorization: `Bearer ${token}` },
        payload: {
          clienteId: '00000000-0000-0000-0000-000000000000',
          imovelId: imovel.id,
        },
      })

      expect(res.statusCode).toBe(404)
    })

    it('retorna 401 sem autenticação', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/interesses',
        payload: {
          clienteId: '00000000-0000-0000-0000-000000000000',
          imovelId: '00000000-0000-0000-0000-000000000000',
        },
      })

      expect(res.statusCode).toBe(401)
    })
  })
})
