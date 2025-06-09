import { Decimal } from "decimal.js";
import accounting from "accounting";

Decimal.set({
  precision: 28,
  rounding: Decimal.ROUND_HALF_UP,
  toExpNeg: -7,
  toExpPos: 21,
  minE: -9e15,
  maxE: 9e15,
});

export class FinancialCalculator {
  static toDecimal(
    value: string | number | Decimal | null | undefined
  ): Decimal {
    try {
      if (value === null || value === undefined || value === "") {
        return new Decimal(0);
      }
      return new Decimal(value);
    } catch (error) {
      console.warn(`Invalid decimal value: ${value}, using 0 instead`);
      return new Decimal(0);
    }
  }

  static toString(decimal: Decimal): string {
    return decimal.toFixed(2);
  }

  static add(a: Decimal, b: Decimal): Decimal {
    return a.add(b);
  }

  static subtract(a: Decimal, b: Decimal): Decimal {
    return a.sub(b);
  }

  static multiply(a: Decimal, b: Decimal): Decimal {
    return a.mul(b);
  }

  static divide(a: Decimal, b: Decimal): Decimal {
    if (b.isZero()) {
      throw new Error("Division by zero");
    }
    return a.div(b);
  }

  static percentage(part: Decimal, total: Decimal): Decimal {
    if (total.isZero()) {
      return new Decimal(0);
    }
    return this.multiply(this.divide(part, total), new Decimal(100));
  }

  static isPositive(value: Decimal): boolean {
    return value.greaterThan(0);
  }

  static isZeroOrPositive(value: Decimal): boolean {
    return value.greaterThanOrEqualTo(0);
  }

  static min(a: Decimal, b: Decimal): Decimal {
    return a.lessThan(b) ? a : b;
  }

  static max(a: Decimal, b: Decimal): Decimal {
    return a.greaterThan(b) ? a : b;
  }
}

export class CurrencyFormatter {
  private static defaultOptions = {
    symbol: "$",
    precision: 2,
    thousand: ",",
    decimal: ".",
    format: "%s%v",
  };

  static format(amount: Decimal | string | number, options = {}): string {
    const value =
      amount instanceof Decimal ? amount.toNumber() : Number(amount);
    const formatOptions = { ...this.defaultOptions, ...options };

    return accounting.formatMoney(value, formatOptions);
  }

  static formatCompact(amount: Decimal | string | number): string {
    const value =
      amount instanceof Decimal ? amount.toNumber() : Number(amount);

    if (value >= 1000000) {
      return this.format(value / 1000000, { precision: 1 }) + "M";
    }

    if (value >= 1000) {
      return this.format(value / 1000, { precision: 1 }) + "K";
    }

    return this.format(value);
  }

  static unformat(value: string): number {
    return accounting.unformat(value);
  }

  static toDecimal(formattedValue: string): Decimal {
    const unformatted = this.unformat(formattedValue);
    return FinancialCalculator.toDecimal(unformatted);
  }
}

export class ProjectionCalculator {
  static calculateTargetDate(
    currentBalance: Decimal,
    targetAmount: Decimal,
    monthlyContribution: Decimal
  ): Date | null {
    if (monthlyContribution.lessThanOrEqualTo(0)) {
      return null;
    }

    if (currentBalance.greaterThanOrEqualTo(targetAmount)) {
      return new Date();
    }

    const remainingAmount = targetAmount.sub(currentBalance);
    const monthsNeeded = Math.ceil(
      remainingAmount.div(monthlyContribution).toNumber()
    );

    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() + monthsNeeded);

    return targetDate;
  }

  static calculateMonthlyProjections(
    currentBalance: Decimal,
    monthlyContribution: Decimal,
    months: number
  ): Decimal[] {
    const projections: Decimal[] = [];
    let balance = currentBalance;

    for (let i = 0; i < months; i++) {
      balance = balance.add(monthlyContribution);
      projections.push(balance);
    }

    return projections;
  }

  static calculateVariance(actual: Decimal, projected: Decimal): Decimal {
    return actual.sub(projected);
  }

  static calculateConsistencyScore(
    contributions: Array<{ actualAmount?: Decimal; projectedAmount: Decimal }>
  ): number {
    if (contributions.length === 0) return 0;

    const validContributions = contributions.filter(
      (c) => c.actualAmount !== undefined
    );
    if (validContributions.length === 0) return 0;

    let totalVariance = new Decimal(0);
    let count = 0;

    for (const contribution of validContributions) {
      if (contribution.actualAmount) {
        const variance = Math.abs(
          contribution.actualAmount.sub(contribution.projectedAmount).toNumber()
        );
        totalVariance = totalVariance.add(variance);
        count++;
      }
    }

    if (count === 0) return 0;

    const averageVariance = totalVariance.div(count);
    const consistencyScore = Math.max(0, 100 - averageVariance.toNumber());

    return Math.round(consistencyScore);
  }
}
