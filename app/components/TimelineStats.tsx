import { useMemo } from "react";
import { RetroactiveAnalyzer } from "../lib/retroactiveAnalyzer";
import type { SavingsGoalWithContributions } from "../types/financial";

interface TimelineStatsProps {
  goal: SavingsGoalWithContributions;
  className?: string;
}

export function TimelineStats({ goal, className = "" }: TimelineStatsProps) {
  const stats = useMemo(() => {
    try {
      const analysis = RetroactiveAnalyzer.analyzeGoalPerformance(goal);
      const { monthlyComparisons } = analysis;

      const onTrackCount = monthlyComparisons.filter(
        (comparison) => comparison.isOnTrack
      ).length;

      const aheadCount = monthlyComparisons.filter((comparison) =>
        comparison.variance.greaterThan(0)
      ).length;

      const behindCount = monthlyComparisons.filter(
        (comparison) =>
          comparison.variance.lessThan(0) && comparison.actual.greaterThan(0)
      ).length;

      const noContributionCount = monthlyComparisons.filter((comparison) =>
        comparison.actual.equals(0)
      ).length;

      const successRate =
        monthlyComparisons.length > 0
          ? Math.round(
              ((onTrackCount + aheadCount) / monthlyComparisons.length) * 100
            )
          : 0;

      return {
        total: monthlyComparisons.length,
        onTrack: onTrackCount,
        ahead: aheadCount,
        behind: behindCount,
        noContribution: noContributionCount,
        successRate,
      };
    } catch (error) {
      console.error("Error calculating timeline stats:", error);
      return null;
    }
  }, [goal]);

  if (!stats) {
    return (
      <div className={`timeline-stats ${className}`}>
        <div className="timeline-stats__error bg-red-50 rounded-lg p-4">
          <p className="text-sm text-red-600">
            Unable to calculate timeline statistics
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`timeline-stats bg-white rounded-lg border border-gray-200 p-4 ${className}`}
    >
      <h4 className="timeline-stats__title text-sm font-medium text-gray-700 mb-3">
        Timeline Summary
      </h4>

      <div className="timeline-stats__metrics space-y-3">
        <div className="timeline-stats__metric flex justify-between items-center">
          <span className="text-sm text-gray-600">Success Rate</span>
          <span className="text-sm font-semibold text-green-600">
            {stats.successRate}%
          </span>
        </div>

        <div className="timeline-stats__metric flex justify-between items-center">
          <span className="text-sm text-gray-600">Months Tracked</span>
          <span className="text-sm font-semibold text-gray-900">
            {stats.total}
          </span>
        </div>

        <div className="timeline-stats__metric flex justify-between items-center">
          <span className="text-sm text-gray-600">On Track</span>
          <span className="text-sm font-semibold text-blue-600">
            {stats.onTrack}
          </span>
        </div>

        <div className="timeline-stats__metric flex justify-between items-center">
          <span className="text-sm text-gray-600">Ahead of Target</span>
          <span className="text-sm font-semibold text-green-600">
            {stats.ahead}
          </span>
        </div>

        <div className="timeline-stats__metric flex justify-between items-center">
          <span className="text-sm text-gray-600">Behind Target</span>
          <span className="text-sm font-semibold text-yellow-600">
            {stats.behind}
          </span>
        </div>

        <div className="timeline-stats__metric flex justify-between items-center">
          <span className="text-sm text-gray-600">No Contribution</span>
          <span className="text-sm font-semibold text-red-600">
            {stats.noContribution}
          </span>
        </div>
      </div>
    </div>
  );
}
