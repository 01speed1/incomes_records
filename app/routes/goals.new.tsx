import type { ActionFunctionArgs, MetaFunction } from "react-router";
import { redirect } from "react-router";
import { useActionData } from "react-router";
import { SavingsGoalService } from "../services/savingsGoal.server";
import { GoalForm } from "../components/GoalForm";
import { goalCreateSchema } from "../schemas/validation";
import type { CreateSavingsGoalData } from "../types/financial";

type ActionData = {
  success: boolean;
  errors?: Record<string, string>;
};

export const meta: MetaFunction = () => {
  return [
    { title: "Create New Goal - Income Management" },
    {
      name: "description",
      content: "Create a new savings goal to track your financial progress",
    },
  ];
};

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  try {
    // Validate form data
    const { error, value } = goalCreateSchema.validate(data);
    if (error) {
      return Response.json(
        {
          success: false,
          errors: error.details.reduce((acc, detail) => {
            const key = detail.path.join(".");
            acc[key] = detail.message;
            return acc;
          }, {} as Record<string, string>),
        },
        { status: 400 }
      );
    }

    // Create the goal
    const goalData: CreateSavingsGoalData = {
      name: value.name,
      goalType: value.goalType,
      targetAmount: value.targetAmount,
      expectedMonthlyAmount: value.expectedMonthlyAmount,
      category: value.category,
      startDate: value.startDate,
    };

    const goal = await SavingsGoalService.createGoal(goalData);

    return redirect(`/goals/${goal.id}`);
  } catch (error) {
    console.error("Error creating goal:", error);
    return Response.json(
      {
        success: false,
        errors: { general: "Failed to create goal. Please try again." },
      },
      { status: 500 }
    );
  }
}

export default function NewGoal() {
  const actionData = useActionData<ActionData>();

  return (
    <div className="goal-creation">
      <div className="goal-creation__container max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="goal-creation__header mb-8">
          <h1 className="goal-creation__title text-3xl font-bold text-gray-900">
            Create New Savings Goal
          </h1>
          <p className="goal-creation__subtitle text-gray-600 mt-2">
            Set up a new financial target and start tracking your progress
          </p>
        </header>

        {/* Form */}
        <section className="goal-creation__form">
          <GoalForm errors={actionData?.errors} isSubmitting={false} />
        </section>
      </div>
    </div>
  );
}
