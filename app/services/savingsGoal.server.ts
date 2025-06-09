import { prisma } from "../lib/db.server";
import { FinancialCalculator, ProjectionCalculator } from "../lib/financial";
import { Decimal } from "decimal.js";
import type {
  SavingsGoalData,
  MonthlyContributionData,
  SavingsGoalWithContributions,
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

  static async updateCurrentBalance(goalId: string) {
    const contributions = await prisma.monthlyContribution.findMany({
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

    await prisma.savingsGoal.update({
      where: { id: goalId },
      data: {
        currentBalance: FinancialCalculator.toString(currentBalance),
        updatedAt: new Date(),
      },
    });

    return currentBalance;
  }

  private static transformGoalData(
    goal: any
  ): SerializedSavingsGoalWithContributions {
    return {
      id: goal.id,
      name: goal.name,
      description: goal.description,
      goalType: goal.goalType,
      targetAmount: goal.targetAmount, // Keep as string for JSON serialization
      targetDate: goal.targetDate,
      expectedMonthlyAmount: goal.expectedMonthlyAmount, // Keep as string
      currentBalance: goal.currentBalance || "0", // Keep as string, default to '0'
      status: goal.status,
      category: goal.category,
      startDate: goal.startDate,
      createdAt: goal.createdAt,
      updatedAt: goal.updatedAt,
      contributions: goal.contributions.map((contribution: any) => ({
        id: contribution.id,
        savingsGoalId: contribution.savingsGoalId,
        year: contribution.year,
        month: contribution.month,
        projectedAmount: contribution.projectedAmount, // Keep as string
        actualAmount: contribution.actualAmount || undefined,
        variance: contribution.variance || undefined,
        runningBalance: contribution.runningBalance || "0", // Keep as string
        contributionDate: contribution.contributionDate,
        notes: contribution.notes,
        createdAt: contribution.createdAt,
        updatedAt: contribution.updatedAt,
      })),
    };
  }
}

export class ContributionService {
  static async createContribution(data: {
    goalId: string;
    month: number;
    year: number;
    projectedAmount: string;
    actualAmount?: string;
    notes?: string;
  }) {
    return this.addContribution({
      savingsGoalId: data.goalId,
      year: data.year,
      month: data.month,
      projectedAmount: data.projectedAmount,
      actualAmount: data.actualAmount,
      notes: data.notes,
    });
  }

  static async addContribution(data: {
    savingsGoalId: string;
    year: number;
    month: number;
    projectedAmount: string;
    actualAmount?: string;
    notes?: string;
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

    const previousContributions = await prisma.monthlyContribution.findMany({
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

    const contribution = await prisma.monthlyContribution.create({
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
        notes: data.notes,
      },
    });

    if (actualDecimal) {
      await SavingsGoalService.updateCurrentBalance(data.savingsGoalId);
    }

    return contribution;
  }

  static async updateContribution(
    id: string,
    data: {
      actualAmount: string;
      notes?: string;
    }
  ) {
    const contribution = await prisma.monthlyContribution.findUnique({
      where: { id },
    });

    if (!contribution) {
      throw new Error("Contribution not found");
    }

    const actualDecimal = FinancialCalculator.toDecimal(data.actualAmount);
    if (!FinancialCalculator.isZeroOrPositive(actualDecimal)) {
      throw new Error("Actual amount must be zero or positive");
    }

    const projectedDecimal = FinancialCalculator.toDecimal(
      contribution.projectedAmount
    );
    const varianceDecimal = FinancialCalculator.subtract(
      actualDecimal,
      projectedDecimal
    );

    const updatedContribution = await prisma.monthlyContribution.update({
      where: { id },
      data: {
        actualAmount: data.actualAmount,
        variance: FinancialCalculator.toString(varianceDecimal),
        notes: data.notes,
        updatedAt: new Date(),
      },
    });

    await this.recalculateRunningBalances(contribution.savingsGoalId);
    await SavingsGoalService.updateCurrentBalance(contribution.savingsGoalId);

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
