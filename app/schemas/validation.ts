import Joi from "joi";

const decimalStringSchema = Joi.string()
  .pattern(/^\d+(\.\d{1,2})?$/)
  .message("Must be a valid decimal number with up to 2 decimal places");

const positiveDecimalStringSchema = Joi.string()
  .pattern(/^(0\.[0-9]*[1-9][0-9]*|[1-9][0-9]*(\.[0-9]+)?)$/)
  .message("Must be a positive decimal number");

export const savingsGoalSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).required().messages({
    "string.empty": "Goal name is required",
    "string.min": "Goal name must be at least 1 character",
    "string.max": "Goal name cannot exceed 100 characters",
  }),

  description: Joi.string().trim().max(500).optional().allow("").messages({
    "string.max": "Description cannot exceed 500 characters",
  }),

  goalType: Joi.string()
    .valid("TARGET_BASED", "CONTINUOUS")
    .default("TARGET_BASED")
    .messages({
      "any.only": "Goal type must be either TARGET_BASED or CONTINUOUS",
    }),

  targetAmount: positiveDecimalStringSchema
    .when("goalType", {
      is: "TARGET_BASED",
      then: Joi.required(),
      otherwise: Joi.optional(),
    })
    .messages({
      "any.required": "Target amount is required for target-based goals",
    }),

  targetDate: Joi.date()
    .min("now")
    .when("goalType", {
      is: "TARGET_BASED",
      then: Joi.optional(),
      otherwise: Joi.forbidden(),
    })
    .messages({
      "date.min": "Target date cannot be in the past",
      "any.unknown": "Target date is not applicable for continuous goals",
    }),

  expectedMonthlyAmount: positiveDecimalStringSchema.required().messages({
    "any.required": "Expected monthly contribution is required",
  }),

  category: Joi.string()
    .valid(
      "DEBT_REPAYMENT",
      "INVESTMENT",
      "PERSONAL",
      "EMERGENCY_FUND",
      "OTHER"
    )
    .default("PERSONAL")
    .messages({
      "any.only":
        "Category must be one of: DEBT_REPAYMENT, INVESTMENT, PERSONAL, EMERGENCY_FUND, OTHER",
    }),

  startDate: Joi.date().max("now").optional().messages({
    "date.max": "Start date cannot be in the future",
  }),
});

export const monthlyContributionSchema = Joi.object({
  savingsGoalId: Joi.string().required().messages({
    "any.required": "Savings goal ID is required",
  }),

  year: Joi.number().integer().min(2000).max(2100).required().messages({
    "number.integer": "Year must be an integer",
    "number.min": "Year must be 2000 or later",
    "number.max": "Year must be 2100 or earlier",
    "any.required": "Year is required",
  }),

  month: Joi.number().integer().min(1).max(12).required().messages({
    "number.integer": "Month must be an integer",
    "number.min": "Month must be between 1 and 12",
    "number.max": "Month must be between 1 and 12",
    "any.required": "Month is required",
  }),

  projectedAmount: positiveDecimalStringSchema.required().messages({
    "any.required": "Projected amount is required",
  }),

  actualAmount: decimalStringSchema.optional().allow("").messages({
    "string.pattern.base": "Actual amount must be a valid decimal number",
  }),

  notes: Joi.string().trim().max(1000).optional().allow("").messages({
    "string.max": "Notes cannot exceed 1000 characters",
  }),
});

export const goalUpdateSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).optional(),

  notes: Joi.string().trim().max(1000).optional().allow(""),

  description: Joi.string().trim().max(500).optional().allow(""),

  targetAmount: positiveDecimalStringSchema.optional(),

  targetDate: Joi.date().min("now").optional().allow(null),

  expectedMonthlyAmount: positiveDecimalStringSchema.optional(),

  status: Joi.string()
    .valid("ACTIVE", "COMPLETED", "PAUSED", "CANCELLED")
    .optional(),

  category: Joi.string()
    .valid(
      "DEBT_REPAYMENT",
      "INVESTMENT",
      "PERSONAL",
      "EMERGENCY_FUND",
      "OTHER"
    )
    .optional(),

  startDate: Joi.date().max("now").optional().messages({
    "date.max": "Start date cannot be in the future",
  }),
  goalType: Joi.string()
    .valid("TARGET_BASED", "CONTINUOUS")
    .default("TARGET_BASED")
    .messages({
      "any.only": "Goal type must be either TARGET_BASED or CONTINUOUS",
    }),
});

export const contributionUpdateSchema = Joi.object({
  actualAmount: decimalStringSchema.required().messages({
    "any.required": "Actual amount is required",
  }),

  notes: Joi.string().trim().max(1000).optional().allow(""),
});

export const dateRangeSchema = Joi.object({
  startYear: Joi.number().integer().min(2000).max(2100).required(),

  startMonth: Joi.number().integer().min(1).max(12).required(),

  endYear: Joi.number().integer().min(2000).max(2100).required(),

  endMonth: Joi.number().integer().min(1).max(12).required(),
})
  .custom((value, helpers) => {
    const startDate = new Date(value.startYear, value.startMonth - 1);
    const endDate = new Date(value.endYear, value.endMonth - 1);

    if (startDate >= endDate) {
      return helpers.error("date.order");
    }

    return value;
  }, "Date range validation")
  .messages({
    "date.order": "End date must be after start date",
  });

// Schema for creating new goals
export const goalCreateSchema = Joi.object({
  intent: Joi.string().valid("create", "update").optional(),

  name: Joi.string().trim().min(1).max(100).required().messages({
    "string.empty": "Goal name is required",
    "string.min": "Goal name must be at least 1 character",
    "string.max": "Goal name cannot exceed 100 characters",
  }),

  goalType: Joi.string()
    .valid("TARGET_BASED", "CONTINUOUS")
    .default("TARGET_BASED")
    .messages({
      "any.only": "Goal type must be either TARGET_BASED or CONTINUOUS",
    }),

  targetAmount: positiveDecimalStringSchema
    .when("goalType", {
      is: "TARGET_BASED",
      then: Joi.required(),
      otherwise: Joi.optional(),
    })
    .messages({
      "any.required": "Target amount is required for target-based goals",
    }),

  expectedMonthlyAmount: positiveDecimalStringSchema.required().messages({
    "any.required": "Expected monthly contribution is required",
  }),

  category: Joi.string()
    .valid(
      "DEBT_REPAYMENT",
      "INVESTMENT",
      "PERSONAL",
      "EMERGENCY_FUND",
      "OTHER"
    )
    .default("PERSONAL")
    .messages({
      "any.only":
        "Category must be one of: DEBT_REPAYMENT, INVESTMENT, PERSONAL, EMERGENCY_FUND, OTHER",
    }),

  startDate: Joi.date().max("now").optional().messages({
    "date.max": "Start date cannot be in the future",
  }),
});

// Schema for contribution form validation
export const contributionSchema = Joi.object({
  intent: Joi.string().valid("add", "update").optional(),

  month: Joi.number().integer().min(1).max(12).required().messages({
    "number.integer": "Month must be an integer",
    "number.min": "Month must be between 1 and 12",
    "number.max": "Month must be between 1 and 12",
    "any.required": "Month is required",
  }),

  year: Joi.number().integer().min(2000).max(2100).required().messages({
    "number.integer": "Year must be an integer",
    "number.min": "Year must be 2000 or later",
    "number.max": "Year must be 2100 or earlier",
    "any.required": "Year is required",
  }),

  projectedAmount: positiveDecimalStringSchema.required().messages({
    "any.required": "Projected amount is required",
  }),

  actualAmount: decimalStringSchema.optional().allow("").messages({
    "string.pattern.base": "Actual amount must be a valid decimal number",
  }),
});

// Schema for projection configuration
export const projectionConfigSchema = Joi.object({
  calculationMethod: Joi.string()
    .valid("AVERAGE", "WEIGHTED_RECENT", "FIXED_AMOUNT")
    .default("AVERAGE")
    .messages({
      "any.only":
        "Calculation method must be AVERAGE, WEIGHTED_RECENT, or FIXED_AMOUNT",
    }),

  periodMonths: Joi.number().integer().min(1).max(120).default(24).messages({
    "number.integer": "Period must be an integer",
    "number.min": "Period must be at least 1 month",
    "number.max": "Period cannot exceed 120 months (10 years)",
  }),

  chartView: Joi.string()
    .valid("COMBINED", "SEPARATED", "BOTH")
    .default("COMBINED")
    .messages({
      "any.only": "Chart view must be COMBINED, SEPARATED, or BOTH",
    }),

  fixedAmount: positiveDecimalStringSchema
    .when("calculationMethod", {
      is: "FIXED_AMOUNT",
      then: Joi.required(),
      otherwise: Joi.optional(),
    })
    .messages({
      "any.required": "Fixed amount is required when using FIXED_AMOUNT method",
    }),
});
