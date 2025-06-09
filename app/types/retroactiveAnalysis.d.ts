import { Decimal } from 'decimal.js';

export interface TheoreticalContribution {
  year: number;
  month: number;
  theoreticalAmount: Decimal;
  cumulativeTheoretical: Decimal;
}

export interface MonthlyPerformanceComparison {
  year: number;
  month: number;
  theoretical: Decimal;
  actual: Decimal;
  variance: Decimal;
  isOnTrack: boolean;
  performanceRatio: number;
}

export interface RetroactivePerformanceMetrics {
  totalTheoretical: Decimal;
  totalActual: Decimal;
  totalVariance: Decimal;
  performancePercentage: number;
  monthsAnalyzed: number;
  monthsOnTrack: number;
  consistencyScore: number;
}

export interface RetroactiveAnalysisResult {
  metrics: RetroactivePerformanceMetrics;
  monthlyComparisons: MonthlyPerformanceComparison[];
  theoreticalContributions: TheoreticalContribution[];
  startDate: Date;
  endDate: Date;
}

export interface RetroactiveAnalysisConfig {
  goalId: string;
  startDate: Date;
  endDate?: Date;
  expectedMonthlyAmount: Decimal;
  includePartialMonths?: boolean;
}

export type PerformanceStatus = 'ahead' | 'on-track' | 'behind' | 'no-contribution';

export interface MonthlyPerformanceIndicator {
  year: number;
  month: number;
  status: PerformanceStatus;
  percentage: number;
  tooltip: string;
}

export interface SerializedRetroactiveAnalysisResult {
  metrics: {
    totalTheoretical: string;
    totalActual: string;
    totalVariance: string;
    performancePercentage: number;
    monthsAnalyzed: number;
    monthsOnTrack: number;
    consistencyScore: number;
  };
  monthlyComparisons: {
    year: number;
    month: number;
    theoretical: string;
    actual: string;
    variance: string;
    isOnTrack: boolean;
    performanceRatio: number;
  }[];
  theoreticalContributions: {
    year: number;
    month: number;
    theoreticalAmount: string;
    cumulativeTheoretical: string;
  }[];
  startDate: Date;
  endDate: Date;
}

export interface RetroactiveAnalysisDisplayOptions {
  showDetailedTimeline?: boolean;
  showMonthlyBreakdown?: boolean;
  showProjections?: boolean;
  timelineColorScheme?: 'default' | 'colorblind' | 'high-contrast';
  compactView?: boolean;
}
