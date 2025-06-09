import { Form, Link } from "react-router";
import { useState } from "react";
import dayjs from "dayjs";
import type {
  SavingsGoalWithContributions,
  GoalType,
} from "../types/financial";

interface GoalFormProps {
  goal?: SavingsGoalWithContributions;
  errors?: Record<string, string>;
  isSubmitting?: boolean;
  isEdit?: boolean;
}

export function GoalForm({
  goal,
  errors,
  isSubmitting = false,
  isEdit = false,
}: GoalFormProps) {
  const [formData, setFormData] = useState({
    name: goal?.name || "",
    goalType: goal?.goalType || ("TARGET_BASED" as GoalType),
    targetAmount: goal?.targetAmount?.toString() || "",
    expectedMonthlyAmount: goal?.expectedMonthlyAmount?.toString() || "",
    category: goal?.category || "PERSONAL",
    status: goal?.status || "ACTIVE",
    startDate: goal?.startDate 
      ? dayjs(goal.startDate).format('YYYY-MM-DD') 
      : dayjs().format('YYYY-MM-DD'),
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="goal-form bg-white rounded-lg shadow-md p-6">
      <div className="goal-form__header mb-6">
        <h2 className="goal-form__title text-xl font-semibold text-gray-900">
          {isEdit ? "Edit Savings Goal" : "Create New Savings Goal"}
        </h2>
        <p className="goal-form__subtitle text-sm text-gray-600 mt-1">
          {isEdit
            ? "Update your savings goal details"
            : "Set up a new financial objective with monthly targets"}
        </p>
      </div>

      <Form method="post" className="goal-form__form">
        <input
          type="hidden"
          name="intent"
          value={isEdit ? "update" : "create"}
        />

        <div className="goal-form__section mb-6">
          <div className="goal-form__field mb-4">
            <label
              htmlFor="name"
              className="goal-form__label block text-sm font-medium text-gray-700 mb-2"
            >
              Goal Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={`goal-form__input w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors?.name ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="e.g., Emergency Fund, Dad's Debt"
              required
            />
            {errors?.name && (
              <p className="goal-form__error text-sm text-red-600 mt-1">
                {errors.name}
              </p>
            )}
          </div>

          <div className="goal-form__field mb-4">
            <label
              htmlFor="goalType"
              className="goal-form__label block text-sm font-medium text-gray-700 mb-2"
            >
              Goal Type *
            </label>
            <select
              id="goalType"
              name="goalType"
              value={formData.goalType}
              onChange={(e) => handleInputChange("goalType", e.target.value)}
              className={`goal-form__select w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors?.goalType ? "border-red-300" : "border-gray-300"
              }`}
              required
            >
              <option value="TARGET_BASED">
                Target-Based (Save specific amount)
              </option>
              <option value="CONTINUOUS">Continuous (Ongoing savings)</option>
            </select>
            {errors?.goalType && (
              <p className="goal-form__error text-sm text-red-600 mt-1">
                {errors.goalType}
              </p>
            )}
            <p className="goal-form__field-help text-xs text-gray-500 mt-1">
              {formData.goalType === "TARGET_BASED"
                ? "Set a specific savings target with deadline"
                : "Ongoing savings without a specific target amount"}
            </p>
          </div>

          <div className="goal-form__field mb-4">
            <label
              htmlFor="category"
              className="goal-form__label block text-sm font-medium text-gray-700 mb-2"
            >
              Category *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={(e) => handleInputChange("category", e.target.value)}
              className={`goal-form__select w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors?.category ? "border-red-300" : "border-gray-300"
              }`}
              required
            >
              <option value="PERSONAL">Personal Savings</option>
              <option value="DEBT_REPAYMENT">Debt Repayment</option>
              <option value="INVESTMENT">Investment</option>
              <option value="EMERGENCY_FUND">Emergency Fund</option>
              <option value="OTHER">Other</option>
            </select>
            {errors?.category && (
              <p className="goal-form__error text-sm text-red-600 mt-1">
                {errors.category}
              </p>
            )}
          </div>

          {isEdit && (
            <div className="goal-form__field mb-4">
              <label
                htmlFor="status"
                className="goal-form__label block text-sm font-medium text-gray-700 mb-2"
              >
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={(e) => handleInputChange("status", e.target.value)}
                className="goal-form__select w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
                <option value="PAUSED">Paused</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          )}
        </div>

        <div className="goal-form__section mb-6">
          <h3 className="goal-form__section-title text-lg font-medium text-gray-900 mb-4">
            Timeline Configuration
          </h3>
          
          <div className="goal-form__field mb-4">
            <label
              htmlFor="startDate"
              className="goal-form__label block text-sm font-medium text-gray-700 mb-2"
            >
              Goal Start Date *
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={(e) => handleInputChange("startDate", e.target.value)}
              max={dayjs().format('YYYY-MM-DD')}
              className={`goal-form__input w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors?.startDate ? "border-red-300" : "border-gray-300"
              }`}
              required
            />
            {errors?.startDate && (
              <p className="goal-form__error text-sm text-red-600 mt-1">
                {errors.startDate}
              </p>
            )}
            <p className="goal-form__field-help text-xs text-gray-500 mt-1">
              Set when you actually started working towards this goal (can be in the past)
            </p>
          </div>
        </div>

        <div className="goal-form__section mb-6">
          <h3 className="goal-form__section-title text-lg font-medium text-gray-900 mb-4">
            Financial Details
          </h3>

          <div className="goal-form__field-group grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {formData.goalType === "TARGET_BASED" && (
              <div className="goal-form__field">
                <label
                  htmlFor="targetAmount"
                  className="goal-form__label block text-sm font-medium text-gray-700 mb-2"
                >
                  Target Amount *
                </label>
                <div className="goal-form__input-group relative">
                  <span className="goal-form__currency-symbol absolute left-3 top-2 text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    id="targetAmount"
                    name="targetAmount"
                    value={formData.targetAmount}
                    onChange={(e) =>
                      handleInputChange("targetAmount", e.target.value)
                    }
                    className={`goal-form__input w-full pl-8 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors?.targetAmount
                        ? "border-red-300"
                        : "border-gray-300"
                    }`}
                    placeholder="10000.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                {errors?.targetAmount && (
                  <p className="goal-form__error text-sm text-red-600 mt-1">
                    {errors.targetAmount}
                  </p>
                )}
              </div>
            )}

            <div
              className={`goal-form__field ${
                formData.goalType === "CONTINUOUS" ? "md:col-span-2" : ""
              }`}
            >
              <label
                htmlFor="expectedMonthlyAmount"
                className="goal-form__label block text-sm font-medium text-gray-700 mb-2"
              >
                Monthly Contribution *
              </label>
              <div className="goal-form__input-group relative">
                <span className="goal-form__currency-symbol absolute left-3 top-2 text-gray-500">
                  $
                </span>
                <input
                  type="number"
                  id="expectedMonthlyAmount"
                  name="expectedMonthlyAmount"
                  value={formData.expectedMonthlyAmount}
                  onChange={(e) =>
                    handleInputChange("expectedMonthlyAmount", e.target.value)
                  }
                  className={`goal-form__input w-full pl-8 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors?.expectedMonthlyAmount
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                  placeholder="500.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              {errors?.expectedMonthlyAmount && (
                <p className="goal-form__error text-sm text-red-600 mt-1">
                  {errors.expectedMonthlyAmount}
                </p>
              )}
            </div>
          </div>
        </div>

        {errors?.general && (
          <div className="goal-form__general-error mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{errors.general}</p>
          </div>
        )}

        <div className="goal-form__actions flex justify-end gap-3">
          <Link
            to={isEdit ? `/goals/${goal?.id}` : "/"}
            className="goal-form__cancel-button px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="goal-form__submit-button px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting
              ? "Saving..."
              : isEdit
              ? "Update Goal"
              : "Create Goal"}
          </button>
        </div>
      </Form>
    </div>
  );
}
