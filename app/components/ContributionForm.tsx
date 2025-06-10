import { Form } from "react-router";
import { useState, useEffect } from "react";
import type { SavingsGoalWithContributions } from "../types/financial";
import { useContributionStatus } from "../hooks/useContributionStatus";
import { ExclamationTriangleIcon } from "./icons";

interface ContributionFormProps {
  goal: SavingsGoalWithContributions;
  actionData?: {
    errors?: Record<string, string>;
    success?: boolean;
    message?: string;
  };
  className?: string;
}

export function ContributionForm({
  goal,
  actionData,
  className = "",
}: ContributionFormProps) {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(
    currentDate.getMonth() + 1
  );
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [projectedAmount, setProjectedAmount] = useState("");
  const [actualAmount, setActualAmount] = useState("");

  const contributionStatus = useContributionStatus({
    goal,
    selectedMonth,
    selectedYear,
  });

  // Update form values when contribution status changes
  useEffect(() => {
    if (contributionStatus.exists && contributionStatus.contribution) {
      setProjectedAmount(
        contributionStatus.contribution.projectedAmount.toString()
      );
      setActualAmount(
        contributionStatus.contribution.actualAmount?.toString() || ""
      );
    } else {
      setProjectedAmount(goal.expectedMonthlyAmount.toString());
      setActualAmount("");
    }
  }, [
    contributionStatus.exists,
    contributionStatus.contribution,
    goal.expectedMonthlyAmount,
  ]);

  // Reset form after successful submission
  useEffect(() => {
    if (actionData?.success) {
      setShowUpdateDialog(false);
    }
  }, [actionData?.success]);

  const handleMonthYearChange = () => {
    // Reset dialog when month/year changes
    setShowUpdateDialog(false);
  };

  const handleSubmit = (event: React.FormEvent) => {
    if (
      contributionStatus.exists &&
      contributionStatus.formMode === "update" &&
      !showUpdateDialog
    ) {
      event.preventDefault();
      setShowUpdateDialog(true);
    }
  };

  const handleConfirmUpdate = (event: React.MouseEvent<HTMLButtonElement>) => {
    setShowUpdateDialog(false);
    // Find the form and submit it with update intent
    const form = document.querySelector(
      ".contribution-form__form"
    ) as HTMLFormElement;
    if (form) {
      const intentInput = form.querySelector(
        'input[name="intent"]'
      ) as HTMLInputElement;
      if (intentInput) {
        intentInput.value = "update";
      }
      form.submit();
    }
  };

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Date(0, i).toLocaleString("default", { month: "long" }),
  }));

  const years = Array.from({ length: 10 }, (_, i) => {
    const startYear = currentDate.getFullYear() - 9; // 9 años atrás + año actual = 10 total
    return startYear + i;
  });

  return (
    <div className={`contribution-form ${className}`}>
      <div className="contribution-form__card bg-white rounded-lg shadow-md p-6">
        <div className="contribution-form__header mb-6">
          <h2 className="contribution-form__title text-xl font-semibold text-gray-900">
            {contributionStatus.headerText}
          </h2>

          {contributionStatus.exists && (
            <div className="contribution-form__status-indicator mt-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <div className="contribution-form__status-content flex items-center">
                <ExclamationTriangleIcon
                  className="contribution-form__status-icon mr-2"
                  color="text-amber-600"
                  size="sm"
                />
                <div>
                  <p className="contribution-form__status-text text-sm text-amber-800 font-medium">
                    Contribution exists for {contributionStatus.monthName}{" "}
                    {selectedYear}
                  </p>
                  <p className="contribution-form__status-subtext text-xs text-amber-700 mt-1">
                    You can update the existing contribution below
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <Form
          method="post"
          className="contribution-form__form"
          onSubmit={handleSubmit}
        >
          <input
            type="hidden"
            name="intent"
            value={contributionStatus.formMode === "update" ? "update" : "add"}
          />

          <div className="contribution-form__grid grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* Month Selection */}
            <div className="contribution-form__field">
              <label
                htmlFor="month"
                className="contribution-form__label block text-sm font-medium text-gray-700 mb-1"
              >
                Month
              </label>
              <select
                id="month"
                name="month"
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(Number(e.target.value));
                  handleMonthYearChange();
                }}
                className="contribution-form__select block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Selection */}
            <div className="contribution-form__field">
              <label
                htmlFor="year"
                className="contribution-form__label block text-sm font-medium text-gray-700 mb-1"
              >
                Year
              </label>
              <select
                id="year"
                name="year"
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(Number(e.target.value));
                  handleMonthYearChange();
                }}
                className="contribution-form__select block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Projected Amount */}
            <div className="contribution-form__field">
              <label
                htmlFor="projectedAmount"
                className="contribution-form__label block text-sm font-medium text-gray-700 mb-1"
              >
                Projected Amount
              </label>
              <div className="contribution-form__input-wrapper relative">
                <span className="contribution-form__currency absolute left-3 top-2 text-gray-500">
                  $
                </span>
                <input
                  type="number"
                  id="projectedAmount"
                  name="projectedAmount"
                  step="0.01"
                  min="0"
                  value={projectedAmount}
                  onChange={(e) => setProjectedAmount(e.target.value)}
                  className="contribution-form__input block w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            {/* Actual Amount */}
            <div className="contribution-form__field">
              <label
                htmlFor="actualAmount"
                className="contribution-form__label block text-sm font-medium text-gray-700 mb-1"
              >
                Actual Amount
              </label>
              <div className="contribution-form__input-wrapper relative">
                <span className="contribution-form__currency absolute left-3 top-2 text-gray-500">
                  $
                </span>
                <input
                  type="number"
                  id="actualAmount"
                  name="actualAmount"
                  step="0.01"
                  min="0"
                  value={actualAmount}
                  onChange={(e) => setActualAmount(e.target.value)}
                  className="contribution-form__input block w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={
                    contributionStatus.exists
                      ? "Update actual amount"
                      : "Leave empty if same as projected"
                  }
                />
              </div>
            </div>
          </div>

          {/* Error Messages */}
          {actionData?.errors && (
            <div className="contribution-form__errors mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              {Object.values(actionData.errors).map((error, index) => (
                <p
                  key={index}
                  className="contribution-form__error text-sm text-red-600"
                >
                  {error}
                </p>
              ))}
            </div>
          )}

          {/* Success Message */}
          {actionData?.success && actionData.message && (
            <div className="contribution-form__success mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="contribution-form__success-text text-sm text-green-600">
                {actionData.message}
              </p>
            </div>
          )}

          {/* Form Actions */}
          <div className="contribution-form__actions flex items-center justify-between">
            <button
              type="submit"
              className={`contribution-form__submit font-medium px-6 py-2 rounded-lg transition-colors duration-200 ${
                contributionStatus.exists
                  ? "bg-amber-600 hover:bg-amber-700 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {contributionStatus.buttonText}
            </button>

            {contributionStatus.exists && (
              <p className="contribution-form__update-hint text-sm text-gray-600">
                Updating contribution for {contributionStatus.monthName}{" "}
                {selectedYear}
              </p>
            )}
          </div>
        </Form>
      </div>

      {/* Update Confirmation Dialog */}
      {showUpdateDialog && (
        <div className="contribution-form__dialog-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="contribution-form__dialog bg-white rounded-lg shadow-xl p-6 max-w-md mx-4">
            <div className="contribution-form__dialog-header mb-4">
              <h3 className="contribution-form__dialog-title text-lg font-semibold text-gray-900">
                Update Existing Contribution
              </h3>
            </div>

            <div className="contribution-form__dialog-content mb-6">
              <p className="contribution-form__dialog-text text-gray-600">
                A contribution for{" "}
                <strong>
                  {contributionStatus.monthName} {selectedYear}
                </strong>{" "}
                already exists. Do you want to update it with the new values?
              </p>

              {contributionStatus.contribution && (
                <div className="contribution-form__existing-values mt-3 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-700">
                    <strong>Current values:</strong>
                  </p>
                  <ul className="text-sm text-gray-600 mt-1">
                    <li>
                      Projected: $
                      {contributionStatus.contribution.projectedAmount.toString()}
                    </li>
                    {contributionStatus.contribution.actualAmount && (
                      <li>
                        Actual: $
                        {contributionStatus.contribution.actualAmount.toString()}
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>

            <div className="contribution-form__dialog-actions flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowUpdateDialog(false)}
                className="contribution-form__dialog-cancel px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmUpdate}
                className="contribution-form__dialog-confirm bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                Update Contribution
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
