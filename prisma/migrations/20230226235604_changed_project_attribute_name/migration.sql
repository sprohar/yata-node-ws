/*
  Warnings:

  - You are about to drop the column `project_view` on the `project` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "project" DROP COLUMN "project_view",
ADD COLUMN     "view" "project_view" NOT NULL DEFAULT 'LIST';

-- AlterTable
ALTER TABLE "task" ADD COLUMN     "owner_id" TEXT;
