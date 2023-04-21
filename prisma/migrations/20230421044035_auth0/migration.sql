/*
  Warnings:

  - You are about to drop the column `all_day` on the `task` table. All the data in the column will be lost.
  - You are about to drop the column `completed` on the `task` table. All the data in the column will be lost.
  - You are about to drop the column `completed_on` on the `task` table. All the data in the column will be lost.
  - You are about to drop the column `deleted` on the `task` table. All the data in the column will be lost.
  - You are about to drop the `subtask` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `user_id` on the `project` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `user_id` on the `tag` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `user_id` on the `task` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- DropForeignKey
ALTER TABLE "project" DROP CONSTRAINT "project_user_id_fkey";

-- DropForeignKey
ALTER TABLE "subtask" DROP CONSTRAINT "subtask_task_id_fkey";

-- DropForeignKey
ALTER TABLE "tag" DROP CONSTRAINT "tag_user_id_fkey";

-- DropForeignKey
ALTER TABLE "task" DROP CONSTRAINT "task_user_id_fkey";

-- AlterTable
ALTER TABLE "project" DROP COLUMN "user_id",
ADD COLUMN     "user_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "section" ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "tag" DROP COLUMN "user_id",
ADD COLUMN     "user_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "task" DROP COLUMN "all_day",
DROP COLUMN "completed",
DROP COLUMN "completed_on",
DROP COLUMN "deleted",
ADD COLUMN     "completed_at" TIMESTAMPTZ,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "is_all_day" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "is_completed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "parent_id" INTEGER,
ADD COLUMN     "start_date" TIMESTAMPTZ,
ALTER COLUMN "title" SET DATA TYPE VARCHAR(4096),
ALTER COLUMN "content" SET DATA TYPE TEXT,
DROP COLUMN "user_id",
ADD COLUMN     "user_id" UUID NOT NULL;

-- DropTable
DROP TABLE "subtask";

-- DropTable
DROP TABLE "user";

-- CreateTable
CREATE TABLE "users" (
    "user_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "phone_number" TEXT,
    "phone_verified" BOOLEAN NOT NULL DEFAULT false,
    "picture" TEXT,
    "tenant" TEXT,
    "username" TEXT,
    "nickname" TEXT,
    "family_name" TEXT,
    "given_name" TEXT,
    "blocked" BOOLEAN NOT NULL DEFAULT false,
    "blocked_for" TEXT,
    "last_ip" TEXT,
    "multifactor" TEXT,
    "multifactor_updated" TIMESTAMP(3),
    "last_login" TIMESTAMPTZ,
    "last_password_reset" TIMESTAMPTZ,
    "logins_count" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tag_name_user_id_key" ON "tag"("name", "user_id");

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task" ADD CONSTRAINT "task_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task" ADD CONSTRAINT "task_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tag" ADD CONSTRAINT "tag_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
