import { useState, useEffect, useCallback, useRef } from "react";
import { IncomeChartService } from "~/services/incomeChart";
import type {
  SavingsGoalWithContributions,
  AdvancedChartConfig,
  IncomeChartData,
  ChartLoadingState,
  ChartErrorState,
} from "~/types/financial";

interface UseAdvancedChartOptions {
  goals: SavingsGoalWithContributions[];
  config?: Partial<AdvancedChartConfig>;
  autoLoad?: boolean;
  onDataUpdate?: (data: IncomeChartData) => void;
  onError?: (error: ChartErrorState) => void;
  onLoadingChange?: (loading: ChartLoadingState) => void;
}

interface UseAdvancedChartReturn {
  // Data state
  chartData: IncomeChartData | null;
  loadingState: ChartLoadingState;
  errorState: ChartErrorState;

  // Configuration
  config: AdvancedChartConfig;
  updateConfig: (newConfig: Partial<AdvancedChartConfig>) => void;

  // Actions
  loadData: (isRefresh?: boolean) => Promise<void>;
  exportChart: (chartRef: any) => void;
  resetZoom: (chartRef: any) => void;
  retry: () => void;

  // Utilities
  isLoading: boolean;
  hasError: boolean;
  canRetry: boolean;
  isEmpty: boolean;
}

export function useAdvancedChart({
  goals,
  config: initialConfig = {},
  autoLoad = true,
  onDataUpdate,
  onError,
  onLoadingChange,
}: UseAdvancedChartOptions): UseAdvancedChartReturn {
  // Configuration state
  const [config, setConfig] = useState<AdvancedChartConfig>(() => {
    return {
      ...IncomeChartService.getDefaultAdvancedConfig(),
      ...initialConfig,
    };
  });

  // Data state
  const [chartData, setChartData] = useState<IncomeChartData | null>(null);
  const [loadingState, setLoadingState] = useState<ChartLoadingState>({
    isLoading: autoLoad,
    isRefreshing: false,
    loadingMessage: "Inicializando...",
    progress: 0,
  });
  const [errorState, setErrorState] = useState<ChartErrorState>({
    hasError: false,
    canRetry: true,
    retryCount: 0,
  });

  // Refs for cleanup
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Update configuration
  const updateConfig = useCallback(
    (newConfig: Partial<AdvancedChartConfig>) => {
      setConfig((prev) => ({ ...prev, ...newConfig }));
    },
    []
  );

  // Load chart data
  const loadData = useCallback(
    async (isRefresh = false) => {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      if (!goals.length) {
        // Show skeleton data when no goals
        const skeletonData = IncomeChartService.generateSkeletonData();
        setChartData(skeletonData);
        setLoadingState({
          isLoading: false,
          isRefreshing: false,
          loadingMessage: "Sin datos disponibles",
          progress: 100,
        });
        onLoadingChange?.({
          isLoading: false,
          isRefreshing: false,
          progress: 100,
        });
        return;
      }

      try {
        const newLoadingState = {
          isLoading: !isRefresh,
          isRefreshing: isRefresh,
          loadingMessage: isRefresh
            ? "Actualizando datos..."
            : "Cargando datos...",
          progress: isRefresh ? 75 : 25,
        };

        setLoadingState(newLoadingState);
        onLoadingChange?.(newLoadingState);

        // Reset error state
        setErrorState((prev) => ({ ...prev, hasError: false }));

        // Simulate progressive loading
        if (!isRefresh) {
          await new Promise((resolve) => setTimeout(resolve, 300));
          setLoadingState((prev) => ({ ...prev, progress: 50 }));
        }

        const result = await IncomeChartService.loadChartData(goals, config);

        if (abortControllerRef.current?.signal.aborted) {
          return; // Request was cancelled
        }

        setChartData(result.data);

        const finalLoadingState = {
          isLoading: false,
          isRefreshing: false,
          loadingMessage: `Datos cargados (${result.loadTime}ms)`,
          progress: 100,
        };

        setLoadingState(finalLoadingState);
        onLoadingChange?.(finalLoadingState);
        onDataUpdate?.(result.data);

        // Reset error count on success
        setErrorState((prev) => ({ ...prev, retryCount: 0 }));
      } catch (error) {
        if (abortControllerRef.current?.signal.aborted) {
          return; // Request was cancelled
        }

        console.error("Error loading chart data:", error);

        const newErrorState = {
          hasError: true,
          errorMessage:
            error instanceof Error ? error.message : "Error desconocido",
          errorCode: "DATA_LOAD_ERROR",
          canRetry: true,
          retryCount: errorState.retryCount + 1,
          lastAttempt: new Date(),
        };

        setErrorState(newErrorState);

        const errorLoadingState = {
          isLoading: false,
          isRefreshing: false,
          loadingMessage: "Error al cargar datos",
          progress: 0,
        };

        setLoadingState(errorLoadingState);
        onLoadingChange?.(errorLoadingState);
        onError?.(newErrorState);

        // Auto-retry with exponential backoff
        if (
          config.autoRefresh.exponentialBackoff &&
          newErrorState.retryCount < config.autoRefresh.maxRetries
        ) {
          const delay = Math.pow(2, newErrorState.retryCount) * 1000;
          retryTimeoutRef.current = setTimeout(() => {
            loadData(isRefresh);
          }, delay);
        }
      }
    },
    [
      goals,
      config,
      errorState.retryCount,
      onDataUpdate,
      onLoadingChange,
      onError,
    ]
  );

  // Auto-refresh effect
  useEffect(() => {
    if (!config.autoRefresh.enabled) {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
      return;
    }

    const interval = setInterval(() => {
      loadData(true);
    }, config.autoRefresh.intervalMs);

    refreshIntervalRef.current = interval;

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [config.autoRefresh, loadData]);

  // Auto-load effect
  useEffect(() => {
    if (autoLoad) {
      loadData(false);
    }
  }, [autoLoad, goals, loadData]);

  // Export chart function
  const exportChart = useCallback((chartRef: any) => {
    if (!chartRef) {
      console.warn("Chart reference not available for export");
      return;
    }

    try {
      const canvas = chartRef.canvas || chartRef;

      if (canvas && typeof canvas.toDataURL === "function") {
        const link = document.createElement("a");
        link.download = `income-chart-${new Date().getTime()}.png`;
        link.href = canvas.toDataURL("image/png", 0.9);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        console.error("Unable to export chart: Canvas not available");
      }
    } catch (error) {
      console.error("Error exporting chart:", error);
    }
  }, []);

  // Reset zoom function
  const resetZoom = useCallback((chartRef: any) => {
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
  }, []);

  // Retry function
  const retry = useCallback(() => {
    setErrorState((prev) => ({ ...prev, hasError: false }));
    loadData(false);
  }, [loadData]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Computed values
  const isLoading = loadingState.isLoading || loadingState.isRefreshing;
  const hasError = errorState.hasError;
  const canRetry = errorState.canRetry && !isLoading;
  const isEmpty = !goals.length;

  return {
    // Data state
    chartData,
    loadingState,
    errorState,

    // Configuration
    config,
    updateConfig,

    // Actions
    loadData,
    exportChart,
    resetZoom,
    retry,

    // Utilities
    isLoading,
    hasError,
    canRetry,
    isEmpty,
  };
}
