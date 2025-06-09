import type { SavingsGoalWithContributions } from "../types/financial";
import { CurrencyFormatter } from "../lib/financial";
import { Decimal } from "decimal.js";

interface DashboardSummaryProps {
  goals: SavingsGoalWithContributions[];
}

export function DashboardSummary({ goals }: DashboardSummaryProps) {
  const activeGoals = goals.filter((goal) => goal.status === "ACTIVE");

  const completedGoals = goals.filter((goal) => goal.status === "COMPLETED");

  const totalTargetAmount = goals.reduce(
    (sum, goal) => sum.add(goal.targetAmount),
    new Decimal(0)
  );

  const totalCurrentBalance = goals.reduce(
    (sum, goal) => sum.add(goal.currentBalance),
    new Decimal(0)
  );

  const overallProgress = totalTargetAmount.greaterThan(0)
    ? totalCurrentBalance.div(totalTargetAmount).mul(100).toNumber()
    : 0;

  const monthlyContributionTotal = activeGoals.reduce(
    (sum, goal) => sum.add(goal.expectedMonthlyAmount),
    new Decimal(0)
  );

  return (
    <div className="dashboard-summary">
      <div className="dashboard-summary__header mb-6">
        <h1 className="dashboard-summary__title text-2xl font-bold text-gray-900">
          Savings Goals Dashboard
        </h1>
        <p className="dashboard-summary__subtitle text-gray-600 mt-1">
          Track your progress toward financial objectives
        </p>
      </div>

      <div className="dashboard-summary__stats grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="dashboard-summary__stat-card bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="dashboard-summary__stat-header flex items-center justify-between">
            <h3 className="dashboard-summary__stat-title text-sm font-medium text-gray-500 uppercase tracking-wide">
              Total Goals
            </h3>
            <div className="dashboard-summary__stat-icon">
              <svg
                className="w-6 h-6 text-blue-600"
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
            </div>
          </div>
          <div className="dashboard-summary__stat-content mt-2">
            <p className="dashboard-summary__stat-value text-2xl font-semibold text-gray-900">
              {goals.length}
            </p>
            <p className="dashboard-summary__stat-detail text-sm text-gray-600">
              {activeGoals.length} active, {completedGoals.length} completed
            </p>
          </div>
        </div>

        <div className="dashboard-summary__stat-card bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="dashboard-summary__stat-header flex items-center justify-between">
            <h3 className="dashboard-summary__stat-title text-sm font-medium text-gray-500 uppercase tracking-wide">
              Total Saved
            </h3>
            <div className="dashboard-summary__stat-icon">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
            </div>
          </div>
          <div className="dashboard-summary__stat-content mt-2">
            <p className="dashboard-summary__stat-value text-2xl font-semibold text-gray-900">
              {CurrencyFormatter.formatCompact(totalCurrentBalance)}
            </p>
            <p className="dashboard-summary__stat-detail text-sm text-gray-600">
              Current balance across all goals
            </p>
          </div>
        </div>

        <div className="dashboard-summary__stat-card bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="dashboard-summary__stat-header flex items-center justify-between">
            <h3 className="dashboard-summary__stat-title text-sm font-medium text-gray-500 uppercase tracking-wide">
              Total Target
            </h3>
            <div className="dashboard-summary__stat-icon">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
          </div>
          <div className="dashboard-summary__stat-content mt-2">
            <p className="dashboard-summary__stat-value text-2xl font-semibold text-gray-900">
              {CurrencyFormatter.formatCompact(totalTargetAmount)}
            </p>
            <p className="dashboard-summary__stat-detail text-sm text-gray-600">
              Combined target amount
            </p>
          </div>
        </div>

        <div className="dashboard-summary__stat-card bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="dashboard-summary__stat-header flex items-center justify-between">
            <h3 className="dashboard-summary__stat-title text-sm font-medium text-gray-500 uppercase tracking-wide">
              Monthly Goal
            </h3>
            <div className="dashboard-summary__stat-icon">
              <svg
                className="w-6 h-6 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
          <div className="dashboard-summary__stat-content mt-2">
            <p className="dashboard-summary__stat-value text-2xl font-semibold text-gray-900">
              {CurrencyFormatter.formatCompact(monthlyContributionTotal)}
            </p>
            <p className="dashboard-summary__stat-detail text-sm text-gray-600">
              Expected monthly contributions
            </p>
          </div>
        </div>
      </div>

      <div className="dashboard-summary__progress-section bg-white rounded-lg shadow p-6 border border-gray-200">
        <div className="dashboard-summary__progress-header mb-4">
          <h3 className="dashboard-summary__progress-title text-lg font-medium text-gray-900">
            Overall Progress
          </h3>
          <div className="dashboard-summary__progress-meta flex justify-between items-center mt-2">
            <span className="dashboard-summary__progress-label text-sm text-gray-600">
              {CurrencyFormatter.format(totalCurrentBalance)} of{" "}
              {CurrencyFormatter.format(totalTargetAmount)}
            </span>
            <span className="dashboard-summary__progress-percentage text-sm font-medium text-gray-900">
              {overallProgress.toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="dashboard-summary__progress-bar w-full bg-gray-200 rounded-full h-3">
          <div
            className="dashboard-summary__progress-fill bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(overallProgress, 100)}%` }}
          />
        </div>

        <div className="dashboard-summary__progress-insights mt-4">
          <div className="dashboard-summary__insights-grid grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="dashboard-summary__insight">
              <p className="dashboard-summary__insight-label text-xs text-gray-500 uppercase tracking-wide">
                Remaining Amount
              </p>
              <p className="dashboard-summary__insight-value text-sm font-medium text-gray-900">
                {CurrencyFormatter.formatCompact(
                  totalTargetAmount.sub(totalCurrentBalance)
                )}
              </p>
            </div>

            <div className="dashboard-summary__insight">
              <p className="dashboard-summary__insight-label text-xs text-gray-500 uppercase tracking-wide">
                Active Goals Progress
              </p>
              <p className="dashboard-summary__insight-value text-sm font-medium text-gray-900">
                {
                  activeGoals.filter((goal) =>
                    goal.currentBalance.greaterThan(0)
                  ).length
                }{" "}
                / {activeGoals.length} started
              </p>
            </div>

            <div className="dashboard-summary__insight">
              <p className="dashboard-summary__insight-label text-xs text-gray-500 uppercase tracking-wide">
                Completion Rate
              </p>
              <p className="dashboard-summary__insight-value text-sm font-medium text-gray-900">
                {goals.length > 0
                  ? ((completedGoals.length / goals.length) * 100).toFixed(1)
                  : 0}
                %
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
