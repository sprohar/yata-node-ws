/*
  Warnings:

  - You are about to drop the column `completed_at` on the `task` table. All the data in the column will be lost.
  - You are about to drop the column `started_at` on the `task` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "task" DROP COLUMN "completed_at",
DROP COLUMN "started_at",
ADD COLUMN     "completed_on" TIMESTAMPTZ,
ADD COLUMN     "started_on" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;
