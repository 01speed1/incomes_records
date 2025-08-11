import { prisma } from "../lib/db.server";
import type { Prisma, PrismaClient } from "@prisma/client";
import { FinancialCalculator } from "../lib/financial";
import { Decimal } from "decimal.js";
import type {
  SerializedSavingsGoalWithContributions,
  GoalStatus,
  GoalCategory,
  GoalType,
} from "../types/financial";

export class SavingsGoalService {
  static async createGoal(data: {
    name: string;
    description?: string;
    goalType?: GoalType;
    targetAmount?: string;
    targetDate?: Date;
    expectedMonthlyAmount: string;
    category?: GoalCategory;
    startDate?: string;
  }) {
    const expectedMonthlyDecimal = FinancialCalculator.toDecimal(
      data.expectedMonthlyAmount
    );

    if (!FinancialCalculator.isPositive(expectedMonthlyDecimal)) {
      throw new Error("Expected monthly amount must be positive");
    }

    // Validate target amount for target-based goals
    if (data.goalType === "TARGET_BASED") {
      if (!data.targetAmount) {
        throw new Error("Target amount is required for target-based goals");
      }

      const targetAmountDecimal = FinancialCalculator.toDecimal(
        data.targetAmount
      );
      if (!FinancialCalculator.isPositive(targetAmountDecimal)) {
        throw new Error("Target amount must be positive");
      }
    }

    return await prisma.savingsGoal.create({
      data: {
        name: data.name,
        description: data.description,
        goalType: data.goalType || "TARGET_BASED",
        targetAmount: data.targetAmount || "0",
        targetDate: data.targetDate,
        expectedMonthlyAmount: data.expectedMonthlyAmount,
        category: data.category || "PERSONAL",
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
      },
      include: {
        contributions: true,
      },
    });
  }

  static async getGoalById(id: string) {
    const goal = await prisma.savingsGoal.findUnique({
      where: { id },
      include: {
        contributions: {
          orderBy: [{ year: "asc" }, { month: "asc" }],
        },
      },
    });

    if (!goal) {
      throw new Error("Savings goal not found");
    }

    return this.transformGoalData(goal);
  }

  static async getAllGoals() {
    const goals = await prisma.savingsGoal.findMany({
      include: {
        contributions: {
          orderBy: [{ year: "asc" }, { month: "asc" }],
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return goals.map((goal) => this.transformGoalData(goal));
  }

  static async getActiveGoals() {
    const goals = await prisma.savingsGoal.findMany({
      where: { status: "ACTIVE" },
      include: {
        contributions: {
          orderBy: [{ year: "asc" }, { month: "asc" }],
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return goals.map((goal) => this.transformGoalData(goal));
  }

  static async updateGoal(
    id: string,
    data: {
      name?: string;
      description?: string;
      targetAmount?: string;
      targetDate?: Date | null;
      expectedMonthlyAmount?: string;
      status?: GoalStatus;
      category?: GoalCategory;
      startDate?: string;
    }
  ) {
    if (data.targetAmount) {
      const targetAmountDecimal = FinancialCalculator.toDecimal(
        data.targetAmount
      );
      if (!FinancialCalculator.isPositive(targetAmountDecimal)) {
        throw new Error("Target amount must be positive");
      }
    }

    if (data.expectedMonthlyAmount) {
      const expectedMonthlyDecimal = FinancialCalculator.toDecimal(
        data.expectedMonthlyAmount
      );
      if (!FinancialCalculator.isPositive(expectedMonthlyDecimal)) {
        throw new Error("Expected monthly amount must be positive");
      }
    }

    const updatedGoal = await prisma.savingsGoal.update({
      where: { id },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        updatedAt: new Date(),
      },
      include: {
        contributions: {
          orderBy: [{ year: "asc" }, { month: "asc" }],
        },
      },
    });

    return this.transformGoalData(updatedGoal);
  }

  static async deleteGoal(id: string) {
    await prisma.savingsGoal.delete({
      where: { id },
    });
  }

  static async updateCurrentBalance(
    goalId: string,
    tx?: PrismaClient | Prisma.TransactionClient
  ) {
    const client = (tx ?? prisma) as PrismaClient | Prisma.TransactionClient;
    const contributions = await client.monthlyContribution.findMany({
      where: {
        savingsGoalId: goalId,
        actualAmount: { not: null },
      },
      orderBy: [{ year: "asc" }, { month: "asc" }],
    });

    let currentBalance = new Decimal(0);

    for (const contribution of contributions) {
      if (contribution.actualAmount) {
        const amount = FinancialCalculator.toDecimal(contribution.actualAmount);
        currentBalance = FinancialCalculator.add(currentBalance, amount);
      }
    }

  await client.savingsGoal.update({
      where: { id: goalId },
      data: {
        currentBalance: FinancialCalculator.toString(currentBalance),
        updatedAt: new Date(),
      },
    });

    return currentBalance;
  }

  private static transformGoalData(
    goal: {
      id: string;
      name: string;
      description: string | null;
      goalType: GoalType;
      targetAmount: string;
      targetDate: Date | null;
      expectedMonthlyAmount: string;
      currentBalance: string | null;
      status: GoalStatus;
      category: GoalCategory;
      startDate: Date | null;
      createdAt: Date;
      updatedAt: Date;
      contributions: Array<{
        id: string;
        savingsGoalId: string;
        year: number;
        month: number;
        projectedAmount: string;
        actualAmount: string | null;
        variance: string | null;
        runningBalance: string | null;
        contributionDate: Date | null;
        createdAt: Date;
        updatedAt: Date;
      }>;
    }
  ): SerializedSavingsGoalWithContributions {
    return {
      id: goal.id,
      name: goal.name,
      description: goal.description || undefined,
      goalType: goal.goalType,
      targetAmount: goal.targetAmount, // Keep as string for JSON serialization
      targetDate: goal.targetDate || undefined,
      expectedMonthlyAmount: goal.expectedMonthlyAmount, // Keep as string
      currentBalance: goal.currentBalance || "0", // Keep as string, default to '0'
      status: goal.status,
      category: goal.category,
      startDate: goal.startDate || new Date(), // Provide default date if null
      createdAt: goal.createdAt,
      updatedAt: goal.updatedAt,
      contributions: goal.contributions.map((contribution) => ({
        id: contribution.id,
        savingsGoalId: contribution.savingsGoalId,
        year: contribution.year,
        month: contribution.month,
        projectedAmount: contribution.projectedAmount, // Keep as string
        actualAmount: contribution.actualAmount || undefined,
        variance: contribution.variance || undefined,
        runningBalance: contribution.runningBalance || "0", // Keep as string
        contributionDate: contribution.contributionDate || undefined,
        createdAt: contribution.createdAt,
        updatedAt: contribution.updatedAt,
      })),
    };
  }
}

export class ContributionService {
  static async checkExistingContribution(
    goalId: string,
    month: number,
    year: number
  ) {
    return await prisma.monthlyContribution.findUnique({
      where: {
        savingsGoalId_year_month: {
          savingsGoalId: goalId,
          year: year,
          month: month,
        },
      },
    });
  }

  static async createContribution(data: {
    goalId: string;
    month: number;
    year: number;
    projectedAmount: string;
    actualAmount?: string;
  }) {
    // Check if contribution already exists
    const existing = await this.checkExistingContribution(
      data.goalId,
      data.month,
      data.year
    );

    if (existing) {
      const monthName = new Date(0, data.month - 1).toLocaleDateString("en", {
        month: "long",
      });
      throw new Error(
        `A contribution for ${monthName} ${data.year} already exists. Use updateContribution to modify it.`
      );
    }

    return this.addContribution({
      savingsGoalId: data.goalId,
      year: data.year,
      month: data.month,
      projectedAmount: data.projectedAmount,
      actualAmount: data.actualAmount,
    });
  }

  static async addContribution(data: {
    savingsGoalId: string;
    year: number;
    month: number;
    projectedAmount: string;
    actualAmount?: string;
  }) {
    const projectedDecimal = FinancialCalculator.toDecimal(
      data.projectedAmount
    );

    if (!FinancialCalculator.isZeroOrPositive(projectedDecimal)) {
      throw new Error("Projected amount must be zero or positive");
    }

    let actualDecimal: Decimal | undefined;
    let varianceDecimal: Decimal | undefined;

    if (data.actualAmount) {
      actualDecimal = FinancialCalculator.toDecimal(data.actualAmount);
      if (!FinancialCalculator.isZeroOrPositive(actualDecimal)) {
        throw new Error("Actual amount must be zero or positive");
      }
      varianceDecimal = FinancialCalculator.subtract(
        actualDecimal,
        projectedDecimal
      );
    }

    // Use a transaction to ensure consistency between insert and balance update
    const [contribution] = await prisma.$transaction(async (tx) => {
      const previousContributions = await tx.monthlyContribution.findMany({
        where: {
          savingsGoalId: data.savingsGoalId,
          OR: [
            { year: { lt: data.year } },
            { year: data.year, month: { lt: data.month } },
          ],
        },
        orderBy: [{ year: "asc" }, { month: "asc" }],
      });

      let runningBalance = new Decimal(0);
      for (const contribution of previousContributions) {
        if (contribution.actualAmount) {
          runningBalance = FinancialCalculator.add(
            runningBalance,
            FinancialCalculator.toDecimal(contribution.actualAmount)
          );
        }
      }

      if (actualDecimal) {
        runningBalance = FinancialCalculator.add(runningBalance, actualDecimal);
      }

      const created = await tx.monthlyContribution.create({
        data: {
          savingsGoalId: data.savingsGoalId,
          year: data.year,
          month: data.month,
          projectedAmount: data.projectedAmount,
          actualAmount: data.actualAmount,
          variance: varianceDecimal
            ? FinancialCalculator.toString(varianceDecimal)
            : null,
          runningBalance: FinancialCalculator.toString(runningBalance),
        },
      });

      if (actualDecimal) {
        await SavingsGoalService.updateCurrentBalance(data.savingsGoalId, tx);
      }

      return [created];
    });

    return contribution;
  }

  static async updateContribution(data: {
    goalId: string;
    month: number;
    year: number;
    projectedAmount?: string;
    actualAmount?: string;
  }) {
    const existing = await this.checkExistingContribution(
      data.goalId,
      data.month,
      data.year
    );

    if (!existing) {
      const monthName = new Date(0, data.month - 1).toLocaleDateString("en", {
        month: "long",
      });
      throw new Error(
        `No contribution found for ${monthName} ${data.year}.`
      );
    }

    // Prepare update data
    const updateData: {
      projectedAmount?: string;
      actualAmount?: string;
      variance?: string;
      updatedAt?: Date;
    } = {};

    if (data.projectedAmount !== undefined) {
      const projectedDecimal = FinancialCalculator.toDecimal(data.projectedAmount);
      if (!FinancialCalculator.isZeroOrPositive(projectedDecimal)) {
        throw new Error("Projected amount must be zero or positive");
      }
      updateData.projectedAmount = data.projectedAmount;
    }

    if (data.actualAmount !== undefined) {
      const actualDecimal = FinancialCalculator.toDecimal(data.actualAmount);
      if (!FinancialCalculator.isZeroOrPositive(actualDecimal)) {
        throw new Error("Actual amount must be zero or positive");
      }
      updateData.actualAmount = data.actualAmount;

      // Recalculate variance
      const projectedAmount = data.projectedAmount || existing.projectedAmount;
      const projectedDecimal = FinancialCalculator.toDecimal(projectedAmount);
      const varianceDecimal = FinancialCalculator.subtract(actualDecimal, projectedDecimal);
      updateData.variance = FinancialCalculator.toString(varianceDecimal);
    }

    // Wrap update and potential balance recompute in a transaction
    const [updatedContribution] = await prisma.$transaction(async (tx) => {
      const updated = await tx.monthlyContribution.update({
        where: {
          savingsGoalId_year_month: {
            savingsGoalId: data.goalId,
            year: data.year,
            month: data.month,
          },
        },
        data: {
          ...updateData,
          updatedAt: new Date(),
        },
      });

      if (data.actualAmount !== undefined) {
        await SavingsGoalService.updateCurrentBalance(data.goalId, tx);
      }

      return [updated];
    });

    return updatedContribution;
  }

  private static async recalculateRunningBalances(savingsGoalId: string) {
    const contributions = await prisma.monthlyContribution.findMany({
      where: { savingsGoalId },
      orderBy: [{ year: "asc" }, { month: "asc" }],
    });

    let runningBalance = new Decimal(0);

    for (const contribution of contributions) {
      if (contribution.actualAmount) {
        runningBalance = FinancialCalculator.add(
          runningBalance,
          FinancialCalculator.toDecimal(contribution.actualAmount)
        );

        await prisma.monthlyContribution.update({
          where: { id: contribution.id },
          data: {
            runningBalance: FinancialCalculator.toString(runningBalance),
            updatedAt: new Date(),
          },
        });
      }
    }
  }
}
