import type { SavingsGoalWithContributions } from "../types/financial";
import { CurrencyFormatter } from "../lib/financial";

interface GoalCardProps {
  goal: SavingsGoalWithContributions;
  onClick?: () => void;
}

export function GoalCard({ goal, onClick }: GoalCardProps) {
  const progressPercentage = goal.targetAmount.greaterThan(0)
    ? goal.currentBalance.div(goal.targetAmount).mul(100).toNumber()
    : 0;

  const categoryColors = {
    DEBT_REPAYMENT: "bg-red-100 text-red-800",
    INVESTMENT: "bg-green-100 text-green-800",
    PERSONAL: "bg-blue-100 text-blue-800",
    EMERGENCY_FUND: "bg-yellow-100 text-yellow-800",
    OTHER: "bg-gray-100 text-gray-800",
  };

  const statusColors = {
    ACTIVE: "bg-green-100 text-green-800",
    COMPLETED: "bg-blue-100 text-blue-800",
    PAUSED: "bg-yellow-100 text-yellow-800",
    CANCELLED: "bg-red-100 text-red-800",
  };

  return (
    <div
      className="goal-card bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="goal-card__header flex justify-between items-start mb-4">
        <div className="goal-card__title-section">
          <h3 className="goal-card__title text-lg font-semibold text-gray-900 mb-1">
            {goal.name}
          </h3>
          {goal.description && (
            <p className="goal-card__description text-sm text-gray-600">
              {goal.description}
            </p>
          )}
        </div>

        <div className="goal-card__badges flex flex-col gap-2">
          <span
            className={`goal-card__category-badge px-2 py-1 rounded-full text-xs font-medium ${
              categoryColors[goal.category]
            }`}
          >
            {goal.category.replace("_", " ")}
          </span>
          <span
            className={`goal-card__status-badge px-2 py-1 rounded-full text-xs font-medium ${
              statusColors[goal.status]
            }`}
          >
            {goal.status}
          </span>
        </div>
      </div>

      <div className="goal-card__progress mb-4">
        <div className="goal-card__progress-header flex justify-between items-center mb-2">
          <span className="goal-card__progress-label text-sm font-medium text-gray-700">
            Progress
          </span>
          <span className="goal-card__progress-percentage text-sm text-gray-600">
            {progressPercentage.toFixed(1)}%
          </span>
        </div>

        <div className="goal-card__progress-bar w-full bg-gray-200 rounded-full h-2">
          <div
            className="goal-card__progress-fill bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
        </div>
      </div>

      <div className="goal-card__amounts grid grid-cols-2 gap-4 mb-4">
        <div className="goal-card__amount-item">
          <p className="goal-card__amount-label text-xs text-gray-500 uppercase tracking-wide">
            Current
          </p>
          <p className="goal-card__amount-value text-lg font-semibold text-gray-900">
            {CurrencyFormatter.formatCompact(goal.currentBalance)}
          </p>
        </div>

        <div className="goal-card__amount-item">
          <p className="goal-card__amount-label text-xs text-gray-500 uppercase tracking-wide">
            Target
          </p>
          <p className="goal-card__amount-value text-lg font-semibold text-gray-900">
            {CurrencyFormatter.formatCompact(goal.targetAmount)}
          </p>
        </div>
      </div>

      <div className="goal-card__footer flex justify-between items-center">
        <div className="goal-card__monthly-contribution">
          <p className="goal-card__monthly-label text-xs text-gray-500">
            Monthly Goal
          </p>
          <p className="goal-card__monthly-value text-sm font-medium text-gray-700">
            {CurrencyFormatter.format(goal.expectedMonthlyAmount)}
          </p>
        </div>

        {goal.targetDate && (
          <div className="goal-card__target-date">
            <p className="goal-card__date-label text-xs text-gray-500">
              Target Date
            </p>
            <p className="goal-card__date-value text-sm font-medium text-gray-700">
              {new Date(goal.targetDate).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
