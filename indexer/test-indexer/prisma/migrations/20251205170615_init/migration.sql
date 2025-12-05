-- CreateTable
CREATE TABLE "CoinAdded" (
    "dbId" TEXT NOT NULL,
    "coin_type" JSONB NOT NULL,
    "price_feed_index" INTEGER NOT NULL,
    "decimals" INTEGER NOT NULL,

    CONSTRAINT "CoinAdded_pkey" PRIMARY KEY ("dbId")
);

-- CreateTable
CREATE TABLE "CoinRemoved" (
    "dbId" TEXT NOT NULL,
    "coin_type" JSONB NOT NULL,

    CONSTRAINT "CoinRemoved_pkey" PRIMARY KEY ("dbId")
);

-- CreateTable
CREATE TABLE "CollateralRedeemed" (
    "dbId" TEXT NOT NULL,
    "coin_type" JSONB NOT NULL,
    "amount" TEXT NOT NULL,

    CONSTRAINT "CollateralRedeemed_pkey" PRIMARY KEY ("dbId")
);

-- CreateTable
CREATE TABLE "DSCBurned" (
    "dbId" TEXT NOT NULL,
    "user" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "position_id" TEXT NOT NULL,

    CONSTRAINT "DSCBurned_pkey" PRIMARY KEY ("dbId")
);

-- CreateTable
CREATE TABLE "LiquidationBonusUpdated" (
    "dbId" TEXT NOT NULL,
    "old_bonus" TEXT NOT NULL,
    "new_bonus" TEXT NOT NULL,

    CONSTRAINT "LiquidationBonusUpdated_pkey" PRIMARY KEY ("dbId")
);

-- CreateTable
CREATE TABLE "LiquidationThresholdUpdated" (
    "dbId" TEXT NOT NULL,
    "old_threshold" TEXT NOT NULL,
    "new_threshold" TEXT NOT NULL,

    CONSTRAINT "LiquidationThresholdUpdated_pkey" PRIMARY KEY ("dbId")
);

-- CreateTable
CREATE TABLE "MinHealthFactorUpdated" (
    "dbId" TEXT NOT NULL,
    "old_min_health_factor" TEXT NOT NULL,
    "new_min_health_factor" TEXT NOT NULL,

    CONSTRAINT "MinHealthFactorUpdated_pkey" PRIMARY KEY ("dbId")
);

-- CreateTable
CREATE TABLE "NewDepositMade" (
    "dbId" TEXT NOT NULL,
    "coin_type" JSONB NOT NULL,
    "amount" TEXT NOT NULL,

    CONSTRAINT "NewDepositMade_pkey" PRIMARY KEY ("dbId")
);

-- CreateTable
CREATE TABLE "NewPositionCreated" (
    "dbId" TEXT NOT NULL,
    "new_position_id" TEXT NOT NULL,

    CONSTRAINT "NewPositionCreated_pkey" PRIMARY KEY ("dbId")
);

-- CreateTable
CREATE TABLE "Option" (
    "dbId" TEXT NOT NULL,
    "vec" JSONB[],

    CONSTRAINT "Option_pkey" PRIMARY KEY ("dbId")
);

-- CreateTable
CREATE TABLE "OracleHolderChanged" (
    "dbId" TEXT NOT NULL,
    "old_oracle_holder_id" TEXT,
    "new_oracle_holder_id" TEXT NOT NULL,

    CONSTRAINT "OracleHolderChanged_pkey" PRIMARY KEY ("dbId")
);

-- CreateTable
CREATE TABLE "PositionLiquidated" (
    "dbId" TEXT NOT NULL,
    "liquidated_user" TEXT NOT NULL,
    "liquidator" TEXT NOT NULL,
    "debt_covered" TEXT NOT NULL,
    "collateral_type" JSONB NOT NULL,
    "collateral_amount" TEXT NOT NULL,

    CONSTRAINT "PositionLiquidated_pkey" PRIMARY KEY ("dbId")
);

-- CreateTable
CREATE TABLE "PrecisionUpdated" (
    "dbId" TEXT NOT NULL,
    "old_precision" TEXT NOT NULL,
    "new_precision" TEXT NOT NULL,

    CONSTRAINT "PrecisionUpdated_pkey" PRIMARY KEY ("dbId")
);

-- CreateTable
CREATE TABLE "PriceFetched" (
    "dbId" TEXT NOT NULL,
    "coin_type" JSONB NOT NULL,
    "price" TEXT NOT NULL,
    "decimal" INTEGER NOT NULL,
    "round" TEXT NOT NULL,

    CONSTRAINT "PriceFetched_pkey" PRIMARY KEY ("dbId")
);

-- CreateTable
CREATE TABLE "TypeName" (
    "dbId" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "TypeName_pkey" PRIMARY KEY ("dbId")
);

-- CreateTable
CREATE TABLE "cursor" (
    "id" TEXT NOT NULL,
    "eventSeq" TEXT NOT NULL,
    "txDigest" TEXT NOT NULL,

    CONSTRAINT "cursor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CoinAdded_dbId_key" ON "CoinAdded"("dbId");

-- CreateIndex
CREATE UNIQUE INDEX "CoinRemoved_dbId_key" ON "CoinRemoved"("dbId");

-- CreateIndex
CREATE UNIQUE INDEX "CollateralRedeemed_dbId_key" ON "CollateralRedeemed"("dbId");

-- CreateIndex
CREATE UNIQUE INDEX "DSCBurned_dbId_key" ON "DSCBurned"("dbId");

-- CreateIndex
CREATE UNIQUE INDEX "LiquidationBonusUpdated_dbId_key" ON "LiquidationBonusUpdated"("dbId");

-- CreateIndex
CREATE UNIQUE INDEX "LiquidationThresholdUpdated_dbId_key" ON "LiquidationThresholdUpdated"("dbId");

-- CreateIndex
CREATE UNIQUE INDEX "MinHealthFactorUpdated_dbId_key" ON "MinHealthFactorUpdated"("dbId");

-- CreateIndex
CREATE UNIQUE INDEX "NewDepositMade_dbId_key" ON "NewDepositMade"("dbId");

-- CreateIndex
CREATE UNIQUE INDEX "NewPositionCreated_dbId_key" ON "NewPositionCreated"("dbId");

-- CreateIndex
CREATE UNIQUE INDEX "Option_dbId_key" ON "Option"("dbId");

-- CreateIndex
CREATE UNIQUE INDEX "OracleHolderChanged_dbId_key" ON "OracleHolderChanged"("dbId");

-- CreateIndex
CREATE UNIQUE INDEX "PositionLiquidated_dbId_key" ON "PositionLiquidated"("dbId");

-- CreateIndex
CREATE UNIQUE INDEX "PrecisionUpdated_dbId_key" ON "PrecisionUpdated"("dbId");

-- CreateIndex
CREATE UNIQUE INDEX "PriceFetched_dbId_key" ON "PriceFetched"("dbId");

-- CreateIndex
CREATE UNIQUE INDEX "TypeName_dbId_key" ON "TypeName"("dbId");
