import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

const enderecoSchema = z.object({
  cep: z.string().min(1),
  logradouro: z.string().min(1),
  numero: z.string().min(1),
  complemento: z.string().optional(),
  bairro: z.string().min(1),
  cidade: z.string().min(1),
  estado: z.string().length(2, 'Estado deve ter 2 letras'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
})

const tipoImovelEnum = z.enum(['APARTAMENTO', 'CASA', 'COMERCIAL', 'TERRENO', 'RURAL', 'STUDIO', 'COBERTURA'])
const finalidadeEnum = z.enum(['VENDA', 'LOCACAO', 'VENDA_LOCACAO'])
const statusEnum = z.enum(['DISPONIVEL', 'RESERVADO', 'VENDIDO', 'LOCADO', 'INATIVO'])

const cadastrarImovelSchema = z.object({
  titulo: z.string().min(1, 'Título obrigatório'),
  tipo: tipoImovelEnum,
  finalidade: finalidadeEnum,
  descricao: z.string().optional(),
  areaTotal: z.number().positive().optional(),
  areaUtil: z.number().positive().optional(),
  quartos: z.number().int().min(0).default(0),
  banheiros: z.number().int().min(0).default(0),
  vagas: z.number().int().min(0).default(0),
  preco: z.number().positive('Preço deve ser positivo'),
  endereco: enderecoSchema,
  corretorResponsavelId: z.string().uuid().optional(),
  dataConstrucao: z.coerce.date().optional(),
})

const editarImovelSchema = z.object({
  titulo: z.string().min(1).optional(),
  tipo: tipoImovelEnum.optional(),
  finalidade: finalidadeEnum.optional(),
  descricao: z.string().optional(),
  areaTotal: z.number().positive().optional(),
  areaUtil: z.number().positive().optional(),
  quartos: z.number().int().min(0).optional(),
  banheiros: z.number().int().min(0).optional(),
  vagas: z.number().int().min(0).optional(),
  preco: z.number().positive().optional(),
  status: statusEnum.optional(),
  endereco: enderecoSchema.optional(),
  corretorResponsavelId: z.string().uuid().optional(),
  dataConstrucao: z.coerce.date().optional(),
})

const filtrosSchema = z.object({
  tipo: tipoImovelEnum.optional(),
  finalidade: finalidadeEnum.optional(),
  status: statusEnum.optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  bairro: z.string().optional(),
  precoMin: z.coerce.number().positive().optional(),
  precoMax: z.coerce.number().positive().optional(),
  areaMin: z.coerce.number().positive().optional(),
  quartos: z.coerce.number().int().min(0).optional(),
  banheiros: z.coerce.number().int().min(0).optional(),
  vagas: z.coerce.number().int().min(0).optional(),
  ordenarPor: z.enum(['preco', 'criadoEm', 'dataConstrucao']).optional(),
  ordem: z.enum(['asc', 'desc']).optional(),
})

export async function imoveisRoutes(app: FastifyInstance) {
  const { container } = app

  // GET /imoveis  (público)
  app.get('/', async (request, reply) => {
    const filtros = filtrosSchema.parse(request.query)
    const resultado = await container.pesquisarImoveis.execute(filtros)
    return reply.status(200).send(resultado)
  })

  // GET /imoveis/:id  (público)
  app.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const resultado = await container.visualizarImovel.execute(id)
    return reply.status(200).send(resultado)
  })

  // POST /imoveis  (autenticado)
  app.post('/', {
    preHandler: app.authenticate,
  }, async (request, reply) => {
    const body = cadastrarImovelSchema.parse(request.body)

    const resultado = await container.cadastrarImovel.execute({
      perfilExecutor: request.usuario.perfil,
      ...body,
    })

    return reply.status(201).send(resultado)
  })

  // PATCH /imoveis/:id  (autenticado)
  app.patch('/:id', {
    preHandler: app.authenticate,
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const body = editarImovelSchema.parse(request.body)

    const resultado = await container.editarImovel.execute({
      id,
      perfilExecutor: request.usuario.perfil,
      ...body,
    })

    return reply.status(200).send(resultado)
  })

  // DELETE /imoveis/:id  (autenticado)
  app.delete('/:id', {
    preHandler: app.authenticate,
  }, async (request, reply) => {
    const { id } = request.params as { id: string }

    await container.excluirImovel.execute({
      id,
      perfilExecutor: request.usuario.perfil,
    })

    return reply.status(204).send()
  })
}
