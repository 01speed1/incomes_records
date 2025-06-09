-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_savings_goals" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "goalType" TEXT NOT NULL DEFAULT 'TARGET_BASED',
    "targetAmount" TEXT NOT NULL,
    "targetDate" DATETIME,
    "expectedMonthlyAmount" TEXT NOT NULL,
    "currentBalance" TEXT NOT NULL DEFAULT '0',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "category" TEXT NOT NULL DEFAULT 'PERSONAL',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_savings_goals" ("category", "createdAt", "currentBalance", "description", "expectedMonthlyAmount", "id", "name", "status", "targetAmount", "targetDate", "updatedAt") SELECT "category", "createdAt", "currentBalance", "description", "expectedMonthlyAmount", "id", "name", "status", "targetAmount", "targetDate", "updatedAt" FROM "savings_goals";
DROP TABLE "savings_goals";
ALTER TABLE "new_savings_goals" RENAME TO "savings_goals";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
