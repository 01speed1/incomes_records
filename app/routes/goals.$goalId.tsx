import type {
  LoaderFunctionArgs,
  MetaFunction,
  ActionFunctionArgs,
} from "react-router";
import { useLoaderData, useActionData, Link, Form } from "react-router";
import {
  SavingsGoalService,
  ContributionService,
} from "../services/savingsGoal.server";
import { GoalCard } from "../components/GoalCard";
import { contributionSchema } from "../schemas/validation";
import { CurrencyFormatter } from "../lib/financial";
import * as ClientTransforms from "../lib/client-transforms";
import type {
  SavingsGoalWithContributions,
  SerializedSavingsGoalWithContributions,
  CreateContributionData,
} from "../types/financial";
import { Decimal } from "decimal.js";

type LoaderData = {
  goal: SerializedSavingsGoalWithContributions;
};

type ActionData = {
  success: boolean;
  errors?: Record<string, string>;
};

export const meta: MetaFunction = () => {
  return [
    { title: "Goal Details - Income Management" },
    {
      name: "description",
      content: "View and manage your savings goal progress",
    },
  ];
};

export async function loader({ params }: LoaderFunctionArgs) {
  const goalId = params.goalId;
  if (!goalId) {
    throw new Response("Goal not found", { status: 404 });
  }

  try {
    const goal = await SavingsGoalService.getGoalById(goalId);
    if (!goal) {
      throw new Response("Goal not found", { status: 404 });
    }

    return Response.json({ goal });
  } catch (error) {
    console.error("Error loading goal:", error);
    throw new Response("Failed to load goal", { status: 500 });
  }
}

export async function action({ request, params }: ActionFunctionArgs) {
  const goalId = params.goalId;
  if (!goalId) {
    throw new Response("Goal not found", { status: 404 });
  }

  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  console.log("Action debug - intent:", intent);
  console.log("Action debug - formData:", Object.fromEntries(formData));

  if (intent === "add") {
    try {
      const data = Object.fromEntries(formData);

      // Validate form data
      const { error, value } = contributionSchema.validate(data);
      if (error) {
        return Response.json(
          {
            success: false,
            errors: error.details.reduce((acc, detail) => {
              acc[detail.path[0]] = detail.message;
              return acc;
            }, {} as Record<string, string>),
          },
          { status: 400 }
        );
      }

      // Create the contribution
      const contributionData: CreateContributionData = {
        goalId,
        month: value.month,
        year: value.year,
        projectedAmount: value.projectedAmount,
        actualAmount: value.actualAmount || value.projectedAmount,
      };

      await ContributionService.createContribution(contributionData);

      return Response.json({ success: true });
    } catch (error) {
      console.error("Error adding contribution:", error);
      return Response.json(
        {
          success: false,
          errors: { general: "Failed to add contribution. Please try again." },
        },
        { status: 500 }
      );
    }
  }

  return Response.json(
    { success: false, errors: { general: "Invalid action" } },
    { status: 400 }
  );
}

export default function GoalDetail() {
  const { goal: rawGoal } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();

  // Transform serialized data back to Decimal objects
  const goal = ClientTransforms.transformGoalDataFromJSON(rawGoal);

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const progressPercentage = new Decimal(goal.currentBalance)
    .dividedBy(goal.targetAmount)
    .mul(100)
    .toFixed(1);

  return (
    <div className="goal-detail">
      <div className="goal-detail__container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="goal-detail__header mb-8">
          <div className="goal-detail__header-content flex items-center justify-between">
            <div>
              <Link
                to="/"
                className="goal-detail__back-link text-blue-600 hover:text-blue-700 mb-2 inline-flex items-center"
              >
                ← Back to Dashboard
              </Link>
              <h1 className="goal-detail__title text-3xl font-bold text-gray-900">
                {goal.name}
              </h1>
              <p className="goal-detail__subtitle text-gray-600 mt-2">
                Track your progress and add monthly contributions
              </p>
            </div>
            <Link
              to={`/goals/${goal.id}/edit`}
              className="goal-detail__edit-btn bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              Edit Goal
            </Link>
          </div>
        </header>

        {/* Goal Overview */}
        <section className="goal-detail__overview mb-8">
          <div className="goal-detail__overview-card bg-white rounded-lg shadow-md p-6">
            <div className="goal-detail__overview-grid grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Progress */}
              <div className="goal-detail__progress">
                <h3 className="goal-detail__progress-title text-lg font-semibold text-gray-900 mb-4">
                  Progress
                </h3>
                <div className="goal-detail__progress-bar bg-gray-200 rounded-full h-4 mb-2">
                  <div
                    className="goal-detail__progress-fill bg-blue-600 h-4 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, Number(progressPercentage))}%`,
                    }}
                  ></div>
                </div>
                <p className="goal-detail__progress-text text-sm text-gray-600">
                  {progressPercentage}% complete
                </p>
                <p className="goal-detail__progress-amounts text-lg font-medium text-gray-900 mt-2">
                  {CurrencyFormatter.format(goal.currentBalance)} /{" "}
                  {CurrencyFormatter.format(goal.targetAmount)}
                </p>
              </div>

              {/* Monthly Target */}
              <div className="goal-detail__monthly">
                <h3 className="goal-detail__monthly-title text-lg font-semibold text-gray-900 mb-4">
                  Monthly Target
                </h3>
                <p className="goal-detail__monthly-amount text-2xl font-bold text-blue-600">
                  {CurrencyFormatter.format(goal.expectedMonthlyAmount)}
                </p>
                <p className="goal-detail__monthly-description text-sm text-gray-600 mt-2">
                  Expected monthly contribution
                </p>
              </div>

              {/* Status & Category */}
              <div className="goal-detail__info">
                <h3 className="goal-detail__info-title text-lg font-semibold text-gray-900 mb-4">
                  Details
                </h3>
                <div className="goal-detail__info-items space-y-2">
                  <div className="goal-detail__status">
                    <span
                      className={`goal-detail__status-badge inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        goal.status === "ACTIVE"
                          ? "bg-green-100 text-green-800"
                          : goal.status === "COMPLETED"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {goal.status}
                    </span>
                  </div>
                  <div className="goal-detail__category">
                    <span className="goal-detail__category-label text-sm text-gray-600">
                      Category:{" "}
                      <span className="font-medium">{goal.category}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Add Contribution Form */}
        <section className="goal-detail__add-contribution mb-8">
          <div className="goal-detail__add-contribution-card bg-white rounded-lg shadow-md p-6">
            <h2 className="goal-detail__add-contribution-title text-xl font-semibold text-gray-900 mb-4">
              Add Monthly Contribution
            </h2>

            <Form method="post" className="goal-detail__add-contribution-form">
              <input type="hidden" name="intent" value="add" />

              <div className="goal-detail__form-grid grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="goal-detail__form-group">
                  <label
                    htmlFor="month"
                    className="goal-detail__form-label block text-sm font-medium text-gray-700 mb-1"
                  >
                    Month
                  </label>
                  <select
                    id="month"
                    name="month"
                    defaultValue={currentMonth}
                    className="goal-detail__form-select block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {new Date(0, i).toLocaleString("default", {
                          month: "long",
                        })}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="goal-detail__form-group">
                  <label
                    htmlFor="year"
                    className="goal-detail__form-label block text-sm font-medium text-gray-700 mb-1"
                  >
                    Year
                  </label>
                  <select
                    id="year"
                    name="year"
                    defaultValue={currentYear}
                    className="goal-detail__form-select block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    {Array.from({ length: 5 }, (_, i) => (
                      <option key={currentYear + i} value={currentYear + i}>
                        {currentYear + i}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="goal-detail__form-group">
                  <label
                    htmlFor="projectedAmount"
                    className="goal-detail__form-label block text-sm font-medium text-gray-700 mb-1"
                  >
                    Projected Amount
                  </label>
                  <input
                    type="number"
                    id="projectedAmount"
                    name="projectedAmount"
                    step="0.01"
                    min="0"
                    defaultValue={goal.expectedMonthlyAmount.toString()}
                    className="goal-detail__form-input block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div className="goal-detail__form-group">
                  <label
                    htmlFor="actualAmount"
                    className="goal-detail__form-label block text-sm font-medium text-gray-700 mb-1"
                  >
                    Actual Amount
                  </label>
                  <input
                    type="number"
                    id="actualAmount"
                    name="actualAmount"
                    step="0.01"
                    min="0"
                    className="goal-detail__form-input block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Leave empty if same as projected"
                  />
                </div>
              </div>

              {actionData?.errors && (
                <div className="goal-detail__form-errors mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  {Object.values(actionData.errors).map((error, index) => (
                    <p key={index} className="text-sm text-red-600">
                      {error}
                    </p>
                  ))}
                </div>
              )}

              <div className="goal-detail__form-actions mt-4">
                <button
                  type="submit"
                  className="goal-detail__form-submit bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  Add Contribution
                </button>
              </div>
            </Form>
          </div>
        </section>

        {/* Contributions History */}
        <section className="goal-detail__history">
          <div className="goal-detail__history-card bg-white rounded-lg shadow-md p-6">
            <h2 className="goal-detail__history-title text-xl font-semibold text-gray-900 mb-4">
              Contribution History
            </h2>

            {goal.contributions && goal.contributions.length > 0 ? (
              <div className="goal-detail__history-table overflow-x-auto">
                <table className="goal-detail__table w-full">
                  <thead className="goal-detail__table-head bg-gray-50">
                    <tr>
                      <th className="goal-detail__table-header px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Month/Year
                      </th>
                      <th className="goal-detail__table-header px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Projected
                      </th>
                      <th className="goal-detail__table-header px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actual
                      </th>
                      <th className="goal-detail__table-header px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Variance
                      </th>
                      <th className="goal-detail__table-header px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Running Balance
                      </th>
                    </tr>
                  </thead>
                  <tbody className="goal-detail__table-body bg-white divide-y divide-gray-200">
                    {goal.contributions.map((contribution) => (
                      <tr key={contribution.id}>
                        <td className="goal-detail__table-cell px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(0, contribution.month - 1).toLocaleString(
                            "default",
                            { month: "long" }
                          )}{" "}
                          {contribution.year}
                        </td>
                        <td className="goal-detail__table-cell px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {CurrencyFormatter.format(
                            contribution.projectedAmount
                          )}
                        </td>
                        <td className="goal-detail__table-cell px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {contribution.actualAmount
                            ? CurrencyFormatter.format(
                                contribution.actualAmount
                              )
                            : "Not recorded"}
                        </td>
                        <td className="goal-detail__table-cell px-4 py-4 whitespace-nowrap text-sm">
                          {contribution.variance ? (
                            <span
                              className={`${
                                contribution.variance.gte(0)
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {contribution.variance.gte(0) ? "+" : ""}
                              {CurrencyFormatter.format(contribution.variance)}
                            </span>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </td>
                        <td className="goal-detail__table-cell px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {CurrencyFormatter.format(
                            contribution.runningBalance
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="goal-detail__history-empty text-center py-8">
                <p className="goal-detail__history-empty-text text-gray-500">
                  No contributions yet. Add your first contribution above to
                  start tracking progress.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
