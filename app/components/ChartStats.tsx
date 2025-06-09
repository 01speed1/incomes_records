import { useMemo } from "react";
import dayjs from "dayjs";
import { Decimal } from "decimal.js";
import type {
  SavingsGoalWithContributions,
  ChartLoadingState,
  ChartErrorState,
  IncomeChartData,
} from "~/types/financial";

interface ChartStatsProps {
  goals: SavingsGoalWithContributions[];
  chartData: IncomeChartData | null;
  loadingState: ChartLoadingState;
  errorState: ChartErrorState;
  className?: string;
}

export function ChartStats({
  goals,
  chartData,
  loadingState,
  errorState,
  className = "",
}: ChartStatsProps) {
  const stats = useMemo(() => {
    if (!goals.length || !chartData) {
      return {
        totalIncome: new Decimal(0),
        avgMonthly: new Decimal(0),
        trend: 0,
        dataPoints: 0,
        lastUpdate: null,
        nextGoalCompletion: null,
        topPerformingGoal: null,
      };
    }

    // Calculate total income from all contributions
    let totalIncome = new Decimal(0);
    let totalContributions = 0;
    let lastContributionDate: Date | null = null;
    let topGoal: {
      goal: SavingsGoalWithContributions;
      amount: Decimal;
    } | null = null;
    let nextCompletion: {
      goal: SavingsGoalWithContributions;
      date: Date;
    } | null = null;

    goals.forEach((goal) => {
      let goalTotal = new Decimal(0);

      goal.contributions.forEach((contribution) => {
        const amount =
          contribution.actualAmount || contribution.projectedAmount;
        totalIncome = totalIncome.plus(amount);
        goalTotal = goalTotal.plus(amount);
        totalContributions++;

        const contributionDate = new Date(contribution.contributionDate);
        if (!lastContributionDate || contributionDate > lastContributionDate) {
          lastContributionDate = contributionDate;
        }
      });

      // Track top performing goal
      if (!topGoal || goalTotal.greaterThan(topGoal.amount)) {
        topGoal = { goal, amount: goalTotal };
      }

      // Calculate completion date estimate
      if (goal.targetDate) {
        const remaining = goal.targetAmount.minus(goal.currentBalance);
        if (
          remaining.greaterThan(0) &&
          goal.expectedMonthlyAmount.greaterThan(0)
        ) {
          const monthsToComplete = remaining
            .dividedBy(goal.expectedMonthlyAmount)
            .ceil();
          const estimatedCompletion = dayjs()
            .add(monthsToComplete.toNumber(), "month")
            .toDate();

          if (!nextCompletion || estimatedCompletion < nextCompletion.date) {
            nextCompletion = { goal, date: estimatedCompletion };
          }
        }
      }
    });

    // Calculate average monthly income
    const avgMonthly =
      totalContributions > 0
        ? totalIncome.dividedBy(totalContributions)
        : new Decimal(0);

    // Calculate trend (simple comparison of last vs first data point)
    let trend = 0;
    if (chartData.datasets[0]?.data.length >= 2) {
      const data = chartData.datasets[0].data;
      const first = data[0];
      const last = data[data.length - 1];
      if (first > 0) {
        trend = ((last - first) / first) * 100;
      }
    }

    return {
      totalIncome,
      avgMonthly,
      trend,
      dataPoints: chartData.labels?.length || 0,
      lastUpdate: lastContributionDate,
      nextGoalCompletion: nextCompletion,
      topPerformingGoal: topGoal,
    };
  }, [goals, chartData]);

  const formatCurrency = (amount: Decimal) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount.toNumber());
  };

  const formatTrend = (trend: number) => {
    const sign = trend >= 0 ? "+" : "";
    return `${sign}${trend.toFixed(1)}%`;
  };

  if (loadingState.isLoading && !chartData) {
    return (
      <div className={`chart-stats ${className}`}>
        <div className="chart-stats__container bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="chart-stats__header mb-4">
            <div className="chart-stats__title-skeleton h-5 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
          <div className="chart-stats__grid grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="chart-stats__stat-skeleton">
                <div className="chart-stats__stat-value-skeleton h-8 bg-gray-200 rounded w-20 animate-pulse mb-2"></div>
                <div className="chart-stats__stat-label-skeleton h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`chart-stats ${className}`}>
      <div className="chart-stats__container bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="chart-stats__header mb-4">
          <h3 className="chart-stats__title text-lg font-semibold text-gray-900">
            Estadísticas del Gráfico
          </h3>
          {loadingState.isRefreshing && (
            <div className="chart-stats__loading-indicator flex items-center mt-2">
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
              <span className="text-sm text-gray-500">Actualizando...</span>
            </div>
          )}
        </div>

        {errorState.hasError ? (
          <div className="chart-stats__error bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="chart-stats__error-content flex items-center">
              <svg
                className="chart-stats__error-icon w-5 h-5 text-red-500 mr-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 19c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <div>
                <p className="chart-stats__error-message text-sm text-red-700 font-medium">
                  Error al cargar las estadísticas
                </p>
                <p className="chart-stats__error-detail text-xs text-red-600 mt-1">
                  {errorState.errorMessage}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Main Stats */}
            <div className="chart-stats__grid grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="chart-stats__stat">
                <div className="chart-stats__stat-value text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.totalIncome)}
                </div>
                <div className="chart-stats__stat-label text-sm text-gray-500">
                  Ingresos Totales
                </div>
              </div>

              <div className="chart-stats__stat">
                <div className="chart-stats__stat-value text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.avgMonthly)}
                </div>
                <div className="chart-stats__stat-label text-sm text-gray-500">
                  Promedio Mensual
                </div>
              </div>

              <div className="chart-stats__stat">
                <div
                  className={`chart-stats__stat-value text-2xl font-bold flex items-center ${
                    stats.trend >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {stats.trend !== 0 && (
                    <svg
                      className={`w-5 h-5 mr-1 ${
                        stats.trend >= 0
                          ? "transform rotate-0"
                          : "transform rotate-180"
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 17l5-5 5 5"
                      />
                    </svg>
                  )}
                  {formatTrend(stats.trend)}
                </div>
                <div className="chart-stats__stat-label text-sm text-gray-500">
                  Tendencia
                </div>
              </div>

              <div className="chart-stats__stat">
                <div className="chart-stats__stat-value text-2xl font-bold text-gray-900">
                  {stats.dataPoints}
                </div>
                <div className="chart-stats__stat-label text-sm text-gray-500">
                  Puntos de Datos
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="chart-stats__additional border-t border-gray-200 pt-4">
              <div className="chart-stats__info-grid grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Last Update */}
                {stats.lastUpdate && (
                  <div className="chart-stats__info-item">
                    <div className="chart-stats__info-label text-sm font-medium text-gray-700 mb-1">
                      Última Actualización
                    </div>
                    <div className="chart-stats__info-value text-sm text-gray-600">
                      {dayjs(stats.lastUpdate).format("DD/MM/YYYY HH:mm")}
                    </div>
                  </div>
                )}

                {/* Top Performing Goal */}
                {stats.topPerformingGoal && (
                  <div className="chart-stats__info-item">
                    <div className="chart-stats__info-label text-sm font-medium text-gray-700 mb-1">
                      Objetivo Destacado
                    </div>
                    <div className="chart-stats__info-value text-sm text-gray-600">
                      {stats.topPerformingGoal.goal.name} -{" "}
                      {formatCurrency(stats.topPerformingGoal.amount)}
                    </div>
                  </div>
                )}

                {/* Next Goal Completion */}
                {stats.nextGoalCompletion && (
                  <div className="chart-stats__info-item">
                    <div className="chart-stats__info-label text-sm font-medium text-gray-700 mb-1">
                      Próximo Objetivo
                    </div>
                    <div className="chart-stats__info-value text-sm text-gray-600">
                      {stats.nextGoalCompletion.goal.name} -{" "}
                      {dayjs(stats.nextGoalCompletion.date).format("MMM YYYY")}
                    </div>
                  </div>
                )}

                {/* Performance Metrics */}
                {loadingState.loadingMessage && (
                  <div className="chart-stats__info-item">
                    <div className="chart-stats__info-label text-sm font-medium text-gray-700 mb-1">
                      Rendimiento
                    </div>
                    <div className="chart-stats__info-value text-sm text-gray-600">
                      {loadingState.loadingMessage}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
