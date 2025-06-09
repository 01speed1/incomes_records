import { useRef, useEffect, useState } from 'react';
import { Download, ZoomIn, RotateCcw, Settings, TrendingUp } from 'lucide-react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import type { ChartType } from 'chart.js';
import ChartSkeleton from './ChartSkeleton';
import ChartError from './ChartError';
import { useAdvancedChart } from '../hooks/useAdvancedChart';
import type { SavingsGoalWithContributions } from '../types/financial';

interface ResponsiveChartProps {
  goals: SavingsGoalWithContributions[];
  chartType?: ChartType;
  className?: string;
  height?: number;
  autoRefresh?: boolean;
  showControls?: boolean;
  showStats?: boolean;
}

export function ResponsiveChart({
  goals,
  chartType = 'line',
  className = "",
  height = 400,
  autoRefresh = true,
  showControls = true,
  showStats = true
}: ResponsiveChartProps) {
  const chartRef = useRef<any>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    chartData,
    loadingState,
    errorState,
    config,
    updateConfig,
    loadData,
    exportChart,
    resetZoom,
    retry,
    isLoading,
    hasError,
    canRetry,
    isEmpty
  } = useAdvancedChart({
    goals,
    config: {
      chartType,
      autoRefresh: {
        enabled: autoRefresh,
        intervalMs: 30000, // 30 segundos
        maxRetries: 3,
        exponentialBackoff: true
      }
    },
    autoLoad: true
  });

  // Responsive handling
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        setContainerWidth(width);
        setIsMobile(width < 768);
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Chart configuration with responsive options
  const getChartOptions = () => {
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index' as const,
      },
      plugins: {
        legend: {
          display: !isMobile || chartType !== 'doughnut',
          position: isMobile ? 'bottom' as const : 'top' as const,
          labels: {
            padding: isMobile ? 10 : 20,
            font: {
              size: isMobile ? 11 : 12
            }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(17, 24, 39, 0.95)',
          titleColor: 'white',
          bodyColor: 'white',
          cornerRadius: 8,
          padding: 12,
          displayColors: true,
          callbacks: {
            label: (context: any) => {
              const label = context.dataset.label || '';
              const value = new Intl.NumberFormat('es-ES', {
                style: 'currency',
                currency: 'EUR'
              }).format(context.parsed.y || context.parsed);
              return `${label}: ${value}`;
            }
          }
        },
        zoom: {
          pan: {
            enabled: !isMobile,
            mode: 'x' as const,
          },
          zoom: {
            wheel: {
              enabled: !isMobile,
            },
            pinch: {
              enabled: true,
            },
            mode: 'x' as const,
          },
        }
      },
      scales: chartType !== 'doughnut' ? {
        x: {
          display: true,
          grid: {
            display: !isMobile,
            color: 'rgba(156, 163, 175, 0.1)'
          },
          ticks: {
            font: {
              size: isMobile ? 10 : 11
            },
            maxRotation: isMobile ? 45 : 0
          }
        },
        y: {
          display: true,
          grid: {
            color: 'rgba(156, 163, 175, 0.1)'
          },
          ticks: {
            font: {
              size: isMobile ? 10 : 11
            },
            callback: function(value: any) {
              return new Intl.NumberFormat('es-ES', {
                style: 'currency',
                currency: 'EUR',
                notation: isMobile ? 'compact' : 'standard'
              }).format(value);
            }
          }
        }
      } : undefined
    };

    return baseOptions;
  };

  const getChartComponent = () => {
    switch (chartType) {
      case 'bar':
        return Bar;
      case 'doughnut':
        return Doughnut;
      default:
        return Line;
    }
  };

  const ChartComponent = getChartComponent();

  // Handle export
  const handleExport = () => {
    if (chartRef.current) {
      exportChart(chartRef.current);
    }
  };

  // Handle zoom reset
  const handleResetZoom = () => {
    if (chartRef.current) {
      resetZoom(chartRef.current);
    }
  };

  // Calculate stats
  const getChartStats = () => {
    if (!chartData?.datasets?.[0]?.data) return null;

    const data = chartData.datasets[0].data as number[];
    const total = data.reduce((sum, val) => sum + val, 0);
    const average = total / data.length;
    const max = Math.max(...data);
    const min = Math.min(...data);

    return { total, average, max, min, count: data.length };
  };

  const stats = getChartStats();

  return (
    <div 
      ref={containerRef}
      className={`responsive-chart w-full ${className}`}
    >
      {/* Header with controls */}
      {showControls && (
        <div className="responsive-chart__header flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="responsive-chart__title">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
              Análisis de Ingresos
            </h3>
            {autoRefresh && (
              <p className="text-sm text-gray-500 mt-1">
                Actualización automática cada 30s
              </p>
            )}
          </div>
          
          <div className="responsive-chart__controls flex flex-wrap gap-2">
            <button
              onClick={() => loadData(true)}
              disabled={isLoading}
              className="btn btn--secondary"
              title="Actualizar datos"
            >
              <RotateCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              {!isMobile && <span className="ml-1">Actualizar</span>}
            </button>
            
            <button
              onClick={handleResetZoom}
              disabled={!chartData}
              className="btn btn--secondary"
              title="Restablecer zoom"
            >
              <ZoomIn className="w-4 h-4" />
              {!isMobile && <span className="ml-1">Reset Zoom</span>}
            </button>
            
            <button
              onClick={handleExport}
              disabled={!chartData}
              className="btn btn--secondary"
              title="Exportar gráfico"
            >
              <Download className="w-4 h-4" />
              {!isMobile && <span className="ml-1">Exportar</span>}
            </button>
          </div>
        </div>
      )}

      {/* Stats bar */}
      {showStats && stats && !isLoading && !hasError && (
        <div className="responsive-chart__stats grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="stat-card">
            <div className="stat-card__label">Total</div>
            <div className="stat-card__value">
              {new Intl.NumberFormat('es-ES', {
                style: 'currency',
                currency: 'EUR',
                notation: isMobile ? 'compact' : 'standard'
              }).format(stats.total)}
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-card__label">Promedio</div>
            <div className="stat-card__value">
              {new Intl.NumberFormat('es-ES', {
                style: 'currency',
                currency: 'EUR',
                notation: isMobile ? 'compact' : 'standard'
              }).format(stats.average)}
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-card__label">Máximo</div>
            <div className="stat-card__value text-green-600">
              {new Intl.NumberFormat('es-ES', {
                style: 'currency',
                currency: 'EUR',
                notation: isMobile ? 'compact' : 'standard'
              }).format(stats.max)}
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-card__label">Registros</div>
            <div className="stat-card__value text-blue-600">
              {stats.count}
            </div>
          </div>
        </div>
      )}

      {/* Chart content */}
      <div className="responsive-chart__content">
        {/* Loading state */}
        {isLoading && (
          <ChartSkeleton
            showProgress={true}
            progress={loadingState.progress}
            loadingMessage={loadingState.loadingMessage}
            className="min-h-[400px]"
          />
        )}

        {/* Error state */}
        {hasError && !isLoading && (
          <ChartError
            error={errorState}
            onRetry={retry}
            onClear={() => updateConfig({ autoRefresh: { enabled: false } })}
            className="min-h-[400px] flex items-center justify-center"
          />
        )}

        {/* Empty state */}
        {isEmpty && !isLoading && !hasError && (
          <div className="responsive-chart__empty bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center min-h-[400px] flex items-center justify-center">
            <div className="max-w-md">
              <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay datos disponibles
              </h3>
              <p className="text-gray-500 mb-4">
                Comienza agregando metas de ahorro para ver tus gráficos de progreso.
              </p>
              <button
                onClick={() => window.location.href = '/goals/new'}
                className="btn btn--primary"
              >
                Crear primera meta
              </button>
            </div>
          </div>
        )}

        {/* Chart display */}
        {chartData && !isLoading && !hasError && (
          <div 
            className="responsive-chart__canvas bg-white rounded-lg shadow-sm border border-gray-200 p-4"
            style={{ height: `${height}px` }}
          >
            <ChartComponent
              ref={chartRef}
              data={chartData}
              options={getChartOptions()}
            />
          </div>
        )}
      </div>

      {/* Loading indicator */}
      {loadingState.isRefreshing && !isLoading && (
        <div className="responsive-chart__refresh-indicator fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 z-50">
          <RotateCcw className="w-4 h-4 animate-spin" />
          <span className="text-sm">Actualizando...</span>
        </div>
      )}
    </div>
  );
}

export default ResponsiveChart;
