import { useEffect, useState, useRef, useMemo } from "react";
import { useAdvancedChart } from "~/hooks/useAdvancedChart";
import type {
  SavingsGoalWithContributions,
  AdvancedChartConfig,
  EnhancedChartProps,
} from "~/types/financial";

// Dynamic import for Chart.js to avoid SSR issues
let Chart: any = null;
let ChartComponent: any = null;

interface SimpleChartProps extends EnhancedChartProps {
  className?: string;
  height?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
  showStats?: boolean;
}

export function SimpleChart({
  goals = [],
  config,
  onDataUpdate,
  onError,
  onLoadingChange,
  className = "",
  height = 400,
  autoRefresh = false,
  refreshInterval = 30000, // 30 seconds
  showStats = true,
}: SimpleChartProps) {
  const [isClient, setIsClient] = useState(false);
  const [chartReady, setChartReady] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const chartRef = useRef<HTMLCanvasElement>(null);
  const autoRefreshRef = useRef<NodeJS.Timeout | null>(null);

  // Use the advanced chart hook
  const {
    chartData,
    loadingState,
    errorState,
    config: chartConfig,
    updateConfig,
    loadData,
    exportChart,
    resetZoom,
    retry,
    isLoading,
    hasError,
    canRetry,
  } = useAdvancedChart({
    goals,
    config,
    autoLoad: false, // We'll control loading manually after Chart.js is ready
    onDataUpdate,
    onError,
    onLoadingChange,
  });

  // Initialize Chart.js on client-side only
  useEffect(() => {
    const initializeChart = async () => {
      try {
        // Dynamic imports to avoid SSR issues
        const [chartModule, { Chart: ChartClass, registerables }, chartJsZoom] =
          await Promise.all([
            import("react-chartjs-2"),
            import("chart.js"),
            import("chartjs-plugin-zoom"),
          ]);

        // Register Chart.js components
        ChartClass.register(...registerables, chartJsZoom.default);
        Chart = ChartClass;

        // Select chart type based on config
        switch (chartConfig.type) {
          case "LINE":
            ChartComponent = chartModule.Line;
            break;
          case "AREA":
            ChartComponent = chartModule.Line; // Area is Line with fill
            break;
          case "BAR":
          default:
            ChartComponent = chartModule.Bar;
            break;
        }

        setChartReady(true);
        setIsClient(true);
      } catch (error) {
        console.error("Error initializing Chart.js:", error);
        onError?.({
          hasError: true,
          errorMessage: "Error al inicializar el gráfico",
          errorCode: "CHART_INIT_ERROR",
          canRetry: true,
          retryCount: 0,
          lastAttempt: new Date(),
        });
      }
    };

    initializeChart();
  }, [chartConfig.type, onError]);

  // Detect online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Detect mobile/responsive
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefresh && isOnline && chartReady && !isLoading) {
      autoRefreshRef.current = setInterval(() => {
        loadData(true); // Force refresh
      }, refreshInterval);

      return () => {
        if (autoRefreshRef.current) {
          clearInterval(autoRefreshRef.current);
        }
      };
    }
  }, [autoRefresh, isOnline, chartReady, isLoading, refreshInterval, loadData]);

  // Load data when chart is ready
  useEffect(() => {
    if (chartReady && isClient) {
      loadData(false);
    }
  }, [chartReady, isClient, loadData]);

  // Chart.js options with responsive design
  const chartOptions = useMemo(() => {
    if (!chartReady) return {};

    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: isMobile ? "bottom" : ("top" as const),
          display: true,
          labels: {
            font: {
              size: isMobile ? 10 : 12,
            },
            padding: isMobile ? 10 : 20,
          },
        },
        title: {
          display: true,
          text: "Evolución de Ingresos",
          font: {
            size: isMobile ? 14 : 16,
            weight: "bold",
          },
        },
        tooltip: {
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          titleColor: "white",
          bodyColor: "white",
          borderColor: "rgba(255, 255, 255, 0.1)",
          borderWidth: 1,
          cornerRadius: 8,
          bodyFont: {
            size: isMobile ? 11 : 12,
          },
          titleFont: {
            size: isMobile ? 12 : 13,
          },
          callbacks: {
            label: function (context: any) {
              const value = context.parsed.y;
              return `${context.dataset.label}: ${new Intl.NumberFormat(
                "es-ES",
                {
                  style: "currency",
                  currency: "EUR",
                  minimumFractionDigits: 0,
                  maximumFractionDigits: isMobile ? 0 : 2,
                }
              ).format(value)}`;
            },
          },
        },
        zoom: {
          zoom: {
            wheel: {
              enabled: !isMobile,
              modifierKey: "ctrl",
            },
            pinch: {
              enabled: isMobile,
            },
            mode: "x" as const,
          },
          pan: {
            enabled: true,
            mode: "x" as const,
            modifierKey: isMobile ? undefined : "shift",
          },
        },
      },
      scales: {
        x: {
          display: true,
          title: {
            display: !isMobile,
            text: "Período",
            font: {
              size: isMobile ? 10 : 12,
              weight: "bold",
            },
          },
          grid: {
            display: true,
            color: "rgba(0, 0, 0, 0.1)",
          },
          ticks: {
            font: {
              size: isMobile ? 9 : 11,
            },
            maxTicksLimit: isMobile ? 4 : 8,
          },
        },
        y: {
          display: true,
          beginAtZero: true,
          title: {
            display: !isMobile,
            text: "Cantidad (€)",
            font: {
              size: isMobile ? 10 : 12,
              weight: "bold",
            },
          },
          grid: {
            display: true,
            color: "rgba(0, 0, 0, 0.1)",
          },
          ticks: {
            font: {
              size: isMobile ? 9 : 11,
            },
            maxTicksLimit: isMobile ? 5 : 8,
            callback: function (value: any) {
              return new Intl.NumberFormat("es-ES", {
                style: "currency",
                currency: "EUR",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
                notation: isMobile ? "compact" : "standard",
              }).format(value);
            },
          },
        },
      },
      interaction: {
        intersect: false,
        mode: "index" as const,
      },
      animation: {
        duration: loadingState.isRefreshing ? 500 : 1000,
        easing: "easeInOutQuart",
      },
      elements: {
        line: {
          tension: 0.3,
        },
        point: {
          radius: isMobile ? 2 : 4,
          hoverRadius: isMobile ? 4 : 6,
        },
      },
    };
  }, [chartReady, loadingState.isRefreshing, isMobile]);

  // Prepare chart data with proper formatting
  const formattedChartData = useMemo(() => {
    if (!chartData) return null;

    // For AREA charts, add fill property
    const datasets = chartData.datasets.map((dataset) => ({
      ...dataset,
      fill: chartConfig.type === "AREA" ? "origin" : false,
      backgroundColor:
        chartConfig.type === "AREA"
          ? "rgba(59, 130, 246, 0.2)"
          : dataset.backgroundColor,
    }));

    return {
      ...chartData,
      datasets,
    };
  }, [chartData, chartConfig.type]);

  // Calculate stats for display
  const chartStats = useMemo(() => {
    if (!chartData || !showStats) return null;

    const allValues = chartData.datasets.flatMap(
      (dataset) => dataset.data as number[]
    );
    if (allValues.length === 0) return null;

    const total = allValues.reduce((sum, val) => sum + val, 0);
    const average = total / allValues.length;
    const max = Math.max(...allValues);
    const min = Math.min(...allValues);
    const lastValue = allValues[allValues.length - 1] || 0;
    const firstValue = allValues[0] || 0;
    const change = lastValue - firstValue;
    const changePercent = firstValue !== 0 ? (change / firstValue) * 100 : 0;

    return {
      total,
      average,
      max,
      min,
      lastValue,
      change,
      changePercent,
      dataPoints: allValues.length,
    };
  }, [chartData, showStats]);

  // Loading skeleton
  if (!isClient || !chartReady) {
    return (
      <div className={`simple-chart ${className}`}>
        <div className="simple-chart__container bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="simple-chart__header mb-4">
            <div className="simple-chart__title-skeleton h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
          </div>
          <div
            className="simple-chart__skeleton bg-gray-100 rounded animate-pulse flex items-center justify-center"
            style={{ height: `${height}px` }}
          >
            <div className="simple-chart__skeleton-icon text-gray-400">
              <svg
                className="w-16 h-16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
          </div>
          <div className="simple-chart__progress mt-4">
            <div className="simple-chart__progress-bar bg-gray-200 rounded-full h-2">
              <div
                className="simple-chart__progress-fill bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${loadingState.progress}%` }}
              ></div>
            </div>
            <p className="simple-chart__progress-text text-sm text-gray-500 mt-2 text-center">
              {loadingState.loadingMessage}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (hasError) {
    return (
      <div className={`simple-chart ${className}`}>
        <div className="simple-chart__container bg-white rounded-lg shadow-sm border border-red-200 p-6">
          <div className="simple-chart__error text-center">
            <div className="simple-chart__error-icon text-red-500 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 19c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="simple-chart__error-title text-lg font-medium text-gray-900 mb-2">
              Error al cargar el gráfico
            </h3>
            <p className="simple-chart__error-message text-gray-500 mb-4">
              {errorState.errorMessage}
            </p>
            {canRetry && (
              <button
                onClick={retry}
                className="simple-chart__retry-btn bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200"
              >
                Reintentar ({errorState.retryCount}/3)
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Chart component
  return (
    <div className={`simple-chart ${className}`}>
      <div className="simple-chart__container bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="simple-chart__header flex items-center justify-between mb-4">
          <div>
            <h3 className="simple-chart__title text-lg font-semibold text-gray-900">
              Evolución de Ingresos
            </h3>
            <p className="simple-chart__subtitle text-sm text-gray-500">
              {goals.length} objetivo{goals.length !== 1 ? "s" : ""} de ahorro
              {!isOnline && (
                <span className="simple-chart__offline-indicator ml-2 text-orange-500">
                  (Sin conexión)
                </span>
              )}
            </p>
          </div>
          <div className="simple-chart__controls flex items-center space-x-2">
            {loadingState.isRefreshing && (
              <div className="simple-chart__refresh-indicator">
                <svg
                  className="animate-spin h-4 w-4 text-blue-600"
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
              </div>
            )}
            {autoRefresh && isOnline && (
              <div
                className="simple-chart__auto-refresh-indicator text-green-500"
                title="Auto-actualización activada"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            )}
            <button
              onClick={() => loadData(true)}
              className="simple-chart__refresh-btn text-gray-400 hover:text-gray-600 transition-colors duration-200"
              title="Actualizar datos"
              disabled={isLoading || !isOnline}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        {chartStats && !isMobile && (
          <div className="simple-chart__stats grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="simple-chart__stat text-center">
              <div className="simple-chart__stat-value text-lg font-semibold text-gray-900">
                {new Intl.NumberFormat("es-ES", {
                  style: "currency",
                  currency: "EUR",
                  minimumFractionDigits: 0,
                }).format(chartStats.total)}
              </div>
              <div className="simple-chart__stat-label text-xs text-gray-500">
                Total
              </div>
            </div>
            <div className="simple-chart__stat text-center">
              <div className="simple-chart__stat-value text-lg font-semibold text-gray-900">
                {new Intl.NumberFormat("es-ES", {
                  style: "currency",
                  currency: "EUR",
                  minimumFractionDigits: 0,
                }).format(chartStats.average)}
              </div>
              <div className="simple-chart__stat-label text-xs text-gray-500">
                Promedio
              </div>
            </div>
            <div className="simple-chart__stat text-center">
              <div className="simple-chart__stat-value text-lg font-semibold text-gray-900">
                {new Intl.NumberFormat("es-ES", {
                  style: "currency",
                  currency: "EUR",
                  minimumFractionDigits: 0,
                }).format(chartStats.max)}
              </div>
              <div className="simple-chart__stat-label text-xs text-gray-500">
                Máximo
              </div>
            </div>
            <div className="simple-chart__stat text-center">
              <div
                className={`simple-chart__stat-value text-lg font-semibold ${
                  chartStats.changePercent >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {chartStats.changePercent >= 0 ? "+" : ""}
                {chartStats.changePercent.toFixed(1)}%
              </div>
              <div className="simple-chart__stat-label text-xs text-gray-500">
                Cambio
              </div>
            </div>
          </div>
        )}

        <div
          className="simple-chart__canvas-container"
          style={{ height: `${height}px` }}
        >
          {formattedChartData && ChartComponent && (
            <ChartComponent
              ref={chartRef}
              data={formattedChartData}
              options={chartOptions}
            />
          )}
        </div>

        {goals.length === 0 && (
          <div className="simple-chart__empty-state text-center mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-500 text-sm">
              No hay datos disponibles. Crea tu primer objetivo de ahorro para
              ver el gráfico.
            </p>
          </div>
        )}

        {/* Mobile Stats */}
        {chartStats && isMobile && (
          <div className="simple-chart__mobile-stats mt-4 grid grid-cols-2 gap-2">
            <div className="simple-chart__mobile-stat bg-gray-50 p-2 rounded text-center">
              <div className="text-sm font-semibold">
                {new Intl.NumberFormat("es-ES", {
                  style: "currency",
                  currency: "EUR",
                  notation: "compact",
                }).format(chartStats.total)}
              </div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
            <div className="simple-chart__mobile-stat bg-gray-50 p-2 rounded text-center">
              <div
                className={`text-sm font-semibold ${
                  chartStats.changePercent >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {chartStats.changePercent >= 0 ? "+" : ""}
                {chartStats.changePercent.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500">Cambio</div>
            </div>
          </div>
        )}

        {/* Help text for interaction */}
        {goals.length > 0 && !isLoading && (
          <div className="simple-chart__help-text mt-3 text-xs text-gray-400 text-center">
            💡{" "}
            {isMobile
              ? "Pellizca para zoom, arrastra para desplazarse"
              : "Usa Ctrl + rueda del ratón para zoom, Shift + arrastrar para desplazarse"}
          </div>
        )}
      </div>
    </div>
  );
}
