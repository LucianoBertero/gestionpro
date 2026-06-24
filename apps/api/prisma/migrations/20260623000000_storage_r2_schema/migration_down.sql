-- Rollback migration: restore archivos table to pre-R2 shape
-- WARNING: Only run this if you have NOT deleted the archivos_clientes junction data
-- that was created during the migration. The backfill in step 3 depends on it.

BEGIN;

-- ── Step 1: Re-add old columns as nullable ──────────────────────────────────

ALTER TABLE "archivos"
  ADD COLUMN "cliente_id" INTEGER,
  ADD COLUMN "nombre"     TEXT,
  ADD COLUMN "url"        TEXT,
  ADD COLUMN "tamanio_kb" INTEGER;

-- ── Step 2: Restore cliente_id from junction table ──────────────────────────
-- One archivo can be linked to multiple clientes via junctions now,
-- but the old schema only supports one. We take the first junction row.

UPDATE "archivos" a
SET "cliente_id" = ac."cliente_id"
FROM "archivos_clientes" ac
WHERE a."id" = ac."archivo_id";

-- ── Step 3: Restore old columns from new columns ────────────────────────────

UPDATE "archivos"
SET
  "nombre"     = "original_name",
  "url"        = "storage_key",
  "tamanio_kb" = "bytes" / 1024
WHERE "cliente_id" IS NOT NULL;

-- ── Step 4: Make old columns NOT NULL where they were previously required ───

ALTER TABLE "archivos"
  ALTER COLUMN "cliente_id" SET NOT NULL,
  ALTER COLUMN "nombre" SET NOT NULL,
  ALTER COLUMN "url" SET NOT NULL;

-- ── Step 5: Restore FK and index ────────────────────────────────────────────

ALTER TABLE "archivos"
  ADD CONSTRAINT "archivos_cliente_id_fkey"
    FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE CASCADE;

CREATE INDEX "idx_archivos_cliente_tipo" ON "archivos"("cliente_id", "tipo");

-- ── Step 6: Drop junction tables ────────────────────────────────────────────

DROP TABLE IF EXISTS "archivos_liquidaciones" CASCADE;
DROP TABLE IF EXISTS "archivos_tareas" CASCADE;
DROP TABLE IF EXISTS "archivos_clientes" CASCADE;

-- ── Step 7: Drop new columns and constraints ────────────────────────────────

ALTER TABLE "archivos" DROP CONSTRAINT IF EXISTS "archivos_storage_key_key";

ALTER TABLE "archivos"
  DROP COLUMN "storage_key",
  DROP COLUMN "mime_type",
  DROP COLUMN "bytes",
  DROP COLUMN "extension",
  DROP COLUMN "original_name";

COMMIT;
