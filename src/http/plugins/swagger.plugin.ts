import type { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'

export const swaggerPlugin = fp(async (app: FastifyInstance) => {
  // ─── Schemas compartilhados ──────────────────────────────────────────────
  app.addSchema({
    $id: 'ErrorResponse',
    type: 'object',
    additionalProperties: false,
    properties: {
      erro: { type: 'string' },
    },
    required: ['erro'],
  })

  app.addSchema({
    $id: 'ValidationError',
    type: 'object',
    additionalProperties: false,
    properties: {
      erro: { type: 'string' },
      detalhes: {
        type: 'object',
        additionalProperties: {
          type: 'array',
          items: { type: 'string' },
        },
      },
    },
    required: ['erro', 'detalhes'],
  })

  app.addSchema({
    $id: 'UsuarioPublic',
    type: 'object',
    additionalProperties: false,
    properties: {
      id: { type: 'string', format: 'uuid' },
      nome: { type: 'string' },
      email: { type: 'string', format: 'email' },
      perfil: { type: 'string', enum: ['ADMINISTRADOR', 'GESTOR', 'CORRETOR', 'CLIENTE'] },
    },
    required: ['id', 'nome', 'email', 'perfil'],
  })

  app.addSchema({
    $id: 'ImovelEndereco',
    type: 'object',
    additionalProperties: false,
    properties: {
      cep: { type: 'string' },
      logradouro: { type: 'string' },
      numero: { type: 'string' },
      complemento: { type: 'string' },
      bairro: { type: 'string' },
      cidade: { type: 'string' },
      estado: { type: 'string', minLength: 2, maxLength: 2 },
      latitude: { type: 'number' },
      longitude: { type: 'number' },
    },
    required: ['cep', 'logradouro', 'numero', 'bairro', 'cidade', 'estado'],
  })

  app.addSchema({
    $id: 'Imovel',
    type: 'object',
    additionalProperties: false,
    properties: {
      id: { type: 'string', format: 'uuid' },
      titulo: { type: 'string' },
      tipo: {
        type: 'string',
        enum: ['APARTAMENTO', 'CASA', 'COMERCIAL', 'TERRENO', 'RURAL', 'STUDIO', 'COBERTURA'],
      },
      finalidade: { type: 'string', enum: ['VENDA', 'LOCACAO', 'VENDA_LOCACAO'] },
      descricao: { type: 'string' },
      areaTotal: { type: 'number' },
      areaUtil: { type: 'number' },
      quartos: { type: 'integer', minimum: 0 },
      banheiros: { type: 'integer', minimum: 0 },
      vagas: { type: 'integer', minimum: 0 },
      preco: { type: 'number' },
      status: { type: 'string', enum: ['DISPONIVEL', 'RESERVADO', 'VENDIDO', 'LOCADO', 'INATIVO'] },
      endereco: { $ref: 'ImovelEndereco#' },
      corretorResponsavelId: { type: 'string', format: 'uuid' },
      dataConstrucao: { type: 'string', format: 'date-time' },
      criadoEm: { type: 'string', format: 'date-time' },
      atualizadoEm: { type: 'string', format: 'date-time' },
    },
    required: [
      'id',
      'titulo',
      'tipo',
      'finalidade',
      'quartos',
      'banheiros',
      'vagas',
      'preco',
      'status',
      'endereco',
      'criadoEm',
      'atualizadoEm',
    ],
  })

  app.addSchema({
    $id: 'ClienteFavorito',
    type: 'object',
    additionalProperties: false,
    properties: {
      id: { type: 'string', format: 'uuid' },
      clienteId: { type: 'string', format: 'uuid' },
      imovelId: { type: 'string', format: 'uuid' },
      criadoEm: { type: 'string', format: 'date-time' },
    },
    required: ['id', 'clienteId', 'imovelId', 'criadoEm'],
  })

  app.addSchema({
    $id: 'Interesse',
    type: 'object',
    additionalProperties: false,
    properties: {
      id: { type: 'string', format: 'uuid' },
      clienteId: { type: 'string', format: 'uuid' },
      imovelId: { type: 'string', format: 'uuid' },
      corretorId: { type: 'string', format: 'uuid' },
      mensagem: { type: 'string' },
      status: {
        type: 'string',
        enum: ['PENDENTE', 'EM_ATENDIMENTO', 'AGENDADO', 'FINALIZADO', 'CANCELADO'],
      },
      criadoEm: { type: 'string', format: 'date-time' },
      atualizadoEm: { type: 'string', format: 'date-time' },
    },
    required: ['id', 'clienteId', 'imovelId', 'status', 'criadoEm', 'atualizadoEm'],
  })

  app.addSchema({
    $id: 'RelatorioImoveisMarcadosItem',
    type: 'object',
    additionalProperties: false,
    properties: {
      imovelId: { type: 'string', format: 'uuid' },
      titulo: { type: 'string' },
      status: { type: 'string' },
      totalFavoritos: { type: 'integer', minimum: 0 },
      totalInteresses: { type: 'integer', minimum: 0 },
    },
    required: ['imovelId', 'titulo', 'status', 'totalFavoritos', 'totalInteresses'],
  })

  app.addSchema({
    $id: 'RelatorioDesempenhoCorretorItem',
    type: 'object',
    additionalProperties: false,
    properties: {
      corretorId: { type: 'string', format: 'uuid' },
      corretorNome: { type: 'string' },
      creci: { type: 'string' },
      totalImoveisVinculados: { type: 'integer', minimum: 0 },
      totalClientesAtendidos: { type: 'integer', minimum: 0 },
      totalInteressesRecebidos: { type: 'integer', minimum: 0 },
      totalConversoes: { type: 'integer', minimum: 0 },
      totalFechamentos: { type: 'integer', minimum: 0 },
    },
    required: [
      'corretorId',
      'corretorNome',
      'creci',
      'totalImoveisVinculados',
      'totalClientesAtendidos',
      'totalInteressesRecebidos',
      'totalConversoes',
      'totalFechamentos',
    ],
  })

  // ─── Swagger/OpenAPI ────────────────────────────────────────────────────
  await app.register(swagger, {
    openapi: {
      info: {
        title: 'Real Estate API',
        version: '1.0.0',
        description:
          'API de gestão imobiliária. Autenticação via Bearer token e rotas públicas/privadas para imóveis, clientes, corretores e relatórios.',
      },
      servers: [
        {
          url: process.env.SWAGGER_SERVER_URL ?? 'http://localhost:3000',
          description: 'Servidor principal',
        },
      ],
      tags: [
        { name: 'Auth', description: 'Autenticação e sessão' },
        { name: 'Imoveis', description: 'Catálogo e gestão de imóveis' },
        { name: 'Clientes', description: 'Cadastro de clientes e favoritos' },
        { name: 'Corretores', description: 'Cadastro e vínculo de corretores' },
        { name: 'Interesses', description: 'Registro de interesses em imóveis' },
        { name: 'Relatorios', description: 'Relatórios gerenciais' },
        { name: 'Health', description: 'Monitoramento e health check' },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'Token retornado em /auth/login',
          },
        },
      },
    },
  })

  await app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
      displayRequestDuration: true,
    },
  })
})
