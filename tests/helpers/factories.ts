import { Usuario } from '../../src/domain/entities/usuario.entity.js'
import { Cliente } from '../../src/domain/entities/cliente.entity.js'
import { Corretor } from '../../src/domain/entities/corretor.entity.js'
import { Imovel } from '../../src/domain/entities/imovel.entity.js'
import type { PerfilUsuario } from '../../src/domain/entities/usuario.entity.js'

export function makeUsuario(override: Partial<Parameters<typeof Usuario.create>[0]> = {}): Usuario {
  return Usuario.create({
    nome: 'João Silva',
    email: 'joao@email.com',
    senhaHash: 'hashed:senha123',
    perfil: 'CLIENTE',
    ativo: true,
    ...override,
  })
}

export function makeCliente(usuarioId: string, override: Partial<Parameters<typeof Cliente.create>[0]> = {}): Cliente {
  return Cliente.create({ usuarioId, ...override })
}

export function makeCorretor(usuarioId: string, override: Partial<Parameters<typeof Corretor.create>[0]> = {}): Corretor {
  return Corretor.create({
    usuarioId,
    creci: 'CRECI-12345',
    ...override,
  })
}

export function makeImovel(override: Partial<Parameters<typeof Imovel.create>[0]> = {}): Imovel {
  return Imovel.create({
    titulo: 'Apartamento Centro',
    tipo: 'APARTAMENTO',
    finalidade: 'VENDA',
    quartos: 2,
    banheiros: 1,
    vagas: 1,
    preco: 350000,
    endereco: {
      cep: '01310-100',
      logradouro: 'Av. Paulista',
      numero: '1000',
      bairro: 'Bela Vista',
      cidade: 'São Paulo',
      estado: 'SP',
    },
    ...override,
  })
}
