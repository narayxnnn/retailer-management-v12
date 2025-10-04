-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "retailer" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "fileCount" INTEGER NOT NULL,
    "xlsxCount" INTEGER NOT NULL DEFAULT 0,
    "csvCount" INTEGER NOT NULL DEFAULT 0,
    "txtCount" INTEGER NOT NULL DEFAULT 0,
    "mailCount" INTEGER NOT NULL DEFAULT 0,
    "loadType" TEXT NOT NULL,
    "istTime" TEXT,
    "estTime" TEXT,
    "sqlQuery" TEXT,
    "indirectLoadSource" TEXT,
    "websiteLink" TEXT,
    "portalUsername" TEXT,
    "portalPassword" TEXT,
    "mailFolder" TEXT,
    "mailId" TEXT,
    "link" TEXT NOT NULL DEFAULT '',
    "username" TEXT NOT NULL DEFAULT '',
    "password" TEXT NOT NULL DEFAULT '',
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ktRecordingLink" TEXT,
    "documentationLink" TEXT,
    "instructions" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskFile" (
    "id" TEXT NOT NULL,
    "downloadName" TEXT NOT NULL,
    "requiredName" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,

    CONSTRAINT "TaskFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "Task_userId_idx" ON "Task"("userId");

-- CreateIndex
CREATE INDEX "Task_completed_idx" ON "Task"("completed");

-- CreateIndex
CREATE INDEX "TaskFile_taskId_idx" ON "TaskFile"("taskId");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskFile" ADD CONSTRAINT "TaskFile_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
