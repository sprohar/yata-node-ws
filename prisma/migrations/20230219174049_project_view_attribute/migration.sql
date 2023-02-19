/*
  Warnings:

  - You are about to drop the column `view` on the `project` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "project" DROP COLUMN "view",
ADD COLUMN     "project_view" "view" NOT NULL DEFAULT 'LIST';
