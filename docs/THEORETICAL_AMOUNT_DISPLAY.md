# Theoretical Amount Display in Performance Indicator

## Overview

Enhanced the `PerformanceIndicator` component to display the **theoretical amount** (what should have been saved by now) instead of the static monthly expected amount. This provides more meaningful context by showing the cumulative theoretical savings based on the goal's start date and expected monthly contributions.

## Implementation Details

### What Changed

**Before**: Performance indicator showed "Expected $500/mo" (static monthly amount)

**After**: Performance indicator shows "Should have $2,500" (calculated theoretical total based on elapsed months)

### Technical Changes

#### 1. Enhanced RetroactiveCalculator (`app/lib/retroactiveCalculator.ts`)

Added a new utility function to calculate theoretical amounts for the performance indicator:

```typescript
/**
 * Simplified function to calculate theoretical amount for PerformanceIndicator
 * Uses the same logic as the full analysis but returns just the total amount
 */
static calculateTheoreticalAmountForGoal(
  goal: { startDate: Date; expectedMonthlyAmount: Decimal },
  endDate: Date = new Date()
): Decimal {
  return this.calculateTheoreticalBalance(
    goal.startDate,
    goal.expectedMonthlyAmount,
    endDate
  );
}
```

This function:

- Uses the same calculation logic as `RetroactiveMetrics.totalTheoretical`
- Calculates elapsed months from goal start date to today
- Multiplies by expected monthly amount
- Returns the theoretical total that should have been saved

#### 2. Updated PerformanceIndicator (`app/components/PerformanceIndicators.tsx`)

- **Renamed props**:

  - `expectedMonthlyAmount` → `theoreticalAmount`
  - `showExpectedAmount` → `showTheoreticalAmount`

- **Updated display text**:

  - From: "Expected $X/mo"
  - To: "Should have $X"

- **Enhanced type safety**: Uses `Decimal` type for precise financial calculations

#### 3. Enhanced RetroactiveAnalysisDisplay (`app/components/RetroactiveAnalysisDisplay.tsx`)

- Added `RetroactiveCalculator` import
- Added `theoreticalAmount` calculation using `useMemo` for performance
- Updated performance indicator props to use theoretical amount
- Added proper error handling for theoretical amount calculation

### Calculation Logic

The theoretical amount is calculated as:

```
Theoretical Amount = Expected Monthly Amount × Complete Months Elapsed
```

Where:

- **Expected Monthly Amount**: From `goal.expectedMonthlyAmount`
- **Complete Months Elapsed**: From `goal.startDate` to current date
- **Uses same logic**: As `RetroactiveMetrics` "Should Have Saved" card

### Example

For a goal that:

- Started 5 months ago (January 2025)
- Has expected monthly amount of $500
- Current date is June 2025

**Calculation**: 5 months × $500 = $2,500

**Display**: "Should have $2.5K" (using compact currency formatting)

## Benefits

1. **More Meaningful Context**: Shows cumulative theoretical progress instead of static monthly target
2. **Consistent with Analysis**: Uses same calculation as detailed `RetroactiveMetrics`
3. **Time-Aware**: Automatically updates based on elapsed time since goal start
4. **Performance Optimized**: Cached calculation with `useMemo`
5. **Type Safe**: Proper TypeScript types with `Decimal` for financial precision

## Visual Impact

### Dashboard Goal Cards

The performance indicator now shows contextually relevant information:

- **Icon**: Performance status (ahead/on-track/behind/no-contribution)
- **Text**: "Should have $X.XK" (theoretical cumulative amount)
- **Context**: More meaningful than static monthly amount
- **Alignment**: Matches the detailed analysis metrics

### Consistency

This change ensures that:

- Dashboard cards show the same theoretical logic as detailed goal analysis
- Users see cumulative context rather than repetitive monthly information
- Performance indicators provide actionable insights about progress

## Implementation Status

- ✅ **RetroactiveCalculator**: Enhanced with utility function
- ✅ **PerformanceIndicator**: Updated props and display logic
- ✅ **RetroactiveAnalysisDisplay**: Integrated theoretical calculation
- ✅ **TypeScript**: All types updated and validated
- ✅ **Build**: Passes compilation successfully
- ✅ **Backward Compatibility**: No breaking changes to existing functionality

## Files Modified

1. `app/lib/retroactiveCalculator.ts` - Added utility function
2. `app/components/PerformanceIndicators.tsx` - Updated props and display
3. `app/components/RetroactiveAnalysisDisplay.tsx` - Integrated theoretical calculation

## Testing

The implementation uses the same core calculation logic as the proven `RetroactiveMetrics` component, ensuring accuracy and consistency across the application.
