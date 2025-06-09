import type { MetaFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData, Link, useNavigate } from "react-router";
import { SavingsGoalService } from "../services/savingsGoal.server";
import { DashboardSummary } from "../components/DashboardSummary";
import { GoalCard } from "../components/GoalCard";
import * as ClientTransforms from "../lib/client-transforms";
import type {
  SavingsGoalWithContributions,
  SerializedSavingsGoalWithContributions,
} from "../types/financial";

type LoaderData = {
  goals: SerializedSavingsGoalWithContributions[];
};

export const meta: MetaFunction = () => {
  return [
    { title: "Income Management - Dashboard" },
    {
      name: "description",
      content: "Track and manage your savings goals and income projections",
    },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const goals = await SavingsGoalService.getAllGoals();
    return Response.json({
      goals,
    });
  } catch (error) {
    console.error("Error loading goals:", error);
    return Response.json({
      goals: [],
    });
  }
}

export default function Index() {
  const { goals: rawGoals } = useLoaderData<LoaderData>();
  const navigate = useNavigate();

  // Transform serialized data back to Decimal objects
  const goals = ClientTransforms.transformGoalsDataFromJSON(rawGoals);

  const handleGoalClick = (goalId: string) => {
    navigate(`/goals/${goalId}`);
  };

  return (
    <div className="income-management">
      <div className="income-management__container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="income-management__header mb-8">
          <div className="income-management__header-content flex items-center justify-between">
            <div>
              <h1 className="income-management__title text-3xl font-bold text-gray-900">
                Income Management Dashboard
              </h1>
              <p className="income-management__subtitle text-gray-600 mt-2">
                Track your savings goals and monitor your financial progress
              </p>
            </div>
            <div className="income-management__header-actions flex items-center space-x-4">
              <Link
                to="/goals/new"
                className="income-management__create-btn bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
              >
                + New Goal
              </Link>
            </div>
          </div>
        </header>

        {/* Dashboard Summary */}
        <section className="income-management__summary mb-8">
          <DashboardSummary goals={goals} />
        </section>

        {/* Goals Grid */}
        <section className="income-management__goals">
          <div className="income-management__goals-header mb-6">
            <h2 className="income-management__goals-title text-2xl font-semibold text-gray-900">
              Your Savings Goals
            </h2>
          </div>

          {goals.length === 0 ? (
            <div className="income-management__empty-state text-center py-12">
              <div className="income-management__empty-icon mx-auto h-12 w-12 text-gray-400 mb-4">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <h3 className="income-management__empty-title text-lg font-medium text-gray-900 mb-2">
                No savings goals yet
              </h3>
              <p className="income-management__empty-description text-gray-500 mb-6">
                Start building your financial future by creating your first
                savings goal.
              </p>
              <Link
                to="/goals/new"
                className="income-management__empty-action inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors duration-200"
              >
                Create your first goal
              </Link>
            </div>
          ) : (
            <div className="income-management__goals-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {goals.map((goal: SavingsGoalWithContributions) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onClick={() => handleGoalClick(goal.id)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
