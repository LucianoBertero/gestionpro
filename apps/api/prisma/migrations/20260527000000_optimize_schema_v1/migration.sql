-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SOCIO', 'COLABORADOR');

-- CreateEnum
CREATE TYPE "TipoImpuesto" AS ENUM ('AUTONOMOS', 'IVA', 'IIBB_LOCAL', 'MUNICIPAL', 'SUELDOS', 'MONOTRIBUTO', 'GANANCIAS');

-- CreateEnum
CREATE TYPE "EstadoSemaforo" AS ENUM ('VERDE', 'AMARILLO', 'ROJO');

-- CreateEnum
CREATE TYPE "TipoTarea" AS ENUM ('DDJJ', 'VEP', 'INTERNA', 'BALANCE', 'OTRO');

-- CreateEnum
CREATE TYPE "Prioridad" AS ENUM ('ALTA', 'MEDIA', 'BAJA');

-- CreateEnum
CREATE TYPE "EstadoTarea" AS ENUM ('PENDIENTE', 'EN_PROCESO', 'COMPLETADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "ResultadoLiq" AS ENUM ('A_PAGAR', 'SALDO_A_FAVOR', 'SIN_MOVIMIENTO');

-- CreateEnum
CREATE TYPE "TipoEvento" AS ENUM ('TAREA', 'ESTUDIO', 'PERSONAL');

-- CreateEnum
CREATE TYPE "OrigenEvento" AS ENUM ('SISTEMA', 'MANUAL', 'GOOGLE');

-- CreateEnum
CREATE TYPE "TipoTemplate" AS ENUM ('VENCIMIENTO', 'LIQUIDACION', 'RECORDATORIO', 'GENERAL');

-- CreateEnum
CREATE TYPE "TipoNotificacion" AS ENUM ('VENCIMIENTO', 'TAREA', 'SISTEMA');

-- CreateEnum
CREATE TYPE "TipoArchivo" AS ENUM ('COMPROBANTE', 'DDJJ', 'CONTRATO', 'OTRO');

-- CreateEnum
CREATE TYPE "TipoComunicacion" AS ENUM ('EMAIL', 'WHATSAPP', 'LLAMADA', 'REUNION', 'OTRO');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "telefono" TEXT,
    "role" "Role" NOT NULL DEFAULT 'COLABORADOR',
    "emoji" TEXT DEFAULT '👤',
    "telegram_chat_id" TEXT,
    "estudio_id" INTEGER NOT NULL DEFAULT 1,
    "google_tokens" JSONB,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expira" TIMESTAMP(3) NOT NULL,
    "revocado" BOOLEAN NOT NULL DEFAULT false,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" SERIAL NOT NULL,
    "estudio_id" INTEGER NOT NULL DEFAULT 1,
    "cuit" TEXT NOT NULL,
    "denominacion" TEXT NOT NULL,
    "termino" INTEGER NOT NULL DEFAULT 0,
    "condicion_iva" TEXT NOT NULL,
    "actividades" TEXT[],
    "domicilio" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "whatsapp" TEXT,
    "encargado_id" TEXT NOT NULL,
    "supervisor_id" TEXT,
    "semaforo" "EstadoSemaforo" NOT NULL DEFAULT 'VERDE',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "honorario_mensual" DECIMAL(10,2),
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cliente_impuestos" (
    "id" SERIAL NOT NULL,
    "cliente_id" INTEGER NOT NULL,
    "tipo" "TipoImpuesto" NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cliente_impuestos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tareas" (
    "id" SERIAL NOT NULL,
    "estudio_id" INTEGER NOT NULL DEFAULT 1,
    "cliente_id" INTEGER,
    "encargado_id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "tipo" "TipoTarea" NOT NULL,
    "impuesto" "TipoImpuesto",
    "periodo" TEXT,
    "tiempo_est_min" INTEGER,
    "prioridad" "Prioridad" NOT NULL DEFAULT 'MEDIA',
    "estado" "EstadoTarea" NOT NULL DEFAULT 'PENDIENTE',
    "vence" TIMESTAMP(3),
    "es_recurrente" BOOLEAN NOT NULL DEFAULT false,
    "regla_recur" JSONB,
    "notas" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tareas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "liquidaciones" (
    "id" SERIAL NOT NULL,
    "estudio_id" INTEGER NOT NULL DEFAULT 1,
    "cliente_id" INTEGER NOT NULL,
    "impuesto" "TipoImpuesto" NOT NULL,
    "periodo" TEXT NOT NULL,
    "resultado" "ResultadoLiq" NOT NULL,
    "importe" DECIMAL(12,2),
    "importe_ref" DECIMAL(12,2),
    "vencimiento" TIMESTAMP(3),
    "forma_pago" TEXT,
    "comprobante" TEXT,
    "cargado_por_id" TEXT NOT NULL,
    "origen_carga" TEXT NOT NULL DEFAULT 'MANUAL',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "liquidaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agenda_items" (
    "id" SERIAL NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "tarea_id" INTEGER,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL,
    "duracion_min" INTEGER NOT NULL,
    "tipo" "TipoEvento" NOT NULL DEFAULT 'PERSONAL',
    "origen" "OrigenEvento" NOT NULL DEFAULT 'MANUAL',
    "google_event_id" TEXT,
    "es_estudio" BOOLEAN NOT NULL DEFAULT false,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agenda_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calendario_vencimientos" (
    "id" SERIAL NOT NULL,
    "impuesto" "TipoImpuesto" NOT NULL,
    "anio" INTEGER NOT NULL,
    "mes" INTEGER NOT NULL,
    "digito_cuit" INTEGER NOT NULL,
    "fecha_vence" TIMESTAMP(3) NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "calendario_vencimientos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificaciones" (
    "id" SERIAL NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "tipo" "TipoNotificacion" NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "enlace" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notificaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_templates" (
    "id" SERIAL NOT NULL,
    "estudio_id" INTEGER NOT NULL DEFAULT 1,
    "nombre" TEXT NOT NULL,
    "tipo" "TipoTemplate" NOT NULL,
    "asunto" TEXT NOT NULL,
    "cuerpo" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comunicaciones" (
    "id" SERIAL NOT NULL,
    "cliente_id" INTEGER NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "tipo" "TipoComunicacion" NOT NULL,
    "asunto" TEXT,
    "contenido" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comunicaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notas_cliente" (
    "id" SERIAL NOT NULL,
    "cliente_id" INTEGER NOT NULL,
    "contenido" TEXT NOT NULL,
    "creado_por_id" TEXT NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notas_cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "archivos" (
    "id" SERIAL NOT NULL,
    "cliente_id" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" "TipoArchivo" NOT NULL,
    "periodo" TEXT,
    "url" TEXT NOT NULL,
    "tamanio_kb" INTEGER,
    "subido_por_id" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "archivos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "idx_refresh_tokens_usuario" ON "refresh_tokens"("usuario_id", "revocado");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_cuit_key" ON "clientes"("cuit");

-- CreateIndex
CREATE INDEX "idx_clientes_encargado" ON "clientes"("encargado_id");

-- CreateIndex
CREATE INDEX "idx_clientes_activo_estudio" ON "clientes"("activo", "estudio_id");

-- CreateIndex
CREATE INDEX "idx_clientes_semaforo" ON "clientes"("semaforo", "activo");

-- CreateIndex
CREATE UNIQUE INDEX "cliente_impuestos_cliente_id_tipo_key" ON "cliente_impuestos"("cliente_id", "tipo");

-- CreateIndex
CREATE INDEX "idx_tareas_cliente_estado" ON "tareas"("cliente_id", "estado");

-- CreateIndex
CREATE INDEX "idx_tareas_encargado_estado" ON "tareas"("encargado_id", "estado");

-- CreateIndex
CREATE INDEX "idx_tareas_estado_vence" ON "tareas"("estado", "vence");

-- CreateIndex
CREATE INDEX "idx_liquidaciones_cliente_impuesto_periodo" ON "liquidaciones"("cliente_id", "impuesto", "periodo");

-- CreateIndex
CREATE INDEX "idx_liquidaciones_periodo" ON "liquidaciones"("periodo");

-- CreateIndex
CREATE UNIQUE INDEX "liquidaciones_cliente_id_impuesto_periodo_key" ON "liquidaciones"("cliente_id", "impuesto", "periodo");

-- CreateIndex
CREATE INDEX "idx_agenda_usuario_fecha" ON "agenda_items"("usuario_id", "fecha");

-- CreateIndex
CREATE INDEX "idx_calendario_fecha_vence" ON "calendario_vencimientos"("fecha_vence");

-- CreateIndex
CREATE UNIQUE INDEX "calendario_vencimientos_impuesto_anio_mes_digito_cuit_key" ON "calendario_vencimientos"("impuesto", "anio", "mes", "digito_cuit");

-- CreateIndex
CREATE INDEX "idx_notificaciones_usuario_leida" ON "notificaciones"("usuario_id", "leida", "creado_en");

-- CreateIndex
CREATE INDEX "idx_comunicaciones_cliente_fecha" ON "comunicaciones"("cliente_id", "creado_en");

-- CreateIndex
CREATE INDEX "idx_notas_cliente_fecha" ON "notas_cliente"("cliente_id", "creado_en");

-- CreateIndex
CREATE INDEX "idx_archivos_cliente_tipo" ON "archivos"("cliente_id", "tipo");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_encargado_id_fkey" FOREIGN KEY ("encargado_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_supervisor_id_fkey" FOREIGN KEY ("supervisor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cliente_impuestos" ADD CONSTRAINT "cliente_impuestos_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tareas" ADD CONSTRAINT "tareas_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tareas" ADD CONSTRAINT "tareas_encargado_id_fkey" FOREIGN KEY ("encargado_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "liquidaciones" ADD CONSTRAINT "liquidaciones_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "liquidaciones" ADD CONSTRAINT "liquidaciones_cargado_por_id_fkey" FOREIGN KEY ("cargado_por_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agenda_items" ADD CONSTRAINT "agenda_items_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agenda_items" ADD CONSTRAINT "agenda_items_tarea_id_fkey" FOREIGN KEY ("tarea_id") REFERENCES "tareas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comunicaciones" ADD CONSTRAINT "comunicaciones_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comunicaciones" ADD CONSTRAINT "comunicaciones_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notas_cliente" ADD CONSTRAINT "notas_cliente_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notas_cliente" ADD CONSTRAINT "notas_cliente_creado_por_id_fkey" FOREIGN KEY ("creado_por_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "archivos" ADD CONSTRAINT "archivos_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "archivos" ADD CONSTRAINT "archivos_subido_por_id_fkey" FOREIGN KEY ("subido_por_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

