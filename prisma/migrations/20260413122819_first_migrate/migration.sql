-- CreateEnum
CREATE TYPE "PerfilUsuario" AS ENUM ('ADMINISTRADOR', 'GESTOR', 'CORRETOR', 'CLIENTE');

-- CreateEnum
CREATE TYPE "TipoImovel" AS ENUM ('APARTAMENTO', 'CASA', 'COMERCIAL', 'TERRENO', 'RURAL', 'STUDIO', 'COBERTURA');

-- CreateEnum
CREATE TYPE "FinalidadeImovel" AS ENUM ('VENDA', 'LOCACAO', 'VENDA_LOCACAO');

-- CreateEnum
CREATE TYPE "StatusImovel" AS ENUM ('DISPONIVEL', 'RESERVADO', 'VENDIDO', 'LOCADO', 'INATIVO');

-- CreateEnum
CREATE TYPE "StatusInteresse" AS ENUM ('PENDENTE', 'EM_ATENDIMENTO', 'AGENDADO', 'FINALIZADO', 'CANCELADO');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "telefone" TEXT,
    "cpf" TEXT,
    "perfil" "PerfilUsuario" NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessoes" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "ip" TEXT,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expira_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tokens_recuperacao" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "utilizado" BOOLEAN NOT NULL DEFAULT false,
    "expiracao" TIMESTAMP(3) NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tokens_recuperacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "data_nascimento" TIMESTAMP(3),
    "profissao" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "corretores" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "creci" TEXT NOT NULL,
    "bio" TEXT,
    "foto_url" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "corretores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "imoveis" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "tipo" "TipoImovel" NOT NULL,
    "finalidade" "FinalidadeImovel" NOT NULL,
    "descricao" TEXT,
    "area_total" DOUBLE PRECISION,
    "area_util" DOUBLE PRECISION,
    "quartos" INTEGER NOT NULL,
    "banheiros" INTEGER NOT NULL,
    "vagas" INTEGER NOT NULL,
    "preco" DOUBLE PRECISION NOT NULL,
    "status" "StatusImovel" NOT NULL DEFAULT 'DISPONIVEL',
    "corretor_responsavel_id" TEXT,
    "data_construcao" TIMESTAMP(3),
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,
    "end_cep" TEXT NOT NULL,
    "end_logradouro" TEXT NOT NULL,
    "end_numero" TEXT NOT NULL,
    "end_complemento" TEXT,
    "end_bairro" TEXT NOT NULL,
    "end_cidade" TEXT NOT NULL,
    "end_estado" TEXT NOT NULL,
    "end_latitude" DOUBLE PRECISION,
    "end_longitude" DOUBLE PRECISION,

    CONSTRAINT "imoveis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interesses" (
    "id" TEXT NOT NULL,
    "cliente_id" TEXT NOT NULL,
    "imovel_id" TEXT NOT NULL,
    "corretor_id" TEXT,
    "mensagem" TEXT,
    "status" "StatusInteresse" NOT NULL DEFAULT 'PENDENTE',
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interesses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes_favoritos" (
    "id" TEXT NOT NULL,
    "cliente_id" TEXT NOT NULL,
    "imovel_id" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clientes_favoritos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "corretores_imoveis" (
    "id" TEXT NOT NULL,
    "corretor_id" TEXT NOT NULL,
    "imovel_id" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "corretores_imoveis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "corretores_clientes" (
    "id" TEXT NOT NULL,
    "corretor_id" TEXT NOT NULL,
    "cliente_id" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "corretores_clientes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_cpf_key" ON "usuarios"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "sessoes_token_key" ON "sessoes"("token");

-- CreateIndex
CREATE UNIQUE INDEX "tokens_recuperacao_token_key" ON "tokens_recuperacao"("token");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_usuario_id_key" ON "clientes"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "corretores_usuario_id_key" ON "corretores"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "corretores_creci_key" ON "corretores"("creci");

-- CreateIndex
CREATE INDEX "imoveis_status_idx" ON "imoveis"("status");

-- CreateIndex
CREATE INDEX "imoveis_tipo_idx" ON "imoveis"("tipo");

-- CreateIndex
CREATE INDEX "imoveis_finalidade_idx" ON "imoveis"("finalidade");

-- CreateIndex
CREATE INDEX "imoveis_end_cidade_idx" ON "imoveis"("end_cidade");

-- CreateIndex
CREATE INDEX "imoveis_end_estado_idx" ON "imoveis"("end_estado");

-- CreateIndex
CREATE INDEX "imoveis_preco_idx" ON "imoveis"("preco");

-- CreateIndex
CREATE INDEX "interesses_cliente_id_idx" ON "interesses"("cliente_id");

-- CreateIndex
CREATE INDEX "interesses_imovel_id_idx" ON "interesses"("imovel_id");

-- CreateIndex
CREATE INDEX "interesses_corretor_id_idx" ON "interesses"("corretor_id");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_favoritos_cliente_id_imovel_id_key" ON "clientes_favoritos"("cliente_id", "imovel_id");

-- CreateIndex
CREATE UNIQUE INDEX "corretores_imoveis_corretor_id_imovel_id_key" ON "corretores_imoveis"("corretor_id", "imovel_id");

-- CreateIndex
CREATE UNIQUE INDEX "corretores_clientes_corretor_id_cliente_id_key" ON "corretores_clientes"("corretor_id", "cliente_id");

-- AddForeignKey
ALTER TABLE "sessoes" ADD CONSTRAINT "sessoes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokens_recuperacao" ADD CONSTRAINT "tokens_recuperacao_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corretores" ADD CONSTRAINT "corretores_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interesses" ADD CONSTRAINT "interesses_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interesses" ADD CONSTRAINT "interesses_imovel_id_fkey" FOREIGN KEY ("imovel_id") REFERENCES "imoveis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interesses" ADD CONSTRAINT "interesses_corretor_id_fkey" FOREIGN KEY ("corretor_id") REFERENCES "corretores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clientes_favoritos" ADD CONSTRAINT "clientes_favoritos_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clientes_favoritos" ADD CONSTRAINT "clientes_favoritos_imovel_id_fkey" FOREIGN KEY ("imovel_id") REFERENCES "imoveis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corretores_imoveis" ADD CONSTRAINT "corretores_imoveis_corretor_id_fkey" FOREIGN KEY ("corretor_id") REFERENCES "corretores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corretores_imoveis" ADD CONSTRAINT "corretores_imoveis_imovel_id_fkey" FOREIGN KEY ("imovel_id") REFERENCES "imoveis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corretores_clientes" ADD CONSTRAINT "corretores_clientes_corretor_id_fkey" FOREIGN KEY ("corretor_id") REFERENCES "corretores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corretores_clientes" ADD CONSTRAINT "corretores_clientes_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
