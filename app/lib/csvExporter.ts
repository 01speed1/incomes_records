import type {
  RetroactiveAnalysisResult,
  MonthlyPerformanceComparison,
} from "../types/retroactiveAnalysis";
import type { SavingsGoalWithContributions } from "../types/financial";

export class CSVExporter {
  /**
   * Exports retroactive analysis data to CSV format
   */
  static exportRetroactiveAnalysis(
    goal: SavingsGoalWithContributions,
    analysis: RetroactiveAnalysisResult
  ): string {
    const headers = [
      "Goal Name",
      "Year",
      "Month",
      "Month Name",
      "Theoretical Amount",
      "Actual Amount",
      "Variance",
      "Performance %",
      "Status",
      "Cumulative Theoretical",
      "Cumulative Actual",
    ];

    const rows: string[][] = [];
    let cumulativeActual = 0;

    analysis.monthlyComparisons.forEach((comparison, index) => {
      cumulativeActual += comparison.actual.toNumber();

      const monthName = new Date(
        comparison.year,
        comparison.month - 1
      ).toLocaleDateString("en", { month: "long" });

      const status = this.getStatusText(
        comparison.actual,
        comparison.theoretical
      );

      const theoretical = analysis.theoreticalContributions[index];

      rows.push([
        goal.name,
        comparison.year.toString(),
        comparison.month.toString(),
        monthName,
        comparison.theoretical.toFixed(2),
        comparison.actual.toFixed(2),
        comparison.variance.toFixed(2),
        (comparison.performanceRatio * 100).toFixed(1),
        status,
        theoretical?.cumulativeTheoretical.toFixed(2) || "0",
        cumulativeActual.toFixed(2),
      ]);
    });

    return this.convertToCSV([headers, ...rows]);
  }

  /**
   * Exports goal summary data to CSV format
   */
  static exportGoalSummary(
    goal: SavingsGoalWithContributions,
    analysis: RetroactiveAnalysisResult
  ): string {
    const headers = ["Metric", "Value"];

    const rows = [
      ["Goal Name", goal.name],
      ["Description", goal.description || ""],
      ["Target Amount", goal.targetAmount.toFixed(2)],
      ["Current Balance", goal.currentBalance.toFixed(2)],
      ["Expected Monthly Amount", goal.expectedMonthlyAmount.toFixed(2)],
      ["Start Date", goal.startDate.toISOString().split("T")[0]],
      [
        "Analysis Period",
        `${analysis.startDate.toISOString().split("T")[0]} to ${
          analysis.endDate.toISOString().split("T")[0]
        }`,
      ],
      ["", ""], // Empty row
      ["=== PERFORMANCE METRICS ===", ""],
      ["Total Theoretical", analysis.metrics.totalTheoretical.toFixed(2)],
      ["Total Actual", analysis.metrics.totalActual.toFixed(2)],
      ["Total Variance", analysis.metrics.totalVariance.toFixed(2)],
      [
        "Performance Percentage",
        `${analysis.metrics.performancePercentage.toFixed(1)}%`,
      ],
      ["Months Analyzed", analysis.metrics.monthsAnalyzed.toString()],
      ["Months On Track", analysis.metrics.monthsOnTrack.toString()],
      ["Consistency Score", `${analysis.metrics.consistencyScore.toFixed(1)}%`],
      ["", ""], // Empty row
      ["=== STATUS BREAKDOWN ===", ""],
      ...this.getStatusBreakdown(analysis.monthlyComparisons),
    ];

    return this.convertToCSV([headers, ...rows]);
  }

  /**
   * Downloads CSV data as a file
   */
  static downloadCSV(csvData: string, filename: string): void {
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }

  /**
   * Converts 2D array to CSV string
   */
  private static convertToCSV(data: string[][]): string {
    return data
      .map((row) =>
        row
          .map((cell) => {
            // Escape quotes and wrap in quotes if contains comma, quote, or newline
            if (
              cell.includes(",") ||
              cell.includes('"') ||
              cell.includes("\n")
            ) {
              return `"${cell.replace(/"/g, '""')}"`;
            }
            return cell;
          })
          .join(",")
      )
      .join("\n");
  }

  /**
   * Gets status text for a comparison
   */
  private static getStatusText(actual: any, theoretical: any): string {
    if (actual.isZero()) {
      return "No Contribution";
    }

    const ratio = actual.div(theoretical).toNumber();

    if (ratio >= 1.1) {
      return "Ahead";
    } else if (ratio >= 0.9) {
      return "On Track";
    } else {
      return "Behind";
    }
  }

  /**
   * Gets status breakdown for summary
   */
  private static getStatusBreakdown(
    comparisons: MonthlyPerformanceComparison[]
  ): string[][] {
    const statusCounts = comparisons.reduce((acc, comparison) => {
      const status = this.getStatusText(
        comparison.actual,
        comparison.theoretical
      );
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusCounts).map(([status, count]) => [
      `${status} Months`,
      count.toString(),
    ]);
  }

  /**
   * Generates a filename with timestamp
   */
  static generateFilename(
    goalName: string,
    type: "analysis" | "summary"
  ): string {
    const timestamp = new Date().toISOString().split("T")[0];
    const sanitizedName = goalName.replace(/[^a-zA-Z0-9]/g, "_");
    return `${sanitizedName}_${type}_${timestamp}.csv`;
  }
}
