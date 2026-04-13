import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest'
import type { FastifyInstance } from 'fastify'
import { getApp, closeApp } from './helpers/app.js'
import { cleanDb, loginAs, seedImovelViaApi, seedClienteViaApi } from './helpers/db.js'

describe('Clientes E2E', () => {
  let app: FastifyInstance

  beforeAll(async () => { app = await getApp() })
  beforeEach(async () => { await cleanDb() })
  afterAll(async () => { await closeApp() })

  // ─── POST /clientes ───────────────────────────────────────────────────────

  describe('POST /clientes', () => {
    it('cadastra cliente com dados válidos', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/clientes',
        payload: {
          nome: 'Maria Silva',
          email: 'maria@test.com',
          senha: 'Senha@123',
          telefone: '11999999999',
        },
      })

      expect(res.statusCode).toBe(201)
      expect(res.json()).toMatchObject({
        clienteId: expect.any(String),
        usuario: {
          id: expect.any(String),
          email: 'maria@test.com',
          perfil: 'CLIENTE',
        },
      })
    })

    it('retorna 409 para e-mail duplicado', async () => {
      await app.inject({
        method: 'POST',
        url: '/clientes',
        payload: { nome: 'João', email: 'duplicado@test.com', senha: 'Senha@123' },
      })

      const res = await app.inject({
        method: 'POST',
        url: '/clientes',
        payload: { nome: 'Maria', email: 'duplicado@test.com', senha: 'Senha@123' },
      })

      expect(res.statusCode).toBe(409)
      expect(res.json()).toMatchObject({ erro: expect.stringContaining('E-mail') })
    })

    it('retorna 400 para senha curta (menos de 6 caracteres)', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/clientes',
        payload: { nome: 'João', email: 'joao@test.com', senha: '123' },
      })

      expect(res.statusCode).toBe(400)
      expect(res.json().detalhes).toHaveProperty('senha')
    })
  })

  // ─── PATCH /clientes/:id ──────────────────────────────────────────────────

  describe('PATCH /clientes/:id', () => {
    it('cliente edita os próprios dados', async () => {
      const { clienteId, token } = await seedClienteViaApi(app)

      const res = await app.inject({
        method: 'PATCH',
        url: `/clientes/${clienteId}`,
        headers: { authorization: `Bearer ${token}` },
        payload: { nome: 'Nome Atualizado', profissao: 'Engenheiro' },
      })

      expect(res.statusCode).toBe(204)
    })

    it('ADMINISTRADOR edita qualquer cliente', async () => {
      const { clienteId } = await seedClienteViaApi(app)
      const { token: adminToken } = await loginAs(app, 'ADMINISTRADOR')

      const res = await app.inject({
        method: 'PATCH',
        url: `/clientes/${clienteId}`,
        headers: { authorization: `Bearer ${adminToken}` },
        payload: { nome: 'Editado pelo Admin' },
      })

      expect(res.statusCode).toBe(204)
    })

    it('um cliente não pode editar dados de outro', async () => {
      const { clienteId } = await seedClienteViaApi(app)
      const { token: outroToken } = await loginAs(app, 'CLIENTE')

      const res = await app.inject({
        method: 'PATCH',
        url: `/clientes/${clienteId}`,
        headers: { authorization: `Bearer ${outroToken}` },
        payload: { nome: 'Invasão' },
      })

      expect(res.statusCode).toBe(403)
    })
  })

  // ─── DELETE /clientes/:id ─────────────────────────────────────────────────

  describe('DELETE /clientes/:id', () => {
    it('ADMINISTRADOR exclui cliente sem interesses ativos', async () => {
      const { clienteId } = await seedClienteViaApi(app)
      const { token: adminToken } = await loginAs(app, 'ADMINISTRADOR')

      const res = await app.inject({
        method: 'DELETE',
        url: `/clientes/${clienteId}`,
        headers: { authorization: `Bearer ${adminToken}` },
      })

      expect(res.statusCode).toBe(204)
    })

    it('CLIENTE não pode excluir conta (acesso negado)', async () => {
      const { clienteId, token } = await seedClienteViaApi(app)

      const res = await app.inject({
        method: 'DELETE',
        url: `/clientes/${clienteId}`,
        headers: { authorization: `Bearer ${token}` },
      })

      expect(res.statusCode).toBe(403)
    })
  })

  // ─── Favoritos ────────────────────────────────────────────────────────────

  describe('Favoritos', () => {
    it('adiciona, lista e remove favorito', async () => {
      const { clienteId, token } = await seedClienteViaApi(app)
      const { token: adminToken } = await loginAs(app, 'ADMINISTRADOR')
      const { imovel } = await seedImovelViaApi(app, { token: adminToken })

      // Adiciona
      const addRes = await app.inject({
        method: 'POST',
        url: `/clientes/${clienteId}/favoritos`,
        headers: { authorization: `Bearer ${token}` },
        payload: { imovelId: imovel.id },
      })
      expect(addRes.statusCode).toBe(201)

      // Lista
      const listRes = await app.inject({
        method: 'GET',
        url: `/clientes/${clienteId}/favoritos`,
        headers: { authorization: `Bearer ${token}` },
      })
      expect(listRes.statusCode).toBe(200)
      expect(listRes.json().favoritos).toHaveLength(1)
      expect(listRes.json().favoritos[0].imovelId).toBe(imovel.id)

      // Remove
      const delRes = await app.inject({
        method: 'DELETE',
        url: `/clientes/${clienteId}/favoritos/${imovel.id}`,
        headers: { authorization: `Bearer ${token}` },
      })
      expect(delRes.statusCode).toBe(204)

      // Confirma que sumiu
      const afterDel = await app.inject({
        method: 'GET',
        url: `/clientes/${clienteId}/favoritos`,
        headers: { authorization: `Bearer ${token}` },
      })
      expect(afterDel.json().favoritos).toHaveLength(0)
    })

    it('retorna 409 ao favoritar imóvel já favoritado', async () => {
      const { clienteId, token } = await seedClienteViaApi(app)
      const { token: adminToken } = await loginAs(app, 'ADMINISTRADOR')
      const { imovel } = await seedImovelViaApi(app, { token: adminToken })

      await app.inject({
        method: 'POST',
        url: `/clientes/${clienteId}/favoritos`,
        headers: { authorization: `Bearer ${token}` },
        payload: { imovelId: imovel.id },
      })

      const res = await app.inject({
        method: 'POST',
        url: `/clientes/${clienteId}/favoritos`,
        headers: { authorization: `Bearer ${token}` },
        payload: { imovelId: imovel.id },
      })

      expect(res.statusCode).toBe(409)
    })

    it('retorna 404 ao remover favorito inexistente', async () => {
      const { clienteId, token } = await seedClienteViaApi(app)

      const res = await app.inject({
        method: 'DELETE',
        url: `/clientes/${clienteId}/favoritos/00000000-0000-0000-0000-000000000000`,
        headers: { authorization: `Bearer ${token}` },
      })

      expect(res.statusCode).toBe(404)
    })
  })

  // ─── Interesses do cliente ────────────────────────────────────────────────

  describe('GET /clientes/:id/interesses', () => {
    it('retorna histórico de interesses do cliente', async () => {
      const { clienteId, token } = await seedClienteViaApi(app)
      const { token: adminToken } = await loginAs(app, 'ADMINISTRADOR')
      const { imovel } = await seedImovelViaApi(app, { token: adminToken })

      // Registra um interesse
      await app.inject({
        method: 'POST',
        url: '/interesses',
        headers: { authorization: `Bearer ${token}` },
        payload: { clienteId, imovelId: imovel.id },
      })

      const res = await app.inject({
        method: 'GET',
        url: `/clientes/${clienteId}/interesses`,
        headers: { authorization: `Bearer ${token}` },
      })

      expect(res.statusCode).toBe(200)
      expect(res.json().interesses).toHaveLength(1)
      expect(res.json().interesses[0]).toMatchObject({
        clienteId,
        imovelId: imovel.id,
        status: 'PENDENTE',
      })
    })
  })
})
