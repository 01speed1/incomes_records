import { useMemo, useState } from "react";
import { RetroactiveMetrics } from "./RetroactiveMetrics";
import { TimelineStats } from "./TimelineStats";
import { PerformanceIndicator, PerformanceBar } from "./PerformanceIndicators";
import { AnalysisExportButton } from "./AnalysisExportButton";
import {
  AnalysisLoadingState,
  AnalysisErrorState,
} from "./AnalysisLoadingState";
import { RetroactiveAnalyzer } from "../lib/retroactiveAnalyzer";
import { CurrencyFormatter } from "../lib/financial";
import type { SavingsGoalWithContributions } from "../types/financial";
import type { PerformanceStatus } from "../types/retroactiveAnalysis";

interface RetroactiveAnalysisDisplayProps {
  goal: SavingsGoalWithContributions;
  className?: string;
  showDetailedMetrics?: boolean;
  showTimelineStats?: boolean;
  showExportButton?: boolean;
}

export function RetroactiveAnalysisDisplay({
  goal,
  className = "",
  showDetailedMetrics = true,
  showTimelineStats = false,
  showExportButton = true,
}: RetroactiveAnalysisDisplayProps) {
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Check if goal has retroactive data (start date in the past)
  const hasRetroactiveData = new Date(goal.startDate) < new Date();

  // Calculate performance metrics for preview mode
  const performanceSummary = useMemo(() => {
    if (!hasRetroactiveData) return null;

    try {
      setAnalysisError(null);
      return RetroactiveAnalyzer.getQuickPerformanceSummary(goal);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to analyze performance data";
      console.error("Error calculating performance summary:", error);
      setAnalysisError(errorMessage);
      return null;
    }
  }, [goal, hasRetroactiveData]);

  // Get overall performance status based on performance percentage
  const getOverallStatus = (percentage: number): PerformanceStatus => {
    if (percentage >= 100) return "ahead";
    if (percentage >= 80) return "on-track";
    if (percentage >= 40) return "behind";
    return "no-contribution";
  };

  const retryAnalysis = () => {
    setAnalysisError(null);
    // This will trigger a re-render and re-calculation of the memoized values
  };

  if (!hasRetroactiveData) {
    return null;
  }

  // Show error state if analysis failed
  if (analysisError) {
    return (
      <AnalysisErrorState
        error={analysisError}
        onRetry={retryAnalysis}
        className={className}
      />
    );
  }

  return (
    <div className={`retroactive-analysis-display ${className}`}>
      {/* Header with export button */}
      {showDetailedMetrics && showExportButton && (
        <div className="retroactive-analysis-display__header flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Retroactive Performance Analysis
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Tracking performance since{" "}
              {new Date(goal.startDate).toLocaleDateString()}
            </p>
          </div>
          <AnalysisExportButton goal={goal} variant="both" />
        </div>
      )}

      {showDetailedMetrics && (
        <RetroactiveMetrics goal={goal} className="mb-6" />
      )}

      {showTimelineStats && (
        <div className="retroactive-analysis-display__timeline-stats mb-6">
          <TimelineStats goal={goal} />
        </div>
      )}

      {/* Quick performance preview - for use in cards or lists */}
      {!showDetailedMetrics && performanceSummary && (
        <div className="retroactive-analysis-display__preview bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">
                Performance Since Start
              </h4>
              <div className="flex items-center gap-2">
                <PerformanceIndicator
                  status={getOverallStatus(
                    performanceSummary.performancePercentage || 0
                  )}
                  percentage={Math.round(
                    performanceSummary.performancePercentage || 0
                  )}
                  showTooltip={true}
                  tooltip={`${Math.round(
                    performanceSummary.performancePercentage || 0
                  )}% of target achieved over ${
                    performanceSummary.periodDescription
                  }`}
                />
                <span className="text-sm text-gray-600">
                  {Math.round(performanceSummary.performancePercentage || 0)}%
                  of target
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-gray-900">
                {CurrencyFormatter.format(goal.currentBalance)}
              </p>
              <p className="text-xs text-gray-500">
                of {CurrencyFormatter.format(goal.targetAmount)} target
              </p>
            </div>
          </div>

          <PerformanceBar
            percentage={Math.round(
              performanceSummary.performancePercentage || 0
            )}
            status={getOverallStatus(
              performanceSummary.performancePercentage || 0
            )}
            className="mt-3"
          />
        </div>
      )}

      {/* Fallback for no data */}
      {!showDetailedMetrics && !performanceSummary && (
        <div className="retroactive-analysis-display__no-data bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-500">
            No retroactive data available for analysis
          </p>
        </div>
      )}
    </div>
  );
}
