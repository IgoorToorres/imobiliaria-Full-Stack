import Fastify from 'fastify'
import cors from '@fastify/cors'

import { buildContainer } from './container.js'
import { errorHandler } from './errors/handler.js'
import { authenticatePlugin } from './plugins/authenticate.plugin.js'

import { authRoutes } from './routes/auth.routes.js'
import { imoveisRoutes } from './routes/imoveis.routes.js'
import { clientesRoutes } from './routes/clientes.routes.js'
import { corretoresRoutes } from './routes/corretores.routes.js'
import { interessesRoutes } from './routes/interesses.routes.js'
import { relatoriosRoutes } from './routes/relatorios.routes.js'

export async function buildApp() {
  const app = Fastify({
    logger: {
      transport:
        process.env.NODE_ENV !== 'production'
          ? { target: 'pino-pretty', options: { colorize: true } }
          : undefined,
    },
  })

  // ─── Plugins ──────────────────────────────────────────────────────────────
  await app.register(cors, {
    origin: process.env.CORS_ORIGIN ?? true,
  })

  // ─── Container DI ─────────────────────────────────────────────────────────
  app.decorate('container', buildContainer())

  // ─── Autenticação ─────────────────────────────────────────────────────────
  await app.register(authenticatePlugin)

  // ─── Error handler global ─────────────────────────────────────────────────
  app.setErrorHandler(errorHandler)

  // ─── Rotas ────────────────────────────────────────────────────────────────
  await app.register(authRoutes, { prefix: '/auth' })
  await app.register(imoveisRoutes, { prefix: '/imoveis' })
  await app.register(clientesRoutes, { prefix: '/clientes' })
  await app.register(corretoresRoutes, { prefix: '/corretores' })
  await app.register(interessesRoutes, { prefix: '/interesses' })
  await app.register(relatoriosRoutes, { prefix: '/relatorios' })

  // ─── Health check ─────────────────────────────────────────────────────────
  app.get('/health', async () => ({ status: 'ok' }))

  return app
}
