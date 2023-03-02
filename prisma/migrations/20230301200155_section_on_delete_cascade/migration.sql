-- DropForeignKey
ALTER TABLE "task" DROP CONSTRAINT "task_section_id_fkey";

-- AddForeignKey
ALTER TABLE "task" ADD CONSTRAINT "task_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "section"("id") ON DELETE CASCADE ON UPDATE CASCADE;
