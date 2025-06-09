-- CreateTable
CREATE TABLE "savings_goals" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "targetAmount" TEXT NOT NULL,
    "targetDate" DATETIME,
    "expectedMonthlyAmount" TEXT NOT NULL,
    "currentBalance" TEXT NOT NULL DEFAULT '0',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "category" TEXT NOT NULL DEFAULT 'PERSONAL',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "monthly_contributions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "savingsGoalId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "projectedAmount" TEXT NOT NULL,
    "actualAmount" TEXT,
    "variance" TEXT,
    "runningBalance" TEXT NOT NULL,
    "contributionDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "monthly_contributions_savingsGoalId_fkey" FOREIGN KEY ("savingsGoalId") REFERENCES "savings_goals" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "monthly_contributions_savingsGoalId_year_month_key" ON "monthly_contributions"("savingsGoalId", "year", "month");
