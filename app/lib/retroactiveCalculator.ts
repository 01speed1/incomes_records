import { Decimal } from "decimal.js";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import type {
  TheoreticalContribution,
  RetroactiveAnalysisConfig,
} from "../types/retroactiveAnalysis";

// Extend dayjs with the plugin
dayjs.extend(isSameOrBefore);

export class RetroactiveCalculator {
  /**
   * Calculates the theoretical balance from start date to end date
   * based on expected monthly contributions
   */
  static calculateTheoreticalBalance(
    startDate: Date,
    expectedMonthlyAmount: Decimal,
    endDate: Date = new Date()
  ): Decimal {
    const startMoment = dayjs(startDate);
    const endMoment = dayjs(endDate);

    // Calculate months elapsed (including partial months)
    const monthsElapsed = endMoment.diff(startMoment, "month", true);

    if (monthsElapsed <= 0) {
      return new Decimal(0);
    }

    // For now, we'll use complete months only
    const completeMonths = Math.floor(monthsElapsed);
    return expectedMonthlyAmount.mul(completeMonths);
  }

  /**
   * Generates theoretical contributions month by month from start to end date
   */
  static generateTheoreticalContributions(
    config: RetroactiveAnalysisConfig
  ): TheoreticalContribution[] {
    const { startDate, expectedMonthlyAmount } = config;
    const endDate = config.endDate || new Date();

    const contributions: TheoreticalContribution[] = [];
    let current = dayjs(startDate).startOf("month");
    const end = dayjs(endDate).startOf("month");
    let cumulativeAmount = new Decimal(0);

    while (current.isSameOrBefore(end)) {
      cumulativeAmount = cumulativeAmount.add(expectedMonthlyAmount);

      contributions.push({
        year: current.year(),
        month: current.month() + 1, // dayjs months are 0-based
        theoreticalAmount: expectedMonthlyAmount,
        cumulativeTheoretical: cumulativeAmount,
      });

      current = current.add(1, "month");
    }

    return contributions;
  }

  /**
   * Validates if a date range is valid for retroactive analysis
   */
  static validateDateRange(startDate: Date, endDate?: Date): boolean {
    const start = dayjs(startDate);
    const end = dayjs(endDate || new Date());

    // Start date cannot be in the future
    if (start.isAfter(dayjs())) {
      return false;
    }

    // End date cannot be before start date
    if (end.isBefore(start)) {
      return false;
    }

    return true;
  }

  /**
   * Calculates the number of complete months between two dates
   */
  static getMonthsBetween(startDate: Date, endDate: Date): number {
    const start = dayjs(startDate);
    const end = dayjs(endDate);

    return Math.floor(end.diff(start, "month", true));
  }

  /**
   * Gets a human-readable period description
   */
  static getPeriodDescription(startDate: Date, endDate?: Date): string {
    const start = dayjs(startDate);
    const end = dayjs(endDate || new Date());

    const months = this.getMonthsBetween(startDate, end.toDate());

    if (months === 0) {
      return "Less than 1 month";
    } else if (months === 1) {
      return "1 month";
    } else if (months < 12) {
      return `${months} months`;
    } else {
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;

      if (remainingMonths === 0) {
        return years === 1 ? "1 year" : `${years} years`;
      } else {
        return `${years} year${
          years > 1 ? "s" : ""
        } and ${remainingMonths} month${remainingMonths > 1 ? "s" : ""}`;
      }
    }
  }

  /**
   * Helper method to create a standard analysis configuration
   */
  static createAnalysisConfig(
    goalId: string,
    startDate: Date,
    expectedMonthlyAmount: Decimal,
    options?: {
      endDate?: Date;
      includePartialMonths?: boolean;
    }
  ): RetroactiveAnalysisConfig {
    return {
      goalId,
      startDate,
      endDate: options?.endDate || new Date(),
      expectedMonthlyAmount,
      includePartialMonths: options?.includePartialMonths || false,
    };
  }
}
