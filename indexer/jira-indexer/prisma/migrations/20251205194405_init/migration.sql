-- CreateTable
CREATE TABLE "ConfigKey" (
    "dbId" TEXT NOT NULL,
    "per_type_index" TEXT NOT NULL,
    "per_type_key" INTEGER[],

    CONSTRAINT "ConfigKey_pkey" PRIMARY KEY ("dbId")
);

-- CreateTable
CREATE TABLE "PerTypeConfigCreated" (
    "dbId" TEXT NOT NULL,
    "key" JSONB NOT NULL,
    "config_id" TEXT NOT NULL,

    CONSTRAINT "PerTypeConfigCreated_pkey" PRIMARY KEY ("dbId")
);

-- CreateTable
CREATE TABLE "cursor" (
    "id" TEXT NOT NULL,
    "eventSeq" TEXT NOT NULL,
    "txDigest" TEXT NOT NULL,

    CONSTRAINT "cursor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ConfigKey_dbId_key" ON "ConfigKey"("dbId");

-- CreateIndex
CREATE UNIQUE INDEX "PerTypeConfigCreated_dbId_key" ON "PerTypeConfigCreated"("dbId");
