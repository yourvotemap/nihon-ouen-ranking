-- CreateTable
CREATE TABLE "Entity" (
    "id" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL DEFAULT 'JP',
    "category" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "imageUrl" TEXT,
    "officialUrl" TEXT,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "totalSupportPoints" INTEGER NOT NULL DEFAULT 0,
    "supportCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Entity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Support" (
    "id" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL DEFAULT 'JP',
    "entityId" TEXT NOT NULL,
    "userId" TEXT,
    "supporterName" TEXT,
    "email" TEXT,
    "paymentType" TEXT NOT NULL DEFAULT 'free',
    "supporterAccountId" TEXT,
    "points" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'visible',
    "ipHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Support_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL DEFAULT 'JP',
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "detail" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateLimitRecord" (
    "id" TEXT NOT NULL,
    "ipHash" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RateLimitRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FreeSupportRecord" (
    "id" TEXT NOT NULL,
    "ipHash" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FreeSupportRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupporterAccount" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "displayName" TEXT,
    "pointBalance" INTEGER NOT NULL DEFAULT 0,
    "totalPurchasedPoints" INTEGER NOT NULL DEFAULT 0,
    "totalSpentPoints" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupporterAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PointPurchase" (
    "id" TEXT NOT NULL,
    "supporterAccountId" TEXT,
    "stripeSessionId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'jpy',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "PointPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PointTransaction" (
    "id" TEXT NOT NULL,
    "supporterAccountId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "balanceAfter" INTEGER NOT NULL,
    "entityId" TEXT,
    "supportId" TEXT,
    "purchaseId" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PointTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Entity_countryCode_slug_key" ON "Entity"("countryCode", "slug");

-- CreateIndex
CREATE INDEX "RateLimitRecord_ipHash_entityId_idx" ON "RateLimitRecord"("ipHash", "entityId");

-- CreateIndex
CREATE INDEX "FreeSupportRecord_ipHash_entityId_idx" ON "FreeSupportRecord"("ipHash", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "SupporterAccount_email_key" ON "SupporterAccount"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PointPurchase_stripeSessionId_key" ON "PointPurchase"("stripeSessionId");

-- AddForeignKey
ALTER TABLE "Support" ADD CONSTRAINT "Support_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Entity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Support" ADD CONSTRAINT "Support_supporterAccountId_fkey" FOREIGN KEY ("supporterAccountId") REFERENCES "SupporterAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointPurchase" ADD CONSTRAINT "PointPurchase_supporterAccountId_fkey" FOREIGN KEY ("supporterAccountId") REFERENCES "SupporterAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointTransaction" ADD CONSTRAINT "PointTransaction_supporterAccountId_fkey" FOREIGN KEY ("supporterAccountId") REFERENCES "SupporterAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointTransaction" ADD CONSTRAINT "PointTransaction_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "PointPurchase"("id") ON DELETE SET NULL ON UPDATE CASCADE;
