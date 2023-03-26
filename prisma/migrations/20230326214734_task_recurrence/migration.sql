-- AlterTable
ALTER TABLE "task" ADD COLUMN     "end_date" TIMESTAMPTZ,
ADD COLUMN     "recurrencePattern" VARCHAR(64),
ADD COLUMN     "start_date" TIMESTAMPTZ;
