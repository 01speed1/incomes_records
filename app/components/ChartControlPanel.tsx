import { useState, useCallback } from "react";
import type {
  ChartPeriod,
  ChartType,
  AdvancedChartConfig,
} from "~/types/financial";

interface ChartControlPanelProps {
  config: AdvancedChartConfig;
  onConfigChange: (config: Partial<AdvancedChartConfig>) => void;
  onExportChart: () => void;
  onResetZoom: () => void;
  className?: string;
}

export function ChartControlPanel({
  config,
  onConfigChange,
  onExportChart,
  onResetZoom,
  className = "",
}: ChartControlPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handlePeriodChange = useCallback(
    (period: ChartPeriod) => {
      onConfigChange({ period });
    },
    [onConfigChange]
  );

  const handleTypeChange = useCallback(
    (type: ChartType) => {
      onConfigChange({ type });
    },
    [onConfigChange]
  );

  const handleAutoRefreshToggle = useCallback(() => {
    onConfigChange({
      autoRefresh: {
        ...config.autoRefresh,
        enabled: !config.autoRefresh.enabled,
      },
    });
  }, [config.autoRefresh, onConfigChange]);

  const handlePerformanceToggle = useCallback(
    (key: keyof typeof config.performance) => {
      onConfigChange({
        performance: {
          ...config.performance,
          [key]: !config.performance[key],
        },
      });
    },
    [config.performance, onConfigChange]
  );

  return (
    <div className={`chart-control-panel ${className}`}>
      <div className="chart-control-panel__container bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        {/* Main Controls */}
        <div className="chart-control-panel__main flex flex-wrap items-center gap-4 mb-4">
          {/* Period Selector */}
          <div className="chart-control-panel__period">
            <label className="chart-control-panel__label text-sm font-medium text-gray-700 mb-1 block">
              Período
            </label>
            <select
              value={config.period}
              onChange={(e) =>
                handlePeriodChange(e.target.value as ChartPeriod)
              }
              className="chart-control-panel__select form-select text-sm border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="WEEKLY">Semanal</option>
              <option value="MONTHLY">Mensual</option>
              <option value="QUARTERLY">Trimestral</option>
              <option value="YEARLY">Anual</option>
            </select>
          </div>

          {/* Chart Type Selector */}
          <div className="chart-control-panel__type">
            <label className="chart-control-panel__label text-sm font-medium text-gray-700 mb-1 block">
              Tipo de Gráfico
            </label>
            <select
              value={config.type}
              onChange={(e) => handleTypeChange(e.target.value as ChartType)}
              className="chart-control-panel__select form-select text-sm border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="BAR">Barras</option>
              <option value="LINE">Líneas</option>
              <option value="AREA">Área</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="chart-control-panel__actions flex items-end gap-2">
            <button
              onClick={onResetZoom}
              className="chart-control-panel__reset-zoom bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              title="Resetear Zoom"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>

            <button
              onClick={onExportChart}
              className="chart-control-panel__export bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              title="Exportar Gráfico"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </button>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="chart-control-panel__toggle bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              title="Configuración Avanzada"
            >
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${
                  isExpanded ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Advanced Controls */}
        {isExpanded && (
          <div className="chart-control-panel__advanced border-t border-gray-200 pt-4">
            <h4 className="chart-control-panel__advanced-title text-sm font-semibold text-gray-900 mb-3">
              Configuración Avanzada
            </h4>

            <div className="chart-control-panel__advanced-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Auto Refresh */}
              <div className="chart-control-panel__setting">
                <label className="chart-control-panel__checkbox-label flex items-center">
                  <input
                    type="checkbox"
                    checked={config.autoRefresh.enabled}
                    onChange={handleAutoRefreshToggle}
                    className="chart-control-panel__checkbox rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="chart-control-panel__checkbox-text ml-2 text-sm text-gray-700">
                    Auto-actualización
                  </span>
                </label>
                {config.autoRefresh.enabled && (
                  <p className="chart-control-panel__setting-description text-xs text-gray-500 mt-1">
                    Cada {config.autoRefresh.intervalMs / 1000}s
                  </p>
                )}
              </div>

              {/* Memoization */}
              <div className="chart-control-panel__setting">
                <label className="chart-control-panel__checkbox-label flex items-center">
                  <input
                    type="checkbox"
                    checked={config.performance.enableMemoization}
                    onChange={() =>
                      handlePerformanceToggle("enableMemoization")
                    }
                    className="chart-control-panel__checkbox rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="chart-control-panel__checkbox-text ml-2 text-sm text-gray-700">
                    Caché de datos
                  </span>
                </label>
                <p className="chart-control-panel__setting-description text-xs text-gray-500 mt-1">
                  Mejora el rendimiento
                </p>
              </div>

              {/* Lazy Load */}
              <div className="chart-control-panel__setting">
                <label className="chart-control-panel__checkbox-label flex items-center">
                  <input
                    type="checkbox"
                    checked={config.performance.lazyLoad}
                    onChange={() => handlePerformanceToggle("lazyLoad")}
                    className="chart-control-panel__checkbox rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="chart-control-panel__checkbox-text ml-2 text-sm text-gray-700">
                    Carga diferida
                  </span>
                </label>
                <p className="chart-control-panel__setting-description text-xs text-gray-500 mt-1">
                  Carga solo cuando es visible
                </p>
              </div>

              {/* Responsive */}
              <div className="chart-control-panel__setting">
                <label className="chart-control-panel__checkbox-label flex items-center">
                  <input
                    type="checkbox"
                    checked={config.responsive.adaptiveHeight}
                    onChange={() =>
                      onConfigChange({
                        responsive: {
                          ...config.responsive,
                          adaptiveHeight: !config.responsive.adaptiveHeight,
                        },
                      })
                    }
                    className="chart-control-panel__checkbox rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="chart-control-panel__checkbox-text ml-2 text-sm text-gray-700">
                    Altura adaptativa
                  </span>
                </label>
                <p className="chart-control-panel__setting-description text-xs text-gray-500 mt-1">
                  Se ajusta al contenido
                </p>
              </div>

              {/* Show Comparison */}
              <div className="chart-control-panel__setting">
                <label className="chart-control-panel__checkbox-label flex items-center">
                  <input
                    type="checkbox"
                    checked={config.showComparison}
                    onChange={() =>
                      onConfigChange({
                        showComparison: !config.showComparison,
                      })
                    }
                    className="chart-control-panel__checkbox rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="chart-control-panel__checkbox-text ml-2 text-sm text-gray-700">
                    Mostrar comparación
                  </span>
                </label>
                <p className="chart-control-panel__setting-description text-xs text-gray-500 mt-1">
                  Compara períodos
                </p>
              </div>
            </div>

            {/* Refresh Interval Slider */}
            {config.autoRefresh.enabled && (
              <div className="chart-control-panel__slider-setting mt-4">
                <label className="chart-control-panel__slider-label text-sm font-medium text-gray-700 mb-2 block">
                  Intervalo de actualización:{" "}
                  {config.autoRefresh.intervalMs / 1000}s
                </label>
                <input
                  type="range"
                  min="5000"
                  max="300000"
                  step="5000"
                  value={config.autoRefresh.intervalMs}
                  onChange={(e) =>
                    onConfigChange({
                      autoRefresh: {
                        ...config.autoRefresh,
                        intervalMs: parseInt(e.target.value),
                      },
                    })
                  }
                  className="chart-control-panel__slider w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="chart-control-panel__slider-labels flex justify-between text-xs text-gray-500 mt-1">
                  <span>5s</span>
                  <span>5min</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Status Info */}
        <div className="chart-control-panel__status mt-4 pt-3 border-t border-gray-100">
          <div className="chart-control-panel__status-grid flex flex-wrap items-center gap-4 text-xs text-gray-500">
            <div className="chart-control-panel__status-item">
              <span className="chart-control-panel__status-label font-medium">
                Período:
              </span>
              <span className="chart-control-panel__status-value ml-1">
                {config.period === "WEEKLY" && "Semanal"}
                {config.period === "MONTHLY" && "Mensual"}
                {config.period === "QUARTERLY" && "Trimestral"}
                {config.period === "YEARLY" && "Anual"}
              </span>
            </div>
            <div className="chart-control-panel__status-item">
              <span className="chart-control-panel__status-label font-medium">
                Tipo:
              </span>
              <span className="chart-control-panel__status-value ml-1">
                {config.type === "BAR" && "Barras"}
                {config.type === "LINE" && "Líneas"}
                {config.type === "AREA" && "Área"}
              </span>
            </div>
            {config.autoRefresh.enabled && (
              <div className="chart-control-panel__status-item flex items-center">
                <div className="chart-control-panel__status-indicator w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                <span className="chart-control-panel__status-label font-medium">
                  Auto-actualización activa
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
