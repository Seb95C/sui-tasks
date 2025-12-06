-- CreateTable
CREATE TABLE "AttachmentAdded" (
    "dbId" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "attachment_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "added_by" TEXT NOT NULL,

    CONSTRAINT "AttachmentAdded_pkey" PRIMARY KEY ("dbId")
);

-- CreateTable
CREATE TABLE "AttachmentRemoved" (
    "dbId" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "attachment_id" TEXT NOT NULL,
    "removed_by" TEXT NOT NULL,

    CONSTRAINT "AttachmentRemoved_pkey" PRIMARY KEY ("dbId")
);

-- CreateTable
CREATE TABLE "DeleteTask" (
    "dbId" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "deleted_by" TEXT NOT NULL,

    CONSTRAINT "DeleteTask_pkey" PRIMARY KEY ("dbId")
);

-- CreateTable
CREATE TABLE "MemberAdded" (
    "dbId" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "member_address" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "joined_at" TEXT NOT NULL,
    "added_by" TEXT NOT NULL,

    CONSTRAINT "MemberAdded_pkey" PRIMARY KEY ("dbId")
);

-- CreateTable
CREATE TABLE "MemberRemoved" (
    "dbId" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "member_address" TEXT NOT NULL,
    "removed_by" TEXT NOT NULL,

    CONSTRAINT "MemberRemoved_pkey" PRIMARY KEY ("dbId")
);

-- CreateTable
CREATE TABLE "ProjectCreated" (
    "dbId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "manager" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "manager_cap_id" TEXT NOT NULL,

    CONSTRAINT "ProjectCreated_pkey" PRIMARY KEY ("dbId")
);

-- CreateTable
CREATE TABLE "SubtaskAdded" (
    "dbId" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "subtask_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "state" INTEGER NOT NULL,
    "added_by" TEXT NOT NULL,

    CONSTRAINT "SubtaskAdded_pkey" PRIMARY KEY ("dbId")
);

-- CreateTable
CREATE TABLE "SubtaskDeleted" (
    "dbId" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "subtask_id" TEXT NOT NULL,
    "deleted_by" TEXT NOT NULL,

    CONSTRAINT "SubtaskDeleted_pkey" PRIMARY KEY ("dbId")
);

-- CreateTable
CREATE TABLE "SubtaskUpdated" (
    "dbId" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "subtask_id" TEXT NOT NULL,
    "updated_by" TEXT NOT NULL,

    CONSTRAINT "SubtaskUpdated_pkey" PRIMARY KEY ("dbId")
);

-- CreateTable
CREATE TABLE "TaskAdded" (
    "dbId" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "assignee" TEXT NOT NULL,
    "state" INTEGER NOT NULL,
    "due_date" TEXT NOT NULL,
    "added_by" TEXT NOT NULL,

    CONSTRAINT "TaskAdded_pkey" PRIMARY KEY ("dbId")
);

-- CreateTable
CREATE TABLE "TaskAssigneeUpdated" (
    "dbId" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "old_assignee" TEXT NOT NULL,
    "new_assignee" TEXT NOT NULL,
    "updated_by" TEXT NOT NULL,

    CONSTRAINT "TaskAssigneeUpdated_pkey" PRIMARY KEY ("dbId")
);

-- CreateTable
CREATE TABLE "TaskDescriptionUpdated" (
    "dbId" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "updated_by" TEXT NOT NULL,

    CONSTRAINT "TaskDescriptionUpdated_pkey" PRIMARY KEY ("dbId")
);

-- CreateTable
CREATE TABLE "TaskDueDateUpdated" (
    "dbId" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "old_due_date" TEXT NOT NULL,
    "new_due_date" TEXT NOT NULL,
    "updated_by" TEXT NOT NULL,

    CONSTRAINT "TaskDueDateUpdated_pkey" PRIMARY KEY ("dbId")
);

-- CreateTable
CREATE TABLE "TaskNameUpdated" (
    "dbId" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "old_name" TEXT NOT NULL,
    "new_name" TEXT NOT NULL,
    "updated_by" TEXT NOT NULL,

    CONSTRAINT "TaskNameUpdated_pkey" PRIMARY KEY ("dbId")
);

-- CreateTable
CREATE TABLE "TaskStateUpdated" (
    "dbId" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "old_state" INTEGER NOT NULL,
    "new_state" INTEGER NOT NULL,
    "updated_by" TEXT NOT NULL,

    CONSTRAINT "TaskStateUpdated_pkey" PRIMARY KEY ("dbId")
);

-- CreateTable
CREATE TABLE "UsernameRegistered" (
    "dbId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "user_address" TEXT NOT NULL,

    CONSTRAINT "UsernameRegistered_pkey" PRIMARY KEY ("dbId")
);

-- CreateTable
CREATE TABLE "cursor" (
    "id" TEXT NOT NULL,
    "eventSeq" TEXT NOT NULL,
    "txDigest" TEXT NOT NULL,

    CONSTRAINT "cursor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AttachmentAdded_dbId_key" ON "AttachmentAdded"("dbId");

-- CreateIndex
CREATE UNIQUE INDEX "AttachmentRemoved_dbId_key" ON "AttachmentRemoved"("dbId");

-- CreateIndex
CREATE UNIQUE INDEX "DeleteTask_dbId_key" ON "DeleteTask"("dbId");

-- CreateIndex
CREATE UNIQUE INDEX "MemberAdded_dbId_key" ON "MemberAdded"("dbId");

-- CreateIndex
CREATE UNIQUE INDEX "MemberRemoved_dbId_key" ON "MemberRemoved"("dbId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectCreated_dbId_key" ON "ProjectCreated"("dbId");

-- CreateIndex
CREATE UNIQUE INDEX "SubtaskAdded_dbId_key" ON "SubtaskAdded"("dbId");

-- CreateIndex
CREATE UNIQUE INDEX "SubtaskDeleted_dbId_key" ON "SubtaskDeleted"("dbId");

-- CreateIndex
CREATE UNIQUE INDEX "SubtaskUpdated_dbId_key" ON "SubtaskUpdated"("dbId");

-- CreateIndex
CREATE UNIQUE INDEX "TaskAdded_dbId_key" ON "TaskAdded"("dbId");

-- CreateIndex
CREATE UNIQUE INDEX "TaskAssigneeUpdated_dbId_key" ON "TaskAssigneeUpdated"("dbId");

-- CreateIndex
CREATE UNIQUE INDEX "TaskDescriptionUpdated_dbId_key" ON "TaskDescriptionUpdated"("dbId");

-- CreateIndex
CREATE UNIQUE INDEX "TaskDueDateUpdated_dbId_key" ON "TaskDueDateUpdated"("dbId");

-- CreateIndex
CREATE UNIQUE INDEX "TaskNameUpdated_dbId_key" ON "TaskNameUpdated"("dbId");

-- CreateIndex
CREATE UNIQUE INDEX "TaskStateUpdated_dbId_key" ON "TaskStateUpdated"("dbId");

-- CreateIndex
CREATE UNIQUE INDEX "UsernameRegistered_dbId_key" ON "UsernameRegistered"("dbId");
