-- Migration: add claves_cliente and claves_estudio tables
-- These tables were added to schema.prisma in feat(clave-cliente) but the
-- initial baseline migration 20260527000000_optimize_schema_v1 only covered
-- the original 12-model spec. This migration brings prod in sync.

-- CreateEnum
-- (No new enums needed for this migration.)

-- CreateTable: claves_estudio
CREATE TABLE "claves_estudio" (
    "id" TEXT NOT NULL,
    "estudio_id" INTEGER NOT NULL DEFAULT 1,
    "entidad" TEXT NOT NULL,
    "clave" TEXT NOT NULL,
    "creado_por_id" TEXT NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "claves_estudio_pkey" PRIMARY KEY ("id")
);

-- CreateTable: claves_cliente
CREATE TABLE "claves_cliente" (
    "id" TEXT NOT NULL,
    "cliente_id" INTEGER NOT NULL,
    "entidad" TEXT NOT NULL,
    "clave" TEXT NOT NULL,
    "creado_por_id" TEXT NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "claves_cliente_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "claves_estudio_entidad_key" ON "claves_estudio"("entidad");

-- CreateIndex
CREATE INDEX "idx_claves_cliente" ON "claves_cliente"("cliente_id", "entidad");

-- AddForeignKey
ALTER TABLE "claves_estudio" ADD CONSTRAINT "claves_estudio_creado_por_id_fkey" FOREIGN KEY ("creado_por_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claves_cliente" ADD CONSTRAINT "claves_cliente_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claves_cliente" ADD CONSTRAINT "claves_cliente_creado_por_id_fkey" FOREIGN KEY ("creado_por_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
