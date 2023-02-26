/*
  Warnings:

  - You are about to drop the column `all_day` on the `subtask` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `subtask` table. All the data in the column will be lost.
  - You are about to drop the column `due_date` on the `subtask` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "subtask" DROP COLUMN "all_day",
DROP COLUMN "content",
DROP COLUMN "due_date";
