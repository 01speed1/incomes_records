# Enhanced Contribution Form Implementation

This document describes the frontend improvements implemented for the contribution form to handle duplicate contributions gracefully.

## Features Implemented

### 1. Real-time Contribution Status Detection

The form now detects existing contributions for the selected month/year combination using the `useContributionStatus` hook:

```typescript
const contributionStatus = useContributionStatus({
  goal,
  selectedMonth,
  selectedYear,
});
```

### 2. Dynamic Form Behavior

- **Add Mode**: When no contribution exists for the selected month/year
- **Update Mode**: When a contribution already exists for the selected month/year

### 3. Visual Indicators

#### Status Indicator
When an existing contribution is detected, an amber warning banner appears:

```tsx
{contributionStatus.exists && (
  <div className="contribution-form__status-indicator mt-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
    <div className="contribution-form__status-content flex items-center">
      <svg className="contribution-form__status-icon w-5 h-5 text-amber-600 mr-2">
        {/* Warning icon */}
      </svg>
      <div>
        <p className="contribution-form__status-text text-sm text-amber-800 font-medium">
          Contribution exists for {contributionStatus.monthName} {selectedYear}
        </p>
        <p className="contribution-form__status-subtext text-xs text-amber-700 mt-1">
          You can update the existing contribution below
        </p>
      </div>
    </div>
  </div>
)}
```

#### Dynamic Button Styling
- **Add mode**: Blue button with "Add Contribution" text
- **Update mode**: Amber button with "Update Contribution" text

### 4. Pre-populated Values

When updating an existing contribution, the form automatically populates with current values:

```typescript
useEffect(() => {
  if (contributionStatus.exists && contributionStatus.contribution) {
    setProjectedAmount(contributionStatus.contribution.projectedAmount.toString());
    setActualAmount(contributionStatus.contribution.actualAmount?.toString() || "");
    setNotes(contributionStatus.contribution.notes || "");
  } else {
    setProjectedAmount(goal.expectedMonthlyAmount.toString());
    setActualAmount("");
    setNotes("");
  }
}, [contributionStatus.exists, contributionStatus.contribution, goal.expectedMonthlyAmount]);
```

### 5. Update Confirmation Dialog

When attempting to update an existing contribution, a confirmation dialog appears:

```tsx
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
          A contribution for <strong>{contributionStatus.monthName} {selectedYear}</strong> already exists. 
          Do you want to update it with the new values?
        </p>
        
        {/* Current values display */}
        <div className="contribution-form__existing-values mt-3 p-3 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-700"><strong>Current values:</strong></p>
          <ul className="text-sm text-gray-600 mt-1">
            <li>Projected: ${contributionStatus.contribution.projectedAmount.toString()}</li>
            {contributionStatus.contribution.actualAmount && (
              <li>Actual: ${contributionStatus.contribution.actualAmount.toString()}</li>
            )}
          </ul>
        </div>
      </div>
      
      <div className="contribution-form__dialog-actions flex justify-end space-x-3">
        <button type="button" onClick={() => setShowUpdateDialog(false)}>
          Cancel
        </button>
        <button type="button" onClick={handleConfirmUpdate}>
          Update Contribution
        </button>
      </div>
    </div>
  </div>
)}
```

### 6. Notes Field for Updates

When updating contributions, a notes field becomes available:

```tsx
{contributionStatus.exists && (
  <div className="contribution-form__notes-field mb-4">
    <label htmlFor="notes" className="contribution-form__label block text-sm font-medium text-gray-700 mb-1">
      Notes (optional)
    </label>
    <textarea
      id="notes"
      name="notes"
      rows={2}
      value={notes}
      onChange={(e) => setNotes(e.target.value)}
      className="contribution-form__textarea block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      placeholder="Add notes about this contribution..."
    />
  </div>
)}
```

## User Experience Flow

### Adding New Contribution
1. User selects month/year with no existing contribution
2. Form shows "Add Monthly Contribution" header with blue styling
3. Form fields are empty/default values
4. Submit button says "Add Contribution"
5. On successful submission, success message appears

### Updating Existing Contribution
1. User selects month/year with existing contribution
2. Amber warning indicator appears showing contribution exists
3. Form header changes to "Update Monthly Contribution"
4. Form fields pre-populate with existing values
5. Notes field becomes visible
6. Submit button changes to amber "Update Contribution"
7. On submission attempt, confirmation dialog appears
8. User can cancel or confirm the update
9. On successful update, success message appears

## Error Handling Improvements

### Backend Error Handling
The action now provides specific error messages for duplicate contributions:

```typescript
if (error.message.includes("Unique constraint failed") && 
    error.message.includes("savingsGoalId") &&
    error.message.includes("year") &&
    error.message.includes("month")) {
  const data = Object.fromEntries(formData);
  const monthName = new Date(0, Number(data.month) - 1).toLocaleDateString("en", { month: "long" });
  return Response.json(
    {
      success: false,
      errors: { 
        general: `A contribution for ${monthName} ${data.year} already exists. Please edit the existing contribution instead.` 
      },
    },
    { status: 409 }
  );
}
```

### Frontend Prevention
The form prevents accidental duplicate submissions by:
1. Detecting existing contributions in real-time
2. Changing form mode to "update" automatically
3. Showing confirmation dialogs for updates
4. Providing clear visual indicators

## Technical Implementation

### Hook Integration
The `useContributionStatus` hook provides all necessary status information:

```typescript
export interface ContributionStatus {
  exists: boolean;
  contribution: MonthlyContributionData | null;
  formMode: "add" | "update";
  buttonText: string;
  headerText: string;
  monthName: string;
}
```

### State Management
The form uses controlled inputs for proper state management:

```typescript
const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
const [projectedAmount, setProjectedAmount] = useState("");
const [actualAmount, setActualAmount] = useState("");
const [notes, setNotes] = useState("");
```

### Form Submission Logic
The form intelligently handles both add and update operations:

```typescript
const handleSubmit = (event: React.FormEvent) => {
  if (contributionStatus.exists && contributionStatus.formMode === "update" && !showUpdateDialog) {
    event.preventDefault();
    setShowUpdateDialog(true);
  }
};
```

## Styling Guidelines

The component follows BEM methodology for CSS classes:

- `.contribution-form` - Main component block
- `.contribution-form__card` - Form container
- `.contribution-form__status-indicator` - Warning banner
- `.contribution-form__dialog-overlay` - Modal backdrop
- `.contribution-form__dialog` - Modal content

Color scheme:
- **Add mode**: Blue (#2563eb) for primary actions
- **Update mode**: Amber (#d97706) for update actions
- **Success**: Green (#16a34a) for success messages
- **Error**: Red (#dc2626) for error messages
- **Warning**: Amber (#f59e0b) for warning indicators

## Accessibility Features

- Proper ARIA labels and roles
- Keyboard navigation support
- Focus management for dialog
- Color contrast compliance
- Screen reader friendly text descriptions

## Browser Compatibility

The implementation uses modern React patterns and CSS features:
- React Hooks (useState, useEffect, useMemo)
- CSS Grid and Flexbox
- Modern JavaScript (ES6+)
- CSS custom properties support

Supports all modern browsers (Chrome 88+, Firefox 85+, Safari 14+, Edge 88+).
