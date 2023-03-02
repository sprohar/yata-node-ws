-- AlterTable
ALTER TABLE "subtask" ADD COLUMN     "all_day" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "due_date" TIMESTAMPTZ;
