import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Senha padrão para todos os usuários: senha123
const SENHA_PADRAO = 'senha123'

async function hash(senha: string) {
  return bcrypt.hash(senha, 10)
}

async function main() {
  console.log('🌱 Iniciando seed...')

  // ─── Limpa tabelas na ordem correta ──────────────────────────────────────────
  await prisma.interesse.deleteMany()
  await prisma.clienteFavorito.deleteMany()
  await prisma.corretorImovel.deleteMany()
  await prisma.corretorCliente.deleteMany()
  await prisma.sessao.deleteMany()
  await prisma.tokenRecuperacao.deleteMany()
  await prisma.imovel.deleteMany()
  await prisma.cliente.deleteMany()
  await prisma.corretor.deleteMany()
  await prisma.usuario.deleteMany()

  console.log('🗑️  Banco limpo')

  // ─── 1. Admin ─────────────────────────────────────────────────────────────────
  const admin = await prisma.usuario.create({
    data: {
      nome: 'Rodrigo Administrador',
      email: 'admin@imobiliaria.com',
      senhaHash: await hash(SENHA_PADRAO),
      telefone: '11999990000',
      cpf: '00000000001',
      perfil: 'ADMINISTRADOR',
    },
  })

  // ─── 2. Gestores ─────────────────────────────────────────────────────────────
  const gestor1 = await prisma.usuario.create({
    data: {
      nome: 'Fernanda Gestora',
      email: 'fernanda@imobiliaria.com',
      senhaHash: await hash(SENHA_PADRAO),
      telefone: '11988880001',
      cpf: '00000000002',
      perfil: 'GESTOR',
    },
  })

  const gestor2 = await prisma.usuario.create({
    data: {
      nome: 'Ricardo Gestor',
      email: 'ricardo@imobiliaria.com',
      senhaHash: await hash(SENHA_PADRAO),
      telefone: '11988880002',
      cpf: '00000000003',
      perfil: 'GESTOR',
    },
  })

  console.log('👑 Admin e gestores criados')

  // ─── 3. Corretores ────────────────────────────────────────────────────────────
  const dadosCorretores = [
    {
      nome: 'Carlos Oliveira',
      email: 'carlos@imobiliaria.com',
      cpf: '11111111101',
      telefone: '11977770001',
      creci: '123456-SP',
      bio: 'Especialista em imóveis residenciais de alto padrão na região da Paulista.',
    },
    {
      nome: 'Ana Paula Santos',
      email: 'ana.paula@imobiliaria.com',
      cpf: '11111111102',
      telefone: '11977770002',
      creci: '234567-SP',
      bio: 'Foco em imóveis comerciais e galpões logísticos no ABC Paulista.',
    },
    {
      nome: 'Marcelo Ferreira',
      email: 'marcelo@imobiliaria.com',
      cpf: '11111111103',
      telefone: '11977770003',
      creci: '345678-SP',
      bio: '10 anos de experiência em lançamentos e imóveis na planta.',
    },
  ]

  const corretores = await Promise.all(
    dadosCorretores.map(async ({ nome, email, cpf, telefone, creci, bio }) => {
      const usuario = await prisma.usuario.create({
        data: {
          nome,
          email,
          senhaHash: await hash(SENHA_PADRAO),
          cpf,
          telefone,
          perfil: 'CORRETOR',
        },
      })
      const corretor = await prisma.corretor.create({
        data: { usuarioId: usuario.id, creci, bio },
      })
      return { usuario, corretor }
    }),
  )

  console.log('🏠 Corretores criados')

  // ─── 4. Clientes ─────────────────────────────────────────────────────────────
  const dadosClientes = [
    { nome: 'Maria Silva',      email: 'maria@email.com',      cpf: '22222222201', profissao: 'Engenheira',       nascimento: '1985-03-15' },
    { nome: 'João Pereira',     email: 'joao@email.com',       cpf: '22222222202', profissao: 'Médico',           nascimento: '1978-07-22' },
    { nome: 'Larissa Costa',    email: 'larissa@email.com',    cpf: '22222222203', profissao: 'Arquiteta',        nascimento: '1992-11-08' },
    { nome: 'Bruno Mendes',     email: 'bruno@email.com',      cpf: '22222222204', profissao: 'Empresário',       nascimento: '1980-01-30' },
    { nome: 'Patricia Alves',   email: 'patricia@email.com',   cpf: '22222222205', profissao: 'Advogada',         nascimento: '1990-06-17' },
    { nome: 'Gustavo Lima',     email: 'gustavo@email.com',    cpf: '22222222206', profissao: 'Desenvolvedor',    nascimento: '1995-09-04' },
    { nome: 'Camila Torres',    email: 'camila@email.com',     cpf: '22222222207', profissao: 'Professora',       nascimento: '1988-12-20' },
    { nome: 'Felipe Rocha',     email: 'felipe@email.com',     cpf: '22222222208', profissao: 'Contador',         nascimento: '1983-04-11' },
    { nome: 'Aline Souza',      email: 'aline@email.com',      cpf: '22222222209', profissao: 'Dentista',         nascimento: '1991-08-25' },
    { nome: 'Thiago Martins',   email: 'thiago@email.com',     cpf: '22222222210', profissao: 'Analista',         nascimento: '1987-02-14' },
  ]

  const clientes = await Promise.all(
    dadosClientes.map(async ({ nome, email, cpf, profissao, nascimento }) => {
      const usuario = await prisma.usuario.create({
        data: {
          nome,
          email,
          senhaHash: await hash(SENHA_PADRAO),
          cpf,
          telefone: `119${Math.floor(10000000 + Math.random() * 90000000)}`,
          perfil: 'CLIENTE',
        },
      })
      const cliente = await prisma.cliente.create({
        data: {
          usuarioId: usuario.id,
          profissao,
          dataNascimento: new Date(nascimento),
        },
      })
      return { usuario, cliente }
    }),
  )

  console.log('👥 Clientes criados')

  // ─── 5. Imóveis ──────────────────────────────────────────────────────────────
  const imoveis = await Promise.all([
    // São Paulo — Apartamentos
    prisma.imovel.create({ data: {
      titulo: 'Apartamento 3 quartos — Jardins',
      tipo: 'APARTAMENTO', finalidade: 'VENDA', status: 'DISPONIVEL',
      descricao: 'Amplo apartamento reformado com varanda gourmet e 2 suítes. Condomínio com piscina, academia e salão de festas. Próximo ao Parque Ibirapuera.',
      quartos: 3, banheiros: 2, vagas: 2, preco: 980000,
      areaTotal: 145, areaUtil: 120,
      dataConstrucao: new Date('2012-06-01'),
      corretorResponsavelId: corretores[0].corretor.id,
      endCep: '01403-000', endLogradouro: 'Rua Oscar Freire', endNumero: '200',
      endBairro: 'Jardins', endCidade: 'São Paulo', endEstado: 'SP',
      endLatitude: -23.5659, endLongitude: -46.6711,
    }}),

    prisma.imovel.create({ data: {
      titulo: 'Studio moderno — Vila Madalena',
      tipo: 'STUDIO', finalidade: 'VENDA', status: 'DISPONIVEL',
      descricao: 'Studio compacto com projeto assinado, acabamento premium e varanda. Ideal para investimento ou moradia. Próximo a bares, restaurantes e transporte.',
      quartos: 1, banheiros: 1, vagas: 1, preco: 420000,
      areaTotal: 38, areaUtil: 32,
      dataConstrucao: new Date('2020-03-15'),
      corretorResponsavelId: corretores[0].corretor.id,
      endCep: '05434-020', endLogradouro: 'Rua Aspicuelta', endNumero: '55',
      endBairro: 'Vila Madalena', endCidade: 'São Paulo', endEstado: 'SP',
      endLatitude: -23.5535, endLongitude: -46.6917,
    }}),

    prisma.imovel.create({ data: {
      titulo: 'Cobertura duplex — Moema',
      tipo: 'COBERTURA', finalidade: 'VENDA', status: 'RESERVADO',
      descricao: 'Cobertura com 4 suítes, piscina privativa, churrasqueira e vista panorâmica. Dois andares com escada interna e terraço de 80m². Condomínio fechado de alto padrão.',
      quartos: 4, banheiros: 5, vagas: 4, preco: 3200000,
      areaTotal: 320, areaUtil: 280,
      dataConstrucao: new Date('2018-09-20'),
      corretorResponsavelId: corretores[0].corretor.id,
      endCep: '04077-020', endLogradouro: 'Alameda dos Arapanés', endNumero: '800',
      endBairro: 'Moema', endCidade: 'São Paulo', endEstado: 'SP',
      endLatitude: -23.6025, endLongitude: -46.6653,
    }}),

    prisma.imovel.create({ data: {
      titulo: 'Apartamento 2 quartos — Pinheiros',
      tipo: 'APARTAMENTO', finalidade: 'LOCACAO', status: 'DISPONIVEL',
      descricao: 'Apartamento bem localizado com 2 quartos, 1 suíte. Próximo ao metrô Faria Lima e ao shopping. Condomínio com portaria 24h.',
      quartos: 2, banheiros: 2, vagas: 1, preco: 4500,
      areaTotal: 78, areaUtil: 68,
      dataConstrucao: new Date('2015-11-10'),
      corretorResponsavelId: corretores[1].corretor.id,
      endCep: '05422-010', endLogradouro: 'Rua dos Pinheiros', endNumero: '340',
      endBairro: 'Pinheiros', endCidade: 'São Paulo', endEstado: 'SP',
      endLatitude: -23.5652, endLongitude: -46.6832,
    }}),

    // São Paulo — Casas
    prisma.imovel.create({ data: {
      titulo: 'Casa 4 quartos com piscina — Alphaville',
      tipo: 'CASA', finalidade: 'VENDA', status: 'DISPONIVEL',
      descricao: 'Casa em condomínio fechado com 4 suítes, piscina aquecida, churrasqueira, jardim e área gourmet. Segurança 24h, quadra de tênis e campo de futebol.',
      quartos: 4, banheiros: 4, vagas: 4, preco: 2100000,
      areaTotal: 380, areaUtil: 300,
      dataConstrucao: new Date('2010-05-20'),
      corretorResponsavelId: corretores[2].corretor.id,
      endCep: '06454-000', endLogradouro: 'Alameda Tocantins', endNumero: '125',
      endBairro: 'Alphaville', endCidade: 'Barueri', endEstado: 'SP',
      endLatitude: -23.4967, endLongitude: -46.8506,
    }}),

    prisma.imovel.create({ data: {
      titulo: 'Casa térrea 3 quartos — Santo André',
      tipo: 'CASA', finalidade: 'VENDA', status: 'DISPONIVEL',
      descricao: 'Casa térrea com 3 quartos, sala, cozinha planejada, quintal amplo e garagem para 2 carros. Bairro tranquilo e bem servido de transporte.',
      quartos: 3, banheiros: 2, vagas: 2, preco: 650000,
      areaTotal: 180, areaUtil: 150,
      dataConstrucao: new Date('2005-08-12'),
      corretorResponsavelId: corretores[1].corretor.id,
      endCep: '09090-000', endLogradouro: 'Rua das Acácias', endNumero: '78',
      endBairro: 'Vila Guiomar', endCidade: 'Santo André', endEstado: 'SP',
      endLatitude: -23.6628, endLongitude: -46.5312,
    }}),

    // Campinas
    prisma.imovel.create({ data: {
      titulo: 'Apartamento 2 quartos — Cambuí',
      tipo: 'APARTAMENTO', finalidade: 'VENDA', status: 'DISPONIVEL',
      descricao: 'Apartamento no coração do Cambuí, andar alto com vista. 2 quartos sendo 1 suíte, sala ampla, varanda. Condomínio com piscina e salão.',
      quartos: 2, banheiros: 2, vagas: 1, preco: 480000,
      areaTotal: 85, areaUtil: 72,
      dataConstrucao: new Date('2017-04-25'),
      corretorResponsavelId: corretores[2].corretor.id,
      endCep: '13024-020', endLogradouro: 'Rua Dr. Quirino', endNumero: '1500',
      endBairro: 'Cambuí', endCidade: 'Campinas', endEstado: 'SP',
      endLatitude: -22.9023, endLongitude: -47.0597,
    }}),

    prisma.imovel.create({ data: {
      titulo: 'Casa em condomínio — Sousas',
      tipo: 'CASA', finalidade: 'VENDA', status: 'DISPONIVEL',
      descricao: 'Bela casa de campo em condomínio rural fechado. 3 suítes, churrasqueira, piscina e área verde de 500m². Contato direto com a natureza a 20 min do centro.',
      quartos: 3, banheiros: 3, vagas: 3, preco: 1350000,
      areaTotal: 450, areaUtil: 250,
      dataConstrucao: new Date('2014-12-01'),
      corretorResponsavelId: corretores[0].corretor.id,
      endCep: '13106-000', endLogradouro: 'Estrada dos Costas', endNumero: '2200',
      endBairro: 'Sousas', endCidade: 'Campinas', endEstado: 'SP',
      endLatitude: -22.8401, endLongitude: -46.9968,
    }}),

    // Imóveis Comerciais
    prisma.imovel.create({ data: {
      titulo: 'Sala comercial 60m² — Berrini',
      tipo: 'COMERCIAL', finalidade: 'LOCACAO', status: 'DISPONIVEL',
      descricao: 'Sala comercial em edifício corporativo AAA na Berrini. Piso elevado, forro modulado, ar-condicionado central. Ideal para escritórios e consultorias.',
      quartos: 0, banheiros: 1, vagas: 2, preco: 7800,
      areaTotal: 60, areaUtil: 55,
      dataConstrucao: new Date('2016-02-14'),
      corretorResponsavelId: corretores[1].corretor.id,
      endCep: '04711-130', endLogradouro: 'Av. das Nações Unidas', endNumero: '12551',
      endBairro: 'Brooklin', endCidade: 'São Paulo', endEstado: 'SP',
      endLatitude: -23.6084, endLongitude: -46.6971,
    }}),

    prisma.imovel.create({ data: {
      titulo: 'Galpão logístico 2.000m² — Guarulhos',
      tipo: 'COMERCIAL', finalidade: 'LOCACAO', status: 'DISPONIVEL',
      descricao: 'Galpão industrial com pé-direito de 12m, 4 docas niveladoras, piso de concreto reforçado e área de escritório de 200m². Próximo ao aeroporto de Guarulhos.',
      quartos: 0, banheiros: 4, vagas: 20, preco: 45000,
      areaTotal: 2000, areaUtil: 1800,
      dataConstrucao: new Date('2019-07-30'),
      corretorResponsavelId: corretores[1].corretor.id,
      endCep: '07190-000', endLogradouro: 'Av. Tiradentes', endNumero: '4500',
      endBairro: 'Macedo', endCidade: 'Guarulhos', endEstado: 'SP',
      endLatitude: -23.4419, endLongitude: -46.5332,
    }}),

    // Terrenos
    prisma.imovel.create({ data: {
      titulo: 'Terreno 1.000m² — Cotia',
      tipo: 'TERRENO', finalidade: 'VENDA', status: 'DISPONIVEL',
      descricao: 'Terreno plano de 1.000m² em loteamento fechado. Toda a infraestrutura implantada: água, esgoto, energia e pavimentação. Ideal para construção.',
      quartos: 0, banheiros: 0, vagas: 0, preco: 320000,
      areaTotal: 1000,
      corretorResponsavelId: corretores[2].corretor.id,
      endCep: '06700-000', endLogradouro: 'Rua das Palmeiras', endNumero: 'SN',
      endBairro: 'Granja Viana', endCidade: 'Cotia', endEstado: 'SP',
      endLatitude: -23.6046, endLongitude: -46.9257,
    }}),

    // Rio de Janeiro
    prisma.imovel.create({ data: {
      titulo: 'Apartamento 3 quartos — Ipanema',
      tipo: 'APARTAMENTO', finalidade: 'VENDA', status: 'DISPONIVEL',
      descricao: 'Apartamento a 3 quadras da praia de Ipanema. Vista parcial do mar, 3 quartos sendo 2 suítes, varanda e 2 vagas. Prédio boutique com apenas 4 andares.',
      quartos: 3, banheiros: 3, vagas: 2, preco: 2800000,
      areaTotal: 130, areaUtil: 115,
      dataConstrucao: new Date('2008-03-10'),
      corretorResponsavelId: corretores[0].corretor.id,
      endCep: '22420-002', endLogradouro: 'Rua Garcia D\'Ávila', endNumero: '120',
      endBairro: 'Ipanema', endCidade: 'Rio de Janeiro', endEstado: 'RJ',
      endLatitude: -22.9843, endLongitude: -43.2034,
    }}),

    prisma.imovel.create({ data: {
      titulo: 'Cobertura com vista para o mar — Barra da Tijuca',
      tipo: 'COBERTURA', finalidade: 'VENDA', status: 'DISPONIVEL',
      descricao: 'Cobertura exclusiva com 4 suítes, piscina privativa, churrasqueira e vista 360° para o mar e a Pedra da Gávea. Acabamento importado e automação residencial.',
      quartos: 4, banheiros: 5, vagas: 4, preco: 5500000,
      areaTotal: 400, areaUtil: 350,
      dataConstrucao: new Date('2021-01-15'),
      corretorResponsavelId: corretores[2].corretor.id,
      endCep: '22631-000', endLogradouro: 'Av. Lúcio Costa', endNumero: '3300',
      endBairro: 'Barra da Tijuca', endCidade: 'Rio de Janeiro', endEstado: 'RJ',
      endLatitude: -23.0057, endLongitude: -43.3648,
    }}),

    prisma.imovel.create({ data: {
      titulo: 'Apartamento 1 quarto — Botafogo',
      tipo: 'APARTAMENTO', finalidade: 'LOCACAO', status: 'LOCADO',
      descricao: 'Apartamento compacto e funcional em Botafogo. 1 quarto, sala, cozinha americana e banheiro. Prédio com portaria 24h.',
      quartos: 1, banheiros: 1, vagas: 0, preco: 2800,
      areaTotal: 42, areaUtil: 38,
      dataConstrucao: new Date('2003-09-05'),
      corretorResponsavelId: corretores[1].corretor.id,
      endCep: '22250-040', endLogradouro: 'Rua Voluntários da Pátria', endNumero: '89',
      endBairro: 'Botafogo', endCidade: 'Rio de Janeiro', endEstado: 'RJ',
      endLatitude: -22.9459, endLongitude: -43.1820,
    }}),

    // Belo Horizonte
    prisma.imovel.create({ data: {
      titulo: 'Apartamento 3 quartos — Savassi',
      tipo: 'APARTAMENTO', finalidade: 'VENDA', status: 'DISPONIVEL',
      descricao: 'Apartamento espaçoso na Savassi, bairro mais charmoso de BH. 3 quartos, 2 suítes, varanda, 2 vagas. Perto de restaurantes, bares e mercados.',
      quartos: 3, banheiros: 3, vagas: 2, preco: 720000,
      areaTotal: 110, areaUtil: 95,
      dataConstrucao: new Date('2013-07-18'),
      corretorResponsavelId: corretores[2].corretor.id,
      endCep: '30130-170', endLogradouro: 'Rua Pernambuco', endNumero: '600',
      endBairro: 'Savassi', endCidade: 'Belo Horizonte', endEstado: 'MG',
      endLatitude: -19.9342, endLongitude: -43.9333,
    }}),

    prisma.imovel.create({ data: {
      titulo: 'Casa 4 quartos — Nova Lima',
      tipo: 'CASA', finalidade: 'VENDA', status: 'DISPONIVEL',
      descricao: 'Casa em condomínio de alto padrão em Nova Lima. 4 suítes, home theater, escritório, piscina, jardim e área gourmet completa. Segurança 24h.',
      quartos: 4, banheiros: 5, vagas: 4, preco: 1800000,
      areaTotal: 420, areaUtil: 350,
      dataConstrucao: new Date('2016-03-22'),
      corretorResponsavelId: corretores[0].corretor.id,
      endCep: '34000-000', endLogradouro: 'Rua do Mirante', endNumero: '350',
      endBairro: 'Vale dos Cristais', endCidade: 'Nova Lima', endEstado: 'MG',
      endLatitude: -19.9855, endLongitude: -43.8461,
    }}),

    // Florianópolis
    prisma.imovel.create({ data: {
      titulo: 'Apartamento com vista para o mar — Jurerê',
      tipo: 'APARTAMENTO', finalidade: 'VENDA', status: 'DISPONIVEL',
      descricao: 'Apartamento de alto padrão em Jurerê Internacional com vista deslumbrante para o mar. 3 suítes, 3 vagas, piscina e jacuzzi privativos.',
      quartos: 3, banheiros: 3, vagas: 3, preco: 2200000,
      areaTotal: 160, areaUtil: 140,
      dataConstrucao: new Date('2022-06-01'),
      corretorResponsavelId: corretores[0].corretor.id,
      endCep: '88053-300', endLogradouro: 'Alameda César Nascimento', endNumero: '180',
      endBairro: 'Jurerê Internacional', endCidade: 'Florianópolis', endEstado: 'SC',
      endLatitude: -27.4471, endLongitude: -48.4914,
    }}),

    prisma.imovel.create({ data: {
      titulo: 'Casa de praia — Ingleses',
      tipo: 'CASA', finalidade: 'VENDA_LOCACAO', status: 'DISPONIVEL',
      descricao: 'Casa a 200m da praia dos Ingleses. 3 quartos, churrasqueira, piscina e amplo jardim. Disponível para venda ou locação de temporada.',
      quartos: 3, banheiros: 2, vagas: 2, preco: 850000,
      areaTotal: 200, areaUtil: 160,
      dataConstrucao: new Date('2011-12-10'),
      corretorResponsavelId: corretores[1].corretor.id,
      endCep: '88058-001', endLogradouro: 'Rua Dom João Becker', endNumero: '55',
      endBairro: 'Ingleses', endCidade: 'Florianópolis', endEstado: 'SC',
      endLatitude: -27.4353, endLongitude: -48.3933,
    }}),

    // Vendidos / Inativos (para variedade de status)
    prisma.imovel.create({ data: {
      titulo: 'Apartamento 2 quartos — Centro SP',
      tipo: 'APARTAMENTO', finalidade: 'VENDA', status: 'VENDIDO',
      descricao: 'Apartamento já vendido. Histórico para relatórios.',
      quartos: 2, banheiros: 1, vagas: 1, preco: 390000,
      areaTotal: 70, areaUtil: 60,
      dataConstrucao: new Date('2000-01-01'),
      corretorResponsavelId: corretores[2].corretor.id,
      endCep: '01310-100', endLogradouro: 'Av. Paulista', endNumero: '900',
      endBairro: 'Bela Vista', endCidade: 'São Paulo', endEstado: 'SP',
    }}),

    prisma.imovel.create({ data: {
      titulo: 'Terreno rural — Interior SP',
      tipo: 'RURAL', finalidade: 'VENDA', status: 'DISPONIVEL',
      descricao: 'Sítio com 5 alqueires, casa sede, curral, poço artesiano e nascente. Acesso por estrada pavimentada a 3km da cidade.',
      quartos: 3, banheiros: 2, vagas: 5, preco: 580000,
      areaTotal: 121000, areaUtil: 100000,
      corretorResponsavelId: corretores[2].corretor.id,
      endCep: '13900-000', endLogradouro: 'Estrada Municipal', endNumero: 'KM 12',
      endBairro: 'Zona Rural', endCidade: 'Amparo', endEstado: 'SP',
      endLatitude: -22.7042, endLongitude: -46.7659,
    }}),
  ])

  console.log(`🏘️  ${imoveis.length} imóveis criados`)

  // ─── 6. Vínculos corretor ↔ imóvel ───────────────────────────────────────────
  const vinculosCI = [
    { corretorId: corretores[0].corretor.id, imovelId: imoveis[0].id },
    { corretorId: corretores[0].corretor.id, imovelId: imoveis[1].id },
    { corretorId: corretores[0].corretor.id, imovelId: imoveis[11].id },
    { corretorId: corretores[0].corretor.id, imovelId: imoveis[15].id },
    { corretorId: corretores[1].corretor.id, imovelId: imoveis[3].id },
    { corretorId: corretores[1].corretor.id, imovelId: imoveis[5].id },
    { corretorId: corretores[1].corretor.id, imovelId: imoveis[8].id },
    { corretorId: corretores[2].corretor.id, imovelId: imoveis[4].id },
    { corretorId: corretores[2].corretor.id, imovelId: imoveis[6].id },
    { corretorId: corretores[2].corretor.id, imovelId: imoveis[14].id },
  ]

  await prisma.corretorImovel.createMany({ data: vinculosCI })

  // ─── 7. Vínculos corretor ↔ cliente ──────────────────────────────────────────
  const vinculosCC = [
    { corretorId: corretores[0].corretor.id, clienteId: clientes[0].cliente.id },
    { corretorId: corretores[0].corretor.id, clienteId: clientes[1].cliente.id },
    { corretorId: corretores[0].corretor.id, clienteId: clientes[2].cliente.id },
    { corretorId: corretores[1].corretor.id, clienteId: clientes[3].cliente.id },
    { corretorId: corretores[1].corretor.id, clienteId: clientes[4].cliente.id },
    { corretorId: corretores[2].corretor.id, clienteId: clientes[5].cliente.id },
    { corretorId: corretores[2].corretor.id, clienteId: clientes[6].cliente.id },
    { corretorId: corretores[2].corretor.id, clienteId: clientes[7].cliente.id },
  ]

  await prisma.corretorCliente.createMany({ data: vinculosCC })

  console.log('🔗 Vínculos criados')

  // ─── 8. Favoritos ────────────────────────────────────────────────────────────
  const favoritos = [
    { clienteId: clientes[0].cliente.id, imovelId: imoveis[0].id },
    { clienteId: clientes[0].cliente.id, imovelId: imoveis[4].id },
    { clienteId: clientes[0].cliente.id, imovelId: imoveis[11].id },
    { clienteId: clientes[1].cliente.id, imovelId: imoveis[0].id },
    { clienteId: clientes[1].cliente.id, imovelId: imoveis[2].id },
    { clienteId: clientes[2].cliente.id, imovelId: imoveis[6].id },
    { clienteId: clientes[2].cliente.id, imovelId: imoveis[16].id },
    { clienteId: clientes[3].cliente.id, imovelId: imoveis[4].id },
    { clienteId: clientes[3].cliente.id, imovelId: imoveis[12].id },
    { clienteId: clientes[4].cliente.id, imovelId: imoveis[1].id },
    { clienteId: clientes[5].cliente.id, imovelId: imoveis[8].id },
    { clienteId: clientes[6].cliente.id, imovelId: imoveis[11].id },
    { clienteId: clientes[7].cliente.id, imovelId: imoveis[0].id },
    { clienteId: clientes[8].cliente.id, imovelId: imoveis[15].id },
    { clienteId: clientes[9].cliente.id, imovelId: imoveis[4].id },
  ]

  await prisma.clienteFavorito.createMany({ data: favoritos })

  console.log('❤️  Favoritos criados')

  // ─── 9. Interesses ───────────────────────────────────────────────────────────
  const interesses = [
    {
      clienteId: clientes[0].cliente.id, imovelId: imoveis[0].id,
      corretorId: corretores[0].corretor.id,
      mensagem: 'Gostaria de agendar uma visita para o próximo sábado.',
      status: 'AGENDADO' as const,
    },
    {
      clienteId: clientes[1].cliente.id, imovelId: imoveis[4].id,
      corretorId: corretores[2].corretor.id,
      mensagem: 'Tenho interesse em fazer uma proposta. Qual é o valor mínimo aceito?',
      status: 'EM_ATENDIMENTO' as const,
    },
    {
      clienteId: clientes[2].cliente.id, imovelId: imoveis[6].id,
      corretorId: corretores[2].corretor.id,
      mensagem: 'Preciso de imóvel para mudança em 30 dias. É possível?',
      status: 'PENDENTE' as const,
    },
    {
      clienteId: clientes[3].cliente.id, imovelId: imoveis[11].id,
      corretorId: corretores[0].corretor.id,
      mensagem: 'Já visitei o imóvel e adorei. Quero falar com o corretor.',
      status: 'EM_ATENDIMENTO' as const,
    },
    {
      clienteId: clientes[4].cliente.id, imovelId: imoveis[1].id,
      corretorId: corretores[0].corretor.id,
      mensagem: 'Tenho interesse no studio para uso próprio.',
      status: 'FINALIZADO' as const,
    },
    {
      clienteId: clientes[5].cliente.id, imovelId: imoveis[8].id,
      corretorId: corretores[1].corretor.id,
      mensagem: 'Empresa em expansão buscando sala comercial de 50 a 80m².',
      status: 'AGENDADO' as const,
    },
    {
      clienteId: clientes[6].cliente.id, imovelId: imoveis[16].id,
      corretorId: corretores[0].corretor.id,
      mensagem: 'Adorei o apartamento em Jurerê. Posso ver pessoalmente?',
      status: 'PENDENTE' as const,
    },
    {
      clienteId: clientes[7].cliente.id, imovelId: imoveis[4].id,
      corretorId: corretores[2].corretor.id,
      mensagem: 'Busco casa em condomínio fechado até R$ 2.5 milhões.',
      status: 'CANCELADO' as const,
    },
  ]

  for (const interesse of interesses) {
    await prisma.interesse.create({ data: interesse })
  }

  console.log('💬 Interesses criados')

  // ─── Resumo ───────────────────────────────────────────────────────────────────
  console.log('\n✅ Seed concluído com sucesso!\n')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  Usuários criados:')
  console.log(`    • 1 Administrador  → admin@imobiliaria.com`)
  console.log(`    • 2 Gestores       → fernanda@imobiliaria.com / ricardo@imobiliaria.com`)
  console.log(`    • 3 Corretores     → carlos@ / ana.paula@ / marcelo@imobiliaria.com`)
  console.log(`    • 10 Clientes      → maria@email.com ... thiago@email.com`)
  console.log(`  Senha de todos:      senha123`)
  console.log(`  Imóveis:             ${imoveis.length}`)
  console.log(`  Favoritos:           ${favoritos.length}`)
  console.log(`  Interesses:          ${interesses.length}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
