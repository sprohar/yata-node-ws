/*
  Warnings:

  - Added the required column `colorHexCode` to the `tag` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tag" ADD COLUMN     "colorHexCode" VARCHAR(8) NOT NULL;
