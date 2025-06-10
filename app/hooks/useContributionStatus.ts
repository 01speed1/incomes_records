import { useMemo } from "react";
import type { SavingsGoalWithContributions } from "../types/financial";

interface UseContributionStatusOptions {
  goal: SavingsGoalWithContributions;
  selectedMonth: number;
  selectedYear: number;
}

export function useContributionStatus({
  goal,
  selectedMonth,
  selectedYear,
}: UseContributionStatusOptions) {
  const contributionStatus = useMemo(() => {
    // Find existing contribution for selected month/year
    const existingContribution = goal.contributions.find(
      (contrib) =>
        contrib.month === selectedMonth && contrib.year === selectedYear
    );

    if (existingContribution) {
      return {
        exists: true,
        contribution: existingContribution,
        formMode: "update" as const,
        buttonText: "Update Contribution",
        headerText: "Update Monthly Contribution",
        monthName: new Date(0, selectedMonth - 1).toLocaleDateString("en", {
          month: "long",
        }),
      };
    }

    return {
      exists: false,
      contribution: null,
      formMode: "add" as const,
      buttonText: "Add Contribution",
      headerText: "Add Monthly Contribution",
      monthName: new Date(0, selectedMonth - 1).toLocaleDateString("en", {
        month: "long",
      }),
    };
  }, [goal.contributions, selectedMonth, selectedYear]);

  return contributionStatus;
}
