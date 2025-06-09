import { Decimal } from 'decimal.js';

// Types for data with Decimal objects (used in client after transformation)
export interface SavingsGoalData {
  id: string;
  name: string;
  description?: string;
  goalType: GoalType;
  targetAmount: Decimal;
  targetDate?: Date;
  expectedMonthlyAmount: Decimal;
  currentBalance: Decimal;
  status: GoalStatus;
  category: GoalCategory;
  startDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface MonthlyContributionData {
  id: string;
  savingsGoalId: string;
  year: number;
  month: number;
  projectedAmount: Decimal;
  actualAmount?: Decimal;
  variance?: Decimal;
  runningBalance: Decimal;
  contributionDate: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SavingsGoalWithContributions extends SavingsGoalData {
  contributions: MonthlyContributionData[];
}

export interface FinancialSummary {
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  totalTargetAmount: Decimal;
  totalCurrentBalance: Decimal;
  overallProgress: number;
}

export interface GoalPerformanceMetrics {
  goalId: string;
  averageMonthlyContribution: Decimal;
  consistencyScore: number;
  projectedCompletionDate: Date;
  monthsToTarget: number;
  isOnTrack: boolean;
}

export type GoalStatus = 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'CANCELLED';
export type GoalCategory = 'DEBT_REPAYMENT' | 'INVESTMENT' | 'PERSONAL' | 'EMERGENCY_FUND' | 'OTHER';
export type GoalType = 'TARGET_BASED' | 'CONTINUOUS';

// Data types for creating and updating goals
export interface CreateSavingsGoalData {
  name: string;
  goalType: GoalType;
  targetAmount: string;
  expectedMonthlyAmount: string;
  category: GoalCategory;
  startDate?: string;
}

export interface UpdateSavingsGoalData {
  name?: string;
  goalType?: GoalType;
  targetAmount?: string;
  expectedMonthlyAmount?: string;
  category?: GoalCategory;
  status?: GoalStatus;
  startDate?: string;
}

// Data types for contributions
export interface CreateContributionData {
  goalId: string;
  month: number;
  year: number;
  projectedAmount: string;
  actualAmount?: string;
}

export interface UpdateContributionData {
  actualAmount?: string;
  notes?: string;
}

// Types for serialized data (JSON transfer from server to client)
export interface SerializedSavingsGoalData {
  id: string;
  name: string;
  description?: string;
  goalType: GoalType;
  targetAmount: string;
  targetDate?: Date;
  expectedMonthlyAmount: string;
  currentBalance: string;
  status: GoalStatus;
  category: GoalCategory;
  startDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SerializedMonthlyContributionData {
  id: string;
  savingsGoalId: string;
  year: number;
  month: number;
  projectedAmount: string;
  actualAmount?: string;
  variance?: string;
  runningBalance: string;
  contributionDate: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SerializedSavingsGoalWithContributions extends SerializedSavingsGoalData {
  contributions: SerializedMonthlyContributionData[];
}
