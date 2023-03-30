-- DropIndex
DROP INDEX "task_content_idx";

-- AlterTable
ALTER TABLE "task" ADD COLUMN     "end_date" TIMESTAMPTZ,
ADD COLUMN     "rrule" VARCHAR(1024),
ADD COLUMN     "start_date" TIMESTAMPTZ;

-- CreateIndex
CREATE INDEX "task_title_idx" ON "task"("title");
