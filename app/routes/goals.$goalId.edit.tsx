import type {
  LoaderFunctionArgs,
  ActionFunctionArgs,
  MetaFunction,
} from "react-router";
import { redirect } from "react-router";
import { useLoaderData, useActionData, Link } from "react-router";
import { SavingsGoalService } from "../services/savingsGoal.server";
import { GoalForm } from "../components/GoalForm";
import { goalUpdateSchema } from "../schemas/validation";
import * as ClientTransforms from "../lib/client-transforms";
import type {
  UpdateSavingsGoalData,
  SavingsGoalWithContributions,
  SerializedSavingsGoalWithContributions,
} from "../types/financial";

type LoaderData = {
  goal: SerializedSavingsGoalWithContributions;
};

type ActionData = {
  success: boolean;
  errors?: Record<string, string>;
};

export const meta: MetaFunction = () => {
  return [
    { title: "Edit Goal - Income Management" },
    { name: "description", content: "Edit your savings goal settings" },
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

  if (intent === "update") {
    try {
      const data = Object.fromEntries(formData);

      // Validate form data
      const { error, value } = goalUpdateSchema.validate(data);
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

      // Update the goal
      const updateData: UpdateSavingsGoalData = {
        name: value.name,
        targetAmount: value.targetAmount,
        expectedMonthlyAmount: value.expectedMonthlyAmount,
        category: value.category,
        status: value.status,
        startDate: value.startDate,
      };

      await SavingsGoalService.updateGoal(goalId, updateData);

      return redirect(`/goals/${goalId}`);
    } catch (error) {
      console.error("Error updating goal:", error);
      return Response.json(
        {
          success: false,
          errors: { general: "Failed to update goal. Please try again." },
        },
        { status: 500 }
      );
    }
  }

  if (intent === "delete") {
    console.log("Delete intent received for goal:", goalId);
    try {
      await SavingsGoalService.deleteGoal(goalId);
      console.log("Goal deleted successfully:", goalId);
      return redirect("/");
    } catch (error) {
      console.error("Error deleting goal:", error);
      return Response.json(
        {
          success: false,
          errors: { general: "Failed to delete goal. Please try again." },
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

export default function EditGoal() {
  const { goal: rawGoal } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();

  // Transform serialized data back to Decimal objects
  const goal = ClientTransforms.transformGoalDataFromJSON(rawGoal);

  return (
    <div className="goal-edit">
      <div className="goal-edit__container max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="goal-edit__header mb-8">
          <Link
            to={`/goals/${goal.id}`}
            className="goal-edit__back-link text-blue-600 hover:text-blue-700 mb-2 inline-flex items-center"
          >
            ← Back to Goal
          </Link>
          <h1 className="goal-edit__title text-3xl font-bold text-gray-900">
            Edit Goal: {goal.name}
          </h1>
          <p className="goal-edit__subtitle text-gray-600 mt-2">
            Update your goal settings and preferences
          </p>
        </header>

        {/* Form */}
        <section className="goal-edit__form">
          <GoalForm
            goal={goal}
            errors={actionData?.errors}
            isSubmitting={false}
            isEdit={true}
          />
        </section>

        {/* Danger Zone */}
        <section className="goal-edit__danger-zone mt-12">
          <div className="goal-edit__danger-card bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="goal-edit__danger-title text-lg font-semibold text-red-900 mb-2">
              Danger Zone
            </h2>
            <p className="goal-edit__danger-description text-red-700 mb-4">
              Deleting this goal will permanently remove all associated data
              including contribution history. This action cannot be undone.
            </p>

            <form method="post" className="goal-edit__delete-form">
              <input type="hidden" name="intent" value="delete" />
              <button
                type="submit"
                className="goal-edit__delete-btn bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                Delete Goal
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
