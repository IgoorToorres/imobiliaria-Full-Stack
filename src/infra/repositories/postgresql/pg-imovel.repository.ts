import type { PrismaClient, Prisma } from '@prisma/client'
import type { IImovelRepository, FiltrosImovel } from '../../../domain/repositories/imovel.repository.js'
import {
  Imovel,
  type TipoImovel,
  type FinalidadeImovel,
  type StatusImovel,
} from '../../../domain/entities/imovel.entity.js'

type ImovelRow = {
  id: string
  titulo: string
  tipo: string
  finalidade: string
  descricao: string | null
  areaTotal: number | null
  areaUtil: number | null
  quartos: number
  banheiros: number
  vagas: number
  preco: number
  status: string
  corretorResponsavelId: string | null
  dataConstrucao: Date | null
  criadoEm: Date
  atualizadoEm: Date
  endCep: string
  endLogradouro: string
  endNumero: string
  endComplemento: string | null
  endBairro: string
  endCidade: string
  endEstado: string
  endLatitude: number | null
  endLongitude: number | null
}

export class PgImovelRepository implements IImovelRepository {
  constructor(private readonly db: PrismaClient) {}

  async save(imovel: Imovel): Promise<void> {
    await this.db.imovel.create({
      data: {
        id: imovel.id,
        titulo: imovel.titulo,
        tipo: imovel.tipo,
        finalidade: imovel.finalidade,
        descricao: imovel.descricao,
        areaTotal: imovel.areaTotal,
        areaUtil: imovel.areaUtil,
        quartos: imovel.quartos,
        banheiros: imovel.banheiros,
        vagas: imovel.vagas,
        preco: imovel.preco,
        status: imovel.status,
        corretorResponsavelId: imovel.corretorResponsavelId,
        dataConstrucao: imovel.dataConstrucao,
        criadoEm: imovel.criadoEm,
        endCep: imovel.endereco.cep,
        endLogradouro: imovel.endereco.logradouro,
        endNumero: imovel.endereco.numero,
        endComplemento: imovel.endereco.complemento,
        endBairro: imovel.endereco.bairro,
        endCidade: imovel.endereco.cidade,
        endEstado: imovel.endereco.estado,
        endLatitude: imovel.endereco.latitude,
        endLongitude: imovel.endereco.longitude,
      },
    })
  }

  async findById(id: string): Promise<Imovel | null> {
    const row = await this.db.imovel.findUnique({ where: { id } })
    return row ? this.toEntity(row) : null
  }

  async findByFilters(filtros: FiltrosImovel): Promise<Imovel[]> {
    const where: Prisma.ImovelWhereInput = {}

    if (filtros.tipo) where.tipo = filtros.tipo
    if (filtros.finalidade) where.finalidade = filtros.finalidade
    if (filtros.status) where.status = filtros.status
    if (filtros.cidade) where.endCidade = { contains: filtros.cidade, mode: 'insensitive' }
    if (filtros.estado) where.endEstado = filtros.estado
    if (filtros.bairro) where.endBairro = { contains: filtros.bairro, mode: 'insensitive' }
    if (filtros.quartos !== undefined) where.quartos = filtros.quartos
    if (filtros.banheiros !== undefined) where.banheiros = filtros.banheiros
    if (filtros.vagas !== undefined) where.vagas = filtros.vagas

    if (filtros.precoMin !== undefined || filtros.precoMax !== undefined) {
      where.preco = {
        ...(filtros.precoMin !== undefined && { gte: filtros.precoMin }),
        ...(filtros.precoMax !== undefined && { lte: filtros.precoMax }),
      }
    }

    if (filtros.areaMin !== undefined) {
      where.areaTotal = { gte: filtros.areaMin }
    }

    const orderBy: Prisma.ImovelOrderByWithRelationInput = filtros.ordenarPor
      ? { [filtros.ordenarPor]: filtros.ordem ?? 'asc' }
      : { criadoEm: 'desc' }

    const rows = await this.db.imovel.findMany({ where, orderBy })
    return rows.map((row) => this.toEntity(row))
  }

  async findAll(): Promise<Imovel[]> {
    const rows = await this.db.imovel.findMany({ orderBy: { criadoEm: 'desc' } })
    return rows.map((row) => this.toEntity(row))
  }

  async update(imovel: Imovel): Promise<void> {
    await this.db.imovel.update({
      where: { id: imovel.id },
      data: {
        titulo: imovel.titulo,
        tipo: imovel.tipo,
        finalidade: imovel.finalidade,
        descricao: imovel.descricao,
        areaTotal: imovel.areaTotal,
        areaUtil: imovel.areaUtil,
        quartos: imovel.quartos,
        banheiros: imovel.banheiros,
        vagas: imovel.vagas,
        preco: imovel.preco,
        status: imovel.status,
        corretorResponsavelId: imovel.corretorResponsavelId,
        dataConstrucao: imovel.dataConstrucao,
        endCep: imovel.endereco.cep,
        endLogradouro: imovel.endereco.logradouro,
        endNumero: imovel.endereco.numero,
        endComplemento: imovel.endereco.complemento,
        endBairro: imovel.endereco.bairro,
        endCidade: imovel.endereco.cidade,
        endEstado: imovel.endereco.estado,
        endLatitude: imovel.endereco.latitude,
        endLongitude: imovel.endereco.longitude,
      },
    })
  }

  async delete(id: string): Promise<void> {
    await this.db.imovel.delete({ where: { id } })
  }

  private toEntity(row: ImovelRow): Imovel {
    return new Imovel({
      id: row.id,
      titulo: row.titulo,
      tipo: row.tipo as TipoImovel,
      finalidade: row.finalidade as FinalidadeImovel,
      descricao: row.descricao ?? undefined,
      areaTotal: row.areaTotal ?? undefined,
      areaUtil: row.areaUtil ?? undefined,
      quartos: row.quartos,
      banheiros: row.banheiros,
      vagas: row.vagas,
      preco: row.preco,
      status: row.status as StatusImovel,
      corretorResponsavelId: row.corretorResponsavelId ?? undefined,
      dataConstrucao: row.dataConstrucao ?? undefined,
      criadoEm: row.criadoEm,
      atualizadoEm: row.atualizadoEm,
      endereco: {
        cep: row.endCep,
        logradouro: row.endLogradouro,
        numero: row.endNumero,
        complemento: row.endComplemento ?? undefined,
        bairro: row.endBairro,
        cidade: row.endCidade,
        estado: row.endEstado,
        latitude: row.endLatitude ?? undefined,
        longitude: row.endLongitude ?? undefined,
      },
    })
  }
}
