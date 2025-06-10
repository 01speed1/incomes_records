import { Decimal } from "decimal.js";
import { RetroactiveCalculator } from "./retroactiveCalculator";
import type {
  MonthlyContributionData,
  SavingsGoalWithContributions,
} from "../types/financial";
import type {
  MonthlyPerformanceComparison,
  RetroactivePerformanceMetrics,
  RetroactiveAnalysisResult,
  RetroactiveAnalysisConfig,
  PerformanceStatus,
  MonthlyPerformanceIndicator,
} from "../types/retroactiveAnalysis";

export class RetroactiveAnalyzer {
  /**
   * Performs complete retroactive analysis comparing actual vs theoretical performance
   */
  static analyzeGoalPerformance(
    goal: SavingsGoalWithContributions,
    config?: Partial<RetroactiveAnalysisConfig>
  ): RetroactiveAnalysisResult {
    // Create analysis configuration
    const analysisConfig: RetroactiveAnalysisConfig = {
      goalId: goal.id,
      startDate: goal.startDate,
      endDate: config?.endDate || new Date(),
      expectedMonthlyAmount: goal.expectedMonthlyAmount,
      includePartialMonths: config?.includePartialMonths || false,
    };

    // Validate date range
    if (
      !RetroactiveCalculator.validateDateRange(
        analysisConfig.startDate,
        analysisConfig.endDate
      )
    ) {
      throw new Error("Invalid date range for retroactive analysis");
    }

    // Generate theoretical contributions
    const theoreticalContributions =
      RetroactiveCalculator.generateTheoreticalContributions(analysisConfig);

    // Compare with actual contributions
    const monthlyComparisons = this.compareMonthlyPerformance(
      goal.contributions,
      theoreticalContributions
    );

    // Calculate overall metrics
    const metrics = this.calculatePerformanceMetrics(
      monthlyComparisons,
      theoreticalContributions
    );

    return {
      metrics,
      monthlyComparisons,
      theoreticalContributions,
      startDate: analysisConfig.startDate,
      endDate: analysisConfig.endDate || new Date(),
    };
  }

  /**
   * Compares actual contributions with theoretical contributions month by month
   */
  static compareMonthlyPerformance(
    actualContributions: MonthlyContributionData[],
    theoreticalContributions: any[]
  ): MonthlyPerformanceComparison[] {
    // Create a map of actual contributions by year-month key
    const actualMap = new Map<string, Decimal>();
    actualContributions.forEach((contrib) => {
      if (contrib.actualAmount) {
        const key = `${contrib.year}-${contrib.month}`;
        actualMap.set(key, contrib.actualAmount);
      }
    });

    // Compare each theoretical month with actual
    return theoreticalContributions.map((theoretical) => {
      const key = `${theoretical.year}-${theoretical.month}`;
      const actual = actualMap.get(key) || new Decimal(0);
      const variance = actual.minus(theoretical.theoreticalAmount);
      const performanceRatio = theoretical.theoreticalAmount.greaterThan(0)
        ? actual.div(theoretical.theoreticalAmount).toNumber()
        : actual.greaterThan(0)
        ? 1
        : 0;

      return {
        year: theoretical.year,
        month: theoretical.month,
        theoretical: theoretical.theoreticalAmount,
        actual,
        variance,
        isOnTrack: variance.greaterThanOrEqualTo(0),
        performanceRatio,
      };
    });
  }

  /**
   * Calculates overall performance metrics from monthly comparisons
   */
  static calculatePerformanceMetrics(
    monthlyComparisons: MonthlyPerformanceComparison[],
    theoreticalContributions: any[]
  ): RetroactivePerformanceMetrics {
    const totalTheoretical = theoreticalContributions.reduce(
      (sum, contrib) => sum.add(contrib.theoreticalAmount),
      new Decimal(0)
    );

    const totalActual = monthlyComparisons.reduce(
      (sum, comparison) => sum.add(comparison.actual),
      new Decimal(0)
    );

    const totalVariance = totalActual.minus(totalTheoretical);

    const performancePercentage = totalTheoretical.greaterThan(0)
      ? totalActual.div(totalTheoretical).mul(100).toNumber()
      : 0;

    const monthsOnTrack = monthlyComparisons.filter(
      (comparison) => comparison.isOnTrack
    ).length;

    // Consistency score: percentage of months where some contribution was made
    const monthsWithContributions = monthlyComparisons.filter((comparison) =>
      comparison.actual.greaterThan(0)
    ).length;

    const consistencyScore =
      monthlyComparisons.length > 0
        ? (monthsWithContributions / monthlyComparisons.length) * 100
        : 0;

    return {
      totalTheoretical,
      totalActual,
      totalVariance,
      performancePercentage,
      monthsAnalyzed: monthlyComparisons.length,
      monthsOnTrack,
      consistencyScore,
    };
  }

  /**
   * Determines performance status for a single month
   */
  static getMonthPerformanceStatus(
    actual: Decimal,
    theoretical: Decimal,
    tolerance: number = 0.1
  ): PerformanceStatus {
    if (actual.isZero()) {
      return "no-contribution";
    }

    const ratio = actual.div(theoretical).toNumber();

    if (ratio >= 1 + tolerance) {
      return "ahead";
    } else if (ratio >= 1 - tolerance) {
      return "on-track";
    } else {
      return "behind";
    }
  }

  /**
   * Generates performance indicators for timeline visualization
   */
  static generatePerformanceIndicators(
    monthlyComparisons: MonthlyPerformanceComparison[]
  ): MonthlyPerformanceIndicator[] {
    return monthlyComparisons.map((comparison) => {
      const status = this.getMonthPerformanceStatus(
        comparison.actual,
        comparison.theoretical
      );

      const percentage = Math.round(comparison.performanceRatio * 100);

      // Generate tooltip text
      const monthName = new Date(
        comparison.year,
        comparison.month - 1
      ).toLocaleDateString("en", { month: "short" });
      const tooltip = `${monthName} ${
        comparison.year
      }: ${percentage}% of target (${comparison.actual.toFixed(
        2
      )} / ${comparison.theoretical.toFixed(2)})`;

      return {
        year: comparison.year,
        month: comparison.month,
        status,
        percentage,
        tooltip,
      };
    });
  }

  /**
   * Quick analysis method that checks if a goal has retroactive data
   * and returns basic performance summary
   */
  static getQuickPerformanceSummary(goal: SavingsGoalWithContributions): {
    hasRetroactiveData: boolean;
    periodDescription?: string;
    performancePercentage?: number;
    totalVariance?: Decimal;
  } {
    // Check if goal has start date in the past
    const now = new Date();
    const hasRetroactiveData = new Date(goal.startDate) < now;

    if (!hasRetroactiveData) {
      return { hasRetroactiveData: false };
    }

    try {
      const analysis = this.analyzeGoalPerformance(goal);
      const periodDescription = RetroactiveCalculator.getPeriodDescription(
        goal.startDate,
        now
      );

      return {
        hasRetroactiveData: true,
        periodDescription,
        performancePercentage: analysis.metrics.performancePercentage,
        totalVariance: analysis.metrics.totalVariance,
      };
    } catch (error) {
      console.error("Error in quick performance summary:", error);
      return { hasRetroactiveData: false };
    }
  }
}
