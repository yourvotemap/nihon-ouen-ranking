-- CreateTable
CREATE TABLE "FreeSupportRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ipHash" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "SupporterAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "displayName" TEXT,
    "pointBalance" INTEGER NOT NULL DEFAULT 0,
    "totalPurchasedPoints" INTEGER NOT NULL DEFAULT 0,
    "totalSpentPoints" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PointPurchase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "supporterAccountId" TEXT,
    "stripeSessionId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'jpy',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" DATETIME,
    CONSTRAINT "PointPurchase_supporterAccountId_fkey" FOREIGN KEY ("supporterAccountId") REFERENCES "SupporterAccount" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PointTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "supporterAccountId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "balanceAfter" INTEGER NOT NULL,
    "entityId" TEXT,
    "supportId" TEXT,
    "purchaseId" TEXT,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PointTransaction_supporterAccountId_fkey" FOREIGN KEY ("supporterAccountId") REFERENCES "SupporterAccount" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PointTransaction_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "PointPurchase" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Report" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "countryCode" TEXT NOT NULL DEFAULT 'JP',
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "detail" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Report" ("createdAt", "detail", "id", "reason", "status", "targetId", "targetType") SELECT "createdAt", "detail", "id", "reason", "status", "targetId", "targetType" FROM "Report";
DROP TABLE "Report";
ALTER TABLE "new_Report" RENAME TO "Report";
CREATE TABLE "new_Support" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Support_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Entity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Support_supporterAccountId_fkey" FOREIGN KEY ("supporterAccountId") REFERENCES "SupporterAccount" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Support" ("comment", "countryCode", "createdAt", "entityId", "id", "ipHash", "points", "status", "supporterName", "userId") SELECT "comment", "countryCode", "createdAt", "entityId", "id", "ipHash", "points", "status", "supporterName", "userId" FROM "Support";
DROP TABLE "Support";
ALTER TABLE "new_Support" RENAME TO "Support";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "FreeSupportRecord_ipHash_entityId_idx" ON "FreeSupportRecord"("ipHash", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "SupporterAccount_email_key" ON "SupporterAccount"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PointPurchase_stripeSessionId_key" ON "PointPurchase"("stripeSessionId");
