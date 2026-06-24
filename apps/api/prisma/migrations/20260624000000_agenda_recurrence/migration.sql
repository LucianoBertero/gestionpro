-- AlterTable: add recurrence and multi-day support to agenda_items
ALTER TABLE "agenda_items"
  ADD COLUMN "fecha_fin" TIMESTAMP(3),
  ADD COLUMN "all_day" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "recurrence_rule" TEXT,
  ADD COLUMN "recurrence_end" TIMESTAMP(3);
