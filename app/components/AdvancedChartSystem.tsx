import { useState, useCallback, useMemo } from "react";
import { SimpleChart } from "./SimpleChart";
import { ChartControlPanel } from "./ChartControlPanel";
import { ChartStats } from "./ChartStats";
import { IncomeChartService } from "~/services/incomeChart";
import type {
  SavingsGoalWithContributions,
  AdvancedChartConfig,
  IncomeChartData,
  ChartLoadingState,
  ChartErrorState,
} from "~/types/financial";

interface AdvancedChartSystemProps {
  goals: SavingsGoalWithContributions[];
  className?: string;
  height?: number;
  showControls?: boolean;
  showStats?: boolean;
  initialConfig?: Partial<AdvancedChartConfig>;
}

export function AdvancedChartSystem({
  goals,
  className = "",
  height = 400,
  showControls = true,
  showStats = true,
  initialConfig = {},
}: AdvancedChartSystemProps) {
  // Chart configuration state
  const [chartConfig, setChartConfig] = useState<AdvancedChartConfig>(() => {
    return {
      ...IncomeChartService.getDefaultAdvancedConfig(),
      ...initialConfig,
    };
  });

  // Chart data and state
  const [chartData, setChartData] = useState<IncomeChartData | null>(null);
  const [loadingState, setLoadingState] = useState<ChartLoadingState>({
    isLoading: true,
    isRefreshing: false,
    progress: 0,
  });
  const [errorState, setErrorState] = useState<ChartErrorState>({
    hasError: false,
    canRetry: true,
    retryCount: 0,
  });

  // Chart ref for operations
  const [chartRef, setChartRef] = useState<any>(null);

  // Configuration change handler
  const handleConfigChange = useCallback(
    (newConfig: Partial<AdvancedChartConfig>) => {
      setChartConfig((prev) => ({ ...prev, ...newConfig }));
    },
    []
  );

  // Data update handler
  const handleDataUpdate = useCallback((data: IncomeChartData) => {
    setChartData(data);
  }, []);

  // Loading state handler
  const handleLoadingChange = useCallback((loading: ChartLoadingState) => {
    setLoadingState(loading);
  }, []);

  // Error handler
  const handleError = useCallback((error: ChartErrorState) => {
    setErrorState(error);
  }, []);

  // Export chart function
  const handleExportChart = useCallback(() => {
    if (!chartRef) {
      console.warn("Chart reference not available for export");
      return;
    }

    try {
      // Get chart canvas
      const canvas = chartRef.canvas || chartRef;

      if (canvas && typeof canvas.toDataURL === "function") {
        // Create download link
        const link = document.createElement("a");
        link.download = `income-chart-${new Date().getTime()}.png`;
        link.href = canvas.toDataURL("image/png");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        console.error("Unable to export chart: Canvas not available");
      }
    } catch (error) {
      console.error("Error exporting chart:", error);
    }
  }, [chartRef]);

  // Reset zoom function
  const handleResetZoom = useCallback(() => {
    if (!chartRef) {
      console.warn("Chart reference not available for zoom reset");
      return;
    }

    try {
      if (chartRef.resetZoom) {
        chartRef.resetZoom();
      } else if (chartRef.chart && chartRef.chart.resetZoom) {
        chartRef.chart.resetZoom();
      }
    } catch (error) {
      console.error("Error resetting zoom:", error);
    }
  }, [chartRef]);

  // Memoized summary stats for performance
  const summaryStats = useMemo(() => {
    if (!goals.length) return null;

    const totalGoals = goals.length;
    const totalContributions = goals.reduce(
      (sum, goal) => sum + goal.contributions.length,
      0
    );
    const activeGoals = goals.filter((goal) => goal.status === "ACTIVE").length;

    return {
      totalGoals,
      totalContributions,
      activeGoals,
      dataQuality:
        totalContributions > 0
          ? Math.min(100, (totalContributions / totalGoals) * 20)
          : 0,
    };
  }, [goals]);

  // Enhanced chart props
  const enhancedChartProps = {
    goals,
    config: chartConfig,
    onDataUpdate: handleDataUpdate,
    onError: handleError,
    onLoadingChange: handleLoadingChange,
    height,
  };

  return (
    <div className={`advanced-chart-system ${className}`}>
      <div className="advanced-chart-system__container space-y-6">
        {/* Summary Header */}
        {summaryStats && (
          <div className="advanced-chart-system__header bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
            <div className="advanced-chart-system__summary grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
              <div className="advanced-chart-system__summary-item">
                <div className="advanced-chart-system__summary-value text-2xl font-bold text-blue-600">
                  {summaryStats.totalGoals}
                </div>
                <div className="advanced-chart-system__summary-label text-sm text-gray-600">
                  Objetivos
                </div>
              </div>

              <div className="advanced-chart-system__summary-item">
                <div className="advanced-chart-system__summary-value text-2xl font-bold text-green-600">
                  {summaryStats.activeGoals}
                </div>
                <div className="advanced-chart-system__summary-label text-sm text-gray-600">
                  Activos
                </div>
              </div>

              <div className="advanced-chart-system__summary-item">
                <div className="advanced-chart-system__summary-value text-2xl font-bold text-purple-600">
                  {summaryStats.totalContributions}
                </div>
                <div className="advanced-chart-system__summary-label text-sm text-gray-600">
                  Contribuciones
                </div>
              </div>

              <div className="advanced-chart-system__summary-item">
                <div className="advanced-chart-system__summary-value text-2xl font-bold text-orange-600">
                  {summaryStats.dataQuality.toFixed(0)}%
                </div>
                <div className="advanced-chart-system__summary-label text-sm text-gray-600">
                  Calidad de Datos
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Control Panel */}
        {showControls && (
          <ChartControlPanel
            config={chartConfig}
            onConfigChange={handleConfigChange}
            onExportChart={handleExportChart}
            onResetZoom={handleResetZoom}
          />
        )}

        {/* Main Chart */}
        <div className="advanced-chart-system__chart-container">
          <SimpleChart
            {...enhancedChartProps}
            className="advanced-chart-system__chart"
          />
        </div>

        {/* Statistics Panel */}
        {showStats && (
          <ChartStats
            goals={goals}
            chartData={chartData}
            loadingState={loadingState}
            errorState={errorState}
            className="advanced-chart-system__stats"
          />
        )}

        {/* Status Bar */}
        <div className="advanced-chart-system__status-bar bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div className="advanced-chart-system__status-content flex flex-wrap items-center justify-between text-sm text-gray-600">
            <div className="advanced-chart-system__status-left flex items-center space-x-4">
              <span className="advanced-chart-system__status-item">
                <span className="font-medium">Configuración:</span>{" "}
                {chartConfig.period} | {chartConfig.type}
              </span>

              {chartConfig.autoRefresh.enabled && (
                <span className="advanced-chart-system__status-item flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                  Auto-refresh activo
                </span>
              )}

              {loadingState.isRefreshing && (
                <span className="advanced-chart-system__status-item flex items-center">
                  <svg
                    className="animate-spin h-4 w-4 text-blue-600 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Actualizando datos...
                </span>
              )}
            </div>

            <div className="advanced-chart-system__status-right">
              <span className="advanced-chart-system__status-item text-xs">
                Última actualización: {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
