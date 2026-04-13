import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest'
import type { FastifyInstance } from 'fastify'
import { getApp, closeApp } from './helpers/app.js'
import { cleanDb, seedUsuario, loginAs } from './helpers/db.js'

describe('Auth E2E', () => {
  let app: FastifyInstance

  beforeAll(async () => { app = await getApp() })
  beforeEach(async () => { await cleanDb() })
  afterAll(async () => { await closeApp() })

  // ─── POST /auth/login ─────────────────────────────────────────────────────

  describe('POST /auth/login', () => {
    it('retorna token e dados do usuário ao logar com credenciais válidas', async () => {
      const user = await seedUsuario({ email: 'admin@test.com', senha: 'Senha@123', perfil: 'ADMINISTRADOR' })

      const res = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: { email: user.email, senha: 'Senha@123' },
      })

      expect(res.statusCode).toBe(200)
      expect(res.json()).toMatchObject({
        token: expect.any(String),
        usuario: {
          id: expect.any(String),
          email: 'admin@test.com',
          perfil: 'ADMINISTRADOR',
        },
      })
    })

    it('retorna 401 para senha incorreta', async () => {
      await seedUsuario({ email: 'user@test.com', senha: 'Senha@123' })

      const res = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: { email: 'user@test.com', senha: 'senhaerrada' },
      })

      expect(res.statusCode).toBe(401)
      expect(res.json()).toMatchObject({ erro: expect.any(String) })
    })

    it('retorna 401 para e-mail inexistente', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: { email: 'naoexiste@test.com', senha: 'Senha@123' },
      })

      expect(res.statusCode).toBe(401)
    })

    it('retorna 400 para payload inválido (e-mail sem formato)', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: { email: 'invalido', senha: 'Senha@123' },
      })

      expect(res.statusCode).toBe(400)
      expect(res.json()).toMatchObject({ erro: 'Dados inválidos', detalhes: expect.any(Object) })
    })

    it('não revela se o e-mail existe (mensagem genérica)', async () => {
      const resEmailInexistente = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: { email: 'naoexiste@test.com', senha: 'Senha@123' },
      })

      await seedUsuario({ email: 'existe@test.com', senha: 'Senha@123' })
      const resSenhaErrada = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: { email: 'existe@test.com', senha: 'senhaerrada' },
      })

      // Ambas retornam 401 com a mesma mensagem (evita user enumeration)
      expect(resEmailInexistente.statusCode).toBe(401)
      expect(resSenhaErrada.statusCode).toBe(401)
      expect(resEmailInexistente.json().erro).toBe(resSenhaErrada.json().erro)
    })
  })

  // ─── DELETE /auth/logout ──────────────────────────────────────────────────

  describe('DELETE /auth/logout', () => {
    it('invalida a sessão ao deslogar', async () => {
      const { token } = await loginAs(app, 'CLIENTE')

      const logoutRes = await app.inject({
        method: 'DELETE',
        url: '/auth/logout',
        headers: { authorization: `Bearer ${token}` },
      })

      expect(logoutRes.statusCode).toBe(204)

      // Token não deve mais ser válido após logout
      const afterLogout = await app.inject({
        method: 'DELETE',
        url: '/auth/logout',
        headers: { authorization: `Bearer ${token}` },
      })

      expect(afterLogout.statusCode).toBe(401)
    })

    it('retorna 401 sem token', async () => {
      const res = await app.inject({ method: 'DELETE', url: '/auth/logout' })
      expect(res.statusCode).toBe(401)
    })
  })

  // ─── POST /auth/recuperar-senha ───────────────────────────────────────────

  describe('POST /auth/recuperar-senha', () => {
    it('retorna token de recuperação para e-mail existente', async () => {
      await seedUsuario({ email: 'user@test.com' })

      const res = await app.inject({
        method: 'POST',
        url: '/auth/recuperar-senha',
        payload: { email: 'user@test.com' },
      })

      expect(res.statusCode).toBe(200)
      expect(res.json()).toMatchObject({ token: expect.any(String) })
    })

    it('retorna 404 para e-mail não cadastrado', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/auth/recuperar-senha',
        payload: { email: 'naoexiste@test.com' },
      })

      expect(res.statusCode).toBe(404)
    })
  })

  // ─── POST /auth/redefinir-senha ───────────────────────────────────────────

  describe('POST /auth/redefinir-senha', () => {
    it('redefine a senha com token válido e permite login com a nova senha', async () => {
      await seedUsuario({ email: 'user@test.com', senha: 'SenhaAntiga@123' })

      // Obtém token de recuperação
      const recuperarRes = await app.inject({
        method: 'POST',
        url: '/auth/recuperar-senha',
        payload: { email: 'user@test.com' },
      })
      const { token } = recuperarRes.json<{ token: string }>()

      // Redefine a senha
      const redefinirRes = await app.inject({
        method: 'POST',
        url: '/auth/redefinir-senha',
        payload: { token, novaSenha: 'NovaSenha@456' },
      })
      expect(redefinirRes.statusCode).toBe(204)

      // Login com a nova senha deve funcionar
      const loginRes = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: { email: 'user@test.com', senha: 'NovaSenha@456' },
      })
      expect(loginRes.statusCode).toBe(200)
    })

    it('retorna 422 ao tentar reutilizar o mesmo token', async () => {
      await seedUsuario({ email: 'user@test.com' })

      const { token } = (await app.inject({
        method: 'POST',
        url: '/auth/recuperar-senha',
        payload: { email: 'user@test.com' },
      })).json<{ token: string }>()

      await app.inject({
        method: 'POST',
        url: '/auth/redefinir-senha',
        payload: { token, novaSenha: 'NovaSenha@456' },
      })

      // Segunda tentativa com o mesmo token
      const res = await app.inject({
        method: 'POST',
        url: '/auth/redefinir-senha',
        payload: { token, novaSenha: 'OutraSenha@789' },
      })
      expect(res.statusCode).toBe(422)
    })
  })
})
