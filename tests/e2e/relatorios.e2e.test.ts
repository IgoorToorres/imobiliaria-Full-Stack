import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest'
import type { FastifyInstance } from 'fastify'
import { getApp, closeApp } from './helpers/app.js'
import {
  cleanDb,
  loginAs,
  seedImovelViaApi,
  seedClienteViaApi,
  seedCorretorViaApi,
  seedCorretorDb,
} from './helpers/db.js'

describe('Relatórios E2E', () => {
  let app: FastifyInstance

  beforeAll(async () => { app = await getApp() })
  beforeEach(async () => { await cleanDb() })
  afterAll(async () => { await closeApp() })

  // ─── GET /relatorios/imoveis-marcados/:corretorId ─────────────────────────

  describe('GET /relatorios/imoveis-marcados/:corretorId', () => {
    it('retorna relatório de imóveis marcados para um corretor', async () => {
      const { token: adminToken } = await loginAs(app, 'ADMINISTRADOR')
      const corretor = await seedCorretorViaApi(app, { adminToken })

      // Cria imóvel com o corretor como responsável
      const imovelRes = await app.inject({
        method: 'POST',
        url: '/imoveis',
        headers: { authorization: `Bearer ${adminToken}` },
        payload: {
          titulo: 'Imóvel do Corretor',
          tipo: 'CASA',
          finalidade: 'VENDA',
          quartos: 3,
          banheiros: 2,
          vagas: 2,
          preco: 600_000,
          corretorResponsavelId: corretor.corretorId,
          endereco: {
            cep: '01310-100',
            logradouro: 'Rua Teste',
            numero: '1',
            bairro: 'Centro',
            cidade: 'São Paulo',
            estado: 'SP',
          },
        },
      })
      const { imovel } = imovelRes.json<{ imovel: { id: string } }>()

      // Cliente favorita o imóvel
      const { clienteId, token: clienteToken } = await seedClienteViaApi(app)
      await app.inject({
        method: 'POST',
        url: `/clientes/${clienteId}/favoritos`,
        headers: { authorization: `Bearer ${clienteToken}` },
        payload: { imovelId: imovel.id },
      })

      const res = await app.inject({
        method: 'GET',
        url: `/relatorios/imoveis-marcados/${corretor.corretorId}`,
        headers: { authorization: `Bearer ${adminToken}` },
      })

      expect(res.statusCode).toBe(200)
      expect(res.json().itens).toHaveLength(1)
      expect(res.json().itens[0]).toMatchObject({
        imovelId: imovel.id,
        titulo: 'Imóvel do Corretor',
        totalFavoritos: 1,
        totalInteresses: 0,
      })
    })

    it('CORRETOR pode acessar o próprio relatório', async () => {
      const { token: adminToken } = await loginAs(app, 'ADMINISTRADOR')
      const corretor = await seedCorretorViaApi(app, { adminToken })

      const res = await app.inject({
        method: 'GET',
        url: `/relatorios/imoveis-marcados/${corretor.corretorId}`,
        headers: { authorization: `Bearer ${corretor.token}` },
      })

      expect(res.statusCode).toBe(200)
      expect(res.json().itens).toHaveLength(0)
    })

    it('retorna 403 para CLIENTE', async () => {
      const { token: adminToken } = await loginAs(app, 'ADMINISTRADOR')
      const { corretor } = await seedCorretorDb()

      const { token: clienteToken } = await loginAs(app, 'CLIENTE')

      const res = await app.inject({
        method: 'GET',
        url: `/relatorios/imoveis-marcados/${corretor.id}`,
        headers: { authorization: `Bearer ${clienteToken}` },
      })

      expect(res.statusCode).toBe(403)
    })

    it('retorna 404 para corretor inexistente', async () => {
      const { token } = await loginAs(app, 'ADMINISTRADOR')

      const res = await app.inject({
        method: 'GET',
        url: '/relatorios/imoveis-marcados/00000000-0000-0000-0000-000000000000',
        headers: { authorization: `Bearer ${token}` },
      })

      expect(res.statusCode).toBe(404)
    })
  })

  // ─── GET /relatorios/desempenho-corretores ────────────────────────────────

  describe('GET /relatorios/desempenho-corretores', () => {
    it('retorna relatório de desempenho para ADMINISTRADOR', async () => {
      const { token } = await loginAs(app, 'ADMINISTRADOR')
      await seedCorretorDb()
      await seedCorretorDb()

      const res = await app.inject({
        method: 'GET',
        url: '/relatorios/desempenho-corretores',
        headers: { authorization: `Bearer ${token}` },
      })

      expect(res.statusCode).toBe(200)
      expect(res.json().corretores).toHaveLength(2)
      expect(res.json().corretores[0]).toMatchObject({
        corretorId: expect.any(String),
        corretorNome: expect.any(String),
        creci: expect.any(String),
        totalImoveisVinculados: expect.any(Number),
        totalClientesAtendidos: expect.any(Number),
        totalInteressesRecebidos: expect.any(Number),
        totalConversoes: expect.any(Number),
        totalFechamentos: expect.any(Number),
      })
    })

    it('retorna relatório de desempenho para GESTOR', async () => {
      const { token } = await loginAs(app, 'GESTOR')

      const res = await app.inject({
        method: 'GET',
        url: '/relatorios/desempenho-corretores',
        headers: { authorization: `Bearer ${token}` },
      })

      expect(res.statusCode).toBe(200)
    })

    it('retorna 403 para CORRETOR', async () => {
      const { token } = await loginAs(app, 'CORRETOR')

      const res = await app.inject({
        method: 'GET',
        url: '/relatorios/desempenho-corretores',
        headers: { authorization: `Bearer ${token}` },
      })

      expect(res.statusCode).toBe(403)
    })

    it('retorna 403 para CLIENTE', async () => {
      const { token } = await loginAs(app, 'CLIENTE')

      const res = await app.inject({
        method: 'GET',
        url: '/relatorios/desempenho-corretores',
        headers: { authorization: `Bearer ${token}` },
      })

      expect(res.statusCode).toBe(403)
    })

    it('inclui métricas corretas ao vincular corretor a imóvel e fechar negócio', async () => {
      const { token: adminToken } = await loginAs(app, 'ADMINISTRADOR')
      const corretor = await seedCorretorViaApi(app, { adminToken })

      // Cria e vincula imóvel
      const { imovel } = await seedImovelViaApi(app, { token: adminToken })
      await app.inject({
        method: 'POST',
        url: `/corretores/${corretor.corretorId}/imoveis`,
        headers: { authorization: `Bearer ${adminToken}` },
        payload: { imovelId: imovel.id },
      })

      // Fecha o imóvel como VENDIDO
      await app.inject({
        method: 'PATCH',
        url: `/imoveis/${imovel.id}`,
        headers: { authorization: `Bearer ${adminToken}` },
        payload: { status: 'VENDIDO', corretorResponsavelId: corretor.corretorId },
      })

      const res = await app.inject({
        method: 'GET',
        url: '/relatorios/desempenho-corretores',
        headers: { authorization: `Bearer ${adminToken}` },
      })

      const desempenho = res.json().corretores.find(
        (c: { corretorId: string }) => c.corretorId === corretor.corretorId,
      )

      expect(desempenho).toBeDefined()
      expect(desempenho.totalImoveisVinculados).toBe(1)
      expect(desempenho.totalFechamentos).toBe(1)
    })
  })
})
