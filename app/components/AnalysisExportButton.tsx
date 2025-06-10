import { useState } from "react";
import { RetroactiveAnalyzer } from "../lib/retroactiveAnalyzer";
import { CSVExporter } from "../lib/csvExporter";
import type { SavingsGoalWithContributions } from "../types/financial";

interface AnalysisExportButtonProps {
  goal: SavingsGoalWithContributions;
  variant?: "detailed" | "summary" | "both";
  className?: string;
}

export function AnalysisExportButton({
  goal,
  variant = "both",
  className = "",
}: AnalysisExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleExport = async (type: "analysis" | "summary") => {
    setIsExporting(true);

    try {
      // Generate analysis data
      const analysis = RetroactiveAnalyzer.analyzeGoalPerformance(goal);

      let csvData: string;
      let filename: string;

      if (type === "analysis") {
        csvData = CSVExporter.exportRetroactiveAnalysis(goal, analysis);
        filename = CSVExporter.generateFilename(goal.name, "analysis");
      } else {
        csvData = CSVExporter.exportGoalSummary(goal, analysis);
        filename = CSVExporter.generateFilename(goal.name, "summary");
      }

      // Download the file
      CSVExporter.downloadCSV(csvData, filename);
      setShowDropdown(false);
    } catch (error) {
      console.error("Error exporting data:", error);
      alert("Failed to export data. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportBoth = async () => {
    await handleExport("analysis");
    setTimeout(() => handleExport("summary"), 100); // Small delay between downloads
  };

  // Check if goal has retroactive data
  const hasRetroactiveData = goal.startDate < new Date();

  if (!hasRetroactiveData) {
    return null;
  }

  if (variant === "detailed") {
    return (
      <button
        onClick={() => handleExport("analysis")}
        disabled={isExporting}
        className={`analysis-export-btn flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors duration-200 ${className}`}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        {isExporting ? "Exporting..." : "Export Analysis"}
      </button>
    );
  }

  if (variant === "summary") {
    return (
      <button
        onClick={() => handleExport("summary")}
        disabled={isExporting}
        className={`analysis-export-btn flex items-center gap-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors duration-200 ${className}`}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        {isExporting ? "Exporting..." : "Export Summary"}
      </button>
    );
  }

  // Both variant - dropdown menu
  return (
    <div className={`analysis-export-dropdown relative ${className}`}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={isExporting}
        className="analysis-export-btn flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors duration-200"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        {isExporting ? "Exporting..." : "Export Data"}
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${
            showDropdown ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {showDropdown && (
        <div className="analysis-export-dropdown__menu absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
          <div className="py-1">
            <button
              onClick={() => handleExport("analysis")}
              disabled={isExporting}
              className="analysis-export-dropdown__item flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:text-gray-400"
            >
              <svg
                className="w-4 h-4 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <div>
                <div className="font-medium">Detailed Analysis</div>
                <div className="text-xs text-gray-500">
                  Month-by-month breakdown
                </div>
              </div>
            </button>

            <button
              onClick={() => handleExport("summary")}
              disabled={isExporting}
              className="analysis-export-dropdown__item flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:text-gray-400"
            >
              <svg
                className="w-4 h-4 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <div>
                <div className="font-medium">Performance Summary</div>
                <div className="text-xs text-gray-500">
                  Key metrics overview
                </div>
              </div>
            </button>

            <hr className="my-1" />

            <button
              onClick={handleExportBoth}
              disabled={isExporting}
              className="analysis-export-dropdown__item flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:text-gray-400"
            >
              <svg
                className="w-4 h-4 text-purple-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              <div>
                <div className="font-medium">Export Both</div>
                <div className="text-xs text-gray-500">Download both files</div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Overlay to close dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
}
