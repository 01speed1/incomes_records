import { Decimal } from "decimal.js";
import type { SavingsGoalWithContributions } from "../types/financial";

/**
 * Transforms serialized goal data from JSON back to proper Decimal objects
 */
export function transformGoalDataFromJSON(
  goal: any
): SavingsGoalWithContributions {
  return {
    ...goal,
    targetAmount: new Decimal(goal.targetAmount),
    expectedMonthlyAmount: new Decimal(goal.expectedMonthlyAmount),
    currentBalance: new Decimal(goal.currentBalance || "0"),
    contributions: goal.contributions.map((contribution: any) => ({
      ...contribution,
      projectedAmount: new Decimal(contribution.projectedAmount),
      actualAmount: contribution.actualAmount
        ? new Decimal(contribution.actualAmount)
        : undefined,
      variance: contribution.variance
        ? new Decimal(contribution.variance)
        : undefined,
      runningBalance: new Decimal(contribution.runningBalance || "0"),
    })),
  };
}

/**
 * Transforms an array of serialized goals
 */
export function transformGoalsDataFromJSON(
  goals: any[]
): SavingsGoalWithContributions[] {
  return goals.map((goal) => transformGoalDataFromJSON(goal));
}
