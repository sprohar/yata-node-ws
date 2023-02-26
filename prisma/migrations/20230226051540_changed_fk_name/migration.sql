/*
  Warnings:

  - You are about to drop the column `taskId` on the `subtask` table. All the data in the column will be lost.
  - Added the required column `task_id` to the `subtask` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "subtask" DROP CONSTRAINT "subtask_taskId_fkey";

-- AlterTable
ALTER TABLE "subtask" DROP COLUMN "taskId",
ADD COLUMN     "task_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "subtask" ADD CONSTRAINT "subtask_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
