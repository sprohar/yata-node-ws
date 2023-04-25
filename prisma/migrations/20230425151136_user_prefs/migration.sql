-- AlterTable
ALTER TABLE "users" ADD COLUMN     "google_id" TEXT,
ADD COLUMN     "prefs" JSONB,
ALTER COLUMN "password" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "project_id_user_id_idx" ON "project"("id", "user_id");

-- CreateIndex
CREATE INDEX "task_id_user_id_idx" ON "task"("id", "user_id");
