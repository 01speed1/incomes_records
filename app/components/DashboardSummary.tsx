import type { SavingsGoalWithContributions } from "../types/financial";
import { CurrencyFormatter } from "../lib/financial";
import { RetroactiveCalculator } from "../lib/retroactiveCalculator";
import { Decimal } from "decimal.js";
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  TrendingUpIcon,
  CalendarIcon,
} from "./icons";

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

  // Calculate total expected amount (theoretical) for all active goals
  const totalExpectedAmount = activeGoals.reduce((sum, goal) => {
    try {
      const theoreticalAmount =
        RetroactiveCalculator.calculateTheoreticalAmountForGoal(goal);
      return sum.add(theoreticalAmount);
    } catch (error) {
      console.warn(
        `Error calculating theoretical amount for goal ${goal.id}:`,
        error
      );
      return sum;
    }
  }, new Decimal(0));

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
              <ChartBarIcon color="text-blue-600" />
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
              <CurrencyDollarIcon color="text-green-600" />
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
              <TrendingUpIcon color="text-purple-600" />
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
              <CalendarIcon color="text-orange-600" />
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
          <div className="dashboard-summary__insights-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
                Expected Total
              </p>
              <p className="dashboard-summary__insight-value text-sm font-medium text-blue-600">
                {CurrencyFormatter.formatCompact(totalExpectedAmount)}
              </p>
            </div>

            <div className="dashboard-summary__insight">
              <p className="dashboard-summary__insight-label text-xs text-gray-500 uppercase tracking-wide">
                Monthly Commitment
              </p>
              <p className="dashboard-summary__insight-value text-sm font-medium text-orange-600">
                {CurrencyFormatter.formatCompact(monthlyContributionTotal)}/mo
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
