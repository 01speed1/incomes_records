import { useMemo } from "react";
import dayjs from "dayjs";
import { RetroactiveAnalyzer } from "../lib/retroactiveAnalyzer";
import { RetroactiveCalculator } from "../lib/retroactiveCalculator";
import type { SavingsGoalWithContributions } from "../types/financial";

interface RetroactiveMetricsProps {
  goal: SavingsGoalWithContributions;
  className?: string;
}

export function RetroactiveMetrics({
  goal,
  className = "",
}: RetroactiveMetricsProps) {
  const analysis = useMemo(() => {
    const summary = RetroactiveAnalyzer.getQuickPerformanceSummary(goal);

    if (!summary.hasRetroactiveData) {
      return null;
    }

    try {
      return RetroactiveAnalyzer.analyzeGoalPerformance(goal);
    } catch (error) {
      console.error("Error analyzing goal performance:", error);
      return null;
    }
  }, [goal]);

  if (!analysis) {
    return null;
  }

  const periodDescription = RetroactiveCalculator.getPeriodDescription(
    goal.startDate,
    new Date()
  );
  const { metrics } = analysis;

  // Determine color scheme based on performance
  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 100) return "text-green-600";
    if (percentage >= 80) return "text-blue-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getVarianceColor = (variance: any) => {
    if (variance.greaterThanOrEqualTo(0)) return "text-green-600";
    return "text-red-600";
  };

  const formatCurrency = (amount: any) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount.toNumber());
  };

  return (
    <div
      className={`retroactive-metrics bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 ${className}`}
    >
      <div className="retroactive-metrics__header mb-6">
        <h3 className="retroactive-metrics__title text-lg font-semibold text-gray-900 mb-2">
          Performance Analysis
        </h3>
        <p className="retroactive-metrics__subtitle text-sm text-gray-600">
          Theoretical vs Actual progress over {periodDescription}
        </p>
      </div>

      <div className="retroactive-metrics__cards grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Should Have Saved */}
        <div className="retroactive-metrics__card bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 ease-in-out">
          <div className="retroactive-metrics__card-header mb-2">
            <h4 className="retroactive-metrics__card-title text-sm font-medium text-gray-500">
              Should Have Saved
            </h4>
          </div>
          <div className="retroactive-metrics__card-content">
            <p className="retroactive-metrics__card-amount text-2xl font-bold text-blue-600 animate-fade-in">
              {formatCurrency(metrics.totalTheoretical)}
            </p>
            <p className="retroactive-metrics__card-subtitle text-xs text-gray-500 mt-1">
              Target since {dayjs(goal.startDate).format("MMM YYYY")}
            </p>
          </div>
        </div>

        {/* Actually Saved */}
        <div className="retroactive-metrics__card bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 ease-in-out">
          <div className="retroactive-metrics__card-header mb-2">
            <h4 className="retroactive-metrics__card-title text-sm font-medium text-gray-500">
              Actually Saved
            </h4>
          </div>
          <div className="retroactive-metrics__card-content">
            <p className="retroactive-metrics__card-amount text-2xl font-bold text-green-600 animate-fade-in animation-delay-100">
              {formatCurrency(metrics.totalActual)}
            </p>
            <p className="retroactive-metrics__card-subtitle text-xs text-gray-500 mt-1">
              Real contributions made
            </p>
          </div>
        </div>

        {/* Performance Score */}
        <div className="retroactive-metrics__card bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 ease-in-out">
          <div className="retroactive-metrics__card-header mb-2">
            <h4 className="retroactive-metrics__card-title text-sm font-medium text-gray-500">
              Performance
            </h4>
          </div>
          <div className="retroactive-metrics__card-content">
            <p
              className={`retroactive-metrics__card-amount text-2xl font-bold ${getPerformanceColor(
                metrics.performancePercentage
              )} animate-fade-in animation-delay-200`}
            >
              {metrics.performancePercentage.toFixed(1)}%
            </p>
            <p
              className={`retroactive-metrics__card-subtitle text-xs mt-1 ${getVarianceColor(
                metrics.totalVariance
              )}`}
            >
              {metrics.totalVariance.greaterThanOrEqualTo(0) ? "+" : ""}
              {formatCurrency(metrics.totalVariance)} vs target
            </p>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="retroactive-metrics__stats mt-6 pt-4 border-t border-gray-200">
        <div className="retroactive-metrics__stats-grid grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
          <div className="retroactive-metrics__stat">
            <p className="retroactive-metrics__stat-value text-lg font-semibold text-gray-900">
              {metrics.monthsAnalyzed}
            </p>
            <p className="retroactive-metrics__stat-label text-xs text-gray-500">
              Months Tracked
            </p>
          </div>

          <div className="retroactive-metrics__stat">
            <p className="retroactive-metrics__stat-value text-lg font-semibold text-gray-900">
              {metrics.monthsOnTrack}
            </p>
            <p className="retroactive-metrics__stat-label text-xs text-gray-500">
              Months On Track
            </p>
          </div>

          <div className="retroactive-metrics__stat">
            <p className="retroactive-metrics__stat-value text-lg font-semibold text-gray-900">
              {metrics.consistencyScore.toFixed(0)}%
            </p>
            <p className="retroactive-metrics__stat-label text-xs text-gray-500">
              Consistency Score
            </p>
          </div>

          <div className="retroactive-metrics__stat">
            <p className="retroactive-metrics__stat-value text-lg font-semibold text-gray-900">
              {formatCurrency(goal.expectedMonthlyAmount)}
            </p>
            <p className="retroactive-metrics__stat-label text-xs text-gray-500">
              Monthly Target
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
