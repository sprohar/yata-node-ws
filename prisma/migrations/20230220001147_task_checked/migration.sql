-- CreateEnum
CREATE TYPE "view" AS ENUM ('LIST', 'KANBAN');

-- CreateEnum
CREATE TYPE "priority" AS ENUM ('NONE', 'LOW', 'MEDIUM', 'HIGH');

-- CreateTable
CREATE TABLE "project" (
    "project_id" SERIAL NOT NULL,
    "project_name" VARCHAR(128) NOT NULL,
    "owner_id" TEXT,
    "is_important" BOOLEAN NOT NULL DEFAULT false,
    "project_view" "view" NOT NULL DEFAULT 'LIST',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "project_pkey" PRIMARY KEY ("project_id")
);

-- CreateTable
CREATE TABLE "task" (
    "task_id" SERIAL NOT NULL,
    "content" VARCHAR(1024) NOT NULL,
    "description" VARCHAR(8192),
    "due_date" TIMESTAMP(3),
    "priority" "priority" NOT NULL DEFAULT 'NONE',
    "checked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ,
    "project_id" INTEGER NOT NULL,
    "section_id" INTEGER,
    "parent_id" INTEGER,

    CONSTRAINT "task_pkey" PRIMARY KEY ("task_id")
);

-- CreateTable
CREATE TABLE "activity" (
    "activity_id" SERIAL NOT NULL,
    "message" VARCHAR(1024) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "task_id" INTEGER NOT NULL,
    "project_id" INTEGER NOT NULL,

    CONSTRAINT "activity_pkey" PRIMARY KEY ("activity_id")
);

-- CreateTable
CREATE TABLE "section" (
    "section_id" SERIAL NOT NULL,
    "section_name" VARCHAR(64) NOT NULL,
    "project_id" INTEGER NOT NULL,

    CONSTRAINT "section_pkey" PRIMARY KEY ("section_id")
);

-- CreateTable
CREATE TABLE "label" (
    "label_id" SERIAL NOT NULL,
    "label_name" VARCHAR(32) NOT NULL,

    CONSTRAINT "label_pkey" PRIMARY KEY ("label_id")
);

-- CreateTable
CREATE TABLE "labeled_task" (
    "label_id" INTEGER NOT NULL,
    "task_id" INTEGER NOT NULL,

    CONSTRAINT "labeled_task_pkey" PRIMARY KEY ("task_id","label_id")
);

-- CreateIndex
CREATE INDEX "task_content_idx" ON "task"("content");

-- CreateIndex
CREATE UNIQUE INDEX "activity_task_id_key" ON "activity"("task_id");

-- AddForeignKey
ALTER TABLE "task" ADD CONSTRAINT "task_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("project_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task" ADD CONSTRAINT "task_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "section"("section_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task" ADD CONSTRAINT "task_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "task"("task_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity" ADD CONSTRAINT "activity_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "task"("task_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity" ADD CONSTRAINT "activity_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("project_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "section" ADD CONSTRAINT "section_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("project_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "labeled_task" ADD CONSTRAINT "labeled_task_label_id_fkey" FOREIGN KEY ("label_id") REFERENCES "label"("label_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "labeled_task" ADD CONSTRAINT "labeled_task_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "task"("task_id") ON DELETE CASCADE ON UPDATE CASCADE;
