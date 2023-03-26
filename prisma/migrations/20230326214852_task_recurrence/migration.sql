/*
  Warnings:

  - You are about to drop the column `recurrencePattern` on the `task` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "task" DROP COLUMN "recurrencePattern",
ADD COLUMN     "recurrence_pattern" VARCHAR(64);
