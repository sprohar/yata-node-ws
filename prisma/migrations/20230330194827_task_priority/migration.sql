-- AlterTable
ALTER TABLE "task" ADD COLUMN     "sort_order" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "priority" DROP NOT NULL;
