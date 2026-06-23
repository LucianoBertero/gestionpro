-- Multi-step migration: refactor archivos for R2-based polymorphic storage
-- All steps run inside a single transaction for atomicity

BEGIN;

-- ── Step 1: Add new columns as nullable ─────────────────────────────────────

ALTER TABLE "archivos"
  ADD COLUMN "storage_key"  TEXT,
  ADD COLUMN "mime_type"    TEXT,
  ADD COLUMN "bytes"        INTEGER,
  ADD COLUMN "extension"    TEXT,
  ADD COLUMN "original_name" TEXT;

-- ── Step 2: Backfill new columns from existing data ─────────────────────────
-- Only operates on rows that have cliente_id (the guard ensures we don't touch orphaned rows)

UPDATE "archivos"
SET
  "storage_key"   = CASE
                      WHEN "url" IS NOT NULL AND "url" <> ''
                      THEN 'legacy/' || COALESCE("url", 'unknown/' || "id"::TEXT)
                      ELSE 'legacy/estudio/1/cliente/' || COALESCE("cliente_id"::TEXT, '0') || '/' || "id"::TEXT || '/' || COALESCE("nombre", 'file')
                    END,
  "mime_type"     = 'application/octet-stream',
  "bytes"         = COALESCE("tamanio_kb", 0) * 1024,
  "extension"     = CASE
                      WHEN "nombre" IS NOT NULL AND "nombre" LIKE '%.%'
                      THEN lower(reverse(split_part(reverse("nombre"), '.', 1)))
                      ELSE ''
                    END,
  "original_name" = COALESCE("nombre", 'archivo_' || "id"::TEXT)
WHERE "cliente_id" IS NOT NULL;

-- For rows without cliente_id (shouldn't exist but be safe), backfill with synthetic defaults
UPDATE "archivos"
SET
  "storage_key"   = 'legacy/orphan/' || "id"::TEXT,
  "mime_type"     = 'application/octet-stream',
  "bytes"         = 0,
  "extension"     = '',
  "original_name" = 'archivo_' || "id"::TEXT
WHERE "cliente_id" IS NULL;

-- ── Step 3: Create junction tables ──────────────────────────────────────────

CREATE TABLE "archivos_clientes" (
  "cliente_id" INTEGER NOT NULL,
  "archivo_id" INTEGER NOT NULL,
  "orden"      INTEGER NOT NULL DEFAULT 0,

  CONSTRAINT "archivos_clientes_pkey" PRIMARY KEY ("cliente_id", "archivo_id"),
  CONSTRAINT "uq_archivos_cliente_archivo" UNIQUE ("archivo_id", "cliente_id")
);

CREATE TABLE "archivos_tareas" (
  "tarea_id"   INTEGER NOT NULL,
  "archivo_id" INTEGER NOT NULL,
  "orden"      INTEGER NOT NULL DEFAULT 0,

  CONSTRAINT "archivos_tareas_pkey" PRIMARY KEY ("tarea_id", "archivo_id"),
  CONSTRAINT "uq_archivos_tarea_archivo" UNIQUE ("archivo_id", "tarea_id")
);

CREATE TABLE "archivos_liquidaciones" (
  "liquidacion_id" INTEGER NOT NULL,
  "archivo_id"     INTEGER NOT NULL,
  "orden"          INTEGER NOT NULL DEFAULT 0,

  CONSTRAINT "archivos_liquidaciones_pkey" PRIMARY KEY ("liquidacion_id", "archivo_id"),
  CONSTRAINT "uq_archivos_liquidacion_archivo" UNIQUE ("archivo_id", "liquidacion_id")
);

-- ── Step 4: Backfill archivos_clientes from existing cliente_id ─────────────
-- Guard: WHERE cliente_id IS NOT NULL — ensures we only migrate rows with a parent

INSERT INTO "archivos_clientes" ("cliente_id", "archivo_id", "orden")
SELECT "cliente_id", "id", 0
FROM "archivos"
WHERE "cliente_id" IS NOT NULL;

-- ── Step 5: Add foreign keys to junction tables ─────────────────────────────

ALTER TABLE "archivos_clientes"
  ADD CONSTRAINT "archivos_clientes_cliente_id_fkey"
    FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE CASCADE,
  ADD CONSTRAINT "archivos_clientes_archivo_id_fkey"
    FOREIGN KEY ("archivo_id") REFERENCES "archivos"("id") ON DELETE CASCADE;

ALTER TABLE "archivos_tareas"
  ADD CONSTRAINT "archivos_tareas_tarea_id_fkey"
    FOREIGN KEY ("tarea_id") REFERENCES "tareas"("id") ON DELETE CASCADE,
  ADD CONSTRAINT "archivos_tareas_archivo_id_fkey"
    FOREIGN KEY ("archivo_id") REFERENCES "archivos"("id") ON DELETE CASCADE;

ALTER TABLE "archivos_liquidaciones"
  ADD CONSTRAINT "archivos_liquidaciones_liquidacion_id_fkey"
    FOREIGN KEY ("liquidacion_id") REFERENCES "liquidaciones"("id") ON DELETE CASCADE,
  ADD CONSTRAINT "archivos_liquidaciones_archivo_id_fkey"
    FOREIGN KEY ("archivo_id") REFERENCES "archivos"("id") ON DELETE CASCADE;

-- ── Step 6: Make new columns NOT NULL ───────────────────────────────────────

ALTER TABLE "archivos"
  ALTER COLUMN "storage_key" SET NOT NULL,
  ALTER COLUMN "mime_type" SET NOT NULL,
  ALTER COLUMN "bytes" SET NOT NULL,
  ALTER COLUMN "extension" SET NOT NULL,
  ALTER COLUMN "original_name" SET NOT NULL;

-- Add unique constraint on storage_key (separate from NOT NULL)
ALTER TABLE "archivos"
  ADD CONSTRAINT "archivos_storage_key_key" UNIQUE ("storage_key");

-- ── Step 7: Drop old FK, index, and columns ─────────────────────────────────

-- Drop the FK constraint (name follows PostgreSQL default convention from Prisma)
ALTER TABLE "archivos" DROP CONSTRAINT IF EXISTS "archivos_cliente_id_fkey";

-- Drop the composite index
DROP INDEX IF EXISTS "idx_archivos_cliente_tipo";

-- Drop old columns
ALTER TABLE "archivos"
  DROP COLUMN "cliente_id",
  DROP COLUMN "url",
  DROP COLUMN "nombre",
  DROP COLUMN "tamanio_kb";

COMMIT;
