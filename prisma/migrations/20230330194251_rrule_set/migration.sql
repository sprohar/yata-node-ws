/*
  Warnings:

  - You are about to drop the column `end_date` on the `task` table. All the data in the column will be lost.
  - You are about to drop the column `start_date` on the `task` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "task" DROP COLUMN "end_date",
DROP COLUMN "start_date",
ADD COLUMN     "rrule_set" VARCHAR(1024);
